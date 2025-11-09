// API Serverless para Vercel: cadastro seguro de prestador no Hygraph
const fetch = require('node-fetch');

const HYGRAPH_API = "https://sa-east-1.cdn.hygraph.com/content/clrwk4fly0sv901tedf2aznmt/master";
const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Rota /categorias
    const query = `
      query {
        categories {
          name
          icon { url }
          description
        }
      }
    `;
    try {
      const response = await fetch(HYGRAPH_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HYGRAPH_TOKEN}`
        },
        body: JSON.stringify({ query })
      });
      const result = await response.json();
      if (result.data && result.data.categories) {
        res.status(200).json(result.data.categories);
      } else {
        res.status(500).json({ error: 'Erro ao buscar categorias', details: result.errors });
      }
    } catch (err) {
      res.status(500).json({ error: 'Erro de conexão', details: err.message });
    }
    return;
  }

  if (req.method === 'POST') {
    // Rota /cadastro-prestador
    let dados = req.body;
    // Vercel pode receber body como string
    if (typeof dados === 'string') {
      try { dados = JSON.parse(dados); } catch { dados = {}; }
    }
    const mutation = `
      mutation {
        createBusinessList(data: {
          name: "${dados.name}",
          cnpj: "${dados.cnpj}",
          location: "${dados.location}",
          adress: "${dados.adress}",
          contactPerson: "${dados.contactPerson}",
          whatsapp: ${dados.whatsapp},
          about: "${dados.about}",
          email: "${dados.email}",
          category: "${dados.category}",
          pricing: ${dados.pricing}
        }) {
          id
          name
        }
      }
    `;
    try {
      const response = await fetch(HYGRAPH_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HYGRAPH_TOKEN}`
        },
        body: JSON.stringify({ query: mutation })
      });
      const result = await response.json();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao cadastrar prestador', details: err.message });
    }
    return;
  }

  res.status(404).json({ error: 'Método não suportado' });
};
