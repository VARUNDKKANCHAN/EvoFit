import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-full p-8 animate-fade-in">
      {/* Glowing circle background */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md"
      >
        {/* 404 Icon */}
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center animate-float"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(139,92,246,0.08))',
            border: '1px solid rgba(124,58,237,0.25)',
            boxShadow: '0 0 40px rgba(124,58,237,0.15)',
          }}
        >
          <svg width="52" height="52" fill="none" viewBox="0 0 24 24" stroke="var(--purple-main)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        {/* Error code */}
        <div>
          <p
            className="text-[80px] font-black leading-none"
            style={{
              background: 'linear-gradient(135deg, var(--purple-main), var(--purple-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </p>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-evofit-text-primary m-0">
            Page Not Found
          </h1>
          <p className="text-sm text-evofit-text-muted leading-relaxed m-0">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-2">
          <button
            id="btn-go-dashboard"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--purple-main), var(--purple-light))',
              boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10" />
            </svg>
            Back to Dashboard
          </button>
          <button
            id="btn-go-back"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:bg-evofit-purple-main/10"
            style={{
              color: 'var(--purple-light)',
              border: '1px solid rgba(124,58,237,0.25)',
              background: 'transparent',
            }}
          >
            Go Back
          </button>
        </div>

        {/* Decorative EvoFit branding */}
        <div className="flex items-center gap-2 mt-4 opacity-50">
          <svg width="18" height="18" viewBox="0 0 34 34" fill="none">
            <circle cx="17" cy="17" r="17" fill="url(#lg404)" />
            <path d="M11 17H14L16 11L20 23L22 17H25" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="lg404" x1="0" y1="0" x2="34" y2="34">
                <stop stopColor="#6D28D9" /><stop offset="1" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-xs font-bold text-evofit-text-muted tracking-wide">EvoFit</span>
        </div>
      </motion.div>
    </main>
  );
}
