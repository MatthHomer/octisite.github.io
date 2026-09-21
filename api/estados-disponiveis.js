// Função serverless Vercel: proxy read-only dos estados disponíveis, sem
// expor nenhuma chave do Supabase ao navegador.
const { SB_URL, serviceHeaders, setCors } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(404).json({ error: 'Método não suportado' });

  try {
    const r = await fetch(
      `${SB_URL}/rest/v1/comercial_estados?select=uf,disponivel&disponivel=eq.true`,
      { headers: serviceHeaders }
    );
    const rows = await r.json();
    res.status(r.ok ? 200 : 500).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro de conexão', details: err.message });
  }
};
