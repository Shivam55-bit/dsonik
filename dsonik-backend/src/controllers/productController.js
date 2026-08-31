const Product = require('../models/Product');
const Category = require('../models/Category');

exports.listProducts = async (req, res, next) => {
  try {
    const { category, q, minPrice, maxPrice, status, featured, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    else query.status = 'active';

    if (featured === 'true') query.isFeatured = true;

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catObj = await Category.findOne({ slug: category });
        if (catObj) {
          query.category = catObj._id;
        }
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (q) {
      const searchTerm = String(q).trim();
      const matchingCategories = await Category.find({
        name: { $regex: searchTerm, $options: 'i' }
      }).select('_id');

      const categoryIds = matchingCategories.map((c) => c._id);

      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { slug: { $regex: searchTerm, $options: 'i' } },
        { sku: { $regex: searchTerm, $options: 'i' } },
        { shortDescription: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];

      if (categoryIds.length) {
        query.$or.push({ category: { $in: categoryIds } });
      }
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      data: products,
      products
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let product;

    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(slug).populate('category', 'name slug');
    } else {
      product = await Product.findOne({ slug }).populate('category', 'name slug');
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      data: product,
      product
    });
  } catch (error) {
    next(error);
  }
};
