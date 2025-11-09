// blog-slider.js - Slider horizontal de posts do blog

const HYGRAPH_API = "https://api-us-west-2.hygraph.com/v2/cm6pzx1wi00ki07wet8piy0zy/master";
const HYGRAPH_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE3Mzg2NDQ0MDMsImF1ZCI6WyJodHRwczovL2FwaS11cy13ZXN0LTIuaHlncmFwaC5jb20vdjIvY202cHp4MXdpMDBraTA3d2V0OHBpeTB6eS9tYXN0ZXIiLCJtYW5hZ2VtZW50LW5leHQuZ3JhcGhjbXMuY29tIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC11cy13ZXN0LTIuaHlncmFwaC5jb20vIiwic3ViIjoiMjM5YmY2YWItZTVjYS00ZjkxLTg0MzctYTM3MDE0MWNmMzMyIiwianRpIjoiY2thNWoyZW9iMDN0YzAxd2gwZGZkNjdyeSJ9.FIgvO6oOfKANRmEOICz0HYI0te89E9j_ngps6G-cwW8RnPnE4CAFjr_xJ0v73CSFnCIBxSJ9SfQriyiF2CNAz6GveN46RzK1rFf63QVQqOIrZJPDNbOuQ0O7n7RDgFRZF7dadmAJUnhbAlkGZCZhJqLC-SZHGlriGfpa046ggnkLR9HZE4UVAOlP-pxjy_DRsFlKIjdRpUtRMYKxTlH41kwrxinKSDzR23gVliavVxxywcapba9n0ZnEDMVQIp9eUz3fwKcG6sHU8e9LXialA415yfO0aNY0BFCqZS4lTXHFpJbzb2FkmQLD1TzXpcLY6XOu0AGimonMfTR1yxU7nVmy6Rt0h6KuHD8QQkMc8F30Zh2Qzrf9uvEJ0SSO2JYc8k4NSR35UdZpQjySoPe4LU6rgXMNxhUnEHHg7SfVzhmtU91PPWSzbc8xsEJT1c_T2etFaVyH354viR36NEKajYDAiuWq0RzuV3js8sw13vHMsYW67_jUvQV6oslk2NDf0l7wOVTXvQnJ8TtiCiG36OeGrdfM8WgPREkvBBl757PdUCUa4eGdsjNGT5FApvU3XjyglTwz68LBdWTuprzJ4iZb02_iCE3iHtiOA34-nqNL2YmP2Sctv0K2EiGgCTvxntxS06KxazcUy7XGKBzptBbpfvUx7QDeYh2ic7eBUYc";

async function carregarBlogSlider() {
  const query = `{
    posts(orderBy: date_DESC, stage: PUBLISHED, first: 10) {
      id
      title
      excerpt
      coverImage { url }
      slug
    }
  }`;

  const res = await fetch(HYGRAPH_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${HYGRAPH_TOKEN}`
    },
    body: JSON.stringify({ query })
  });

  const { data } = await res.json();
  const posts = data?.posts || [];
  let sliderList = null;
  // Tenta encontrar a estrutura lateral (nova) ou a antiga
  const sliderSection = document.getElementById("blog-slider");
  if (sliderSection) {
    // Estrutura lateral
    sliderList = sliderSection.querySelector(".blog-slider-list");
    if (!sliderList) {
      // Estrutura antiga
      const lateral = sliderSection.querySelector(".blog-slider-wrapper .blog-slider-list");
      if (lateral) sliderList = lateral;
    }
  }
  if (!sliderList) return;
  sliderList.innerHTML = "";

  console.log('Posts carregados para o slider:', posts);
  posts.forEach(post => {
    const card = document.createElement("div");
    card.className = "card shadow-sm m-2";
    card.style.minWidth = "260px";
    card.style.maxWidth = "260px";
    card.style.flex = "0 0 auto";
  card.innerHTML = `
      <img src="${post.coverImage?.url || 'assets/img/blog-placeholder.png'}" class="card-img-top" alt="${post.title}" style="height:160px;object-fit:cover;">
      <div class="card-body">
        <h5 class="card-title" style="font-size:1.1rem;">${post.title}</h5>
        <p class="card-text" style="font-size:.95rem;">${post.excerpt?.substring(0, 60) || ''}${post.excerpt?.length > 60 ? '...' : ''}</p>
        <a href="blog-post.html?slug=${post.slug}" class="btn btn-primary btn-sm">Ver mais</a>
      </div>
    `;
  sliderList.appendChild(card);
  console.log('Card inserido:', post.title);
  });
}

document.addEventListener("DOMContentLoaded", carregarBlogSlider);

// Slider navigation
function scrollBlogSlider(direction) {
  const sliderSection = document.getElementById("blog-slider");
  const sliderList = sliderSection.querySelector(".blog-slider-list");
  if (!sliderList) return;
  sliderList.scrollBy({ left: direction * 280, behavior: 'smooth' });
}

document.addEventListener("DOMContentLoaded", function() {
  carregarBlogSlider();
  const sliderSection = document.getElementById("blog-slider");
  const btnLeft = sliderSection.querySelector(".blog-slider-btn-left");
  const btnRight = sliderSection.querySelector(".blog-slider-btn-right");
  if (btnLeft) btnLeft.addEventListener("click", () => scrollBlogSlider(-1));
  if (btnRight) btnRight.addEventListener("click", () => scrollBlogSlider(1));
});
