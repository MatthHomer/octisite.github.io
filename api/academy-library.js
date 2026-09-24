// Função serverless Vercel: catálogo público da Academy (sem PDFs — só
// metadados de card), sem expor nenhuma chave do Supabase ao navegador.
const { SB_URL, serviceHeaders, setCors } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(404).json({ error: 'Método não suportado' });

  try {
    const url = `${SB_URL}/rest/v1/academy_content?active=eq.true&order=display_order.asc`;
    const r = await fetch(url, { headers: serviceHeaders });
    const rows = await r.json();
    res.status(r.ok ? 200 : 500).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro de conexão', details: err.message });
  }
};
