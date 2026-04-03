import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UploadPredict from './pages/UploadPredict';

/* ══════════════════════════════════════════════════
   Animated page wrapper — fades + slides on route change
══════════════════════════════════════════════════ */
function AnimatedPage({ children }) {
  const ref = useRef();
  const location = useLocation();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.animation = 'none';
    // Force reflow
    void el.offsetHeight;
    el.style.animation = 'page-enter 0.35s cubic-bezier(0.4,0,0.2,1) both';
  }, [location.pathname]);

  return (
    <div ref={ref} style={{ display: 'contents' }}>
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
    <header className="header" style={{ animation: 'fade-in 0.4s ease both' }}>
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontSize: '18px', fontWeight: 700, margin: 0,
          color: 'var(--text-primary)',
          animation: 'slide-in-left 0.4s ease both',
        }}>
          {title}
        </h1>
      </div>

      {/* Date */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        color: 'var(--text-muted)', fontSize: '13px',
        animation: 'fade-in 0.5s ease both',
      }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Session: {today}
      </div>

      {/* Right side */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px', marginLeft: '16px',
        animation: 'fade-in 0.5s ease both', animationDelay: '0.1s',
      }}>
        {/* Bell */}
        <div
          style={{ position: 'relative', cursor: 'pointer', transition: 'transform 0.2s ease' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; setBellHover(true); }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; setBellHover(false); }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
            stroke={bellHover ? '#A78BFA' : 'var(--text-secondary)'} strokeWidth="2"
            style={{ transition: 'stroke 0.2s ease' }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            width: '8px', height: '8px', background: '#EF4444',
            borderRadius: '50%', border: '1px solid var(--bg-secondary)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }} />
        </div>

        {/* User chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.querySelector('.avatar').style.boxShadow = '0 0 0 2px #7C3AED'}
          onMouseLeave={e => e.currentTarget.querySelector('.avatar').style.boxShadow = 'none'}
        >
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Alex Johnson</p>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--purple-light)' }}>Pro Member</p>
          </div>
          <div className="avatar" style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#6D28D9,#A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '14px', color: '#fff',
            transition: 'box-shadow 0.2s ease',
          }}>
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
function ComingSoon({ title, icon, description, accentColor = '#7C3AED' }) {
  const [hovered, setHovered] = useState(false);

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader title={title} />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '20px', padding: '40px',
        animation: 'fade-in-up 0.45s ease both',
      }}>
        {/* Icon box */}
        <div
          style={{
            width: '90px', height: '90px', borderRadius: '22px',
            background: `rgba(124,58,237,0.10)`,
            border: `1px solid ${hovered ? 'rgba(124,58,237,0.5)' : 'rgba(124,58,237,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px',
            boxShadow: hovered ? '0 0 40px rgba(124,58,237,0.25)' : 'none',
            transition: 'all 0.3s ease',
            animation: 'float 5s ease-in-out infinite',
            cursor: 'default',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {icon}
        </div>

        <h2 style={{
          fontSize: '24px', fontWeight: 800, margin: 0,
          color: 'var(--text-primary)',
          animation: 'fade-in-up 0.4s ease both', animationDelay: '0.1s',
        }}>
          {title}
        </h2>

        <p style={{
          color: 'var(--text-muted)', fontSize: '14px', margin: 0,
          maxWidth: '360px', textAlign: 'center', lineHeight: 1.7,
          animation: 'fade-in-up 0.4s ease both', animationDelay: '0.15s',
        }}>
          {description}
        </p>

        {/* Shimmer "Coming Soon" pill */}
        <div style={{
          marginTop: '4px',
          padding: '6px 20px',
          borderRadius: '20px',
          border: '1px solid rgba(124,58,237,0.35)',
          background: 'linear-gradient(90deg, rgba(109,40,217,0.15), rgba(167,139,250,0.25), rgba(109,40,217,0.15))',
          backgroundSize: '200% auto',
          animation: 'shimmer 2.5s linear infinite, fade-in-up 0.4s ease both',
          animationDelay: '0s, 0.2s',
          fontSize: '12px', fontWeight: 700,
          color: 'var(--purple-light)',
          letterSpacing: '0.04em',
        }}>
          ✦ Coming Soon
        </div>

        {/* Decorative dots */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', animation: 'fade-in 0.5s ease both', animationDelay: '0.3s' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--purple-main)',
              opacity: 0.3 + i * 0.2,
              animation: `float ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }} />
          ))}
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════
   Upload page wrapped with header
══════════════════════════════════════════════════ */
function UploadPage() {
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <PageHeader title="Upload & Predict" />
      <UploadPredict />
    </main>
  );
}

/* ══════════════════════════════════════════════════
   App root
══════════════════════════════════════════════════ */
function AppShell() {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <AnimatedPage key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={
              <ComingSoon title="Dashboard" icon="📊"
                description="Your personal training overview — workout history, streaks, personal records and weekly summaries." />
            } />
            <Route path="/upload"    element={<UploadPage />} />
            <Route path="/analytics" element={
              <ComingSoon title="Analytics" icon="📈"
                description="Deep-dive charts of your accelerometer data, rep velocity trends, and fatigue curves." />
            } />
            <Route path="/targets"   element={
              <ComingSoon title="Targets" icon="🎯"
                description="Set weekly, monthly and exercise-specific goals. Track progress toward each target in real time." />
            } />
            <Route path="/chatbot"   element={
              <ComingSoon title="AI Chatbot" icon="🤖"
                description="Ask the EvoFit AI coach anything about your training — powered by RAG on your personal workout data." />
            } />
          </Routes>
        </AnimatedPage>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
