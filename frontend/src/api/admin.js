import axios from 'axios';

const API_URL = 'http://localhost:8000/admin';

const getAuthHeader = () => {
  const token = localStorage.getItem('evofit_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const withRetry = async (fn, maxRetries = 2) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < maxRetries - 1) await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw lastError;
};

export const adminApi = {
  getStats: async () => {
    return withRetry(async () => {
      const response = await axios.get(`${API_URL}/stats`, { headers: getAuthHeader() });
      return response.data;
    });
  },
  getUsers: async (params = {}) => {
    return withRetry(async () => {
      const response = await axios.get(`${API_URL}/users`, { 
        headers: getAuthHeader(),
        params
      });
      return response.data;
    });
  },
  updateUserStatus: async (userId, isActive) => {
    const response = await axios.put(`${API_URL}/users/${userId}/status`, null, {
      headers: getAuthHeader(),
      params: { is_active: isActive }
    });
    return response.data;
  },
  deleteSession: async (sessionId) => {
    const response = await axios.delete(`${API_URL}/sessions/${sessionId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  updateUserTokenLimit: async (userId, limit) => {
    const response = await axios.put(`${API_URL}/users/${userId}/token-limit`, null, {
      headers: getAuthHeader(),
      params: { limit }
    });
    return response.data;
  },
  getSystemStatus: async () => {
    const response = await axios.get(`${API_URL}/system-status`, { headers: getAuthHeader() });
    return response.data;
  },

  flushCache: async () => {
    const response = await axios.post(`${API_URL}/system/flush-cache`, null, { headers: getAuthHeader() });
    return response.data;
  }
};
