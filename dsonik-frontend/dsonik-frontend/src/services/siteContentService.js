import api from '../api';

export const getSiteContent = async (params = {}) => {
  const res = await api.get('/site-content', { params });
  return res.data;
};

export default {
  getSiteContent
};
