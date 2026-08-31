const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'FAQ question is required'],
      trim: true
    },
    answer: {
      type: String,
      required: [true, 'FAQ answer is required'],
      trim: true
    },
    category: {
      type: String,
      trim: true,
      default: 'general'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Faq', faqSchema);
