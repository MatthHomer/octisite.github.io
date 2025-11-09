// blog.js - Carrega posts do Hygraph e exibe na página do blog

const HYGRAPH_API = "https://api-us-west-2.hygraph.com/v2/cm6pzx1wi00ki07wet8piy0zy/master";
const HYGRAPH_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE3Mzg2NDQ0MDMsImF1ZCI6WyJodHRwczovL2FwaS11cy13ZXN0LTIuaHlncmFwaC5jb20vdjIvY202cHp4MXdpMDBraTA3d2V0OHBpeTB6eS9tYXN0ZXIiLCJtYW5hZ2VtZW50LW5leHQuZ3JhcGhjbXMuY29tIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC11cy13ZXN0LTIuaHlncmFwaC5jb20vIiwic3ViIjoiMjM5YmY2YWItZTVjYS00ZjkxLTg0MzctYTM3MDE0MWNmMzMyIiwianRpIjoiY2thNWoyZW9iMDN0YzAxd2gwZGZkNjdyeSJ9.FIgvO6oOfKANRmEOICz0HYI0te89E9j_ngps6G-cwW8RnPnE4CAFjr_xJ0v73CSFnCIBxSJ9SfQriyiF2CNAz6GveN46RzK1rFf63QVQqOIrZJPDNbOuQ0O7n7RDgFRZF7dadmAJUnhbAlkGZCZhJqLC-SZHGlriGfpa046ggnkLR9HZE4UVAOlP-pxjy_DRsFlKIjdRpUtRMYKxTlH41kwrxinKSDzR23gVliavVxxywcapba9n0ZnEDMVQIp9eUz3fwKcG6sHU8e9LXialA415yfO0aNY0BFCqZS4lTXHFpJbzb2FkmQLD1TzXpcLY6XOu0AGimonMfTR1yxU7nVmy6Rt0h6KuHD8QQkMc8F30Zh2Qzrf9uvEJ0SSO2JYc8k4NSR35UdZpQjySoPe4LU6rgXMNxhUnEHHg7SfVzhmtU91PPWSzbc8xsEJT1c_T2etFaVyH354viR36NEKajYDAiuWq0RzuV3js8sw13vHMsYW67_jUvQV6oslk2NDf0l7wOVTXvQnJ8TtiCiG36OeGrdfM8WgPREkvBBl757PdUCUa4eGdsjNGT5FApvU3XjyglTwz68LBdWTuprzJ4iZb02_iCE3iHtiOA34-nqNL2YmP2Sctv0K2EiGgCTvxntxS06KxazcUy7XGKBzptBbpfvUx7QDeYh2ic7eBUYc";

async function carregarPostsBlog() {
  const query = `{
    posts(orderBy: date_DESC, stage: PUBLISHED) {
      id
      title
      excerpt
      content {
        html
      }
      coverImage {
        url
      }
      date
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
  const container = document.getElementById("blog-posts");
  container.innerHTML = "";

  if (posts.length === 0) {
    container.innerHTML = '<div class="col-12 text-center">Nenhum post encontrado.</div>';
    return;
  }

  posts.forEach(post => {
    const postEl = document.createElement("div");
    postEl.className = "col-md-6 col-lg-4";
    postEl.innerHTML = `
      <div class="card h-100 shadow-sm wow fadeInUp" data-wow-delay=".2s">
        <img src="${post.coverImage?.url || 'assets/img/blog-placeholder.png'}" class="card-img-top" alt="${post.title}">
        <div class="card-body">
          <h5 class="card-title">${post.title}</h5>
          <p class="card-text">${post.excerpt || ''}</p>
          <a href="blog-post.html?slug=${post.slug}" class="btn btn-primary">Leia mais</a>
        </div>
        <div class="card-footer text-muted small">
          ${new Date(post.date).toLocaleDateString('pt-BR')}
        </div>
      </div>
    `;
    // O campo post.content.html estará disponível para reutilização na página de detalhes
    container.appendChild(postEl);
  });
}

document.addEventListener("DOMContentLoaded", carregarPostsBlog);