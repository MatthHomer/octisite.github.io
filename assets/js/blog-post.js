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
                style="max-height:400px;object-fit:cover;"
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

    // Atualiza o título da aba
    document.title = `${post.title} | Blog Octi`;

  } catch (err) {
    console.error("Erro ao carregar post:", err);
    container.innerHTML = '<div class="col-12 text-center py-5 text-muted">Não foi possível carregar o post.</div>';
  }
}

function escHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", carregarConteudoPost);
