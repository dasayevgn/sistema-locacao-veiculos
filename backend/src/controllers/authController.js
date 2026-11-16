const authService = require('../services/authService');
const asyncHandler = require('../lib/asyncHandler');

exports.registrar = asyncHandler(async (req, res) => {
  const usuario = await authService.registrar(req.body || {});
  res.status(201).json(usuario);
});

exports.login = asyncHandler(async (req, res) => {
  const resultado = await authService.login(req.body || {});
  res.status(200).json(resultado);
});

exports.perfil = asyncHandler(async (req, res) => {
  const usuario = await authService.perfil(req.usuarioId);
  res.status(200).json(usuario);
});
