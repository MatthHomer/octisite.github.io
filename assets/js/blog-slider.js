// blog-slider.js - Slider de posts do blog (fonte: Supabase)

const SUPABASE_URL = "https://tdttqltbnizljmsajqlc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHRxbHRibml6bGptc2FqcWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDc0NzAsImV4cCI6MjA1NTU4MzQ3MH0.v__13i-EzViT2Eaz4gd2CFJlTq_W5kbDdIQtXSpXnfU";

async function carregarBlogSlider() {
  const sliderSection = document.getElementById("blog-slider");
  if (!sliderSection) return;

  const sliderList = sliderSection.querySelector(".blog-slider-list");
  if (!sliderList) return;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?status=eq.published&order=published_at.desc&limit=10&select=id,title,slug,excerpt,cover_url`,
      {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

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
