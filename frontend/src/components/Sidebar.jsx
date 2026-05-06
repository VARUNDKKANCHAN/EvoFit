import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/upload',
    label: 'Upload & Predict',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: '/targets',
    label: 'Targets',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'Workout History',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/trophy',
    label: 'Trophy Room',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M8 21h8m-4-4v4M7 4h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/leaderboard',
    label: 'Leaderboard',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    to: '/chatbot',
    label: 'AI Chatbot',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const ADMIN_NAV = [
  {
    to: '/admin',
    label: 'Platform Control',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function Sidebar({ mobileOpen }) {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      className={`
        bg-evofit-bg-sidebar border-r border-evofit-border flex flex-col shrink-0 
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden min-h-screen
        fixed inset-y-0 left-0 z-[70] lg:static lg:z-auto
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}
      style={{ width: collapsed ? '64px' : '240px' }}
    >

      {/* ── Logo ─────────────────────────────── */}
      <div className={`border-b border-evofit-border flex items-center gap-[10px] animate-slide-in-left transition-[padding] duration-300 relative ${collapsed ? 'py-6 justify-center' : 'py-7 px-5 pb-5 justify-start'}`}>
        {/* Mobile Close Btn */}
        <button 
          className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-evofit-purple-main/10 text-evofit-purple-light hover:bg-evofit-purple-main/20"
          onClick={() => setCollapsed(false)} // Or handle close properly via prop
          style={{ display: mobileOpen ? 'flex' : 'none' }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <svg width="28" height="28" viewBox="0 0 34 34" fill="none" className="shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]">
          <circle cx="17" cy="17" r="17" fill="url(#lg)" />
          <path d="M11 17H14L16 11L20 23L22 17H25" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="34" y2="34">
              <stop stopColor="#6D28D9" /><stop offset="1" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
        </svg>
        {!collapsed && (
          <span className="text-[20px] font-extrabold tracking-tight text-evofit-text-primary whitespace-nowrap animate-fade-in">
            EvoFit
          </span>
        )}
      </div>

      {/* ── Navigation ───────────────────────── */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="text-[10px] font-bold tracking-[0.1em] text-evofit-text-muted px-5 pt-2 pb-1 uppercase whitespace-nowrap animate-fade-in duration-300">
            {user?.isAdmin ? 'Administration' : 'Main Menu'}
          </p>
        )}

        {(user?.isAdmin ? ADMIN_NAV : NAV).map(({ to, label, icon }, idx) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) => `
              group relative flex items-center gap-3 transition-all duration-200 no-underline text-sm font-medium
              ${collapsed ? 'justify-center py-2.5 px-0 mx-1.5' : 'justify-start py-2.5 px-4 mx-3'}
              ${isActive 
                ? 'bg-evofit-purple-main/5 text-evofit-purple-main' 
                : 'text-evofit-text-secondary hover:bg-evofit-purple-main/5 hover:text-evofit-purple-main'}
              rounded-lg
            `}
            style={{ animationDelay: `${0.05 * idx}s` }}
          >
            {/* Active Indicator Bar */}
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-evofit-purple-main rounded-r-full transition-all duration-200 ${location.pathname === (to === '/' ? '/' : to) ? 'opacity-100' : 'opacity-0'}`} />
            
            <span className={`shrink-0 transition-all duration-200 ${location.pathname === (to === '/' ? '/' : to) ? 'text-evofit-purple-main' : 'text-evofit-text-muted group-hover:text-evofit-text-primary'}`}>
              {icon}
            </span>
            {!collapsed && (
              <span className="whitespace-nowrap">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User Profile & Bottom controls ───────────────────── */}
      <div className={`border-t border-evofit-border animate-fade-in-up duration-500 delay-300 ${collapsed ? 'p-3 pb-5' : 'p-[10px] pb-5'}`}>
        
        {/* User Stats Card (Only if not collapsed AND NOT admin) */}
        {!collapsed && user && !user.isAdmin && (
          <div
            className="mx-2 mb-4 p-3 rounded-xl bg-evofit-bg-secondary border border-evofit-border flex items-center gap-3 cursor-pointer hover:border-evofit-border-hover hover:bg-evofit-purple-main/5 transition-all duration-200 group"
            onClick={() => navigate('/profile')}
            title="View Profile"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm border border-white/20 shadow-sm transition-all">
              {(user.fullName || user.username || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[13px] font-bold text-evofit-text-primary truncate m-0">{user.fullName || user.username}</p>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[10px] font-bold text-evofit-purple-light uppercase tracking-wider">Lvl {user.level || 1}</span>
                <span className="text-[10px] text-evofit-text-muted">{(user.xp || 0).toLocaleString()} XP</span>
              </div>
              <div className="w-full h-1.5 bg-evofit-bg-primary rounded-full mt-2 overflow-hidden border border-evofit-border/50">
                <div 
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] transition-all duration-1000" 
                  style={{ width: `${Math.min(100, ((user.xp || 0) / ((user.level || 1) * 1000)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* User Mini Icon (If collapsed AND NOT admin) */}
        {collapsed && user && !user.isAdmin && (
          <div className="flex justify-center mb-4">
             <div className="w-8 h-8 rounded-full bg-evofit-purple-main/20 flex items-center justify-center text-evofit-purple-light text-xs font-bold border border-evofit-purple-main/30" title={`${user.fullName} (Lvl ${user.level})`}>
              {user.fullName?.charAt(0) || user.username?.charAt(0) || '?'}
            </div>
          </div>
        )}

        {/* Admin Minimal Avatar (If admin) */}
        {user?.isAdmin && (
          <div className={`mx-2 mb-4 p-3 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
             <div className="w-10 h-10 rounded-2xl bg-evofit-purple-main/10 flex items-center justify-center text-evofit-purple-light font-black border border-evofit-purple-main/20 shadow-sm">
              A
            </div>
            {!collapsed && (
              <div>
                <p className="text-[13px] font-bold text-evofit-text-primary m-0">System Admin</p>
                <p className="text-[10px] text-evofit-text-muted m-0">Root Privileges</p>
              </div>
            )}
          </div>
        )}

        {/* Collapse / Expand */}
        <button
          id="btn-collapse-sidebar"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed(c => !c)}
          className={`flex items-center gap-[10px] w-full py-[10px] rounded-xl bg-transparent border-none cursor-pointer text-evofit-text-secondary text-sm font-medium transition-colors duration-200 hover:bg-evofit-purple-main/5 hover:text-evofit-purple-main ${collapsed ? 'justify-center' : 'justify-start px-[10px]'}`}
        >
          <svg
            width="16" height="16" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth="2"
            className={`shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : 'rotate-0'}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {!collapsed && <span className="animate-fade-in duration-200">Collapse</span>}
        </button>

        {/* Logout */}
        <button
          id="btn-logout"
          title="Logout"
          onClick={handleLogout}
          className={`group flex items-center gap-[10px] w-full py-[10px] rounded-xl bg-transparent border-none cursor-pointer text-evofit-text-secondary text-sm font-medium transition-all duration-200 hover:bg-red-500/10 hover:text-[#F87171] ${collapsed ? 'justify-center' : 'justify-start px-[10px]'}`}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span className="animate-fade-in duration-200">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
