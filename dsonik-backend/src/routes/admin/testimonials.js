const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/admin');
const { testimonialUpload } = require('../../middleware/cmsUpload');
const {
  getAdminTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} = require('../../controllers/testimonialController');

router.get('/', protect, authorize('admin', 'superadmin'), getAdminTestimonials);
router.get('/:id', protect, authorize('admin', 'superadmin'), getTestimonialById);

router.post(
  '/',
  protect,
  authorize('admin', 'superadmin'),
  testimonialUpload.single('image'),
  createTestimonial
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'superadmin'),
  testimonialUpload.single('image'),
  updateTestimonial
);

router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteTestimonial);

module.exports = router;
