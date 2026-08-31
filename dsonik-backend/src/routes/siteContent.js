const express = require('express');
const router = express.Router();
const { getPublicSiteContent } = require('../controllers/siteContentController');

router.get('/', getPublicSiteContent);

module.exports = router;
