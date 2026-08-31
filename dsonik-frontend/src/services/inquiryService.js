import api from '../api';

export const sendInquiry = async (payload) => {
  const res = await api.post('/inquiries', payload);
  return res.data;
};

export default {
  sendInquiry
};
