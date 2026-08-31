import api from '../api';

export const getContactInfo = async () => {
  const res = await api.get('/contact-info');
  return res.data;
};

export default {
  getContactInfo
};
