const Achievement = require('../models/Achievement');

exports.getPublicAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ status: 'active' })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: achievements.length,
      data: achievements,
      achievements
    });
  } catch (error) {
    console.error('Get public achievements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAdminAchievements = async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    const query = {};
    if (status) query.status = status;

    const achievements = await Achievement.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Achievement.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: achievements.length,
      total,
      data: achievements,
      achievements
    });
  } catch (error) {
    console.error('Get admin achievements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin achievements',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }
    return res.status(200).json({ success: true, data: achievement, achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch achievement' });
  }
};

exports.createAchievement = async (req, res) => {
  try {
    const { title, value, suffix = '+', icon = 'globe', status = 'active', displayOrder = 0 } = req.body;

    if (!title || !String(title).trim() || value === undefined) {
      return res.status(400).json({ success: false, message: 'Title and numeric value are required' });
    }

    const achievement = await Achievement.create({
      title: String(title).trim(),
      value: Number(value) || 0,
      suffix: suffix ? String(suffix).trim() : '+',
      icon: icon ? String(icon).trim() : 'globe',
      status: status === 'inactive' ? 'inactive' : 'active',
      displayOrder: Number(displayOrder) || 0
    });

    return res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: achievement,
      achievement
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create achievement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateAchievement = async (req, res) => {
  try {
    const existing = await Achievement.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    const updateData = {};
    if (req.body.title !== undefined) updateData.title = String(req.body.title).trim();
    if (req.body.value !== undefined) updateData.value = Number(req.body.value) || 0;
    if (req.body.suffix !== undefined) updateData.suffix = String(req.body.suffix).trim();
    if (req.body.icon !== undefined) updateData.icon = String(req.body.icon).trim();
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';
    if (req.body.displayOrder !== undefined) updateData.displayOrder = Number(req.body.displayOrder) || 0;

    const achievement = await Achievement.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      success: true,
      message: 'Achievement updated successfully',
      data: achievement,
      achievement
    });
  } catch (error) {
    console.error('Update achievement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update achievement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }
    return res.status(200).json({ success: true, message: 'Achievement deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete achievement' });
  }
};
