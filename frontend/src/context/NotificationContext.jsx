import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import ToastContent from '../components/ToastContent';

const NotificationContext = createContext(null);

const MAX_STORED = 50;
const STORAGE_KEY = 'evofit_notifications';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch { /* quota exceeded – silently ignore */ }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(loadFromStorage);

  /** Core: add to history + fire a toast */
  const notify = useCallback((type, title, subtitle = '') => {
    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type,   // 'success' | 'error' | 'info' | 'warning'
      title,
      subtitle,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [entry, ...prev].slice(0, MAX_STORED);
      saveToStorage(updated);
      return updated;
    });

    // Fire toast — ToastContent renders the branded UI
    const content = <ToastContent type={type} title={title} subtitle={subtitle} />;
    const opts = { icon: false };
    if (type === 'success') toast.success(content, opts);
    else if (type === 'error') toast.error(content, opts);
    else if (type === 'warning') toast.warning(content, opts);
    else toast.info(content, opts);
  }, []);

  /** Mark a single notification as read */
  const markRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, read: true } : n));
      saveToStorage(updated);
      return updated;
    });
  }, []);

  /** Mark every notification as read */
  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveToStorage(updated);
      return updated;
    });
  }, []);

  /** Wipe the entire history */
  const clearAll = useCallback(() => {
    setNotifications([]);
    saveToStorage([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, notify, markRead, markAllRead, clearAll, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within <NotificationProvider>');
  return ctx;
}
