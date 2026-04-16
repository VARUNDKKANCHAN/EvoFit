import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('evofit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (username, password) => {
    const response = await api.post('/users/login', { username, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/users/me/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/users/me/profile', profileData);
    return response.data;
  }
};

export default api;
