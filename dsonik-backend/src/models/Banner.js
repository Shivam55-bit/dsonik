const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Banner title is required'],
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    tag: {
      type: String,
      trim: true,
      default: '',
    },
    desktopImage: {
      type: String,
      required: [true, 'Desktop banner image is required'],
    },
    mobileImage: {
      type: String,
      default: '',
    },
    buttonOneText: {
      type: String,
      trim: true,
      default: 'Explore Machines',
    },
    buttonOneLink: {
      type: String,
      trim: true,
      default: '/category/all',
    },
    buttonTwoText: {
      type: String,
      trim: true,
      default: 'Enquire Now',
    },
    buttonTwoLink: {
      type: String,
      trim: true,
      default: '/contact',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    overlayOpacity: {
      type: Number,
      default: 0.45,
      min: 0,
      max: 1,
    },
    textAlignment: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Banner', bannerSchema);
