const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/admin');
const categoryUpload = require('../../middleware/categoryUpload');
const {
  getAdminCategories,
  getCategoryBySlugOrId,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../../controllers/categoryController');

router.get(
  '/',
  protect,
  authorize('admin', 'superadmin'),
  getAdminCategories
);

router.get(
  '/:id',
  protect,
  authorize('admin', 'superadmin'),
  getCategoryBySlugOrId
);

router.post(
  '/',
  protect,
  authorize('admin', 'superadmin'),
  categoryUpload.single('image'),
  createCategory
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'superadmin'),
  categoryUpload.single('image'),
  updateCategory
);

router.delete(
  '/:id',
  protect,
  authorize('admin', 'superadmin'),
  deleteCategory
);

module.exports = router;
