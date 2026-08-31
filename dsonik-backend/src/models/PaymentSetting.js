const mongoose = require('mongoose');

const paymentSettingSchema = new mongoose.Schema({
  onlineQrEnabled: { type: Boolean, default: false },
  paymentTitle: { type: String, default: 'Online Payment' },
  qrCode: { type: String, default: '' },
  upiId: { type: String, default: '' },
  payeeName: { type: String, default: '' },
  instructions: { type: String, default: '' },
  note: { type: String, default: '' },
  allowedScreenshotFormats: { type: String, default: 'JPG, JPEG, PNG, WEBP' },
  maximumScreenshotSize: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PaymentSetting', paymentSettingSchema);
