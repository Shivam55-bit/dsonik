const Cart = require('../models/Cart');
const Product = require('../models/Product');

const calculateCartTotals = (items = []) => {
  const subtotal = items.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
  return { subtotal, total: subtotal };
};

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const { subtotal, total } = calculateCartTotals(cart.items);

    return res.status(200).json({
      success: true,
      data: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        subtotal,
        total
      },
      items: cart.items,
      subtotal,
      total
    });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const activePrice = (product.salePrice && product.salePrice > 0) ? product.salePrice : product.price;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      i => i.product && i.product.toString() === productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
      cart.items[existingIndex].price = activePrice;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || product.image || '',
        price: activePrice,
        quantity: Number(quantity),
        sku: product.sku || ''
      });
    }

    await cart.save();
    const { subtotal, total } = calculateCartTotals(cart.items);

    return res.status(200).json({
      success: true,
      message: 'Product added to cart',
      data: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        subtotal,
        total
      },
      items: cart.items
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCart = async (req, res, next) => {
  try {
    const { items, itemId, productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    if (Array.isArray(items)) {
      // Bulk update mode
      cart.items = items.map(u => ({
        product: u.productId || u.product,
        name: u.name,
        image: u.image,
        price: Number(u.price || 0),
        quantity: Number(u.quantity || 1),
        sku: u.sku
      }));
    } else if (itemId || productId) {
      // Single item update mode
      const targetId = itemId || productId;
      const index = cart.items.findIndex(
        i => (i._id && i._id.toString() === targetId) || (i.product && i.product.toString() === targetId)
      );

      if (index > -1) {
        if (Number(quantity) <= 0) {
          cart.items.splice(index, 1);
        } else {
          cart.items[index].quantity = Number(quantity);
        }
      }
    }

    await cart.save();
    const { subtotal, total } = calculateCartTotals(cart.items);

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        subtotal,
        total
      },
      items: cart.items
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      i => (i._id && i._id.toString() !== targetId) && (i.product && i.product.toString() !== targetId)
    );

    await cart.save();
    const { subtotal, total } = calculateCartTotals(cart.items);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        subtotal,
        total
      },
      items: cart.items
    });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: { items: [], subtotal: 0, total: 0 },
      items: []
    });
  } catch (error) {
    next(error);
  }
};
