const CheckoutAddress = require('../models/CheckoutAddress');
const PaymentSetting = require('../models/PaymentSetting');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
const digitsOnly = (value) => /^\d{8,15}$/.test((value || '').replace(/\s+/g, '').replace(/[^\d]/g, ''));
const isValidPostal = (value) => !!(value || '').toString().trim();

const getSessionId = (req) => {
  if (req.headers['x-session-id']) return String(req.headers['x-session-id']);
  if (req.headers['x-checkout-session-id']) return String(req.headers['x-checkout-session-id']);
  if (req.cookies && req.cookies.sessionId) return String(req.cookies.sessionId);
  if (req.cookies && req.cookies.checkoutSessionId) return String(req.cookies.checkoutSessionId);
  if (req.query && req.query.sessionId) return String(req.query.sessionId);
  if (req.query && req.query.checkoutSessionId) return String(req.query.checkoutSessionId);
  return req.sessionId || 'guest-session';
};

const normalizeAddress = (payload = {}) => ({
  address: payload.address || payload.line1 || '',
  city: payload.city || '',
  state: payload.state || '',
  postalCode: payload.postalCode || payload.zip || '',
  country: payload.country || ''
});

const normalizeBilling = (payload = {}) => ({
  address: payload.address || payload.line1 || '',
  city: payload.city || '',
  state: payload.state || '',
  postalCode: payload.postalCode || payload.zip || '',
  country: payload.country || ''
});

const ensureGuestSessionCookie = (req, res) => {
  const sessionId = getSessionId(req);
  if (!req.cookies || !req.cookies.sessionId) {
    res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  }
  if (!req.cookies || !req.cookies.checkoutSessionId) {
    res.cookie('checkoutSessionId', sessionId, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  }
  return sessionId;
};

exports.saveAddress = async (req, res, next) => {
  try {
    const sessionId = ensureGuestSessionCookie(req, res);
    const payload = req.body || {};
    const billingSameAsShipping = payload.billingSameAsShipping !== false;

    const fullName = String(payload.fullName || '').trim();
    const phone = String(payload.phone || '').trim();
    const email = String(payload.email || '').trim();
    const shippingAddress = normalizeAddress(payload.shippingAddress || payload);
    const billingAddress = billingSameAsShipping ? shippingAddress : normalizeBilling(payload.billingAddress || {});

    if (!fullName || !phone || !email || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({ success: false, message: 'All required address fields are required.' });
    }

    if (!digitsOnly(phone)) {
      return res.status(400).json({ success: false, field: 'phone', message: 'Phone number must contain valid digits.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, field: 'email', message: 'Please enter a valid email address.' });
    }

    if (!isValidPostal(shippingAddress.postalCode)) {
      return res.status(400).json({ success: false, field: 'postalCode', message: 'ZIP / PIN is required.' });
    }

    const userId = req.user ? req.user.id : null;
    const criteria = userId ? { userId } : { sessionId };

    const existingAddress = await CheckoutAddress.findOne(criteria);

    const record = existingAddress || new CheckoutAddress({
      userId,
      sessionId,
      fullName,
      phone,
      email,
      shippingAddress,
      billingSameAsShipping,
      billingAddress
    });

    record.userId = userId;
    record.sessionId = sessionId;
    record.fullName = fullName;
    record.phone = phone;
    record.email = email;
    record.shippingAddress = shippingAddress;
    record.billingSameAsShipping = billingSameAsShipping;
    record.billingAddress = billingAddress;
    record.updatedAt = new Date();

    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Address saved successfully.',
      data: record
    });
  } catch (error) {
    next(error);
  }
};

exports.getSavedAddress = async (req, res, next) => {
  try {
    const sessionId = ensureGuestSessionCookie(req, res);
    let query = { sessionId };

    if (req.user) {
      query = { userId: req.user.id };
    }

    const address = await CheckoutAddress.findOne(query).sort({ updatedAt: -1 });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'No saved address found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: address,
      address
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const sessionId = ensureGuestSessionCookie(req, res);
    const payload = req.body || {};
    const userId = req.user ? req.user.id : null;
    const criteria = userId ? { userId } : { sessionId };

    const record = await CheckoutAddress.findOne(criteria);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Saved address not found.' });
    }

    const fullName = String(payload.fullName || record.fullName || '').trim();
    const phone = String(payload.phone || record.phone || '').trim();
    const email = String(payload.email || record.email || '').trim();
    const shippingAddress = normalizeAddress(payload.shippingAddress || record.shippingAddress || {});
    const billingSameAsShipping = payload.billingSameAsShipping !== undefined ? payload.billingSameAsShipping : record.billingSameAsShipping;
    const billingAddress = billingSameAsShipping ? shippingAddress : normalizeBilling(payload.billingAddress || record.billingAddress || {});

    if (!fullName || !phone || !email || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({ success: false, message: 'All required address fields are required.' });
    }

    if (!digitsOnly(phone)) {
      return res.status(400).json({ success: false, field: 'phone', message: 'Phone number must contain valid digits.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, field: 'email', message: 'Please enter a valid email address.' });
    }

    if (!isValidPostal(shippingAddress.postalCode)) {
      return res.status(400).json({ success: false, field: 'postalCode', message: 'ZIP / PIN is required.' });
    }

    record.fullName = fullName;
    record.phone = phone;
    record.email = email;
    record.shippingAddress = shippingAddress;
    record.billingSameAsShipping = billingSameAsShipping;
    record.billingAddress = billingAddress;
    record.userId = userId;
    record.sessionId = sessionId;
    record.updatedAt = new Date();
    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      data: record
    });
  } catch (error) {
    next(error);
  }
};

exports.getPublicPaymentSettings = async (req, res, next) => {
  try {
    const settings = await PaymentSetting.findOne().sort({ createdAt: -1 });
    const payload = settings ? {
      onlineQrEnabled: !!settings.onlineQrEnabled,
      paymentTitle: settings.paymentTitle || 'Online Payment',
      qrCode: settings.qrCode || '',
      upiId: settings.upiId || '',
      payeeName: settings.payeeName || '',
      instructions: settings.instructions || '',
      note: settings.note || ''
    } : {
      onlineQrEnabled: false,
      paymentTitle: 'Online Payment',
      qrCode: '',
      upiId: '',
      payeeName: '',
      instructions: '',
      note: ''
    };

    return res.status(200).json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
};

exports.getAdminPaymentSettings = async (req, res, next) => {
  try {
    const settings = await PaymentSetting.findOne().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: settings || null, setting: settings || null });
  } catch (error) {
    next(error);
  }
};

exports.saveAdminPaymentSettings = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const settings = await PaymentSetting.findOneAndUpdate(
      {},
      {
        onlineQrEnabled: !!payload.onlineQrEnabled,
        paymentTitle: payload.paymentTitle || 'Online Payment',
        qrCode: payload.qrCode || '',
        upiId: payload.upiId || '',
        payeeName: payload.payeeName || '',
        instructions: payload.instructions || '',
        note: payload.note || '',
        allowedScreenshotFormats: payload.allowedScreenshotFormats || 'JPG, JPEG, PNG, WEBP',
        maximumScreenshotSize: Number(payload.maximumScreenshotSize || 5),
        updatedAt: new Date()
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: 'Payment settings saved successfully.', data: settings });
  } catch (error) {
    next(error);
  }
};

exports.uploadPaymentQr = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'QR code image is required.' });
    }

    const fileType = req.file.mimetype || '';
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(fileType.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Only JPG, JPEG, PNG, and WEBP images are allowed.' });
    }

    const targetDir = path.resolve(__dirname, '../../uploads/payment-settings');
    fs.mkdirSync(targetDir, { recursive: true });

    const ext = path.extname(req.file.originalname || 'qr.png').toLowerCase();
    const safeName = `qr-${Date.now()}${ext}`;
    const filePath = path.join(targetDir, safeName);
    fs.writeFileSync(filePath, req.file.buffer || fs.readFileSync(req.file.path));

    const publicUrl = `/uploads/payment-settings/${safeName}`;

    const settings = await PaymentSetting.findOneAndUpdate(
      {},
      { $set: { qrCode: publicUrl, updatedAt: new Date() } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: 'QR code uploaded successfully.', data: settings });
  } catch (error) {
    next(error);
  }
};

exports.deletePaymentQr = async (req, res, next) => {
  try {
    const settings = await PaymentSetting.findOne();
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Payment settings not found.' });
    }

    if (settings.qrCode) {
      const relative = settings.qrCode.replace(/^\//, '');
      const absolute = path.resolve(__dirname, '../../', relative);
      if (fs.existsSync(absolute)) {
        fs.unlinkSync(absolute);
      }
    }

    settings.qrCode = '';
    settings.updatedAt = new Date();
    await settings.save();

    return res.status(200).json({ success: true, message: 'QR code removed successfully.', data: settings });
  } catch (error) {
    next(error);
  }
};

exports.createCashOrder = async (req, res, next) => {
  try {
    const savedAddress = await CheckoutAddress.findOne(req.user ? { userId: req.user.id } : { sessionId: getSessionId(req) });
    if (!savedAddress) {
      return res.status(400).json({ success: false, message: 'Please save your shipping address before placing the order.' });
    }

    const cart = await Cart.findOne({ user: req.user ? req.user.id : null });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    let subtotal = 0;
    const orderItems = [];
    const productIds = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product '${item.name}' not found.` });
      }
      if ((product.stock || 0) < Number(item.quantity || 1)) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
      }
      productIds.push(product._id);
      const price = Number(item.price || product.price || 0);
      subtotal += price * Number(item.quantity || 1);
      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku || '',
        image: product.images?.[0] || product.image || '',
        price,
        quantity: Number(item.quantity || 1)
      });
    }

    const shippingCharge = subtotal > 5000 ? 0 : 250;
    const tax = 0;
    const grandTotal = subtotal + shippingCharge + tax;
    const orderNumber = `DSK-${Date.now()}`;

    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user.id : null,
      customer: req.user ? req.user.name : savedAddress.fullName,
      items: orderItems,
      products: orderItems,
      shippingAddress: savedAddress.shippingAddress,
      billingAddress: savedAddress.billingSameAsShipping ? savedAddress.shippingAddress : savedAddress.billingAddress,
      subtotal,
      shippingCharge,
      tax,
      grandTotal,
      paymentMethod: 'cash_on_delivery',
      paymentMethodLabel: 'Cash on Delivery',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      paymentConfigurationSnapshot: null
    });

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, Number(product.stock || 0) - Number(item.quantity || 1));
        await product.save();
      }
    }

    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Your Cash on Delivery order has been placed successfully.',
      data: order,
      order
    });
  } catch (error) {
    next(error);
  }
};

exports.createOnlineOrder = async (req, res, next) => {
  try {
    const savedAddress = await CheckoutAddress.findOne(req.user ? { userId: req.user.id } : { sessionId: getSessionId(req) });
    if (!savedAddress) {
      return res.status(400).json({ success: false, message: 'Please save your shipping address before paying online.' });
    }

    const cart = await Cart.findOne({ user: req.user ? req.user.id : null });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const payload = req.body || {};
    const transactionId = String(payload.transactionId || '').trim();
    const paymentNote = String(payload.paymentNote || '').trim();
    const paymentScreenshot = payload.paymentScreenshot || '';
    const paymentSettings = await PaymentSetting.findOne().sort({ createdAt: -1 });

    if (!transactionId) {
      return res.status(400).json({ success: false, field: 'transactionId', message: 'Transaction ID / UTR is required.' });
    }

    if (!paymentScreenshot) {
      return res.status(400).json({ success: false, field: 'paymentScreenshot', message: 'Payment screenshot is required.' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product '${item.name}' not found.` });
      }
      if ((product.stock || 0) < Number(item.quantity || 1)) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
      }
      const price = Number(item.price || product.price || 0);
      subtotal += price * Number(item.quantity || 1);
      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku || '',
        image: product.images?.[0] || product.image || '',
        price,
        quantity: Number(item.quantity || 1)
      });
    }

    const shippingCharge = subtotal > 5000 ? 0 : 250;
    const tax = 0;
    const grandTotal = subtotal + shippingCharge + tax;
    const orderNumber = `DSK-${Date.now()}`;

    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user.id : null,
      customer: req.user ? req.user.name : savedAddress.fullName,
      items: orderItems,
      products: orderItems,
      shippingAddress: savedAddress.shippingAddress,
      billingAddress: savedAddress.billingSameAsShipping ? savedAddress.shippingAddress : savedAddress.billingAddress,
      subtotal,
      shippingCharge,
      tax,
      grandTotal,
      paymentMethod: 'online_qr',
      paymentMethodLabel: 'Online Payment',
      paymentStatus: 'verification_pending',
      orderStatus: 'pending',
      transactionId,
      paymentScreenshot,
      paymentNote,
      paymentConfigurationSnapshot: paymentSettings ? {
        paymentTitle: paymentSettings.paymentTitle,
        qrcode: paymentSettings.qrCode,
        upiId: paymentSettings.upiId,
        payeeName: paymentSettings.payeeName,
        instructions: paymentSettings.instructions,
        note: paymentSettings.note
      } : null,
      paymentRejectionReason: ''
    });

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, Number(product.stock || 0) - Number(item.quantity || 1));
        await product.save();
      }
    }

    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Your payment has been submitted for verification.',
      data: order,
      order
    });
  } catch (error) {
    next(error);
  }
};

exports.listAdminOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: orders.length, data: orders, orders });
  } catch (error) {
    next(error);
  }
};

exports.getAdminOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    return res.status(200).json({ success: true, data: order, order });
  } catch (error) {
    next(error);
  }
};

exports.updateAdminOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const nextStatus = String(req.body.orderStatus || req.body.status || order.orderStatus).toLowerCase();
    const validStatus = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatus.includes(nextStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status.' });
    }

    order.orderStatus = nextStatus;
    if (nextStatus === 'cancelled') {
      for (const item of order.items || order.products || []) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity || 0 } });
        }
      }
    }
    await order.save();

    return res.status(200).json({ success: true, message: 'Order status updated successfully.', data: order, order });
  } catch (error) {
    next(error);
  }
};

exports.updateAdminPaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const nextStatus = String(req.body.paymentStatus || order.paymentStatus).toLowerCase();
    const validStatus = ['pending', 'paid', 'failed', 'refunded', 'verification_pending', 'rejected'];
    if (!validStatus.includes(nextStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status.' });
    }

    order.paymentStatus = nextStatus;
    order.paymentMethodLabel = order.paymentMethod === 'online_qr' ? 'Online Payment' : 'Cash on Delivery';
    await order.save();

    return res.status(200).json({ success: true, message: 'Payment status updated successfully.', data: order, order });
  } catch (error) {
    next(error);
  }
};

exports.approvePayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    order.paymentStatus = 'paid';
    await order.save();
    return res.status(200).json({ success: true, message: 'Payment approved.', data: order, order });
  } catch (error) {
    next(error);
  }
};

exports.rejectPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    order.paymentStatus = 'rejected';
    order.paymentRejectionReason = String(req.body.reason || req.body.rejectionReason || 'Payment rejected by admin.');
    await order.save();
    return res.status(200).json({ success: true, message: 'Payment rejected.', data: order, order });
  } catch (error) {
    next(error);
  }
};
