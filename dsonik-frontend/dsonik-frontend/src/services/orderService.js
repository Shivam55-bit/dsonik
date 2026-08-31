import api from '../api';

export const createOrder = async (payload) => {
  const res = await api.post('/orders', payload);
  return res.data;
};

export const getMyOrders = async (params = {}) => {
  const res = await api.get('/orders/my-orders', { params });
  return res.data;
};

export const getOrder = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const downloadInvoice = async (id) => {
  const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
  return res.data;
};

export default {
  createOrder,
  getMyOrders,
  getOrder,
  downloadInvoice
};
