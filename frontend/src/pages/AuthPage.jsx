import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const isLogin = location.pathname === '/login';
  
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  // Signup State (Fully Restored)
  const [signupForm, setSignupForm] = useState({
    username: '', 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    age: '', 
    weight: '', 
    height: '', 
    gender: 'Male',
    fitnessGoal: 'Build Strength/Muscle', 
    fitnessLevel: 'Intermediate'
  });

  const handleLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  const handleSignupChange = (e) => setSignupForm({ ...signupForm, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) return;
    setIsSubmitting(true);
    const success = await login(loginForm.username, loginForm.password);
    setIsSubmitting(false);
    if (success) navigate('/dashboard');
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupForm.username || !signupForm.email || !signupForm.password) return;
    if (signupForm.password !== signupForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);
    const success = await register({
      username: signupForm.username,
      email: signupForm.email,
      password: signupForm.password
    });
    setIsSubmitting(false);
    if (success) navigate('/login');
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
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmerTab {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .auth-root {
          display: flex;
          height: 100vh;
          background: #020617;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        /* ── Left Branding Panel ─────────────────────── */
        .auth-left {
          position: relative;
          flex: 1.15;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 60px;
          overflow: hidden;
          height: 100vh;
        }
        .auth-left-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 30%, #1e1b4b 0%, #0f172a 50%, #020617 100%);
          z-index: 0;
        }
        .auth-left-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 30% 20%, rgba(99,102,241,0.18) 0%, transparent 80%),
            radial-gradient(ellipse 50% 50% at 80% 80%, rgba(139,92,246,0.15) 0%, transparent 80%);
          animation: meshShift 12s ease-in-out infinite alternate;
          z-index: 0;
        }
        .auth-left-lighting {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, rgba(2,6,23,0.9));
          z-index: 1;
        }
        .auth-left-img {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.92) 100%),
            url('https://images.unsplash.com/photo-1541534741688-6078c64b5913?w=1200&q=80') center/cover no-repeat;
          z-index: 0;
          opacity: 0.55;
          filter: contrast(1.1) brightness(0.75);
        }
        .auth-left-content { position: relative; z-index: 2; animation: slideRight 0.9s cubic-bezier(0.4,0,0.2,1) both; }
        
        .auth-logo {
          display: flex; align-items: center; gap: 12px;
          position: absolute; top: 60px; left: 60px; z-index: 2;
          animation: fadeUp 0.6s ease both;
        }
        .auth-logo-text { font-size: 22px; font-weight: 900; color: #fff; letter-spacing: -0.02em; }

        .auth-headline {
          font-size: clamp(38px, 4.5vw, 58px);
          font-weight: 950;
          color: #fff; line-height: 1.02; letter-spacing: -2.5px; margin: 0 0 20px;
        }
        .auth-headline em {
          font-style: normal; display: block;
          background: linear-gradient(90deg, #818cf8, #c084fc, #e879f9);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: shimmerTab 5s linear infinite;
          filter: drop-shadow(0 0 12px rgba(167,139,250,0.3));
        }
        .auth-subtext {
          font-size: 17px; color: rgba(255,255,255,0.65);
          line-height: 1.6; max-width: 420px; margin: 0 0 48px;
        }
        .auth-stats { display: flex; gap: 20px; animation: fadeUp 0.8s 0.3s ease both; }
        .auth-stat-card {
          flex: 1; background: rgba(255,255,255,0.03); backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 20px;
          transition: transform 0.3s ease;
        }
        .auth-stat-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.05); }
        .auth-stat-num { font-size: 26px; font-weight: 950; color: #fff; display: block; margin-bottom: 6px; }
        .auth-stat-label { font-size: 11px; color: rgba(255,255,255,0.45); font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }

        /* ── Right Action Panel ──────────────────────── */
        .auth-right {
          width: 580px;
          background: #0E0E16;
          border-left: 1px solid rgba(255,255,255,0.04);
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100vh;
          justify-content: ${isLogin ? 'center' : 'flex-start'};
          padding: ${isLogin ? '60px 48px' : '80px 48px'};
          overflow-y: auto;
          position: relative;
          z-index: 5;
        }
        .auth-form-container { 
          width: 100%; 
          max-width: 440px; 
          position: relative; 
          animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        
        .auth-title { font-size: 32px; font-weight: 900; letter-spacing: -1.2px; margin-bottom: 8px; color: #F8F8FA; }
        .auth-subtitle { color: rgba(240,240,245,0.4); font-size: 14px; margin-bottom: 32px; }

        /* Unified Card Styles */
        .auth-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px; padding: 28px; margin-bottom: 24px;
        }
        .auth-section-title {
          font-size: 11px; font-weight: 800; color: #A78BFA;
          text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 24px;
          display: flex; align-items: center; gap: 12px;
        }
        .auth-section-title::after { content: ''; flex: 1; height: 1px; background: rgba(167,139,250,0.1); }

        /* Tab switcher */
        .auth-tabs {
          display: flex; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 14px;
          padding: 5px; margin-bottom: 36px;
        }
        .auth-tab {
          flex: 1; border: none; background: none; padding: 12px; border-radius: 10px;
          font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(240,240,245,0.4); text-align: center; text-decoration: none;
        }
        .auth-tab.active { background: rgba(124,58,237,0.22); color: #fff; box-shadow: 0 4px 15px rgba(124,58,237,0.15); }

        .auth-field { margin-bottom: 20px; }
        .auth-label { display: block; font-size: 13px; font-weight: 600; color: rgba(240,240,245,0.7); margin-bottom: 10px; }
        .auth-input-wrap { position: relative; }
        .auth-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 14px;
          padding: 13px 16px 13px 44px; color: #fff; font-size: 15px; outline: none; transition: all 0.25s;
          box-sizing: border-box;
        }
        .auth-input:focus { border-color: #818cf8; background: rgba(129,140,248,0.06); box-shadow: 0 0 0 4px rgba(129,140,248,0.1); }

        /* FIX: Select Dropdown Contrast */
        .auth-select {
          width: 100%; background: #16161E; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 13px 16px 13px 44px; color: #fff; font-size: 15px; outline: none;
          cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23818cf8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 16px center; background-size: 18px;
        }
        .auth-select option { background-color: #12121A; color: #fff; padding: 12px; }

        .auth-btn {
          width: 100%; padding: 18px; border: none; border-radius: 16px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff; font-weight: 800; font-size: 16px; cursor: pointer; transition: all 0.3s ease;
          box-shadow: 0 10px 30px -10px rgba(124,58,237,0.6);
          letter-spacing: 0.01em;
          margin-top: 10px;
        }
        .auth-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 35px -10px rgba(124,58,237,0.7); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 1100px) { .auth-left { padding: 40px; } }
        @media (max-width: 960px) {
          .auth-left { display: none; }
          .auth-right { width: 100%; padding: 60px 24px; }
        }
      `}</style>

      <div className="auth-root">
        {/* ── Left Branding Panel ── */}
        <div className="auth-left">
          <div className="auth-left-img" />
          <div className="auth-left-bg" />
          <div className="auth-left-mesh" />
          <div className="auth-left-lighting" />
          <Particles />

          <div className="auth-logo">
            <svg width="36" height="36" viewBox="0 0 34 34" fill="none">
              <circle cx="17" cy="17" r="17" fill="url(#logo_grad_final)" />
              <path d="M11 17H14L16 11L20 23L22 17H25" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="logo_grad_final" x1="0" y1="0" x2="34" y2="34">
                  <stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <span className="auth-logo-text">EVOFIT</span>
          </div>

          <div className="auth-left-content">
            <h2 className="auth-headline">Elevate Your<br /><em>Performance.</em></h2>
            <p className="auth-subtext">
              Experience the future of fitness with intelligent tracking, hyper-personalized insights, and cinematic workout analysis.
            </p>
            <div className="auth-stats">
              <div className="auth-stat-card">
                <span className="auth-stat-num">10k+</span>
                <span className="auth-stat-label">Athletes</span>
              </div>
              <div className="auth-stat-card">
                <span className="auth-stat-num">98%</span>
                <span className="auth-stat-label">Accuracy</span>
              </div>
              <div className="auth-stat-card">
                <span className="auth-stat-num">5</span>
                <span className="auth-stat-label">Classes</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Action Panel ── */}
        <div className="auth-right">
          <div className="auth-form-container" key={isLogin ? 'login' : 'signup'}>
            <div style={{ marginBottom: 36 }}>
               <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Join the Elite'}</h1>
               <p className="auth-subtitle">
                 {isLogin ? 'Continue your AI-powered fitness journey.' : 'Create your pro profile and start training today.'}
               </p>
            </div>

            {/* Tab switcher */}
            <div className="auth-tabs">
              <Link to="/login" className={`auth-tab ${isLogin ? 'active' : ''}`}>Sign In</Link>
              <Link to="/signup" className={`auth-tab ${!isLogin ? 'active' : ''}`}>Get Started</Link>
            </div>

            {isLogin ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit}>
                <div className="auth-field">
                  <label className="auth-label">Username</label>
                  <div className="auth-input-wrap">
                    <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <input name="username" type="text" className="auth-input" placeholder="alex_johnson" value={loginForm.username} onChange={handleLoginChange} />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className="auth-input-wrap">
                    <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                    <input name="password" type={showPass ? 'text' : 'password'} className="auth-input" placeholder="••••••••" value={loginForm.password} onChange={handleLoginChange} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>
                      {showPass ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="auth-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Authenticating...' : 'Sign In to EvoFit ⚡'}
                </button>
              </form>
            ) : (
              /* SIGNUP FORM (FULL RESTORATION) */
              <form onSubmit={handleSignupSubmit}>
                <div className="auth-section">
                  <div className="auth-section-title">Account Details</div>
                  <div className="auth-field">
                    <label className="auth-label">Full Name</label>
                    <div className="auth-input-wrap">
                      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                         <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                           <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>
                         </svg>
                      </span>
                      <input name="fullName" className="auth-input" placeholder="Alex Johnson" onChange={handleSignupChange} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="auth-field">
                      <label className="auth-label">Username</label>
                      <div className="auth-input-wrap">
                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        </span>
                        <input name="username" className="auth-input" placeholder="alex_pro" onChange={handleSignupChange} required />
                      </div>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Email</label>
                      <div className="auth-input-wrap">
                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                          </svg>
                        </span>
                        <input name="email" type="email" className="auth-input" placeholder="name@pro.com" onChange={handleSignupChange} required />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="auth-field">
                      <label className="auth-label">Password</label>
                      <div className="auth-input-wrap">
                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </span>
                        <input name="password" type="password" className="auth-input" placeholder="••••••••" onChange={handleSignupChange} />
                      </div>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Confirm</label>
                      <div className="auth-input-wrap">
                        <input name="confirmPassword" type="password" className="auth-input" style={{ paddingLeft: 16 }} placeholder="••••••••" onChange={handleSignupChange} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="auth-section">
                   <div className="auth-section-title">Physical Profile</div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="auth-field">
                        <label className="auth-label">Age</label>
                        <div className="auth-input-wrap">
                          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                          </span>
                          <input name="age" type="number" className="auth-input" placeholder="24" onChange={handleSignupChange} />
                        </div>
                      </div>
                      <div className="auth-field">
                        <label className="auth-label">Gender</label>
                        <div className="auth-input-wrap">
                          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="10" r="8"/><path d="M12 18v4m-2-2h4"/>
                            </svg>
                          </span>
                          <select name="gender" className="auth-select" onChange={handleSignupChange}>
                            <option>Male</option><option>Female</option><option>Other</option>
                          </select>
                        </div>
                      </div>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="auth-field">
                        <label className="auth-label">Weight (kg)</label>
                        <div className="auth-input-wrap">
                          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                            </svg>
                          </span>
                          <input name="weight" type="number" className="auth-input" placeholder="75" onChange={handleSignupChange} />
                        </div>
                      </div>
                      <div className="auth-field">
                        <label className="auth-label">Height (cm)</label>
                        <div className="auth-input-wrap">
                          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                          </span>
                          <input name="height" type="number" className="auth-input" placeholder="180" onChange={handleSignupChange} />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="auth-section">
                   <div className="auth-section-title">Fitness Aspirations</div>
                   <div className="auth-field">
                      <label className="auth-label">Primary Goal</label>
                      <div className="auth-input-wrap">
                         <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                            </svg>
                         </span>
                         <select name="fitnessGoal" className="auth-select" onChange={handleSignupChange}>
                           <option>Build Strength/Muscle</option>
                           <option>Weight Loss</option>
                           <option>Endurance</option>
                           <option>General Fitness</option>
                         </select>
                      </div>
                   </div>
                   <div className="auth-field">
                      <label className="auth-label">Experience</label>
                      <div className="auth-input-wrap">
                         <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                         </span>
                         <select name="fitnessLevel" className="auth-select" onChange={handleSignupChange}>
                           <option>Beginner</option>
                           <option>Intermediate</option>
                           <option>Advanced</option>
                         </select>
                      </div>
                   </div>
                </div>

                <button type="submit" className="auth-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Account...' : 'Create Account & Start Training ⚡'}
                </button>
              </form>
            )}

            <p style={{ marginTop: 28, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Link to={isLogin ? "/signup" : "/login"} style={{ color: '#818cf8', textDecoration: 'none', fontStyle: 'italic', fontWeight: 600 }}>
                {isLogin ? "Join the community" : "Sign In back"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
