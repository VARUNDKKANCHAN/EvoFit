import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ══════════════════════════════════════════════
   Floating particle dots for the left panel
   ══════════════════════════════════════════════ */
function Particles() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
    dur: Math.random() * 4 + 4,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {dots.map((d) => (
        <div
          key={d.id}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: 'rgba(167,139,250,0.6)',
            animation: `floatDot ${d.dur}s ${d.delay}s ease-in-out infinite alternate`,
            opacity: d.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return;
    
    setIsSubmitting(true);
    const success = await login(form.username, form.password);
    setIsSubmitting(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        @keyframes floatDot {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-18px) scale(1.2); }
        }
        @keyframes meshShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(124,58,237,0); }
        }
        @keyframes shimmerBtn {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-root {
          display: flex;
          min-height: 100vh;
          background: #07070E;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        /* ── Left Branding Panel ─────────────────────── */
        .login-left {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 48px;
          overflow: hidden;
          min-height: 100vh;
        }
        .login-left-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #1a0533 0%, #0d0d1a 40%, #090920 70%, #07070e 100%);
          z-index: 0;
        }
        .login-left-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 25% 30%, rgba(124,58,237,0.28) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 75% 70%, rgba(167,139,250,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 30% 30% at 50% 10%, rgba(109,40,217,0.2) 0%, transparent 60%);
          animation: meshShift 8s ease-in-out infinite;
          z-index: 0;
        }
        .login-left-img {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(7,7,14,0.15) 0%, rgba(7,7,14,0.85) 100%),
            url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80') center/cover no-repeat;
          z-index: 0;
        }
        .login-left-content {
          position: relative;
          z-index: 2;
          animation: slideRight 0.8s cubic-bezier(0.4,0,0.2,1) both;
        }
        .login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          position: absolute;
          top: 48px;
          left: 48px;
          z-index: 2;
          animation: fadeUp 0.6s ease both;
        }
        .login-logo-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg,#7C3AED,#A78BFA);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 20px rgba(124,58,237,0.5);
        }
        .login-logo-text {
          font-size: 20px; font-weight: 800;
          background: linear-gradient(90deg,#fff,#A78BFA);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }
        .login-tagline-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(124,58,237,0.18);
          border: 1px solid rgba(167,139,250,0.3);
          font-size: 11px;
          font-weight: 600;
          color: #A78BFA;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .login-tagline-badge span { width: 6px; height: 6px; border-radius: 50%; background: #A78BFA; animation: pulseGlow 2s infinite; }
        .login-headline {
          font-size: clamp(30px, 3.5vw, 46px);
          font-weight: 900;
          color: #fff;
          line-height: 1.12;
          letter-spacing: -1.5px;
          margin: 0 0 14px;
        }
        .login-headline em {
          font-style: normal;
          background: linear-gradient(90deg, #A78BFA, #7C3AED);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .login-subtext {
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 320px;
          margin: 0 0 32px;
        }
        .login-stats {
          display: flex;
          gap: 24px;
        }
        .login-stat {
          display: flex;
          flex-direction: column;
        }
        .login-stat-num {
          font-size: 22px; font-weight: 800; color: #fff;
        }
        .login-stat-label {
          font-size: 11px; color: rgba(255,255,255,0.45); font-weight: 500;
        }
        .login-stat-divider {
          width: 1px; background: rgba(255,255,255,0.12); align-self: stretch;
        }

        /* ── Right Form Panel ───────────────────────── */
        .login-right {
          width: 460px;
          min-width: 380px;
          background: #0E0E16;
          border-left: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 44px;
          position: relative;
          overflow: hidden;
        }
        .login-right::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-right::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-form-wrap {
          width: 100%;
          max-width: 360px;
          position: relative;
          z-index: 1;
        }
        .login-form-header {
          margin-bottom: 32px;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .login-form-label {
          font-size: 11px; font-weight: 700;
          color: #A78BFA; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 8px;
        }
        .login-form-title {
          font-size: 28px; font-weight: 800;
          color: #F0F0F5; letter-spacing: -0.8px;
          margin: 0 0 8px;
        }
        .login-form-sub {
          font-size: 13px; color: rgba(240,240,245,0.45);
          margin: 0; line-height: 1.6;
        }

        /* Tab switcher */
        .login-tabs {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 28px;
          animation: fadeUp 0.6s 0.15s ease both;
        }
        .login-tab {
          flex: 1; border: none; background: none;
          padding: 10px; border-radius: 9px;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          color: rgba(240,240,245,0.45);
        }
        .login-tab.active {
          background: rgba(124,58,237,0.25);
          color: #A78BFA;
          box-shadow: 0 0 0 1px rgba(124,58,237,0.4);
        }

        /* Input groups */
        .login-field {
          margin-bottom: 18px;
          animation: fadeUp 0.6s 0.2s ease both;
        }
        .login-field-label {
          display: block;
          font-size: 12px; font-weight: 600;
          color: rgba(240,240,245,0.6);
          margin-bottom: 7px;
          letter-spacing: 0.02em;
        }
        .login-input-wrap {
          position: relative;
        }
        .login-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(240,240,245,0.3);
          pointer-events: none;
          display: flex;
        }
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 13px 14px 13px 42px;
          font-family: 'Inter',sans-serif;
          font-size: 14px;
          color: #F0F0F5;
          outline: none;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: rgba(240,240,245,0.25); }
        .login-input:focus {
          border-color: rgba(124,58,237,0.6);
          background: rgba(124,58,237,0.06);
          box-shadow: 0 0 0 4px rgba(124,58,237,0.12);
        }
        .login-pass-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(240,240,245,0.3); padding: 0;
          transition: color 0.2s;
          display: flex;
        }
        .login-pass-toggle:hover { color: #A78BFA; }

        .login-options {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px;
          animation: fadeUp 0.6s 0.25s ease both;
        }
        .login-remember {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: rgba(240,240,245,0.5);
          cursor: pointer;
        }
        .login-remember input[type=checkbox] {
          accent-color: #7C3AED; width: 14px; height: 14px;
        }
        .login-forgot {
          font-size: 12px; color: #A78BFA;
          text-decoration: none; font-weight: 500;
          transition: opacity 0.2s;
        }
        .login-forgot:hover { opacity: 0.7; }

        /* Primary CTA */
        .login-btn {
          width: 100%;
          padding: 14px;
          border: none; border-radius: 12px;
          background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
          background-size: 200% auto;
          font-family: 'Inter',sans-serif;
          font-size: 14px; font-weight: 700;
          color: #fff; cursor: pointer;
          transition: all 0.3s ease;
          position: relative; overflow: hidden;
          animation: fadeUp 0.6s 0.3s ease both;
          letter-spacing: 0.02em;
        }
        .login-btn:hover {
          background-position: right center;
          box-shadow: 0 8px 30px rgba(124,58,237,0.45);
          transform: translateY(-1px);
        }
        .login-btn:active { transform: translateY(0); }
        .login-btn::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          animation: shimmerBtn 2.5s infinite;
        }

        .login-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 22px 0;
          animation: fadeUp 0.6s 0.35s ease both;
        }
        .login-divider::before, .login-divider::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .login-divider span {
          font-size: 11px; color: rgba(240,240,245,0.3); font-weight: 500;
          white-space: nowrap;
        }

        .login-google-btn {
          width: 100%;
          padding: 13px;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          font-family: 'Inter',sans-serif;
          font-size: 13px; font-weight: 600;
          color: rgba(240,240,245,0.7);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.25s ease;
          animation: fadeUp 0.6s 0.4s ease both;
        }
        .login-google-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.15);
          color: #F0F0F5;
        }

        .login-signup-link {
          text-align: center; margin-top: 24px;
          font-size: 13px; color: rgba(240,240,245,0.4);
          animation: fadeUp 0.6s 0.45s ease both;
        }
        .login-signup-link a {
          color: #A78BFA; font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .login-signup-link a:hover { opacity: 0.75; }

        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { width: 100%; min-width: unset; }
        }
      `}</style>

      <div className="login-root">
        {/* ── Left Panel ── */}
        <div className="login-left">
          <div className="login-left-img" />
          <div className="login-left-bg" />
          <div className="login-left-mesh" />
          <Particles />

          {/* Logo */}
          <div className="login-logo">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" className="drop-shadow-[0_0_12px_rgba(124,58,237,0.6)]">
              <circle cx="17" cy="17" r="17" fill="url(#logo_grad)" />
              <path d="M11 17H14L16 11L20 23L22 17H25" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="logo_grad" x1="0" y1="0" x2="34" y2="34">
                  <stop stopColor="#7C3AED" /><stop offset="1" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
            </svg>
            <span className="login-logo-text">EVOFIT</span>
          </div>

          {/* Bottom content */}
          <div className="login-left-content">
            <div className="login-tagline-badge">
              <span /> AI-Powered Training
            </div>
            <h2 className="login-headline">
              Elevate Your<br /><em>Performance.</em>
            </h2>
            <p className="login-subtext">
              Track, analyze, and optimize every rep with AI-powered insights tailored to your body.
            </p>
            <div className="login-stats">
              <div className="login-stat">
                <span className="login-stat-num">10k+</span>
                <span className="login-stat-label">Active Users</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat">
                <span className="login-stat-num">98%</span>
                <span className="login-stat-label">Accuracy</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat">
                <span className="login-stat-num">5</span>
                <span className="login-stat-label">Exercise Classes</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="login-right">
          <div className="login-form-wrap">
            <div className="login-form-header">
              <p className="login-form-label">Welcome back</p>
              <h1 className="login-form-title">Sign in to EvoFit</h1>
              <p className="login-form-sub">Continue your AI-powered fitness journey.</p>
            </div>

            {/* Tab switcher */}
            <div className="login-tabs">
              <button className="login-tab active" id="tab-login">Login</button>
              <Link to="/signup" style={{ flex: 1, textDecoration: 'none' }}>
                <button className="login-tab" id="tab-signup" style={{ width: '100%' }}>Sign Up</button>
              </Link>
            </div>

            {/* Email (Username) */}
            <div className="login-field">
              <label className="login-field-label" htmlFor="login-username">Username</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input id="login-username" name="username" type="text" className="login-input"
                  placeholder="alex_johnson" value={form.username} onChange={handleChange} />
              </div>
            </div>

            {/* Password */}
            <div className="login-field" style={{ animationDelay: '0.25s' }}>
              <label className="login-field-label" htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input id="login-password" name="password"
                  type={showPass ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange} />
                <button className="login-pass-toggle" onClick={() => setShowPass(s => !s)} type="button">
                  {showPass ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Options row */}
            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" id="remember-me" />
                Remember me
              </label>
              <a href="#" className="login-forgot">Forgot password?</a>
            </div>

            {/* Submit */}
            <button 
              className="login-btn" 
              id="btn-login" 
              type="button" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to EvoFit ⚡'}
            </button>

            <div className="login-divider"><span>or continue with</span></div>

            {/* Google */}
            <button className="login-google-btn" id="btn-google-login" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="login-signup-link">
              Don't have an account? <Link to="/signup">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
