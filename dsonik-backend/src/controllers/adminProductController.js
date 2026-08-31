const Product = require('../models/Product');
const { normalizeUploadPaths } = require('../utils/normalizeUploadPath');
const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');

exports.createProduct = async (req, res, next) => {
  try {
    const { name, slug, price, salePrice, sku, stock, shortDescription, description, images, category, status, isFeatured } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const prodSlug = slug || slugify(name);
    const existing = await Product.findOne({ slug: prodSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product slug already exists' });
    }

    const product = await Product.create({
      name,
      slug: prodSlug,
      price: price !== undefined ? Number(price) : 0,
      salePrice: salePrice !== undefined ? Number(salePrice) : undefined,
      sku,
      stock: stock !== undefined ? Number(stock) : 0,
      shortDescription,
      description,
      images: normalizeUploadPaths(images),
      category,
      status: status || 'active',
      isFeatured: Boolean(isFeatured)
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
      product
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { name, slug, price, salePrice, sku, stock, shortDescription, description, images, category, status, isFeatured } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (name) product.name = name;
    if (slug) product.slug = slugify(slug);
    if (price !== undefined) product.price = Number(price);
    if (salePrice !== undefined) product.salePrice = Number(salePrice);
    if (sku !== undefined) product.sku = sku;
    if (stock !== undefined) product.stock = Number(stock);
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (description !== undefined) product.description = description;
    if (images !== undefined) product.images = normalizeUploadPaths(images);
    if (category !== undefined) product.category = category || null;
    if (status) product.status = status;
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
      product
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.listProductsAdmin = async (req, res, next) => {
  try {
    const { q, category, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } }
      ];
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

exports.getProductAdmin = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
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
