// Função serverless Vercel: proxy read-only da lista de posts publicados
// do blog, sem expor nenhuma chave do Supabase ao navegador.
const { SB_URL, serviceHeaders, setCors } = require('./_supabase');

const MAX_LIMIT = 50;

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(404).json({ error: 'Método não suportado' });

  const requested = parseInt(req.query.limit, 10);
  const limit = Number.isFinite(requested) && requested > 0
    ? Math.min(requested, MAX_LIMIT)
    : MAX_LIMIT;

  try {
    const url = `${SB_URL}/rest/v1/blog_posts?status=eq.published&order=published_at.desc&limit=${limit}&select=id,title,slug,excerpt,cover_url,published_at`;
    const r = await fetch(url, { headers: serviceHeaders });
    const rows = await r.json();
    res.status(r.ok ? 200 : 500).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro de conexão', details: err.message });
  }
};
