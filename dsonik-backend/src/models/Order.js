const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  sku: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  customer: { type: String, default: '' },
  products: [orderItemSchema],
  items: [orderItemSchema],
  subtotal: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  totalAmount: { type: Number },
  shippingAddress: { type: mongoose.Schema.Types.Mixed, default: {} },
  billingAddress: { type: mongoose.Schema.Types.Mixed, default: {} },
  paymentMethod: { type: String, enum: ['cod', 'cash_on_delivery', 'online', 'online_qr', 'COD', 'ONLINE', 'CASH_ON_DELIVERY'], default: 'cod' },
  paymentMethodLabel: { type: String, default: 'Cash on Delivery' },
  paymentStatus: { type: String, enum: ['pending', 'verification_pending', 'paid', 'failed', 'refunded', 'rejected', 'Pending', 'Paid', 'Failed', 'Refunded', 'Verification Pending', 'Rejected'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'pending' },
  transactionId: { type: String, default: '' },
  paymentScreenshot: { type: String, default: '' },
  paymentNote: { type: String, default: '' },
  paymentRejectionReason: { type: String, default: '' },
  paymentConfigurationSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
  trackingNumber: { type: String, default: '' },
  notes: { type: String, default: '' },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
