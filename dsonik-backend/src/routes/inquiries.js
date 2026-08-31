const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry
} = require('../controllers/inquiryController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/admin');

// Public route to submit an inquiry
router.post('/', createInquiry);

// Protected admin routes
router.get('/', protect, authorize('admin'), getInquiries);
router.get('/:id', protect, authorize('admin'), getInquiryById);
router.put('/:id/status', protect, authorize('admin'), updateInquiryStatus);
router.delete('/:id', protect, authorize('admin'), deleteInquiry);

module.exports = router;
