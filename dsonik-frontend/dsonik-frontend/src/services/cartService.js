import api from '../api';

export const getCart = async () => {
  const res = await api.get('/cart');
  return res.data;
};

export const addToCart = async (payload) => {
  // payload: { productId, quantity }
  const res = await api.post('/cart/add', payload);
  return res.data;
};

export const updateCart = async (payload) => {
  // payload: { items: [...] } or { itemId, quantity }
  const res = await api.put('/cart/update', payload);
  return res.data;
};

export const removeCartItem = async (itemId) => {
  const res = await api.delete(`/cart/remove/${itemId}`);
  return res.data;
};

export const clearCart = async () => {
  const res = await api.delete('/cart/clear');
  return res.data;
};

export default {
  getCart,
  addToCart,
  updateCart,
  removeCartItem,
  clearCart
};
