const { Router } = require('express');
const controller = require('../controllers/locacaoController');
const auth = require('../middlewares/auth');

const router = Router();

router.use(auth);
router.post('/', controller.criar);
router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.patch('/:id/finalizar', controller.finalizar);

module.exports = router;
