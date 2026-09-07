// Função serverless Vercel: entrega arquivos da Academy (PDFs) só depois de
// confirmar que quem pediu realmente tem acesso ao conteúdo — pelo token de
// academy_access (acesso manual concedido pelo admin) ou pelo código de
// indicação de um prestador, com o módulo já desbloqueado (ver
// get_academy_entitlement, RPC criada em
// 20260907_referral_tier_config_and_academy_entitlement.sql).
//
// Os arquivos ficam num bucket PRIVADO do Storage (academy-materials) — não
// existe mais link público direto pra eles. Esta function gera uma URL
// assinada e temporária (5 min) usando a service_role key, que só existe
// aqui no servidor, nunca no navegador.
const SB_URL = 'https://tdttqltbnizljmsajqlc.supabase.co';
const SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHRxbHRibml6bGptc2FqcWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDc0NzAsImV4cCI6MjA1NTU4MzQ3MH0.v__13i-EzViT2Eaz4gd2CFJlTq_W5kbDdIQtXSpXnfU';
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const anonHeaders = { apikey: SB_ANON_KEY, Authorization: `Bearer ${SB_ANON_KEY}` };

async function isFullAccessValid(token) {
  if (!token) return false;
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/academy_access?token=eq.${encodeURIComponent(token)}&select=id,active`,
      { headers: anonHeaders }
    );
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0 && rows[0].active === true;
  } catch {
    return false;
  }
}

// withStoragePath=false é o fallback caso a migration da coluna
// storage_path ainda não tenha rodado no Supabase — sem isso, um select
// citando uma coluna inexistente derruba o endpoint inteiro em vez de só
// usar o pdf_url legado. Retorna undefined (não null) quando a query em si
// falhou, pra diferenciar de "conteúdo não existe".
async function fetchContent(contentId, withStoragePath) {
  const fields = withStoragePath
    ? 'id,storage_path,pdf_url,active,coming_soon'
    : 'id,pdf_url,active,coming_soon';
  try {
    const res = await fetch(`${SB_URL}/rest/v1/academy_content?id=eq.${contentId}&select=${fields}`, {
      headers: anonHeaders,
    });
    const rows = await res.json();
    if (!Array.isArray(rows)) return undefined;
    return rows[0] || null;
  } catch {
    return undefined;
  }
}

async function getEntitlement(code) {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/rpc/get_academy_entitlement`, {
      method: 'POST',
      headers: Object.assign({}, anonHeaders, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ p_referral_code: code }),
    });
    return await res.json();
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não suportado' });
    return;
  }
  if (!SB_SERVICE_KEY) {
    res.status(500).json({ error: 'Servidor sem SUPABASE_SERVICE_ROLE_KEY configurada' });
    return;
  }

  const contentId = Number(req.query.id);
  const code = req.query.code;
  const token = req.query.t;

  if (!contentId) {
    res.status(400).json({ error: 'id é obrigatório' });
    return;
  }

  try {
    // Tenta com storage_path; se a coluna ainda não existir (migration
    // 20260907_academy_pdf_private_storage.sql não rodada ainda), tenta de
    // novo sem ela — nunca deixa o endpoint inteiro fora do ar por causa
    // disso.
    let content = await fetchContent(contentId, true);
    if (content === undefined) content = await fetchContent(contentId, false);

    if (!content || !content.active || content.coming_soon) {
      res.status(404).json({ error: 'Conteúdo não encontrado' });
      return;
    }

    let allowed = false;

    if (token && (await isFullAccessValid(token))) {
      allowed = true;
    } else if (code) {
      const entitlement = await getEntitlement(code);
      if (entitlement && entitlement.found) {
        if (entitlement.full_access) {
          allowed = true;
        } else {
          const unlocked = (entitlement.unlocked_content_ids || []).map(Number);
          allowed = unlocked.includes(contentId);
        }
      }
    }

    if (!allowed) {
      res.status(403).json({ error: 'Sem acesso a este conteúdo' });
      return;
    }

    if (!content.storage_path) {
      // Conteúdo ainda não migrado pro bucket privado (ou migration da
      // coluna storage_path não rodou ainda) — mantém o link legado até
      // ser migrado. Continua exigindo `allowed`, diferente do
      // comportamento antigo do onclick estático.
      if (content.pdf_url) {
        res.status(200).json({ url: content.pdf_url });
        return;
      }
      res.status(404).json({ error: 'Arquivo não disponível' });
      return;
    }

    const signRes = await fetch(
      `${SB_URL}/storage/v1/object/sign/academy-materials/${encodeURIComponent(content.storage_path)}`,
      {
        method: 'POST',
        headers: {
          apikey: SB_SERVICE_KEY,
          Authorization: `Bearer ${SB_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 300 }),
      }
    );
    const signData = await signRes.json();

    if (!signData.signedURL) {
      res.status(500).json({ error: 'Falha ao gerar link de acesso' });
      return;
    }

    res.status(200).json({ url: `${SB_URL}/storage/v1${signData.signedURL}` });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno', details: err.message });
  }
};
