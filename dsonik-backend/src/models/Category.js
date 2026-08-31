const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  displayOrder: { type: Number, default: 0 },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
