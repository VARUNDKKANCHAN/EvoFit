/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'evofit-bg-primary': '#0A0A0F',
        'evofit-bg-secondary': '#111118',
        'evofit-bg-card': '#16161F',
        'evofit-bg-sidebar': '#0E0E15',
        'evofit-purple-main': '#7C3AED',
        'evofit-purple-light': '#A78BFA',
        'evofit-text-primary': '#F0F0F5',
        'evofit-text-secondary': '#9090A8',
        'evofit-text-muted': '#5A5A72',
        'evofit-border': '#2A2A3A',
        'evofit-border-hover': '#4A4A6A',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
        'fade-in': 'fade-in 0.4s ease both',
        'slide-in-left': 'slide-in-left 0.4s ease both',
        'slide-up': 'slide-up 0.4s ease both',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'page-enter': 'page-enter 0.35s cubic-bezier(0.4, 0, 0.2, 1) both',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(24px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-in-left': {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.25)' },
          '50%': { boxShadow: '0 0 45px rgba(124, 58, 237, 0.55)' },
        },
        'page-enter': {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'purple-glow': '0 0 20px rgba(124, 58, 237, 0.35)',
        'premium-card': '0 4px 20px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
