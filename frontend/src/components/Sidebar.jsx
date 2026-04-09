import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

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
    to: '/chatbot',
    label: 'AI Chatbot',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const navigate    = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`bg-evofit-bg-sidebar border-r border-evofit-border flex flex-col shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden min-h-screen`}
      style={{ width: collapsed ? '64px' : '240px' }}
    >

      {/* ── Logo ─────────────────────────────── */}
      <div className={`border-b border-evofit-border flex items-center gap-[10px] animate-slide-in-left transition-[padding] duration-300 ${collapsed ? 'py-6 justify-center' : 'py-7 px-5 pb-5 justify-start'}`}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]">
          <rect width="28" height="28" rx="8" fill="url(#lg)" />
          <path d="M7 14h4l3-6 4 12 3-6h2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28">
              <stop stopColor="#6D28D9" /><stop offset="1" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
        </svg>
        {!collapsed && (
          <span className="text-[20px] font-extrabold tracking-tight bg-gradient-to-br from-white via-white to-evofit-purple-light bg-clip-text text-transparent whitespace-nowrap animate-fade-in">
            EvoFit
          </span>
        )}
      </div>

      {/* ── Navigation ───────────────────────── */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="text-[10px] font-bold tracking-[0.1em] text-evofit-text-muted px-5 pt-2 pb-1 uppercase whitespace-nowrap animate-fade-in duration-300">
            Main Menu
          </p>
        )}

        {NAV.map(({ to, label, icon }, idx) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) => `
              group flex items-center gap-3 transition-all duration-200 no-underline text-sm font-medium
              ${collapsed ? 'justify-center py-[11px] px-0 mx-1.5' : 'justify-start py-[11px] px-5 mx-[10px]'}
              ${isActive 
                ? 'bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] text-white shadow-purple-glow rounded-xl' 
                : 'text-evofit-text-secondary hover:bg-white/5 hover:text-evofit-text-primary rounded-xl'}
              animate-slide-in-left
            `}
            style={{ animationDelay: `${0.05 * idx}s` }}
          >
            <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">{icon}</span>
            {!collapsed && (
              <span className="whitespace-nowrap animate-fade-in duration-200">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom controls ───────────────────── */}
      <div className={`border-t border-evofit-border animate-fade-in-up duration-500 delay-300 ${collapsed ? 'p-3 pb-5' : 'p-[10px] pb-5'}`}>
        {/* Collapse / Expand */}
        <button
          id="btn-collapse-sidebar"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed(c => !c)}
          className={`flex items-center gap-[10px] w-full py-[10px] rounded-xl bg-transparent border-none cursor-pointer text-evofit-text-secondary text-sm font-medium transition-colors duration-200 hover:bg-white/10 hover:text-evofit-text-primary ${collapsed ? 'justify-center' : 'justify-start px-[10px]'}`}
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
          onClick={() => navigate('/')}
          className={`flex items-center gap-[10px] w-full py-[10px] rounded-xl bg-transparent border-none cursor-pointer text-[#F87171] text-sm font-medium transition-all duration-200 hover:bg-red-500/10 ${collapsed ? 'justify-center' : 'justify-start px-[10px]'}`}
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
