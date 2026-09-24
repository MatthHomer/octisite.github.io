// Função serverless Vercel: valida um token de acesso manual à Academy,
// sem expor a chave do Supabase nem o token em query string de GET.
const { SB_URL, serviceHeaders, setCors } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(404).json({ error: 'Método não suportado' });

  const body = req.body || {};
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  if (!token) return res.status(400).json({ valid: false });

  try {
    const url = `${SB_URL}/rest/v1/academy_access?token=eq.${encodeURIComponent(token)}&select=id,active`;
    const r = await fetch(url, { headers: serviceHeaders });
    const data = await r.json();
    const valid = Array.isArray(data) && data.length > 0 && data[0].active === true;
    res.status(200).json({ valid });
  } catch (err) {
    res.status(200).json({ valid: false });
  }
};
