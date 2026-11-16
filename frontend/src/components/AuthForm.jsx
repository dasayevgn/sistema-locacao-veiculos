import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import Mensagem from './Mensagem.jsx';

export default function AuthForm() {
  const { login, registrar } = useAuth();
  const [modo, setModo] = useState('login');
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function alterar(evento) {
    setForm({ ...form, [evento.target.name]: evento.target.value });
  }

  function trocarModo() {
    setModo(modo === 'login' ? 'cadastro' : 'login');
    setMensagem(null);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setMensagem(null);
    setEnviando(true);
    try {
      if (modo === 'login') {
        await login(form.email, form.senha);
      } else {
        await registrar(form.nome, form.email, form.senha);
      }
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
      setEnviando(false);
    }
  }

  return (
    <div className="entrada">
      <div className="entrada-marca">
        <h1>Locadora</h1>
        <p>Frota, locações e devoluções em um só lugar.</p>
      </div>
      <form className="painel" onSubmit={enviar}>
        <h2>{modo === 'login' ? 'Entrar' : 'Criar conta'}</h2>
        {modo === 'cadastro' && (
          <label>
            Nome
            <input name="nome" value={form.nome} onChange={alterar} required />
          </label>
        )}
        <label>
          E-mail
          <input name="email" type="email" value={form.email} onChange={alterar} required />
        </label>
        <label>
          Senha
          <input name="senha" type="password" minLength={6} value={form.senha} onChange={alterar} required />
        </label>
        <Mensagem mensagem={mensagem} />
        <button type="submit" disabled={enviando}>
          {modo === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
        <button type="button" className="link" onClick={trocarModo}>
          {modo === 'login' ? 'Ainda não tenho conta' : 'Já tenho conta'}
        </button>
      </form>
    </div>
  );
}
