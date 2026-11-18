const locacaoService = require('../services/locacaoService');
const asyncHandler = require('../lib/asyncHandler');

exports.criar = asyncHandler(async (req, res) => {
  const locacao = await locacaoService.criar(req.usuarioId, req.body || {});
  res.status(201).json(locacao);
});

exports.listar = asyncHandler(async (req, res) => {
  const locacoes = await locacaoService.listar(req.usuarioId);
  res.status(200).json(locacoes);
});

exports.buscar = asyncHandler(async (req, res) => {
  const locacao = await locacaoService.buscar(req.usuarioId, req.params.id);
  res.status(200).json(locacao);
});

exports.finalizar = asyncHandler(async (req, res) => {
  const locacao = await locacaoService.finalizar(req.usuarioId, req.params.id);
  res.status(200).json(locacao);
});
