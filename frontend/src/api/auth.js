import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout to prevent hanging requests
});

// Interceptor: automatically inject JWT token into every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('evofit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear if we're NOT on a login/register endpoint
      const url = error.config?.url || '';
      if (!url.includes('/login') && !url.includes('/register')) {
        localStorage.removeItem('evofit_token');
        localStorage.removeItem('evofit_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username, password) => {
    const response = await api.post('/users/login', { username, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  // Single call that returns user + profile combined
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Keep for backward compat
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/me/profile', profileData);
    return response.data;
  }
};

export default api;
