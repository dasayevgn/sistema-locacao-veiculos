import { useCallback, useEffect, useState } from 'react';
import { request } from '../api.js';
import { moeda } from '../format.js';
import Mensagem from './Mensagem.jsx';

const formVazio = { marca: '', modelo: '', placa: '', ano: '', valorDiaria: '' };

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [apenasDisponiveis, setApenasDisponiveis] = useState(false);
  const [form, setForm] = useState(formVazio);
  const [mensagem, setMensagem] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const sufixo = apenasDisponiveis ? '?disponivel=true' : '';
      setVeiculos(await request(`/veiculos${sufixo}`));
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }, [apenasDisponiveis]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function alterar(evento) {
    setForm({ ...form, [evento.target.name]: evento.target.value });
  }

  async function cadastrar(evento) {
    evento.preventDefault();
    setMensagem(null);
    try {
      await request('/veiculos', {
        method: 'POST',
        body: { ...form, ano: Number(form.ano), valorDiaria: Number(form.valorDiaria) }
      });
      setForm(formVazio);
      setMensagem({ tipo: 'sucesso', texto: 'Veículo cadastrado' });
      await carregar();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <div className="duas-colunas">
      <form className="painel" onSubmit={cadastrar}>
        <h2>Cadastrar veículo</h2>
        <label>
          Marca
          <input name="marca" value={form.marca} onChange={alterar} required />
        </label>
        <label>
          Modelo
          <input name="modelo" value={form.modelo} onChange={alterar} required />
        </label>
        <label>
          Placa
          <input name="placa" value={form.placa} onChange={alterar} required />
        </label>
        <label>
          Ano
          <input name="ano" type="number" value={form.ano} onChange={alterar} required />
        </label>
        <label>
          Valor da diária (R$)
          <input name="valorDiaria" type="number" min="0.01" step="0.01" value={form.valorDiaria} onChange={alterar} required />
        </label>
        <Mensagem mensagem={mensagem} />
        <button type="submit">Cadastrar veículo</button>
      </form>

      <section className="painel">
        <div className="cabecalho-lista">
          <h2>Frota</h2>
          <label className="filtro">
            <input type="checkbox" checked={apenasDisponiveis} onChange={(e) => setApenasDisponiveis(e.target.checked)} />
            Mostrar só disponíveis
          </label>
        </div>
        {veiculos.length === 0 ? (
          <p className="vazio">Nenhum veículo encontrado. Cadastre o primeiro ao lado.</p>
        ) : (
          <div className="tabela-rolagem">
            <table>
              <thead>
                <tr>
                  <th>Veículo</th>
                  <th>Placa</th>
                  <th>Ano</th>
                  <th>Diária</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {veiculos.map((veiculo) => (
                  <tr key={veiculo.id}>
                    <td>{veiculo.marca} {veiculo.modelo}</td>
                    <td>{veiculo.placa}</td>
                    <td>{veiculo.ano}</td>
                    <td>{moeda(veiculo.valorDiaria)}</td>
                    <td>
                      <span className={`selo ${veiculo.disponivel ? 'livre' : 'alugado'}`}>
                        {veiculo.disponivel ? 'Disponível' : 'Alugado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
