import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Check local storage or system preference
    const saved = localStorage.getItem('evofit-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
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

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="w-10 h-10 rounded-xl bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center text-evofit-text-secondary hover:text-evofit-purple-main hover:border-evofit-purple-main/50 transition-all duration-300 shadow-sm overflow-hidden relative group"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <Sun 
          size={20} 
          className={`absolute inset-0 transition-all duration-500 transform ${isDark ? 'translate-y-[150%] opacity-0' : 'translate-y-0 opacity-100'}`} 
        />
        <Moon 
          size={20} 
          className={`absolute inset-0 transition-all duration-500 transform ${isDark ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0'}`} 
        />
      </div>
    </button>
  );
}
