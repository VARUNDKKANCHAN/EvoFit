import React, { useEffect, useState } from 'react';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Default to DARK on first visit (app was designed for dark mode)
    const saved = localStorage.getItem('evofit-theme');
    if (saved) return saved === 'dark';
    // No saved preference → default to dark
    return true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('evofit-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('evofit-theme', 'light');
    }
  }, [isDark]);

  // Apply theme on initial mount (before React renders)
  useEffect(() => {
    const saved = localStorage.getItem('evofit-theme');
    const prefersDark = saved ? saved === 'dark' : true;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setIsDark(prev => !prev)}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="w-10 h-10 rounded-xl bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-evofit-purple-main/60 hover:text-evofit-purple-main group overflow-hidden relative"
      aria-label="Toggle theme"
    >
      {/* Sliding icon animation */}
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-500 text-evofit-text-secondary group-hover:text-evofit-purple-main"
        style={{
          transform: isDark ? 'translateY(0)' : 'translateY(-110%)',
          opacity: isDark ? 1 : 0,
        }}
      >
        <MoonIcon />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-500 text-evofit-text-secondary group-hover:text-evofit-purple-main"
        style={{
          transform: isDark ? 'translateY(110%)' : 'translateY(0)',
          opacity: isDark ? 0 : 1,
        }}
      >
        <SunIcon />
      </span>
    </button>
  );
}
