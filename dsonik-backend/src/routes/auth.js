const express = require('express');
const router = express.Router();
const { register, login, adminLogin, profile, refresh, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validators = require('../middleware/validators');

router.post('/register', validators.registerRules, register);
router.post('/login', validators.loginRules, login);
router.post('/login/admin', validators.loginRules, adminLogin);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/profile', authMiddleware, profile);

module.exports = router;
