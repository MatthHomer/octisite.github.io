// blog-slider.js - Slider de posts do blog, via API do site (Vercel)
// Nenhuma chave do Supabase fica no navegador — a leitura passa por
// /api/blog-posts, que usa a service_role key só no servidor.

const API_BASE = "https://octisite-github-io.vercel.app";

async function carregarBlogSlider() {
  const sliderSection = document.getElementById("blog-slider");
  if (!sliderSection) return;

  const sliderList = sliderSection.querySelector(".blog-slider-list");
  if (!sliderList) return;

  try {
    const res = await fetch(`${API_BASE}/api/blog?limit=10`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const posts = await res.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      sliderList.innerHTML = `
        <div class="text-center py-4 text-muted" style="min-width:260px">
          Nenhum post publicado ainda.
        </div>`;
      return;
    }

    sliderList.innerHTML = "";

    posts.forEach(function(post) {
      const card = document.createElement("div");
      card.className = "card shadow-sm m-2";
      card.style.cssText = "min-width:260px;max-width:260px;flex:0 0 auto;";

      const excerpt = post.excerpt || "";
      const shortExcerpt = excerpt.length > 80
        ? excerpt.substring(0, 80) + "..."
        : excerpt;

      card.innerHTML = `
        <img
          src="${post.cover_url || "assets/img/blog-placeholder.png"}"
          class="card-img-top"
          alt="${escapeHtml(post.title)}"
          style="height:160px;object-fit:cover;"
          onerror="this.src='assets/img/blog-placeholder.png'"
        >
        <div class="card-body">
          <h5 class="card-title" style="font-size:1.05rem;line-height:1.3;">
            ${escapeHtml(post.title)}
          </h5>
          ${shortExcerpt ? `<p class="card-text" style="font-size:.9rem;color:#6c757d;">${escapeHtml(shortExcerpt)}</p>` : ""}
          <a href="blog-post.html?slug=${encodeURIComponent(post.slug)}" class="btn btn-primary btn-sm mt-1">
            Ver mais
          </a>
        </div>
      `;

      sliderList.appendChild(card);
    });

  } catch (err) {
    console.error("Erro ao carregar posts do blog:", err);
    sliderList.innerHTML = `
      <div class="text-center py-4 text-muted" style="min-width:260px">
        Não foi possível carregar os posts.
      </div>`;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scrollBlogSlider(direction) {
  const sliderSection = document.getElementById("blog-slider");
  if (!sliderSection) return;
  const sliderList = sliderSection.querySelector(".blog-slider-list");
  if (!sliderList) return;
  sliderList.scrollBy({ left: direction * 280, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", function() {
  carregarBlogSlider();

  const sliderSection = document.getElementById("blog-slider");
  if (!sliderSection) return;

  const btnLeft = sliderSection.querySelector(".blog-slider-btn-left");
  const btnRight = sliderSection.querySelector(".blog-slider-btn-right");
  if (btnLeft) btnLeft.addEventListener("click", function() { scrollBlogSlider(-1); });
  if (btnRight) btnRight.addEventListener("click", function() { scrollBlogSlider(1); });
});
