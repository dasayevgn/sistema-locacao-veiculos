const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');

const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

function textoObrigatorio(valor, campo) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new AppError(400, `${campo} inválido`);
  }
  return valor.trim();
}

async function criar({ marca, modelo, placa, ano, valorDiaria }) {
  const marcaValida = textoObrigatorio(marca, 'Marca');
  const modeloValido = textoObrigatorio(modelo, 'Modelo');

  const placaNormalizada = typeof placa === 'string' ? placa.replace(/[\s-]/g, '').toUpperCase() : '';
  if (!placaRegex.test(placaNormalizada)) {
    throw new AppError(400, 'Placa inválida');
  }

  const anoNumero = Number(ano);
  if (!Number.isInteger(anoNumero) || anoNumero < 1900 || anoNumero > new Date().getFullYear() + 1) {
    throw new AppError(400, 'Ano inválido');
  }

  const diaria = Number(valorDiaria);
  if (!Number.isFinite(diaria) || diaria <= 0) {
    throw new AppError(400, 'O valor da diária deve ser positivo');
  }

  const existente = await prisma.veiculo.findUnique({ where: { placa: placaNormalizada } });
  if (existente) {
    throw new AppError(409, 'Placa já cadastrada');
  }

  return prisma.veiculo.create({
    data: {
      marca: marcaValida,
      modelo: modeloValido,
      placa: placaNormalizada,
      ano: anoNumero,
      valorDiaria: Math.round(diaria * 100) / 100
    }
  });
}

async function listar({ disponivel }) {
  const where = disponivel === 'true' ? { disponivel: true } : {};
  return prisma.veiculo.findMany({ where, orderBy: { id: 'asc' } });
}

module.exports = { criar, listar };
