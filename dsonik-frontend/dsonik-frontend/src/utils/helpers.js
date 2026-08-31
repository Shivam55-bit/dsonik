import { resolveEntityImage, resolveImageUrl as resolveSharedImageUrl } from './imageUrl'

export const extractCategories = (responseData) => {
  if (!responseData) return [];
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData.categories)) return responseData.categories;
  if (Array.isArray(responseData.data)) return responseData.data;
  if (Array.isArray(responseData.data?.categories)) return responseData.data.categories;
  return [];
};

export const extractList = (responseData, resourceKey) => {
  if (!responseData) return [];
  if (Array.isArray(responseData)) return responseData;
  if (resourceKey && Array.isArray(responseData[resourceKey])) return responseData[resourceKey];
  if (Array.isArray(responseData.data)) return responseData.data;
  if (resourceKey && Array.isArray(responseData.data?.[resourceKey])) return responseData.data[resourceKey];
  if (Array.isArray(responseData.products)) return responseData.products;
  if (Array.isArray(responseData.categories)) return responseData.categories;
  if (Array.isArray(responseData.orders)) return responseData.orders;
  if (Array.isArray(responseData.users)) return responseData.users;
  if (Array.isArray(responseData.inquiries)) return responseData.inquiries;
  return [];
};

export const resolveCategoryImage = (category) => {
  return resolveEntityImage(category);
};

export const resolveImageUrl = (image, fallback = '') =>
  typeof image === 'object'
    ? resolveEntityImage(image, fallback)
    : resolveSharedImageUrl(image, fallback);
