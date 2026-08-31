const express = require('express');
const router = express.Router();
const optionalAuth = require('../middleware/optionalAuth');
const ctrl = require('../controllers/checkoutController');

router.post('/address', optionalAuth, ctrl.saveAddress);
router.get('/address', optionalAuth, ctrl.getSavedAddress);
router.put('/address', optionalAuth, ctrl.updateAddress);

module.exports = router;
