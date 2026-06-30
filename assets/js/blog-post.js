// blog-post.js - Carrega conteúdo completo do post do Supabase

const SUPABASE_URL = "https://tdttqltbnizljmsajqlc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHRxbHRibml6bGptc2FqcWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDc0NzAsImV4cCI6MjA1NTU4MzQ3MH0.v__13i-EzViT2Eaz4gd2CFJlTq_W5kbDdIQtXSpXnfU";

function getSlug() {
  return new URLSearchParams(window.location.search).get("slug");
}

async function carregarConteudoPost() {
  const container = document.getElementById("blog-post-content");
  if (!container) return;

  const slug = getSlug();
  if (!slug) {
    container.innerHTML = '<div class="col-12 text-center py-5 text-muted">Post não encontrado.</div>';
    return;
  }

  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>`;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=title,content,cover_url,published_at,author&limit=1`,
      {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const post = Array.isArray(data) ? data[0] : null;
    container.innerHTML = "";

    if (!post) {
      container.innerHTML = '<div class="col-12 text-center py-5 text-muted">Post não encontrado.</div>';
      return;
    }

    const date = post.published_at
      ? new Date(post.published_at).toLocaleDateString("pt-BR", {
          day: "2-digit", month: "long", year: "numeric"
        })
      : "";

    container.innerHTML = `
      <div class="col-lg-8 mx-auto">
        <div class="card shadow-lg wow fadeInUp" data-wow-delay=".1s">
          ${post.cover_url
            ? `<img
                src="${post.cover_url}"
                class="card-img-top"
                alt="${escHtml(post.title)}"
                width="800"
                height="400"
                style="max-height:400px;object-fit:cover;"
                fetchpriority="high"
                decoding="async"
                onerror="this.style.display='none'"
              >`
            : ""}
          <div class="card-body p-4 p-lg-5">
            <h1 class="card-title h2 mb-3">${escHtml(post.title)}</h1>
            <div class="d-flex align-items-center gap-3 mb-4 text-muted small">
              ${date ? `<span>📅 ${date}</span>` : ""}
              ${post.author ? `<span>✍️ ${escHtml(post.author)}</span>` : ""}
            </div>
            <div class="blog-post-body">
              ${post.content || "<p>Conteúdo não disponível.</p>"}
            </div>
          </div>
          <div class="card-footer py-3 px-4">
            <a href="blog.html" class="btn btn-outline-primary btn-sm">
              ← Voltar ao Blog
            </a>
          </div>
        </div>
      </div>`;

    atualizarMetaTags(post, slug);
    injetarSchemaBlogPosting(post, slug);

  } catch (err) {
    console.error("Erro ao carregar post:", err);
    container.innerHTML = '<div class="col-12 text-center py-5 text-muted">Não foi possível carregar o post.</div>';
  }
}

function escHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function plainTextExcerpt(html, maxLen) {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLen ? text.slice(0, maxLen - 1).trim() + "…" : text;
}

function setMeta(id, attr, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, value);
}

function atualizarMetaTags(post, slug) {
  const pageUrl = `https://octi.site/blog-post.html?slug=${encodeURIComponent(slug)}`;
  const description = plainTextExcerpt(post.content, 160) ||
    "Leia as últimas dicas e novidades do blog Octi sobre contratação de prestadores de serviços.";
  const image = post.cover_url || "https://octi.site/assets/img/og/og-default.jpg";
  const fullTitle = `${post.title} | Blog Octi`;

  document.title = fullTitle;
  document.getElementById("page-title").textContent = fullTitle;
  setMeta("meta-description", "content", description);
  setMeta("canonical-link", "href", pageUrl);
  setMeta("og-url", "content", pageUrl);
  setMeta("og-title", "content", fullTitle);
  setMeta("og-description", "content", description);
  setMeta("og-image", "content", image);
  setMeta("og-image-alt", "content", post.title);
  setMeta("twitter-title", "content", fullTitle);
  setMeta("twitter-description", "content", description);
  setMeta("twitter-image", "content", image);
  setMeta("twitter-image-alt", "content", post.title);
  if (post.published_at) {
    setMeta("article-published-time", "content", post.published_at);
  }
}

function injetarSchemaBlogPosting(post, slug) {
  const pageUrl = `https://octi.site/blog-post.html?slug=${encodeURIComponent(slug)}`;
  const description = plainTextExcerpt(post.content, 160);
  const image = post.cover_url || "https://octi.site/assets/img/og/og-default.jpg";

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${pageUrl}#blogposting`,
    "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl },
    "headline": post.title,
    "description": description,
    "image": image,
    "inLanguage": "pt-BR",
    "isPartOf": { "@id": "https://octi.site/#website" },
    "publisher": { "@id": "https://octi.site/#organization" },
    "author": {
      "@type": post.author ? "Person" : "Organization",
      "name": post.author || "Octi"
    }
  };
  if (post.published_at) {
    schema.datePublished = post.published_at;
    schema.dateModified = post.published_at;
  }

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "blogposting-schema";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", carregarConteudoPost);
