const SiteContent = require('../models/SiteContent');

exports.getPublicSiteContent = async (req, res) => {
  try {
    const { section, keys } = req.query;
    const query = { status: 'active' };

    if (section) query.section = section;
    if (keys) {
      const keyList = String(keys).split(',').map((k) => k.trim()).filter(Boolean);
      if (keyList.length > 0) query.key = { $in: keyList };
    }

    const contents = await SiteContent.find(query).lean();

    const dataMap = {};
    contents.forEach((item) => {
      dataMap[item.key] = item;
    });

    return res.status(200).json({
      success: true,
      count: contents.length,
      data: dataMap,
      contents
    });
  } catch (error) {
    console.error('Get public site content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch site content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAdminSiteContents = async (req, res) => {
  try {
    const { section } = req.query;
    const query = {};
    if (section) query.section = section;

    const contents = await SiteContent.find(query).sort({ section: 1, key: 1 }).lean();

    return res.status(200).json({
      success: true,
      count: contents.length,
      data: contents,
      contents
    });
  } catch (error) {
    console.error('Get admin site content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin site content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getSiteContentByKey = async (req, res) => {
  try {
    const key = req.params.key;
    const item = await SiteContent.findOne({ key });
    if (!item) {
      return res.status(404).json({ success: false, message: `SiteContent key '${key}' not found` });
    }
    return res.status(200).json({ success: true, data: item, item });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch site content by key' });
  }
};

exports.updateSiteContentByKey = async (req, res) => {
  try {
    const key = req.params.key;
    const { section, title, subtitle, description, content, image, icon, buttonText, buttonLink, metadata, status } = req.body;

    const updateData = { key };
    if (section !== undefined) updateData.section = String(section).trim();
    if (title !== undefined) updateData.title = String(title).trim();
    if (subtitle !== undefined) updateData.subtitle = String(subtitle).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (content !== undefined) updateData.content = String(content).trim();
    if (icon !== undefined) updateData.icon = String(icon).trim();
    if (buttonText !== undefined) updateData.buttonText = String(buttonText).trim();
    if (buttonLink !== undefined) updateData.buttonLink = String(buttonLink).trim();
    if (metadata !== undefined) updateData.metadata = metadata;
    if (status !== undefined) updateData.status = status === 'inactive' ? 'inactive' : 'active';

    if (req.file) {
      updateData.image = `/uploads/site-content/${req.file.filename}`;
    } else if (image !== undefined) {
      updateData.image = image;
    }

    const item = await SiteContent.findOneAndUpdate(
      { key },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: `SiteContent key '${key}' updated successfully`,
      data: item,
      item
    });
  } catch (error) {
    console.error('Update site content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update site content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
