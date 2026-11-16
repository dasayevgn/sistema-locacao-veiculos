const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const config = require('../config');

module.exports = async (req, res, next) => {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return next(new AppError(401, 'Token não informado'));
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return next(new AppError(401, 'Token inválido ou expirado'));
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true }
    });
    if (!usuario) {
      return next(new AppError(401, 'Usuário não encontrado'));
    }
    req.usuarioId = usuario.id;
    next();
  } catch (erro) {
    next(erro);
  }
};
