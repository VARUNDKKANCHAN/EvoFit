import axios from 'axios';

const API_URL = 'http://localhost:8000/admin';

const getAuthHeader = () => {
  const token = localStorage.getItem('evofit_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminApi = {
  getStats: async () => {
    const response = await axios.get(`${API_URL}/stats`, { headers: getAuthHeader() });
    return response.data;
  },
  getUsers: async (params = {}) => {
    const response = await axios.get(`${API_URL}/users`, { 
      headers: getAuthHeader(),
      params
    });
    return response.data;
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
  getSystemStatus: async () => {
    const response = await axios.get(`${API_URL}/system-status`, { headers: getAuthHeader() });
    return response.data;
  },
  getTokens: async () => {
    const response = await axios.get(`${API_URL}/tokens`, { headers: getAuthHeader() });
    return response.data;
  },
  createToken: async (name, expiresInDays) => {
    const response = await axios.post(`${API_URL}/tokens`, { name, expires_in_days: expiresInDays }, { headers: getAuthHeader() });
    return response.data;
  },
  revokeToken: async (tokenId) => {
    const response = await axios.delete(`${API_URL}/tokens/${tokenId}`, { headers: getAuthHeader() });
    return response.data;
  }
};
