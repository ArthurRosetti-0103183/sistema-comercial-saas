const router = require('express').Router();
const ctrl = require('../controllers/produtoController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', ctrl.list);
router.get('/simple', ctrl.listSimple);
router.get('/low-stock', ctrl.lowStock);
router.get('/out-of-stock', ctrl.outOfStock);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
