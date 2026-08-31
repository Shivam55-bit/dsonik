const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [{ type: String }],
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, default: 0 },
  discountPrice: { type: Number, default: 0 },
  sku: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  features: [{ type: String }],
  applications: [{ type: String }],
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  seoKeywords: [{ type: String }],
  isFeatured: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true }
}, { timestamps: true });

// Text index for search
productSchema.index({ name: 'text', description: 'text', shortDescription: 'text', sku: 'text', slug: 'text' });

module.exports = mongoose.model('Product', productSchema);
