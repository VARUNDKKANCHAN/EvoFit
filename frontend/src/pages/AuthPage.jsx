import React, { useState, useEffect } from 'react';
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
  
  // Signup State
  const [signupForm, setSignupForm] = useState({
    username: '', fullName: '', email: '', password: '', confirmPassword: '',
    age: '', weight: '', height: '', gender: 'Male',
    fitnessGoal: 'Build Strength/Muscle', fitnessLevel: 'Intermediate'
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
    if (signupForm.password !== signupForm.confirmPassword) return;
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
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmerBtn {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .auth-root {
          display: flex;
          min-height: 100vh;
          background: #020617;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        /* ── Left Branding Panel (Shared) ───────────── */
        .auth-left {
          position: relative;
          flex: 1.1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 48px;
          overflow: hidden;
          min-height: 100vh;
          transition: all 0.5s ease;
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
            radial-gradient(ellipse 70% 60% at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 80%),
            radial-gradient(ellipse 50% 50% at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 80%);
          animation: meshShift 10s ease-in-out infinite alternate;
          z-index: 0;
        }
        .auth-left-img {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.9) 100%),
            url('https://images.unsplash.com/photo-1541534741688-6078c64b5913?w=1200&q=80') center/cover no-repeat;
          z-index: 0;
          opacity: 0.5;
          filter: contrast(1.1) brightness(0.7);
        }
        .auth-left-content { position: relative; z-index: 2; animation: slideRight 0.8s cubic-bezier(0.4,0,0.2,1) both; }
        
        .auth-logo {
          display: flex; align-items: center; gap: 10px;
          position: absolute; top: 48px; left: 48px; z-index: 2;
          animation: fadeUp 0.6s ease both;
        }
        .auth-logo-text { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }

        .auth-headline {
          font-size: clamp(34px, 4vw, 54px);
          font-weight: 950;
          color: #fff; line-height: 1.05; letter-spacing: -2px; margin: 0 0 16px;
        }
        .auth-headline em {
          font-style: normal; display: block;
          background: linear-gradient(90deg, #818cf8, #c084fc, #e879f9);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: shimmerBtn 4s linear infinite;
        }
        .auth-subtext {
          font-size: 16px; color: rgba(255,255,255,0.6);
          line-height: 1.6; max-width: 380px; margin: 0 0 40px;
        }
        .auth-stats { display: flex; gap: 16px; animation: fadeUp 0.8s 0.3s ease both; }
        .auth-stat-card {
          flex: 1; background: rgba(255,255,255,0.03); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px;
        }
        .auth-stat-num { font-size: 24px; font-weight: 900; color: #fff; display: block; margin-bottom: 4px; }
        .auth-stat-label { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 600; text-transform: uppercase; }

        /* ── Right Action Panel ──────────────────────── */
        .auth-right {
          width: 580px;
          background: #0E0E16;
          border-left: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 48px;
          overflow-y: auto;
          position: relative;
          z-index: 5;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auth-form-container { 
          width: 100%; 
          max-width: 420px; 
          position: relative; 
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        
        /* Tab switcher */
        .auth-tabs {
          display: flex; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 12px;
          padding: 4px; margin-bottom: 32px;
        }
        .auth-tab {
          flex: 1; border: none; background: none; padding: 10px; border-radius: 9px;
          font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.25s ease;
          color: rgba(240,240,245,0.45); text-align: center; text-decoration: none;
        }
        .auth-tab.active { background: rgba(124,58,237,0.25); color: #A78BFA; }

        .auth-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 18px; padding: 24px; margin-bottom: 24px;
        }
        .auth-section-title {
          font-size: 11px; font-weight: 700; color: #A78BFA;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px;
        }

        .auth-field { margin-bottom: 18px; }
        .auth-label { display: block; font-size: 12px; font-weight: 600; color: rgba(240,240,245,0.6); margin-bottom: 8px; }
        .auth-input-wrap { position: relative; }
        .auth-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 12px 14px 12px 42px; color: #fff; font-size: 14px; outline: none; transition: all 0.2s;
        }
        .auth-input:focus { border-color: #7C3AED; background: rgba(124,58,237,0.05); }

        .auth-select {
          width: 100%; background: #16161E; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 12px 14px; color: #fff; font-size: 14px; outline: none;
          cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23A78BFA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; background-size: 16px;
        }
        .auth-select option { background-color: #16161E; color: #fff; }

        .auth-btn {
          width: 100%; padding: 16px; border: none; border-radius: 14px;
          background: linear-gradient(135deg, #7C3AED, #A78BFA);
          color: #fff; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s ease;
          box-shadow: 0 8px 25px -5px rgba(124,58,237,0.5);
          letter-spacing: 0.02em;
        }
        .auth-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px -5px rgba(124,58,237,0.6); }

        @media (max-width: 960px) {
          .auth-left { display: none; }
          .auth-right { width: 100%; padding: 48px 24px; }
        }
      `}</style>

      <div className="auth-root">
        {/* ── Left Branding Panel (Shared) ── */}
        <div className="auth-left">
          <div className="auth-left-img" />
          <div className="auth-left-bg" />
          <div className="auth-left-mesh" />
          <Particles />

          <div className="auth-logo">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <circle cx="17" cy="17" r="17" fill="url(#logo_grad_a)" />
              <path d="M11 17H14L16 11L20 23L22 17H25" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="logo_grad_a" x1="0" y1="0" x2="34" y2="34">
                  <stop stopColor="#7C3AED" /><stop offset="1" stopColor="#A78BFA" />
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
                <span className="auth-stat-label">Active Users</span>
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
            <div style={{ marginBottom: 32 }}>
               <h1 className="auth-title">{isLogin ? 'Sign in to EvoFit' : 'Create Your Account'}</h1>
               <p className="auth-subtitle">
                 {isLogin ? 'Continue your AI-powered fitness journey.' : 'Join the elite community of AI-driven performers.'}
               </p>
            </div>

            {/* Tab switcher */}
            <div className="auth-tabs">
              <Link to="/login" className={`auth-tab ${isLogin ? 'active' : ''}`}>Login</Link>
              <Link to="/signup" className={`auth-tab ${!isLogin ? 'active' : ''}`}>Sign Up</Link>
            </div>

            {isLogin ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit}>
                <div className="auth-field">
                  <label className="auth-label">Username</label>
                  <div className="auth-input-wrap">
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <input name="username" type="text" className="auth-input" placeholder="alex_johnson" value={loginForm.username} onChange={handleLoginChange} />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className="auth-input-wrap">
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                    <input name="password" type={showPass ? 'text' : 'password'} className="auth-input" placeholder="••••••••" value={loginForm.password} onChange={handleLoginChange} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A78BFA', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      {showPass ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="auth-btn" style={{ marginTop: 12 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Authenticating...' : 'Sign In to EvoFit ⚡'}
                </button>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignupSubmit}>
                <div className="auth-section">
                  <div className="auth-section-title">Credentials</div>
                  <div className="auth-field">
                    <label className="auth-label">Username</label>
                    <div className="auth-input-wrap">
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                         <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                         </svg>
                      </span>
                      <input name="username" className="auth-input" placeholder="alex_pro" onChange={handleSignupChange} required />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <div className="auth-input-wrap">
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </span>
                      <input name="email" type="email" className="auth-input" placeholder="name@example.com" onChange={handleSignupChange} required />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <div className="auth-input-wrap">
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </span>
                      <input name="password" type="password" className="auth-input" placeholder="••••••••" onChange={handleSignupChange} />
                    </div>
                  </div>
                </div>

                <div className="auth-section">
                   <div className="auth-section-title">Physical Profile</div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="auth-field">
                        <label className="auth-label">Age</label>
                        <input name="age" type="number" className="auth-input" style={{ paddingLeft: 14 }} placeholder="24" onChange={handleSignupChange} />
                      </div>
                      <div className="auth-field">
                        <label className="auth-label">Gender</label>
                        <select name="gender" className="auth-select" onChange={handleSignupChange}>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                   </div>
                </div>

                <button type="submit" className="auth-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Account...' : 'Create Account & Start Training ⚡'}
                </button>
              </form>
            )}

            <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Link to={isLogin ? "/signup" : "/login"} style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>
                {isLogin ? "Create one free" : "Sign In"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
