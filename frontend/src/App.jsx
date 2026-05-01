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
import ThemeToggle from './components/ThemeToggle';
import FloatingChatbot from './components/FloatingChatbot';
import { useAuth } from './context/AuthContext';
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
      className="contents"
    >
      {children}
    </motion.div>
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
  const [bellHover, setBellHover] = useState(false);
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
      <div className="hidden md:flex items-center gap-2 text-evofit-text-muted text-[13px] animate-fade-in">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Session: {today}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-[14px] ml-4 animate-fade-in delay-100">
        <ThemeToggle />
        
        {/* Bell */}
        <div
          className="relative cursor-pointer transition-transform duration-200 hover:scale-110"
          onMouseEnter={() => setBellHover(true)}
          onMouseLeave={() => setBellHover(false)}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
            stroke={bellHover ? '#A78BFA' : 'var(--text-secondary)'} strokeWidth="2"
            className="transition-colors duration-200">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#EF4444] rounded-full border border-evofit-bg-secondary animate-pulse-glow" />
        </div>

        {/* User chip + dropdown */}
        <div className="relative" ref={dropdownRef}>
          {/* Trigger button */}
          <button
            id="user-menu-btn"
            ref={btnRef}
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center gap-[10px] group focus:outline-none"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className="text-right hidden sm:block">
              <p className="m-0 text-[13px] font-semibold text-evofit-text-primary leading-tight">
                {user?.fullName || user?.username || 'Guest'}
              </p>
              <p className="m-0 text-[11px] text-evofit-purple-light leading-tight">
                {user ? `Lv.${level} · ${xp.toLocaleString()} XP` : 'Standard'}
              </p>
            </div>
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#A78BFA] flex items-center justify-center text-[14px] font-bold text-white border-2 transition-all duration-200 ${dropdownOpen ? 'ring-2 ring-evofit-purple-main border-transparent' : 'border-white/10 group-hover:ring-2 group-hover:ring-evofit-purple-main/60'}`}>
              {initials}
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
                boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
              }}
            >
              {/* User info header */}
              <div className="p-4 border-b border-evofit-border bg-gradient-to-br from-evofit-purple-main/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#A78BFA] flex items-center justify-center text-lg font-black text-white shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-evofit-text-primary m-0 truncate">
                      {user?.fullName || user?.username}
                    </p>
                    <p className="text-[11px] text-evofit-text-muted m-0 truncate">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-bold text-evofit-purple-light">Lv.{level}</span>
                      <div className="flex-1 h-1 rounded-full bg-evofit-border overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#A78BFA]"
                          style={{ width: `${xpPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-evofit-text-muted">{xp}/{xpToNext}xp</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2">
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
                  {user && (
                    <span className="ml-auto text-[10px] font-bold bg-evofit-purple-main/20 text-evofit-purple-light px-2 py-0.5 rounded-full">
                      Lv.{level}
                    </span>
                  )}
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
                  Edit Profile & Settings
                </button>
              </div>

              {/* Divider + Logout */}
              <div className="px-2 pb-2 border-t border-evofit-border mt-1 pt-2">
                <button
                  id="dropdown-logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-medium text-[#F87171] hover:bg-red-500/10 transition-all duration-150 group"
                >
                  <span className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#F87171" strokeWidth="2.5">
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
  }, [user, loading, isAuthPage, navigate]);

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
      default: return 'EvoFit Dashboard';
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
              </Routes>
            </AnimatedPage>
          </AnimatePresence>
        </div>
      </div>
      {!isAuthPage && <FloatingChatbot />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: '#16161F',
          border: '1px solid #2A2A3A',
          color: '#F0F0F5',
          borderRadius: '12px'
        }}
      />
    </Router>
  );
}
