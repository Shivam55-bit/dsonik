import axios from 'axios';

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  withCredentials: true,
  timeout: 15000,
});

adminApi.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('adminToken') ||
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/login/admin')
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await adminApi.post('/auth/refresh');

        const newToken =
          refreshResponse.data?.token ||
          refreshResponse.data?.data?.token;

        if (newToken) {
          localStorage.setItem('adminToken', newToken);
          localStorage.setItem('admin_token', newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return adminApi(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token');
        localStorage.removeItem('admin');

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;
