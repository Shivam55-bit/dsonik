const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');
const ctrl = require('../../controllers/adminUserController');

router.get('/', auth, admin, ctrl.listUsers);
router.get('/:id', auth, admin, ctrl.getUser);
router.put('/:id', auth, admin, ctrl.updateUser);
router.post('/:id/revoke-sessions', auth, admin, ctrl.revokeSessions);

module.exports = router;
