const router = require('express').Router();
const ctrl = require('../controllers/relatorioController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/dashboard', ctrl.dashboard);
router.get('/vendas', ctrl.vendasPorPeriodo);
router.get('/estoque', ctrl.estoque);
router.get('/financeiro', ctrl.financeiro);

module.exports = router;
