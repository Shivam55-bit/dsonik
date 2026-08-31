import api from '../api';

export const getAchievements = async () => {
  const res = await api.get('/achievements');
  return res.data;
};

export default {
  getAchievements
};
