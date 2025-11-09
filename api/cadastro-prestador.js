// Função serverless Vercel: cadastro seguro de prestador no Hygraph
const fetch = require('node-fetch');

const HYGRAPH_API = "https://sa-east-1.cdn.hygraph.com/content/clrwk4fly0sv901tedf2aznmt/master";
const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    let dados = req.body;
    if (typeof dados === 'string') {
      try { dados = JSON.parse(dados); } catch { dados = {}; }
    }
    const mutation = `
      mutation {
        createBusinessList(data: {
          name: "${dados.name}",
          cnpj: "${dados.cnpj}",
          adress: "${dados.adress}",
          contactPerson: "${dados.contactPerson}",
          whatsapp: "${dados.whatsapp}",
          about: "${dados.about}",
          email: "${dados.email}",
          category: { connect: { name: "${dados.category}" } },
          pricing: "${dados.pricing}"
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
      // Log do resultado para depuração
      console.log('Hygraph mutation result:', JSON.stringify(result));
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao cadastrar prestador', details: err.message });
    }
    return;
  }

  res.status(404).json({ error: 'Método não suportado' });
};