import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import AuthForm from './components/AuthForm.jsx';
import Veiculos from './components/Veiculos.jsx';
import Locacoes from './components/Locacoes.jsx';

function Painel() {
  const { usuario, logout } = useAuth();
  const [aba, setAba] = useState('locacoes');

  return (
    <div className="app">
      <header className="topo">
        <strong className="marca">Locadora</strong>
        <nav>
          <button type="button" className={aba === 'locacoes' ? 'aba ativa' : 'aba'} onClick={() => setAba('locacoes')}>
            Locações
          </button>
          <button type="button" className={aba === 'veiculos' ? 'aba ativa' : 'aba'} onClick={() => setAba('veiculos')}>
            Veículos
          </button>
        </nav>
        <div className="usuario">
          <span>{usuario.nome}</span>
          <button type="button" className="secundario" onClick={logout}>Sair</button>
        </div>
      </header>
      <main>{aba === 'veiculos' ? <Veiculos /> : <Locacoes />}</main>
    </div>
  );
}

function Conteudo() {
  const { usuario, carregando } = useAuth();
  if (carregando) {
    return <p className="vazio centro">Carregando…</p>;
  }
  return usuario ? <Painel /> : <AuthForm />;
}

export default function App() {
  return (
    <AuthProvider>
      <Conteudo />
    </AuthProvider>
  );
}
