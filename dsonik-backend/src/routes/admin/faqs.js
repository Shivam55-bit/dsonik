const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/admin');
const {
  getAdminFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq
} = require('../../controllers/faqController');

router.get('/', protect, authorize('admin', 'superadmin'), getAdminFaqs);
router.get('/:id', protect, authorize('admin', 'superadmin'), getFaqById);
router.post('/', protect, authorize('admin', 'superadmin'), createFaq);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateFaq);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteFaq);

module.exports = router;
