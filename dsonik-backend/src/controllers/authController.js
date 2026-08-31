const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing required fields' });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email is already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email: email.toLowerCase(), phone, password: hashed, role: 'user' });

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET || 'refreshsecret', { expiresIn: '30d' });

    user.refreshTokens = [refreshToken];
    await user.save();

    const secure = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: accessToken,
      data: {
        token: accessToken,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Your account has been blocked' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET || 'refreshsecret', { expiresIn: '30d' });

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    const secure = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token: accessToken,
      data: {
        token: accessToken,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
    }
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Your account has been blocked' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET || 'refreshsecret', { expiresIn: '30d' });

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    const secure = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

    return res.json({
      success: true,
      message: 'Admin logged in successfully',
      token: accessToken,
      data: {
        token: accessToken,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = (req.cookies && req.cookies.refreshToken) || req.body.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token provided' });

    const payload = jwt.verify(token, process.env.REFRESH_SECRET || 'refreshsecret');
    const user = await User.findById(payload.id);
    if (!user || user.isBlocked) return res.status(401).json({ success: false, message: 'Invalid or revoked refresh token' });

    if (!user.refreshTokens || !user.refreshTokens.includes(token)) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked' });
    }

    const newRefresh = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET || 'refreshsecret', { expiresIn: '30d' });
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    user.refreshTokens.push(newRefresh);
    await user.save();

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', newRefresh, { httpOnly: true, secure, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

    return res.json({
      success: true,
      token: accessToken,
      data: { token: accessToken }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Refresh token failed' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.REFRESH_SECRET || 'refreshsecret');
        const user = await User.findById(payload.id);
        if (user && user.refreshTokens) {
          user.refreshTokens = user.refreshTokens.filter(t => t !== token);
          await user.save();
        }
      } catch (e) {}
    }
    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (e) {
    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Logged out' });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({
      success: true,
      data: user,
      user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
