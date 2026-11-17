const { Router } = require('express');
const controller = require('../controllers/veiculoController');
const auth = require('../middlewares/auth');

const router = Router();

router.use(auth);
router.post('/', controller.criar);
router.get('/', controller.listar);

module.exports = router;
