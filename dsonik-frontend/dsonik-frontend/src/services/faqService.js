import api from '../api';

export const getFaqs = async (params = {}) => {
  const res = await api.get('/faqs', { params });
  return res.data;
};

export default {
  getFaqs
};
