import api from '../api';

export const getCategories = async () => {
  const res = await api.get('/categories');
  return res.data;
};

export const getCategory = async (slugOrId) => {
  const res = await api.get(`/categories/${slugOrId}`);
  return res.data;
};

export default {
  getCategories,
  getCategory
};
