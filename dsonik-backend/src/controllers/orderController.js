const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const PDFDocument = require('pdfkit');

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `DSK-${dateStr}-${randomStr}`;
};

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, notes } = req.body;
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.line1 || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product '${item.name}' not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Available: ${product.stock}`
        });
      }

      const activePrice = (product.salePrice && product.salePrice > 0) ? product.salePrice : product.price;
      subtotal += activePrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || product.image || '',
        price: activePrice,
        quantity: item.quantity,
        sku: product.sku || ''
      });

      // Reduce product stock
      product.stock -= item.quantity;
      await product.save();
    }

    const shippingCharge = subtotal > 5000 ? 0 : 250;
    const grandTotal = subtotal + shippingCharge;
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      user: req.user.id,
      items: orderItems,
      products: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      shippingCharge,
      tax: 0,
      discount: 0,
      grandTotal,
      totalAmount: grandTotal,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'online' ? 'completed' : 'pending',
      orderStatus: 'pending',
      notes
    });

    // Clear user cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
      order
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
      orders
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product')
      .populate('products.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isOwner = order.user && (order.user._id.toString() === req.user.id || order.user.toString() === req.user.id);
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.status(200).json({
      success: true,
      data: order,
      order
    });
  } catch (error) {
    next(error);
  }
};

exports.listOrdersAdmin = async (req, res, next) => {
  try {
    const { status, q, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (q) {
      query.$or = [
        { orderNumber: { $regex: q, $options: 'i' } },
        { 'shippingAddress.name': { $regex: q, $options: 'i' } },
        { 'shippingAddress.email': { $regex: q, $options: 'i' } }
      ];
    }

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      data: orders,
      orders
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, status } = req.body;
    const newStatus = orderStatus || status;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Restore stock if order cancelled
    if (newStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
      const itemsToRestore = order.items && order.items.length ? order.items : order.products;
      for (const item of itemsToRestore) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
      }
    }

    order.orderStatus = newStatus;
    if (newStatus === 'delivered') {
      order.paymentStatus = 'completed';
    }
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
      order
    });
  } catch (error) {
    next(error);
  }
};

exports.generateInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product')
      .populate('products.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isOwner = order.user && (order.user._id.toString() === req.user.id || order.user.toString() === req.user.id);
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this invoice' });
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `invoice-${order.orderNumber || order._id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Document Header
    doc.fontSize(22).fillColor('#1E293B').text('DSONIK PRIVATE LIMITED', { align: 'left' });
    doc.fontSize(10).fillColor('#64748B').text('Industrial Area Site-4, Sahibabad, Ghaziabad - 201010', { align: 'left' });
    doc.text('Email: sales@dsonik.com | Web: www.dsonik.com', { align: 'left' });
    doc.moveDown();

    doc.fontSize(18).fillColor('#6366F1').text('TAX INVOICE', { align: 'right' });
    doc.fontSize(10).fillColor('#0F172A').text(`Invoice #: ${order.orderNumber || order._id}`, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, { align: 'right' });
    doc.moveDown();

    doc.lineCap('butt').moveTo(50, 150).lineTo(550, 150).stroke('#CBD5E1');
    doc.moveDown();

    // Customer & Shipping Info
    doc.fontSize(12).fillColor('#0F172A').text('Billed & Shipped To:', { underline: true });
    doc.fontSize(10).text(`Customer: ${order.shippingAddress?.name || order.user?.name || 'Valued Customer'}`);
    doc.text(`Address: ${order.shippingAddress?.line1 || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.zip || ''}`);
    doc.text(`Phone: ${order.shippingAddress?.phone || order.user?.phone || 'N/A'}`);
    doc.moveDown();

    // Items Table Header
    doc.fontSize(11).fillColor('#1E293B').text('Item Description', 50, 240);
    doc.text('Qty', 320, 240);
    doc.text('Price', 400, 240);
    doc.text('Amount', 480, 240);
    doc.lineCap('butt').moveTo(50, 255).lineTo(550, 255).stroke('#94A3B8');

    let y = 265;
    const itemList = order.items && order.items.length ? order.items : order.products;

    itemList.forEach((item) => {
      doc.fontSize(10).fillColor('#334155').text(item.name || 'Product', 50, y, { width: 250 });
      doc.text(String(item.quantity || 1), 320, y);
      doc.text(`₹${(item.price || 0).toLocaleString('en-IN')}`, 400, y);
      doc.text(`₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}`, 480, y);
      y += 20;
    });

    doc.lineCap('butt').moveTo(50, y + 10).lineTo(550, y + 10).stroke('#CBD5E1');
    y += 25;

    const grandTotal = order.grandTotal || order.totalAmount || 0;
    doc.fontSize(12).fillColor('#0F172A').text(`Subtotal: ₹${(order.subtotal || grandTotal).toLocaleString('en-IN')}`, 350, y, { align: 'right' });
    y += 18;
    if (order.shippingCharge > 0) {
      doc.text(`Shipping: ₹${order.shippingCharge.toLocaleString('en-IN')}`, 350, y, { align: 'right' });
      y += 18;
    }
    doc.fontSize(14).fillColor('#6366F1').text(`Grand Total: ₹${grandTotal.toLocaleString('en-IN')}`, 350, y, { align: 'right' });

    doc.moveDown(4);
    doc.fontSize(10).fillColor('#64748B').text('Thank you for choosing DSONIK — Engineered for Precision & Reliability.', { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};
