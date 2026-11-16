const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const resposta = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erro = new Error(dados?.erro || 'Não foi possível concluir a requisição');
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}
