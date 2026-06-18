// blog.js - Carrega posts publicados do Supabase

const SUPABASE_URL = "https://tdttqltbnizljmsajqlc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHRxbHRibml6bGptc2FqcWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDc0NzAsImV4cCI6MjA1NTU4MzQ3MH0.v__13i-EzViT2Eaz4gd2CFJlTq_W5kbDdIQtXSpXnfU";

async function carregarPostsBlog() {
  const container = document.getElementById("blog-posts");
  if (!container) return;

  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>`;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?status=eq.published&order=published_at.desc&select=id,title,slug,excerpt,cover_url,published_at`,
      {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const posts = await res.json();
    container.innerHTML = "";

    if (!Array.isArray(posts) || posts.length === 0) {
      container.innerHTML = '<div class="col-12 text-center py-5 text-muted">Nenhum post publicado ainda.</div>';
      return;
    }

    posts.forEach(function(post, i) {
      const delay = (i * 0.1).toFixed(1);
      const date = post.published_at
        ? new Date(post.published_at).toLocaleDateString("pt-BR")
        : "";

      const el = document.createElement("div");
      el.className = "col-md-6 col-lg-4";
      el.innerHTML = `
        <div class="card h-100 shadow-sm wow fadeInUp" data-wow-delay="${delay}s">
          <img
            src="${post.cover_url || "assets/img/blog-placeholder.png"}"
            class="card-img-top"
            alt="${escHtml(post.title)}"
            style="height:200px;object-fit:cover;"
            onerror="this.src='assets/img/blog-placeholder.png'"
          >
          <div class="card-body">
            <h5 class="card-title">${escHtml(post.title)}</h5>
            <p class="card-text text-muted">${escHtml(post.excerpt || "")}</p>
            <a href="blog-post.html?slug=${encodeURIComponent(post.slug)}" class="btn btn-primary btn-sm">
              Leia mais
            </a>
          </div>
          ${date ? `<div class="card-footer text-muted small">${date}</div>` : ""}
        </div>`;
      container.appendChild(el);
    });

  } catch (err) {
    console.error("Erro ao carregar posts:", err);
    container.innerHTML = '<div class="col-12 text-center py-5 text-muted">Não foi possível carregar os posts.</div>';
  }
}

function escHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", carregarPostsBlog);
