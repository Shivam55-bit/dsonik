import api from '../api';

export const getTestimonials = async () => {
  const res = await api.get('/testimonials');
  return res.data;
};

export default {
  getTestimonials
};
