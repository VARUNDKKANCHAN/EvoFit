import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ username: 'Guest_User', fullName: 'Guest Athlete' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('evofit_token');
    const savedUser = localStorage.getItem('evofit_user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    // setLoading(false); // Already false for bypass
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authApi.login(username, password);
      localStorage.setItem('evofit_token', data.access_token);
      
      // For now, we manually set a user object. 
      // In a real app, we'd fetch the user profile here.
      const userObj = { username };
      setUser(userObj);
      localStorage.setItem('evofit_user', JSON.stringify(userObj));
      
      toast.success('Successfully logged in! ⚡');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await authApi.register(userData);
      toast.success('Account created! You can now log in.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('evofit_token');
    localStorage.removeItem('evofit_user');
    setUser(null);
    toast.info('Logged out from EvoFit.');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
