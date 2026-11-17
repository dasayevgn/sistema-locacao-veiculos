const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const veiculos = [
  { marca: 'Fiat', modelo: 'Argo', placa: 'ABC1D23', ano: 2022, valorDiaria: 120 },
  { marca: 'Volkswagen', modelo: 'Gol', placa: 'DEF4G56', ano: 2021, valorDiaria: 95 },
  { marca: 'Toyota', modelo: 'Corolla', placa: 'HIJ7K89', ano: 2023, valorDiaria: 220 },
  { marca: 'Hyundai', modelo: 'HB20', placa: 'LMN0P12', ano: 2022, valorDiaria: 110 }
];

async function main() {
  const senha = await bcrypt.hash('123456', 10);
  await prisma.usuario.upsert({
    where: { email: 'demo@locadora.com' },
    update: {},
    create: { nome: 'Usuário Demo', email: 'demo@locadora.com', senha }
  });
  for (const veiculo of veiculos) {
    await prisma.veiculo.upsert({
      where: { placa: veiculo.placa },
      update: {},
      create: veiculo
    });
  }
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
