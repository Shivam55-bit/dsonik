const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/checkoutController');

router.get('/public', ctrl.getPublicPaymentSettings);

module.exports = router;
