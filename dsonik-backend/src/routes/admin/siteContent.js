const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/admin');
const { siteContentUpload } = require('../../middleware/cmsUpload');
const {
  getAdminSiteContents,
  getSiteContentByKey,
  updateSiteContentByKey
} = require('../../controllers/siteContentController');

router.get('/', protect, authorize('admin', 'superadmin'), getAdminSiteContents);
router.get('/:key', protect, authorize('admin', 'superadmin'), getSiteContentByKey);
router.put(
  '/:key',
  protect,
  authorize('admin', 'superadmin'),
  siteContentUpload.single('image'),
  updateSiteContentByKey
);

module.exports = router;
