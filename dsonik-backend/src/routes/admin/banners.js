const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/admin');
const bannerUpload = require('../../middleware/bannerUpload');
const {
  getAdminBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../../controllers/bannerController');

const bannerFields = bannerUpload.fields([
  { name: 'desktopImage', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 },
]);

router.get('/', protect, authorize('admin', 'superadmin'), getAdminBanners);
router.get('/:id', protect, authorize('admin', 'superadmin'), getBannerById);

router.post(
  '/',
  protect,
  authorize('admin', 'superadmin'),
  bannerFields,
  createBanner
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'superadmin'),
  bannerFields,
  updateBanner
);

router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteBanner);

module.exports = router;
