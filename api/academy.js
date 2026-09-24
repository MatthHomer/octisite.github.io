// Função serverless Vercel: tudo que a Academy precisa do Supabase (catálogo,
// gate de token, programa de indicações), sem expor a chave ao navegador.
// Um único endpoint com roteamento por ?action= pra não estourar o limite
// de 12 Serverless Functions do plano Hobby.
//
//   GET  /api/academy?action=library    -> catálogo (academy_content)
//   GET  /api/academy?action=tiers      -> níveis do programa de indicações
//   POST /api/academy {action:'validate-token', token} -> {valid}
//   POST /api/academy {action:'entitlement', code}      -> resultado do RPC
const { SB_URL, serviceHeaders, setCors } = require('./_supabase');

async function library(res) {
  const url = `${SB_URL}/rest/v1/academy_content?active=eq.true&order=display_order.asc`;
  const r = await fetch(url, { headers: serviceHeaders });
  const rows = await r.json();
  res.status(r.ok ? 200 : 500).json(rows);
}

async function tiers(res) {
  const url = `${SB_URL}/rest/v1/referral_tier_config?active=eq.true&order=sort_order.asc`;
  const r = await fetch(url, { headers: serviceHeaders });
  const rows = await r.json();
  res.status(r.ok ? 200 : 500).json(Array.isArray(rows) ? rows : []);
}

async function validateToken(req, res) {
  const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
  if (!token) return res.status(400).json({ valid: false });

  const url = `${SB_URL}/rest/v1/academy_access?token=eq.${encodeURIComponent(token)}&select=id,active`;
  const r = await fetch(url, { headers: serviceHeaders });
  const data = await r.json();
  const valid = Array.isArray(data) && data.length > 0 && data[0].active === true;
  res.status(200).json({ valid });
}

async function entitlement(req, res) {
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!code) return res.status(400).json({ found: false });

  const r = await fetch(`${SB_URL}/rest/v1/rpc/get_academy_entitlement`, {
    method: 'POST',
    headers: { ...serviceHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_referral_code: code }),
  });
  const data = await r.json();
  res.status(r.ok ? 200 : 500).json(data);
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      if (req.query.action === 'library') return await library(res);
      if (req.query.action === 'tiers') return await tiers(res);
      return res.status(400).json({ error: 'action inválida' });
    }

    if (req.method === 'POST') {
      const action = req.body?.action;
      if (action === 'validate-token') return await validateToken(req, res);
      if (action === 'entitlement') return await entitlement(req, res);
      return res.status(400).json({ error: 'action inválida' });
    }

    res.status(404).json({ error: 'Método não suportado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro de conexão', details: err.message });
  }
};
