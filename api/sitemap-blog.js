// Função serverless Vercel: gera sitemap-blog.xml dinamicamente a partir
// dos posts publicados no Supabase. Acessível em /api/sitemap-blog,
// reescrito para /sitemap-blog.xml via vercel.json.
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
      `${SUPABASE_URL}/rest/v1/blog_posts?status=eq.published&order=published_at.desc&select=slug,published_at,cover_url,title`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const posts = await response.json();

    const urls = (Array.isArray(posts) ? posts : [])
      .map((post) => {
        const loc = `https://octi.site/blog-post.html?slug=${encodeURIComponent(post.slug)}`;
        const lastmod = post.published_at
          ? new Date(post.published_at).toISOString().split('T')[0]
          : '';
        const image = post.cover_url
          ? `\n    <image:image>\n      <image:loc>${escXml(post.cover_url)}</image:loc>\n      <image:title>${escXml(post.title)}</image:title>\n    </image:image>`
          : '';
        return `  <url>\n    <loc>${escXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>${image}\n  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (err) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(500).send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`
    );
  }
};
