const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');
const ctrl = require('../../controllers/checkoutController');

router.get('/', auth, admin, ctrl.listAdminOrders);
router.get('/:id', auth, admin, ctrl.getAdminOrderById);
router.patch('/:id/status', auth, admin, ctrl.updateAdminOrderStatus);
router.patch('/:id/payment-status', auth, admin, ctrl.updateAdminPaymentStatus);
router.patch('/:id/approve-payment', auth, admin, ctrl.approvePayment);
router.patch('/:id/reject-payment', auth, admin, ctrl.rejectPayment);

module.exports = router;
