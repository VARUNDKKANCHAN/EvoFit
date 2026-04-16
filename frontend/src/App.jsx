import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UploadPredict from './pages/UploadPredict';
import Analytics from './pages/Analytics';
import Targets from './pages/Targets';
import TrophyRoom from './pages/TrophyRoom';
import SessionHistory from './pages/SessionHistory';
import ThemeToggle from './components/ThemeToggle';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ══════════════════════════════════════════════════
   Animated page wrapper — fades + slides on route change
   ══════════════════════════════════════════════════ */
function AnimatedPage({ children }) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="contents animate-page-enter">
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Shared top header
   ══════════════════════════════════════════════════ */
function PageHeader({ title }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const [bellHover, setBellHover] = useState(false);

  return (
    <header className="bg-evofit-bg-secondary border-b border-evofit-border h-16 flex items-center px-7 gap-4 animate-fade-in shrink-0">
      <div className="flex-1">
        <h1 className="text-[18px] font-bold m-0 text-evofit-text-primary animate-slide-in-left">
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

        {/* User chip */}
        <div className="flex items-center gap-[10px] cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="m-0 text-[13px] font-semibold text-evofit-text-primary">Alex Johnson</p>
            <p className="m-0 text-[11px] text-evofit-purple-light">Pro Member</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#A78BFA] flex items-center justify-center text-[14px] font-bold text-white border border-white/10 group-hover:ring-2 group-hover:ring-evofit-purple-main transition-all duration-200">
            AJ
          </div>
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

  /* 
  useEffect(() => {
    // Redirect logic: If not logged in and not on login/signup, go to login
    if (!loading && !isAuthenticated && location.pathname !== '/login' && location.pathname !== '/signup') {
      navigate('/login');
    }
    
    // If logged in and on login/signup, go to dashboard
    if (!loading && isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);
  */

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
      default: return 'EvoFit Dashboard';
    }
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="flex min-h-screen bg-evofit-bg-primary font-inter">
      {!isAuthPage && <Sidebar />}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isAuthPage ? 'w-full' : ''}`}>
        {!isAuthPage && <PageHeader title={getPageTitle(location.pathname)} />}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatedPage>
            <Routes location={location}>
              {/* Auth Routes */}
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Main App Routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload"    element={<UploadPredict />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/targets"   element={<Targets />} />
              <Route path="/history"   element={<SessionHistory />} />
              <Route path="/trophy"    element={<TrophyRoom />} />
              <Route path="/chatbot"   element={
                <ComingSoon title="AI Chatbot" icon="🤖"
                  description="Ask the EvoFit AI coach anything about your training — powered by RAG on your personal workout data." />
              } />
            </Routes>
          </AnimatedPage>
        </div>
      </div>
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
