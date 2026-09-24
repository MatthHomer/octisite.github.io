// Função serverless Vercel: proxy do RPC get_academy_entitlement (calcula o
// que um código de indicação desbloqueia na Academy), sem expor a chave do
// Supabase ao navegador.
const { SB_URL, serviceHeaders, setCors } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(404).json({ error: 'Método não suportado' });

  const body = req.body || {};
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  if (!code) return res.status(400).json({ found: false });

  try {
    const r = await fetch(`${SB_URL}/rest/v1/rpc/get_academy_entitlement`, {
      method: 'POST',
      headers: { ...serviceHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_referral_code: code }),
    });
    const data = await r.json();
    res.status(r.ok ? 200 : 500).json(data);
  } catch (err) {
    res.status(200).json({ found: false });
  }
};
