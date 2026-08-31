const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/cartController');

router.get('/', auth, ctrl.getCart);
router.post('/add', auth, ctrl.addToCart);
router.put('/update', auth, ctrl.updateCart);
router.delete('/remove/:id', auth, ctrl.removeFromCart);
router.delete('/clear', auth, ctrl.clearCart);

module.exports = router;
