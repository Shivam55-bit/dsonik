const express = require('express');
const router = express.Router();
const { getPublicCategories, getCategoryBySlugOrId } = require('../controllers/categoryController');

router.get('/', getPublicCategories);
router.get('/:slugOrId', getCategoryBySlugOrId);

module.exports = router;
