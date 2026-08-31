const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const admin = require('../middleware/admin');
const ctrl = require('../controllers/orderController');
const checkoutCtrl = require('../controllers/checkoutController');

// Specific paths must precede parameter path /:id
router.post('/', auth, ctrl.createOrder);
router.post('/cash-on-delivery', optionalAuth, checkoutCtrl.createCashOrder);
router.post('/online-qr', optionalAuth, checkoutCtrl.createOnlineOrder);
router.get('/my-orders', auth, ctrl.getMyOrders);
router.get('/:id/invoice', auth, ctrl.generateInvoice);

// Admin order operations
router.get('/', auth, admin, ctrl.listOrdersAdmin);
router.put('/:id/status', auth, admin, ctrl.updateOrderStatus);

// Parameterized path
router.get('/:id', auth, ctrl.getOrder);

module.exports = router;
