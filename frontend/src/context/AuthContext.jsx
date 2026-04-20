import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('evofit_token');
      if (token) {
        try {
          const profile = await authApi.getProfile();
          const userObj = { 
            username: profile.username,
            fullName: profile.full_name,
            profileId: profile.id,
            ...profile
          };
          setUser(userObj);
          localStorage.setItem('evofit_user', JSON.stringify(userObj));
        } catch (error) {
          console.error("Auth initialization failed:", error);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authApi.login(username, password);
      localStorage.setItem('evofit_token', data.access_token);
      
      // Fetch full profile after login
      const profile = await authApi.getProfile();
      
      const userObj = { 
        username,
        fullName: profile.full_name,
        profileId: profile.id,
        ...profile
      };
      
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
