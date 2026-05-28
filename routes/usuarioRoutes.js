const router = require('express').Router();
const ctrl = require('../controllers/usuarioController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', adminMiddleware, ctrl.create);
router.put('/:id', adminMiddleware, ctrl.update);
router.delete('/:id', adminMiddleware, ctrl.delete);

module.exports = router;
