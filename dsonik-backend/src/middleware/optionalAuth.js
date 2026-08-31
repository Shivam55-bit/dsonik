const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dsonik-super-secret-jwt-key-2026');
    const user = await User.findById(decoded.id);
    if (!user || user.isBlocked) {
      req.user = null;
      return next();
    }
    req.user = user;
    return next();
  } catch (err) {
    req.user = null;
    return next();
  }
};

module.exports = optionalAuth;
