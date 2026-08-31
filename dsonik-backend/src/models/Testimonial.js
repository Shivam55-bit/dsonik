const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    message: {
      type: String,
      required: [true, 'Testimonial message is required'],
      trim: true
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    image: {
      type: String,
      default: ''
    },
    initials: {
      type: String,
      trim: true,
      default: ''
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

module.exports = mongoose.model('Testimonial', testimonialSchema);
