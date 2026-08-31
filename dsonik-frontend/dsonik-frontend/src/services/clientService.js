import api from '../api';

export const getClients = async () => {
  const res = await api.get('/clients');
  return res.data;
};

export default {
  getClients
};
