const express = require('express');
const router = express.Router();
const { getPublicContactInfo } = require('../controllers/contactInfoController');

router.get('/', getPublicContactInfo);

module.exports = router;
