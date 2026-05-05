import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { useNotifications } from './NotificationContext';

const AuthContext = createContext();

/**
 * Normalizes the raw API response into a consistent user object.
 * Works with both old ProfileResponse and new MeResponse shapes.
 */
function normalizeUser(data) {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    fullName: data.full_name || data.fullName || null,
    full_name: data.full_name || data.fullName || null,
    xp: data.xp ?? 0,
    level: data.level ?? 1,
    age: data.age || null,
    weight_kg: data.weight_kg || null,
    height_cm: data.height_cm || null,
    gender: data.gender || null,
    fitness_goal: data.fitness_goal || null,
    created_at: data.created_at || null,
    is_active: data.is_active ?? true,
  };
}

export function AuthProvider({ children }) {
  // Immediately restore user from localStorage for INSTANT UI (no flicker)
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('evofit_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  // Loading is false by default since we restore from cache instantly
  const [loading, setLoading] = useState(false);

  const { notify } = useNotifications();

  const saveUser = useCallback((userObj) => {
    setUser(userObj);
    localStorage.setItem('evofit_user', JSON.stringify(userObj));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('evofit_token');
    localStorage.removeItem('evofit_user');
    setUser(null);
    notify('info', 'Signed out', 'You have been logged out of EvoFit.');
  }, [notify]);

  // Background sync on mount: silently refresh user data from backend
  useEffect(() => {
    const token = localStorage.getItem('evofit_token');
    if (!token) {
      setLoading(false);
      return;
    }

    // If we already have cached user, don't block the UI — sync silently
    const syncUser = async () => {
      try {
        const data = await authApi.getMe();
        const userObj = normalizeUser(data);
        saveUser(userObj);
      } catch (error) {
        console.error('Session sync failed:', error);
        // Only logout if it's truly a 401 (token expired/invalid)
        if (error.response?.status === 401) {
          logout();
        }
      }
    };

    syncUser();
  }, [saveUser, logout]);

  const login = async (username, password) => {
    try {
      setLoading(true);
      // Step 1: Get token
      const tokenData = await authApi.login(username, password);
      localStorage.setItem('evofit_token', tokenData.access_token);

      // Step 2: Fetch full profile (single call)
      const meData = await authApi.getMe();
      const userObj = normalizeUser(meData);
      saveUser(userObj);

      notify(
        'success',
        'Welcome back!',
        `${userObj.fullName || userObj.username}, your session is ready.`,
      );
      return true;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      notify('error', 'Login failed', msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      await authApi.register(userData);
      notify('success', 'Account created!', 'You can now log in to your dashboard.');
      return true;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Registration failed. Please try again.';
      notify('error', 'Registration failed', msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updated = await authApi.updateProfile(profileData);
      const userObj = normalizeUser(updated);
      saveUser(userObj);
      notify('success', 'Profile updated', 'Your changes have been saved.');
      return true;
    } catch (error) {
      notify('error', 'Update failed', 'Could not save profile changes. Please try again.');
      return false;
    }
  };

  // Refresh user data from backend (call this after XP changes, etc.)
  const refreshUser = async () => {
    try {
      const data = await authApi.getMe();
      const userObj = normalizeUser(data);
      saveUser(userObj);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
      isAuthenticated: !!user,
    }}>
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
