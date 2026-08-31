const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true
    },
    value: {
      type: Number,
      required: [true, 'Achievement numeric value is required'],
      default: 0
    },
    suffix: {
      type: String,
      trim: true,
      default: '+'
    },
    icon: {
      type: String,
      trim: true,
      default: 'globe'
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

module.exports = mongoose.model('Achievement', achievementSchema);
