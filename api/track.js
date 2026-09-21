// Função serverless Vercel: recebe eventos de analytics do site e insere em
// analytics_event, sem expor nenhuma chave do Supabase ao navegador.
const { SB_URL, serviceHeaders, setCors } = require('./_supabase');

const ALLOWED_SOURCES = ['site', 'app', 'formulario'];

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(404).json({ error: 'Método não suportado' });

  const body = req.body || {};
  if (!ALLOWED_SOURCES.includes(body.source) || !body.event_name || !body.session_id) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes (source, event_name, session_id).' });
  }

  const row = {
    source: body.source,
    event_name: String(body.event_name).slice(0, 100),
    screen: body.screen ? String(body.screen).slice(0, 200) : null,
    element_id: body.element_id ? String(body.element_id).slice(0, 100) : null,
    session_id: String(body.session_id).slice(0, 100),
    metadata: body.metadata ?? null,
  };

  try {
    const r = await fetch(`${SB_URL}/rest/v1/analytics_event`, {
      method: 'POST',
      headers: { ...serviceHeaders, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    });
    if (r.ok || r.status === 201) return res.status(201).json({ ok: true });
    const text = await r.text();
    return res.status(500).json({ error: text });
  } catch (err) {
    res.status(500).json({ error: 'Erro de conexão', details: err.message });
  }
};
