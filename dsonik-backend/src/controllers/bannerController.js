const fs = require('fs');
const path = require('path');
const Banner = require('../models/Banner');
const { normalizeUploadPath } = require('../utils/normalizeUploadPath');

exports.getPublicBanners = async (req, res) => {
  try {
    const banners = await Banner.find({
      status: 'active',
    })
      .sort({
        displayOrder: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
      banners,
    });
  } catch (error) {
    console.error('Get public banners error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getAdminBanners = async (req, res) => {
  try {
    const {
      search = '',
      q = '',
      status,
      page = 1,
      limit = 100,
    } = req.query;

    const searchTerm = search || q;
    const query = {};

    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { subtitle: { $regex: searchTerm, $options: 'i' } },
        { tag: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const banners = await Banner.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Banner.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: banners.length,
      total,
      data: banners,
      banners,
    });
  } catch (error) {
    console.error('Get admin banners error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin banners',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: banner,
      banner,
    });
  } catch (error) {
    console.error('Get banner by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch banner details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const desktopFile = req.files?.desktopImage?.[0];
    const mobileFile = req.files?.mobileImage?.[0];

    const desktopPath = desktopFile
      ? `/uploads/banners/${desktopFile.filename}`
      : normalizeUploadPath(req.body.desktopImage || req.body.image || '');

    const mobilePath = mobileFile
      ? `/uploads/banners/${mobileFile.filename}`
      : normalizeUploadPath(req.body.mobileImage || '');

    if (!req.body.title || !String(req.body.title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Banner title is required',
      });
    }

    if (!desktopPath) {
      return res.status(400).json({
        success: false,
        message: 'Desktop banner image is required',
      });
    }

    const banner = await Banner.create({
      title: String(req.body.title).trim(),
      subtitle: String(req.body.subtitle || '').trim(),
      description: String(req.body.description || '').trim(),
      tag: String(req.body.tag || '').trim(),
      desktopImage: desktopPath,
      mobileImage: mobilePath,
      buttonOneText: req.body.buttonOneText || 'Explore Machines',
      buttonOneLink: req.body.buttonOneLink || '/category/all',
      buttonTwoText: req.body.buttonTwoText || 'Enquire Now',
      buttonTwoLink: req.body.buttonTwoLink || '/contact',
      status: req.body.status === 'inactive' ? 'inactive' : 'active',
      displayOrder: Number(req.body.displayOrder) || 0,
      overlayOpacity: Number(req.body.overlayOpacity) ?? 0.45,
      textAlignment: ['left', 'center', 'right'].includes(req.body.textAlignment)
        ? req.body.textAlignment
        : 'left',
    });

    return res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner,
      banner,
    });
  } catch (error) {
    console.error('Create banner error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const existing = await Banner.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    const desktopFile = req.files?.desktopImage?.[0];
    const mobileFile = req.files?.mobileImage?.[0];

    const updateData = {};

    if (req.body.title !== undefined) updateData.title = String(req.body.title).trim();
    if (req.body.subtitle !== undefined) updateData.subtitle = String(req.body.subtitle).trim();
    if (req.body.description !== undefined) updateData.description = String(req.body.description).trim();
    if (req.body.tag !== undefined) updateData.tag = String(req.body.tag).trim();
    if (req.body.buttonOneText !== undefined) updateData.buttonOneText = String(req.body.buttonOneText).trim();
    if (req.body.buttonOneLink !== undefined) updateData.buttonOneLink = String(req.body.buttonOneLink).trim();
    if (req.body.buttonTwoText !== undefined) updateData.buttonTwoText = String(req.body.buttonTwoText).trim();
    if (req.body.buttonTwoLink !== undefined) updateData.buttonTwoLink = String(req.body.buttonTwoLink).trim();
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';
    if (req.body.displayOrder !== undefined) updateData.displayOrder = Number(req.body.displayOrder) || 0;
    if (req.body.overlayOpacity !== undefined) updateData.overlayOpacity = Number(req.body.overlayOpacity) ?? 0.45;
    if (req.body.textAlignment !== undefined && ['left', 'center', 'right'].includes(req.body.textAlignment)) {
      updateData.textAlignment = req.body.textAlignment;
    }

    if (desktopFile) {
      updateData.desktopImage = `/uploads/banners/${desktopFile.filename}`;
    } else if (req.body.desktopImage) {
      updateData.desktopImage = normalizeUploadPath(req.body.desktopImage);
    }

    if (mobileFile) {
      updateData.mobileImage = `/uploads/banners/${mobileFile.filename}`;
    } else if (req.body.mobileImage !== undefined) {
      updateData.mobileImage = normalizeUploadPath(req.body.mobileImage);
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: banner,
      banner,
    });
  } catch (error) {
    console.error('Update banner error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update banner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    // Safely remove local image files if present
    const removeFile = (relativePath) => {
      if (!relativePath || typeof relativePath !== 'string') return;
      if (relativePath.startsWith('/uploads/')) {
        const fullPath = path.join(process.cwd(), relativePath.slice(1));
        if (fs.existsSync(fullPath)) {
          try { fs.unlinkSync(fullPath); } catch (e) { /* ignore */ }
        }
      }
    };

    removeFile(banner.desktopImage);
    removeFile(banner.mobileImage);

    await Banner.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
