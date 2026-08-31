const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');
const upload = require('../../middleware/upload');
const ctrl = require('../../controllers/checkoutController');

router.get('/', auth, admin, ctrl.getAdminPaymentSettings);
router.put('/', auth, admin, ctrl.saveAdminPaymentSettings);
router.post('/qr', auth, admin, upload.single('file'), ctrl.uploadPaymentQr);
router.delete('/qr', auth, admin, ctrl.deletePaymentQr);

module.exports = router;
