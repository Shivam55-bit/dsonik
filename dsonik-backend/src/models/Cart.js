const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  sku: String,
  image: String
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, default: '' },
  items: [cartItemSchema]
}, { timestamps: true });

cartSchema.index({ user: 1 }, { unique: false });
cartSchema.index({ sessionId: 1 }, { unique: false });

module.exports = mongoose.model('Cart', cartSchema);
