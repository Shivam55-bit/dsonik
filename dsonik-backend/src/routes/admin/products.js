const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');
const ctrl = require('../../controllers/adminProductController');
const validators = require('../../middleware/validators');

router.post('/', auth, admin, validators.productRules, ctrl.createProduct);
router.put('/:id', auth, admin, validators.productRules, ctrl.updateProduct);
router.delete('/:id', auth, admin, ctrl.deleteProduct);
router.get('/', auth, admin, ctrl.listProductsAdmin);
router.get('/:id', auth, admin, ctrl.getProductAdmin);

module.exports = router;
