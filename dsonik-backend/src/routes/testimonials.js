const express = require('express');
const router = express.Router();
const { getPublicTestimonials } = require('../controllers/testimonialController');

router.get('/', getPublicTestimonials);

module.exports = router;
