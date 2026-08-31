const express = require('express');
const router = express.Router();
const { getPublicFaqs } = require('../controllers/faqController');

router.get('/', getPublicFaqs);

module.exports = router;
