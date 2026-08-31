const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  subject: { type: String, default: '' },
  companyName: { type: String, default: '' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  message: { type: String, required: true },
  source: { type: String, default: 'website' },
  status: { type: String, enum: ['new', 'contacted', 'converted', 'closed', 'New', 'Contacted', 'Converted', 'Closed'], default: 'new' },
  adminNote: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
