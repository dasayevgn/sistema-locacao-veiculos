const { Router } = require('express');
const controller = require('../controllers/authController');
const auth = require('../middlewares/auth');

const router = Router();

router.post('/register', controller.registrar);
router.post('/login', controller.login);
router.get('/me', auth, controller.perfil);

module.exports = router;
