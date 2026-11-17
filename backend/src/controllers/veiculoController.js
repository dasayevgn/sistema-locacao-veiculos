const veiculoService = require('../services/veiculoService');
const asyncHandler = require('../lib/asyncHandler');

exports.criar = asyncHandler(async (req, res) => {
  const veiculo = await veiculoService.criar(req.body || {});
  res.status(201).json(veiculo);
});

exports.listar = asyncHandler(async (req, res) => {
  const veiculos = await veiculoService.listar(req.query);
  res.status(200).json(veiculos);
});
