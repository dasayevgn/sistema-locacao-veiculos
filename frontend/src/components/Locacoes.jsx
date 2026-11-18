import { useCallback, useEffect, useState } from 'react';
import { request } from '../api.js';
import { moeda, dataHora } from '../format.js';
import Mensagem from './Mensagem.jsx';

const formVazio = { veiculoId: '', dataInicio: '', dataPrevistaDevolucao: '' };

export default function Locacoes() {
  const [disponiveis, setDisponiveis] = useState([]);
  const [locacoes, setLocacoes] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [mensagem, setMensagem] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const [veiculos, historico] = await Promise.all([
        request('/veiculos?disponivel=true'),
        request('/locacoes')
      ]);
      setDisponiveis(veiculos);
      setLocacoes(historico);
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function alterar(evento) {
    setForm({ ...form, [evento.target.name]: evento.target.value });
  }

  async function registrar(evento) {
    evento.preventDefault();
    setMensagem(null);
    try {
      const locacao = await request('/locacoes', {
        method: 'POST',
        body: {
          veiculoId: Number(form.veiculoId),
          dataInicio: new Date(form.dataInicio).toISOString(),
          dataPrevistaDevolucao: new Date(form.dataPrevistaDevolucao).toISOString()
        }
      });
      setForm(formVazio);
      setMensagem({ tipo: 'sucesso', texto: `Locação registrada. Valor total: ${moeda(locacao.valorTotal)}` });
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
    await carregar();
  }

  async function finalizar(id) {
    setMensagem(null);
    try {
      await request(`/locacoes/${id}/finalizar`, { method: 'PATCH' });
      setMensagem({ tipo: 'sucesso', texto: 'Locação finalizada. O veículo está disponível novamente.' });
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
    await carregar();
  }

  return (
    <div className="duas-colunas">
      <form className="painel" onSubmit={registrar}>
        <h2>Nova locação</h2>
        <label>
          Veículo
          <select name="veiculoId" value={form.veiculoId} onChange={alterar} required>
            <option value="">Escolha um veículo disponível</option>
            {disponiveis.map((veiculo) => (
              <option key={veiculo.id} value={veiculo.id}>
                {veiculo.marca} {veiculo.modelo} · {veiculo.placa} · {moeda(veiculo.valorDiaria)}/dia
              </option>
            ))}
          </select>
        </label>
        <label>
          Início
          <input name="dataInicio" type="datetime-local" value={form.dataInicio} onChange={alterar} required />
        </label>
        <label>
          Devolução prevista
          <input name="dataPrevistaDevolucao" type="datetime-local" value={form.dataPrevistaDevolucao} onChange={alterar} required />
        </label>
        <Mensagem mensagem={mensagem} />
        <button type="submit" disabled={disponiveis.length === 0}>Registrar locação</button>
        {disponiveis.length === 0 && <p className="vazio">Não há veículos disponíveis no momento.</p>}
      </form>

      <section className="painel">
        <h2>Minhas locações</h2>
        {locacoes.length === 0 ? (
          <p className="vazio">Você ainda não fez nenhuma locação.</p>
        ) : (
          <div className="tabela-rolagem">
            <table>
              <thead>
                <tr>
                  <th>Veículo</th>
                  <th>Início</th>
                  <th>Previsto</th>
                  <th>Devolvido</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {locacoes.map((locacao) => (
                  <tr key={locacao.id}>
                    <td>{locacao.veiculo.marca} {locacao.veiculo.modelo}<br /><small>{locacao.veiculo.placa}</small></td>
                    <td>{dataHora(locacao.dataInicio)}</td>
                    <td>{dataHora(locacao.dataPrevistaDevolucao)}</td>
                    <td>{dataHora(locacao.dataDevolucao)}</td>
                    <td>{moeda(locacao.valorTotal)}</td>
                    <td>
                      <span className={`selo ${locacao.status === 'ATIVA' ? 'alugado' : 'livre'}`}>
                        {locacao.status === 'ATIVA' ? 'Ativa' : 'Finalizada'}
                      </span>
                    </td>
                    <td>
                      {locacao.status === 'ATIVA' && (
                        <button type="button" className="secundario" onClick={() => finalizar(locacao.id)}>
                          Finalizar
                        </button>
                      )}
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
