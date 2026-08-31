import api from '../api';

export const getActiveBanners = () => {
  return api.get('/banners');
};

export const getBanners = async () => {
  const res = await api.get('/banners');
  return res.data;
};

export const extractBanners = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.banners)) {
    return responseData.banners;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  if (Array.isArray(responseData?.data?.banners)) {
    return responseData.data.banners;
  }

  return [];
};

export default {
  getActiveBanners,
  getBanners,
  extractBanners
};
