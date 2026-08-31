const express = require('express');
const router = express.Router();
const { getPublicBanners } = require('../controllers/bannerController');

router.get('/', getPublicBanners);

module.exports = router;
