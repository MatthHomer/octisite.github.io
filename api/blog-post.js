// Função serverless Vercel: proxy read-only de um post publicado do blog
// (por slug), sem expor nenhuma chave do Supabase ao navegador.
const { SB_URL, serviceHeaders, setCors } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(404).json({ error: 'Método não suportado' });

  const slug = typeof req.query.slug === 'string' ? req.query.slug : '';
  if (!slug) return res.status(400).json({ error: 'slug é obrigatório' });

  try {
    const url = `${SB_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=title,content,cover_url,published_at,author&limit=1`;
    const r = await fetch(url, { headers: serviceHeaders });
    const rows = await r.json();
    res.status(r.ok ? 200 : 500).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro de conexão', details: err.message });
  }
};
