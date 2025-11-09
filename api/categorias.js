// Função serverless Vercel: categorias do Hygraph
const fetch = require('node-fetch');

const HYGRAPH_API = "https://sa-east-1.cdn.hygraph.com/content/clrwk4fly0sv901tedf2aznmt/master";
const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
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

  res.status(404).json({ error: 'Método não suportado' });
};