const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');

const MS_POR_DIA = 24 * 60 * 60 * 1000;
const incluirVeiculo = { veiculo: true };

function lerId(valor, campo) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, `${campo} inválido`);
  }
  return id;
}

function lerData(valor, campo) {
  const data = typeof valor === 'string' ? new Date(valor) : null;
  if (!data || Number.isNaN(data.getTime())) {
    throw new AppError(400, `${campo} inválida`);
  }
  return data;
}

function calcularValorTotal(valorDiaria, inicio, fim) {
  const diarias = Math.ceil((fim.getTime() - inicio.getTime()) / MS_POR_DIA);
  return Math.round(Number(valorDiaria) * diarias * 100) / 100;
}

async function criar(usuarioId, { veiculoId, dataInicio, dataPrevistaDevolucao }) {
  const idVeiculo = lerId(veiculoId, 'Veículo');
  const inicio = lerData(dataInicio, 'Data de início');
  const fim = lerData(dataPrevistaDevolucao, 'Data prevista de devolução');
  if (fim <= inicio) {
    throw new AppError(400, 'A data prevista de devolução deve ser posterior à data de início');
  }

  return prisma.$transaction(async (tx) => {
    const veiculo = await tx.veiculo.findUnique({ where: { id: idVeiculo } });
    if (!veiculo) {
      throw new AppError(404, 'Veículo não encontrado');
    }

    const reserva = await tx.veiculo.updateMany({
      where: { id: idVeiculo, disponivel: true },
      data: { disponivel: false }
    });
    if (reserva.count === 0) {
      throw new AppError(409, 'Veículo indisponível');
    }

    return tx.locacao.create({
      data: {
        usuarioId,
        veiculoId: idVeiculo,
        dataInicio: inicio,
        dataPrevistaDevolucao: fim,
        valorTotal: calcularValorTotal(veiculo.valorDiaria, inicio, fim)
      },
      include: incluirVeiculo
    });
  });
}

async function listar(usuarioId) {
  return prisma.locacao.findMany({
    where: { usuarioId },
    include: incluirVeiculo,
    orderBy: { id: 'desc' }
  });
}

async function buscar(usuarioId, idInformado) {
  const id = lerId(idInformado, 'Locação');
  const locacao = await prisma.locacao.findUnique({ where: { id }, include: incluirVeiculo });
  if (!locacao) {
    throw new AppError(404, 'Locação não encontrada');
  }
  if (locacao.usuarioId !== usuarioId) {
    throw new AppError(403, 'Acesso negado a esta locação');
  }
  return locacao;
}

async function finalizar(usuarioId, idInformado) {
  const id = lerId(idInformado, 'Locação');

  return prisma.$transaction(async (tx) => {
    const locacao = await tx.locacao.findUnique({ where: { id } });
    if (!locacao) {
      throw new AppError(404, 'Locação não encontrada');
    }
    if (locacao.usuarioId !== usuarioId) {
      throw new AppError(403, 'Acesso negado a esta locação');
    }

    const encerramento = await tx.locacao.updateMany({
      where: { id, status: 'ATIVA' },
      data: { status: 'FINALIZADA', dataDevolucao: new Date() }
    });
    if (encerramento.count === 0) {
      throw new AppError(409, 'Locação já finalizada');
    }

    await tx.veiculo.update({ where: { id: locacao.veiculoId }, data: { disponivel: true } });

    return tx.locacao.findUnique({ where: { id }, include: incluirVeiculo });
  });
}

module.exports = { criar, listar, buscar, finalizar };
