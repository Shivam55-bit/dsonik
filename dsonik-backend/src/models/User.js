const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  country: String,
  zip: String
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  addresses: [addressSchema],
  isBlocked: { type: Boolean, default: false },
  refreshTokens: [String]
}, { timestamps: true });

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
