const Category = require('../models/Category');
const Product = require('../models/Product');
const { normalizeUploadPath } = require('../utils/normalizeUploadPath');

exports.getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      status: 'active',
    })
      .sort({
        displayOrder: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
      categories,
    });
  } catch (error) {
    console.error('Get public categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getAdminCategories = async (req, res) => {
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
        {
          name: {
            $regex: searchTerm,
            $options: 'i',
          },
        },
        {
          slug: {
            $regex: searchTerm,
            $options: 'i',
          },
        },
        {
          description: {
            $regex: searchTerm,
            $options: 'i',
          },
        },
      ];
    }

    if (status) {
      query.status = status;
    }

    const categories = await Category.find(query)
      .sort({
        createdAt: -1,
      })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Category.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: categories.length,
      total,
      page: Number(page),
      data: categories,
      categories,
    });
  } catch (error) {
    console.error('Get admin categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Compatibility Alias
exports.getCategories = exports.getPublicCategories;

exports.getCategoryBySlugOrId = async (req, res) => {
  try {
    const slugOrId = req.params.slugOrId || req.params.id;
    let category;

    if (slugOrId && slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(slugOrId);
    } else if (slugOrId) {
      category = await Category.findOne({ slug: slugOrId });
    }

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.status(200).json({
      success: true,
      data: category,
      category,
    });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      status = 'active',
      displayOrder = 0,
      image
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const finalSlug =
      slug && String(slug).trim()
        ? String(slug)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        : String(name)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

    const existingCategory = await Category.findOne({
      slug: finalSlug,
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Category slug already exists',
      });
    }

    const imagePath = req.file
      ? `/uploads/categories/${req.file.filename}`
      : normalizeUploadPath(image || '');

    const category = await Category.create({
      name: String(name).trim(),
      slug: finalSlug,
      description: description
        ? String(description).trim()
        : '',
      image: imagePath,
      status:
        status === true || status === 'active'
          ? 'active'
          : 'inactive',
      displayOrder: Number(displayOrder) || 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      status,
      displayOrder,
      image
    } = req.body;

    const existing = await Category.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const updateData = {};
    if (name && String(name).trim()) {
      updateData.name = String(name).trim();
    }

    if (slug && String(slug).trim()) {
      updateData.slug = String(slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    if (description !== undefined) updateData.description = String(description).trim();
    if (status !== undefined) updateData.status = (status === true || status === 'active') ? 'active' : 'inactive';
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder) || 0;

    if (req.file) {
      updateData.image = `/uploads/categories/${req.file.filename}`;
    } else if (image !== undefined) {
      updateData.image = normalizeUploadPath(image);
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
      category,
    });
  } catch (error) {
    console.error('Update category error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('[DELETE CATEGORY]', {
      id,
      length: id?.length,
      isValid: mongoose.Types.ObjectId.isValid(id)
    });

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const assignedProducts = await Product.countDocuments({
      category: category._id
    });

    if (assignedProducts > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete this category because ${assignedProducts} product(s) are assigned to it.`
      });
    }

    await Category.deleteOne({
      _id: category._id
    });

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: {
        id: category._id,
        name: category.name
      }
    });
  } catch (error) {
    console.error('Delete category error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to delete category',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined
    });
  }
};
