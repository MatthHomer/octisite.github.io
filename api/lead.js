// Função serverless Vercel: recebe o cadastro de prestador do formulário e
// insere em provider_leads, sem expor nenhuma chave do Supabase ao
// navegador (antes o próprio HTML fazia o insert direto com a anon key).
const { SB_URL, serviceHeaders, setCors } = require('./_supabase');

const ALLOWED_FIELDS = [
  'name', 'contact_person', 'whatsapp', 'email', 'address', 'city', 'state',
  'cep', 'about', 'category', 'referral_code',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid',
];

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(404).json({ error: 'Método não suportado' });

  const body = req.body || {};
  if (!body.name || !body.contact_person || !body.whatsapp) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes (name, contact_person, whatsapp).' });
  }

  const row = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) row[field] = body[field];
  }

  try {
    const r = await fetch(`${SB_URL}/rest/v1/provider_leads`, {
      method: 'POST',
      headers: { ...serviceHeaders, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    });
    if (r.ok || r.status === 201) return res.status(201).json({ ok: true });
    const text = await r.text();
    return res.status(500).json({ error: text });
  } catch (err) {
    res.status(500).json({ error: 'Erro de conexão', details: err.message });
  }
};
