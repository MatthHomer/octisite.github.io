// Função serverless Vercel: lista de posts publicados (sem ?slug) ou um
// post único (com ?slug=), sem expor nenhuma chave do Supabase ao
// navegador. Um único endpoint pras duas formas pra não estourar o limite
// de 12 Serverless Functions do plano Hobby.
const { SB_URL, serviceHeaders, setCors } = require('./_supabase');

const MAX_LIMIT = 50;

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(404).json({ error: 'Método não suportado' });

  const slug = typeof req.query.slug === 'string' ? req.query.slug : '';

  try {
    if (slug) {
      const url = `${SB_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=title,content,cover_url,published_at,author&limit=1`;
      const r = await fetch(url, { headers: serviceHeaders });
      const rows = await r.json();
      return res.status(r.ok ? 200 : 500).json(rows);
    }

    const requested = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requested) && requested > 0
      ? Math.min(requested, MAX_LIMIT)
      : MAX_LIMIT;
    const url = `${SB_URL}/rest/v1/blog_posts?status=eq.published&order=published_at.desc&limit=${limit}&select=id,title,slug,excerpt,cover_url,published_at`;
    const r = await fetch(url, { headers: serviceHeaders });
    const rows = await r.json();
    res.status(r.ok ? 200 : 500).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro de conexão', details: err.message });
  }
};
