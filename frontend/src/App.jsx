import React, { useRef, useEffect, useState } from 'react';
import ReactDOM, { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import UploadPredict from './pages/UploadPredict';
import Analytics from './pages/Analytics';
import Targets from './pages/Targets';
import TrophyRoom from './pages/TrophyRoom';
import SessionHistory from './pages/SessionHistory';
import UserProfile from './pages/UserProfile';
import Chatbot from './pages/Chatbot';
import Leaderboard from './pages/Leaderboard';
import TargetAnalysis from './pages/TargetAnalysis';
import AdminPanel from './pages/AdminPanel';
import ThemeToggle from './components/ThemeToggle';
import FloatingChatbot from './components/FloatingChatbot';
import CelebrationModal from './components/CelebrationModal';
import { useAuth } from './context/AuthContext';
import { useNotifications } from './context/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AnimatePresence, motion } from 'framer-motion';

/* ══════════════════════════════════════════════════
   Animated page wrapper — fades + slides on route change
   ══════════════════════════════════════════════════ */
function AnimatedPage({ children }) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex-1 flex flex-col min-h-0"
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   Relative timestamp helper
   ══════════════════════════════════════════════════ */
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ══════════════════════════════════════════════════
   Notification type config
   ══════════════════════════════════════════════════ */
const NOTIF_CONFIG = {
  success: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  error:   { color: '#EF4444', bg: 'rgba(239,68,68,0.12)'  },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  info:    { color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
};

function NotifTypeIcon({ type }) {
  const cfg = NOTIF_CONFIG[type] ?? NOTIF_CONFIG.info;
  const icons = {
    success: <path d="M1.5 5L5.5 9L12.5 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />,
    error:   <><line x1="15" y1="5" x2="5" y2="15" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><line x1="5" y1="5" x2="15" y2="15" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></>,
    warning: <><path d="M10 3.5 L2 16 h16 Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round"/><line x1="10" y1="10" x2="10" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/></>,
    info:    <><circle cx="10" cy="10" r="8" stroke="white" strokeWidth="2"/><line x1="10" y1="8" x2="10" y2="8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><line x1="10" y1="11" x2="10" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/></>,
  };
  return (
    <div style={{
      width: 26, height: 26, borderRadius: '50%',
      background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      boxShadow: `0 0 8px ${cfg.color}50`,
    }}>
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">{icons[type] ?? icons.info}</svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Notification Bell with dropdown panel
   ══════════════════════════════════════════════════ */
function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const btnRef  = useRef(null);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current   && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on scroll / resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [open]);

  const handleOpen = () => {
    setOpen(prev => !prev);
    if (!open && unreadCount > 0) markAllRead();
  };

  return (
    <div className="relative" style={{ display: 'flex' }}>
      {/* Bell trigger */}
      <button
        id="notification-bell-btn"
        ref={btnRef}
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-evofit-purple-main/10 transition-all duration-200"
        aria-label="Toggle notifications"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
          stroke={open ? 'var(--purple-main)' : 'var(--text-muted)'}
          strokeWidth="2" className="transition-colors duration-200"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center
                       text-[9px] font-black text-white rounded-full animate-pulse-glow"
            style={{ background: '#EF4444', lineHeight: 1, border: '1.5px solid var(--bg-secondary)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel — portal to avoid header clip */}
      {open && createPortal(
        <div
          ref={panelRef}
          className="animate-fade-in-up"
          style={{
            position: 'fixed',
            top: 68,
            right: 64,
            width: 360,
            maxHeight: 520,
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            boxShadow: 'var(--card-shadow), 0 24px 48px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            animationDuration: '0.18s',
          }}
        >
          {/* Panel header */}
          <div style={{
            padding: '14px 18px 12px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, transparent 100%)',
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
              stroke="var(--purple-main)" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Notifications
            </span>
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllRead}
                  style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--purple-light)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px',
                    borderRadius: 6, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  Mark all read
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px',
                    borderRadius: 6, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  Clear all
                </button>
              </>
            )}
          </div>

          {/* Notification list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
            {notifications.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '40px 20px', gap: 12,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(124,58,237,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
                    stroke="var(--purple-light)" strokeWidth="1.8">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                  No notifications yet
                </p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                  Achievements, alerts and updates will appear here
                </p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg = NOTIF_CONFIG[n.type] ?? NOTIF_CONFIG.info;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '10px 10px',
                      borderRadius: 12,
                      cursor: 'default',
                      position: 'relative',
                      background: n.read ? 'transparent' : `${cfg.bg}`,
                      borderLeft: n.read ? '2px solid transparent' : `2px solid ${cfg.color}`,
                      marginBottom: 2,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : cfg.bg}
                  >
                    <NotifTypeIcon type={n.type} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontSize: 13, fontWeight: n.read ? 500 : 700,
                        color: 'var(--text-primary)', lineHeight: 1.25,
                      }}>
                        {n.title}
                      </p>
                      {n.subtitle && (
                        <p style={{
                          margin: '2px 0 0', fontSize: 11.5,
                          color: 'var(--text-muted)', lineHeight: 1.4,
                        }}>
                          {n.subtitle}
                        </p>
                      )}
                      <p style={{ margin: '4px 0 0', fontSize: 10.5, color: 'var(--text-muted)' }}>
                        {timeAgo(n.timestamp)}
                      </p>
                    </div>
                    {!n.read && (
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: cfg.color, flexShrink: 0, marginTop: 4,
                        boxShadow: `0 0 6px ${cfg.color}80`,
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '10px 18px',
              borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''} total
              </span>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Shared top header
   ══════════════════════════════════════════════════ */
function PageHeader({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const btnRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on scroll or resize
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = () => setDropdownOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleNav = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const tier = (lvl) => {
    if (lvl >= 100) return 'Evo Legend';
    if (lvl >= 60)  return 'Grandmaster';
    if (lvl >= 40)  return 'Master';
    if (lvl >= 25)  return 'Elite';
    if (lvl >= 15)  return 'Titan';
    if (lvl >= 10)  return 'Warrior';
    if (lvl >= 5)   return 'Vanguard';
    return 'Initiate';
  };
  const tierName = tier(level);
  const xpToNext = level * 1000;
  const xpPct = Math.min(100, Math.round((xp / xpToNext) * 100));
  const initials = (user?.fullName || user?.username || '?').charAt(0).toUpperCase();

  return (
    <header className="bg-evofit-bg-secondary border-b border-evofit-border h-16 flex items-center px-4 md:px-7 gap-3 md:gap-4 animate-fade-in shrink-0">
      {/* Mobile Menu Btn */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-evofit-purple-main/10 text-evofit-text-secondary hover:text-evofit-purple-main transition-colors"
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-[16px] md:text-[18px] font-bold m-0 text-evofit-text-primary animate-slide-in-left truncate">
          {title}
        </h1>
      </div>

      {/* Date */}
      <div className="hidden md:flex items-center gap-2 text-evofit-text-muted text-[13px]">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {today}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-4">
        <ThemeToggle />
        <NotificationBell />

        {/* User chip + dropdown */}
        <div className="relative" ref={dropdownRef}>
          {/* Trigger button */}
          <button
            id="user-menu-btn"
            ref={btnRef}
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-evofit-purple-main/10 transition-all duration-200 focus:outline-none"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className="text-right hidden sm:block">
              <p className="m-0 text-[13px] font-bold text-evofit-text-primary leading-tight">
                {user?.isAdmin ? 'System Administrator' : (user?.fullName || user?.username || 'Guest')}
              </p>
              <p className="m-0 text-[11px] font-medium text-evofit-text-muted leading-tight mt-0.5">
                {user?.isAdmin ? 'Root Access' : (user ? `${tierName} · ${xp.toLocaleString()} XP` : 'Standard User')}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-evofit-purple-main to-evofit-purple-dark flex items-center justify-center text-[12px] font-black text-white border border-white/20 shadow-sm transition-all duration-200 ${dropdownOpen ? 'ring-2 ring-evofit-purple-main/30' : ''}`}>
              {user?.isAdmin ? 'A' : initials}
            </div>
          </button>

          {/* Dropdown panel — rendered via Portal into document.body to prevent clipping */}
          {dropdownOpen && createPortal(
            <div
              ref={dropdownRef}
              className="rounded-2xl border border-evofit-border bg-evofit-bg-card overflow-hidden animate-fade-in-up"
              style={{
                position: 'fixed',
                top: '68px',
                right: '16px',
                width: '288px',
                zIndex: 999999,
                animationDuration: '0.15s',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              {/* User info header */}
              <div className="p-4 border-b border-evofit-border bg-gradient-to-br from-evofit-purple-main/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-evofit-purple-main to-evofit-purple-dark flex items-center justify-center text-lg font-black text-white shrink-0">
                    {user?.isAdmin ? 'A' : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-evofit-text-primary m-0 truncate">
                      {user?.isAdmin ? 'Administrator' : (user?.fullName || user?.username)}
                    </p>
                    <p className="text-[11px] text-evofit-text-muted m-0 truncate">{user?.email}</p>
                    {!user?.isAdmin && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold text-evofit-purple-light">Lv.{level}</span>
                        <div className="flex-1 h-1 rounded-full bg-evofit-border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-evofit-purple-main to-evofit-purple-dark"
                            style={{ width: `${xpPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-evofit-text-muted">{xp}/{xpToNext}xp</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

               {/* Menu items */}
               <div className="p-2">
                 {user?.isAdmin ? (
                    <button
                      onClick={() => handleNav('/admin')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-medium text-evofit-text-secondary hover:bg-evofit-purple-main/10 hover:text-evofit-purple-light transition-all duration-150 group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center group-hover:border-evofit-purple-main/40 transition-colors">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </span>
                      Admin Dashboard
                    </button>
                 ) : (
                   <>
                    <button
                      id="dropdown-profile-btn"
                      onClick={() => handleNav('/profile')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-medium text-evofit-text-secondary hover:bg-evofit-purple-main/10 hover:text-evofit-purple-light transition-all duration-150 group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center group-hover:border-evofit-purple-main/40 transition-colors">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      </span>
                      My Profile
                    </button>

                    <button
                      id="dropdown-trophy-btn"
                      onClick={() => handleNav('/trophy')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-medium text-evofit-text-secondary hover:bg-evofit-purple-main/10 hover:text-evofit-purple-light transition-all duration-150 group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center group-hover:border-evofit-purple-main/40 transition-colors">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path d="M8 21h8m-4-4v4M7 4h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </span>
                      Trophy Room
                    </button>

                    <button
                      id="dropdown-settings-btn"
                      onClick={() => handleNav('/profile')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-medium text-evofit-text-secondary hover:bg-evofit-purple-main/10 hover:text-evofit-purple-light transition-all duration-150 group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center group-hover:border-evofit-purple-main/40 transition-colors">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                      </span>
                      Settings
                    </button>
                   </>
                 )}
               </div>

              {/* Divider + Logout */}
              <div className="px-2 pb-2 border-t border-evofit-border mt-1 pt-2">
                <button
                  id="dropdown-logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-medium text-[#F87171] hover:bg-red-500/10 transition-all duration-150 group"
                >
                  <span className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </span>
                  Sign Out
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </header>
  );
}


/* ══════════════════════════════════════════════════
   Coming Soon placeholder
   ══════════════════════════════════════════════════ */
function ComingSoon({ title, icon, description }) {
  const [hovered, setHovered] = useState(false);

  return (
    <main className="flex-1 flex flex-col pt-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-10 animate-fade-in-up">
        {/* Icon box */}
        <div
          className={`w-[100px] h-[100px] rounded-3xl bg-evofit-purple-main/10 border flex items-center justify-center text-4xl transition-all duration-300 cursor-default animate-float
            ${hovered ? 'border-evofit-purple-main/50 shadow-[0_0_40px_rgba(124,58,237,0.25)]' : 'border-evofit-purple-main/20 shadow-none'}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {icon}
        </div>

        <h2 className="text-2xl font-extrabold m-0 text-evofit-text-primary animate-fade-in-up delay-100">
          {title}
        </h2>

        <p className="text-evofit-text-secondary text-sm m-0 max-w-[360px] text-center leading-relaxed animate-fade-in-up delay-150">
          {description}
        </p>

        {/* Shimmer "Coming Soon" pill */}
        <div className="mt-1 px-5 py-1.5 rounded-full border border-evofit-purple-main/35 bg-[linear-gradient(90deg,rgba(109,40,217,0.15),rgba(167,139,250,0.25),rgba(109,40,217,0.15))] bg-[length:200%_auto] animate-shimmer-fast animate-fade-in-up delay-200 text-[12px] font-bold text-evofit-purple-light tracking-wide">
          ✦ Coming Soon
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════
   App root
   ══════════════════════════════════════════════════ */
function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevLevel, setPrevLevel] = useState(null);
  const [celebration, setCelebration] = useState({ isOpen: false, type: 'level_up', data: null });

  // Level-up detection
  useEffect(() => {
    if (user && prevLevel !== null && user.level > prevLevel) {
      setCelebration({
        isOpen: true,
        type: 'level_up',
        data: { level: user.level }
      });
    }
    if (user) {
      setPrevLevel(user.level);
    }
  }, [user, prevLevel]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Route Protection logic
  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      navigate('/login');
    }
    // Redirect admin to admin panel if they land on user pages
    if (!loading && user?.isAdmin && !isAuthPage && location.pathname !== '/admin') {
      navigate('/admin');
    }
  }, [user, loading, isAuthPage, navigate, location.pathname]);

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Dashboard';
      case '/login': return 'Authentication';
      case '/signup': return 'Create Account';
      case '/upload': return 'AI Dataset Upload';
      case '/analytics': return 'Performance Analytics';
      case '/targets': return 'Target Monitoring';
      case '/history': return 'Workout History';
      case '/trophy': return 'EvoFit Trophy Room';
      case '/chatbot': return 'EvoFit AI Assistant';
      case '/leaderboard': return 'Global Leaderboard';
      case '/profile': return 'My Profile';
      case '/admin': return 'Platform Administration';
      default: 
        if (path.startsWith('/target-analysis/')) return 'Performance Deep Dive';
        return 'EvoFit Dashboard';
    }
  };

  return (
    <div className="flex min-h-screen bg-evofit-bg-primary font-inter relative overflow-hidden">
      {!isAuthPage && (
        <>
          {/* Mobile Backdrop */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden animate-fade-in" 
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          <Sidebar mobileOpen={mobileMenuOpen} />
        </>
      )}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isAuthPage ? 'w-full' : ''}`}>
        {!isAuthPage && (
          <PageHeader 
            title={getPageTitle(location.pathname)} 
            onMenuClick={() => setMobileMenuOpen(true)}
          />
        )}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <AnimatedPage>
              <Routes location={location} key={location.pathname}>
                {/* Auth Routes */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />

                {/* Main App Routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload"    element={<UploadPredict />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/targets"   element={<Targets />} />
                <Route path="/history"   element={<SessionHistory />} />
                <Route path="/trophy"    element={<TrophyRoom />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile"   element={<UserProfile />} />
                <Route path="/chatbot"   element={<Chatbot />} />
                <Route path="/admin"     element={<AdminPanel />} />
                <Route path="/target-analysis/:exercise" element={<TargetAnalysis />} />
              </Routes>
            </AnimatedPage>
          </AnimatePresence>
        </div>
      </div>
      {!isAuthPage && <FloatingChatbot />}
      <CelebrationModal 
        isOpen={celebration.isOpen}
        onClose={() => setCelebration(prev => ({ ...prev, isOpen: false }))}
        type={celebration.type}
        data={celebration.data}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Router>
  );
}
