const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'SiteContent key is required'],
      unique: true,
      trim: true
    },
    section: {
      type: String,
      trim: true,
      default: 'general'
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    subtitle: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    content: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      trim: true,
      default: ''
    },
    buttonText: {
      type: String,
      trim: true,
      default: ''
    },
    buttonLink: {
      type: String,
      trim: true,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);
