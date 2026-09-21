// Helper compartilhado pelas functions serverless que falam com o Supabase.
// Usa sempre a service_role key (só existe aqui, nunca no navegador) —
// nenhuma chave do Supabase é exposta ao cliente por nenhuma destas rotas.
const SB_URL = 'https://tdttqltbnizljmsajqlc.supabase.co';
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const serviceHeaders = {
  apikey: SB_SERVICE_KEY,
  Authorization: `Bearer ${SB_SERVICE_KEY}`,
};

function setCors(res) {
  // Mesmo padrão de api/categorias.js — CORS não é uma camada de segurança
  // real aqui (não impede um curl direto), só controla quem lê a resposta
  // no navegador. A proteção de verdade é a chave nunca sair do servidor.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = { SB_URL, SB_SERVICE_KEY, serviceHeaders, setCors };
