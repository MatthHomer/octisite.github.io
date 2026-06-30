// Função serverless Vercel: notifica buscadores compatíveis com o protocolo
// IndexNow (Bing, DuckDuckGo, Yandex, Seznam) quando uma URL é publicada ou
// atualizada. Chame via POST com body { "urls": ["https://octi.site/..."] }.
const fetch = require('node-fetch');

const INDEXNOW_KEY = '241ff062867e45858ff057447f1f1e01';
const SITE_HOST = 'octi.site';
const KEY_LOCATION = `https://octi.site/${INDEXNOW_KEY}.txt`;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não suportado' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const urls = Array.isArray(body && body.urls) ? body.urls : [body && body.url].filter(Boolean);

    if (!urls.length) {
      res.status(400).json({ error: 'Informe "urls" (array) ou "url" (string)' });
      return;
    }

    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    };

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    res.status(response.status).json({ ok: response.ok, submitted: urls.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao notificar IndexNow', details: err.message });
  }
};
