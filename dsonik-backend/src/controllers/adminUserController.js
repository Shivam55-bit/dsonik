const User = require('../models/User');

exports.listUsers = async (req, res, next) => {
  try {
    const { q, role, isBlocked, page = 1, limit = 50 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      data: users,
      users
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      data: user,
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, phone, role, isBlocked } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent self-demotion or self-blocking if admin modifying own account
    if (req.user.id === user._id.toString()) {
      if (isBlocked) return res.status(400).json({ success: false, message: 'You cannot block your own admin account' });
      if (role && role !== user.role) return res.status(400).json({ success: false, message: 'You cannot change your own admin role' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (isBlocked !== undefined) user.isBlocked = Boolean(isBlocked);

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.revokeSessions = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.refreshTokens = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: `All sessions revoked for user ${user.email}`
    });
  } catch (error) {
    next(error);
  }
};
