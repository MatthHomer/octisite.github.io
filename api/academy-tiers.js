// Função serverless Vercel: lista os níveis do programa de indicações
// (referral_tier_config), sem expor a chave do Supabase ao navegador.
const { SB_URL, serviceHeaders, setCors } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(404).json({ error: 'Método não suportado' });

  try {
    const url = `${SB_URL}/rest/v1/referral_tier_config?active=eq.true&order=sort_order.asc`;
    const r = await fetch(url, { headers: serviceHeaders });
    const rows = await r.json();
    res.status(r.ok ? 200 : 500).json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    res.status(200).json([]);
  }
};
