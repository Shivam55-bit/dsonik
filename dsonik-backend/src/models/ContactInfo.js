const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema(
  {
    phoneNumbers: {
      type: [String],
      default: ['+91-120-4217390', '+91-120-4217391']
    },
    emailAddresses: {
      type: [String],
      default: ['info@dsonik.com', 'sales@dsonik.com']
    },
    officeAddress: {
      type: String,
      trim: true,
      default: 'DSONIK Pvt. Ltd., Industrial Area Site-4, Sahibabad, Ghaziabad — 201010'
    },
    whatsappNumber: {
      type: String,
      trim: true,
      default: '+919876543210'
    },
    mapUrl: {
      type: String,
      trim: true,
      default: ''
    },
    workingHours: {
      type: String,
      trim: true,
      default: 'Monday to Saturday, 9:00 AM to 6:00 PM'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
