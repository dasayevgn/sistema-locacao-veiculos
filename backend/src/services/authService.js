const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const config = require('../config');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const selecaoPublica = { id: true, nome: true, email: true, criadoEm: true };

function dadosPublicos(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    criadoEm: usuario.criadoEm
  };
}

async function registrar({ nome, email, senha }) {
  if (typeof nome !== 'string' || nome.trim().length < 2) {
    throw new AppError(400, 'Nome inválido');
  }
  if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
    throw new AppError(400, 'E-mail inválido');
  }
  if (typeof senha !== 'string' || senha.length < 6) {
    throw new AppError(400, 'A senha deve ter ao menos 6 caracteres');
  }

  const emailNormalizado = email.trim().toLowerCase();
  const existente = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });
  if (existente) {
    throw new AppError(409, 'E-mail já cadastrado');
  }

  const hash = await bcrypt.hash(senha, 10);
  const usuario = await prisma.usuario.create({
    data: { nome: nome.trim(), email: emailNormalizado, senha: hash }
  });
  return dadosPublicos(usuario);
}

async function login({ email, senha }) {
  if (typeof email !== 'string' || typeof senha !== 'string') {
    throw new AppError(400, 'Informe e-mail e senha');
  }

  const usuario = await prisma.usuario.findUnique({ where: { email: email.trim().toLowerCase() } });
  const credenciaisValidas = usuario && (await bcrypt.compare(senha, usuario.senha));
  if (!credenciaisValidas) {
    throw new AppError(401, 'Credenciais inválidas');
  }

  const token = jwt.sign({ sub: usuario.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return { token, usuario: dadosPublicos(usuario) };
}

async function perfil(usuarioId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: selecaoPublica
  });
  if (!usuario) {
    throw new AppError(401, 'Usuário não encontrado');
  }
  return usuario;
}

module.exports = { registrar, login, perfil };
