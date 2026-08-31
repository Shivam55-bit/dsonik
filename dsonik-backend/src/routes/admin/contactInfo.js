const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/admin');
const {
  getAdminContactInfo,
  updateContactInfo
} = require('../../controllers/contactInfoController');

router.get('/', protect, authorize('admin', 'superadmin'), getAdminContactInfo);
router.put('/', protect, authorize('admin', 'superadmin'), updateContactInfo);

module.exports = router;
