// Função serverless Vercel: gera feed RSS 2.0 do blog a partir dos posts
// publicados no Supabase. Acessível em /api/feed, reescrito para /feed.xml
// via vercel.json.
const fetch = require('node-fetch');

const SUPABASE_URL = 'https://tdttqltbnizljmsajqlc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHRxbHRibml6bGptc2FqcWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDc0NzAsImV4cCI6MjA1NTU4MzQ3MH0.v__13i-EzViT2Eaz4gd2CFJlTq_W5kbDdIQtXSpXnfU';

function escXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = async (req, res) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?status=eq.published&order=published_at.desc&select=title,slug,excerpt,cover_url,published_at,author&limit=50`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const posts = await response.json();

    const items = (Array.isArray(posts) ? posts : [])
      .map((post) => {
        const link = `https://octi.site/blog-post.html?slug=${encodeURIComponent(post.slug)}`;
        const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : '';
        const enclosure = post.cover_url
          ? `\n      <enclosure url="${escXml(post.cover_url)}" type="image/jpeg" />`
          : '';
        return `    <item>\n      <title>${escXml(post.title)}</title>\n      <link>${escXml(link)}</link>\n      <guid isPermaLink="true">${escXml(link)}</guid>\n      <description>${escXml(post.excerpt || '')}</description>\n      <author>${escXml(post.author || 'Octi')}</author>${pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ''}${enclosure}\n    </item>`;
      })
      .join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>Blog Octi</title>\n    <link>https://octi.site/blog.html</link>\n    <description>Dicas para contratar serviços, manutenção residencial e empreendedorismo para autônomos.</description>\n    <language>pt-BR</language>\n    <atom:link href="https://octi.site/feed.xml" rel="self" type="application/rss+xml" />\n${items}\n  </channel>\n</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(rss);
  } catch (err) {
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.status(500).send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Blog Octi</title></channel></rss>`
    );
  }
};
