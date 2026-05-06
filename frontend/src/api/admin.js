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
  }
};
