const express = require('express');
const router = express.Router();
const { getPublicAchievements } = require('../controllers/achievementController');

router.get('/', getPublicAchievements);

module.exports = router;
