import { createContext, useContext, useEffect, useState } from 'react';
import { request, setToken, getToken } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      return;
    }
    request('/auth/me')
      .then(setUsuario)
      .catch(() => setToken(null))
      .finally(() => setCarregando(false));
  }, []);

  async function login(email, senha) {
    const resultado = await request('/auth/login', { method: 'POST', body: { email, senha } });
    setToken(resultado.token);
    setUsuario(resultado.usuario);
  }

  async function registrar(nome, email, senha) {
    await request('/auth/register', { method: 'POST', body: { nome, email, senha } });
    await login(email, senha);
  }

  function logout() {
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
