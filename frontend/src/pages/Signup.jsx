import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

function Particles() {
  const dots = Array.from({ length: 15 }, (_, i) => ({
    id: i, size: Math.random() * 3 + 2, x: Math.random() * 100, y: Math.random() * 100,
    delay: Math.random() * 5, dur: Math.random() * 5 + 5, opacity: Math.random() * 0.3 + 0.1,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {dots.map((d) => (
        <div key={d.id} style={{
          position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size,
          borderRadius: '50%', background: 'rgba(167,139,250,0.5)',
          animation: `floatDotSignup ${d.dur}s ${d.delay}s ease-in-out infinite alternate`,
          opacity: d.opacity,
        }} />
      ))}
    </div>
  );
}

export default function Signup() {
  const [form, setForm] = useState({
    username: '', fullName: '', email: '', password: '', confirmPassword: '',
    age: '', weight: '', height: '', gender: 'Male',
    fitnessGoal: 'Build Strength/Muscle', fitnessLevel: 'Intermediate'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
       notify('error', 'Registration failed', 'Passwords do not match.');
       return;
    }

    // Password strength regex validation:
    // - At least 8 characters
    // - At least one uppercase letter
    // - At least one lowercase letter
    // - At least one number
    // - At least one special character from @$!%*?&#
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(form.password)) {
       notify(
         'error', 
         'Weak Password', 
         'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).'
       );
       return;
    }
    
    setIsSubmitting(true);
    const success = await register({
      username: form.username,
      email: form.email,
      password: form.password
    });
    setIsSubmitting(false);
    
    if (success) {
      navigate('/login');
    }
  };

  return (
    <>
      <style>{`
        .signup-root {
          display: flex;
          min-height: 100vh;
          background: #020617;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }
        @keyframes floatDot {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-20px) scale(1.1); }
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

        /* ── Left Branding Panel (Same as Login) ─────── */
        .signup-left {
          position: relative;
          flex: 1.1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 48px;
          overflow: hidden;
          min-height: 100vh;
        }
        .signup-left-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 30%, #1e1b4b 0%, #0f172a 50%, #020617 100%);
          z-index: 0;
        }
        .signup-left-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 80%),
            radial-gradient(ellipse 50% 50% at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 80%);
          animation: meshShift 10s ease-in-out infinite alternate;
          z-index: 0;
        }
        .signup-left-lighting {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, rgba(2,6,23,0.85));
          z-index: 1;
        }
        .signup-left-img {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.9) 100%),
            url('https://images.unsplash.com/photo-1541534741688-6078c64b5913?w=1200&q=80') center/cover no-repeat;
          z-index: 0;
          opacity: 0.5;
          filter: contrast(1.1) brightness(0.7);
        }
        .signup-left-content { position: relative; z-index: 2; animation: slideRight 0.8s cubic-bezier(0.4,0,0.2,1) both; }
        
        .signup-logo {
          display: flex; align-items: center; gap: 10px;
          position: absolute; top: 48px; left: 48px; z-index: 2;
          animation: fadeUp 0.6s ease both;
        }
        .signup-logo-text { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }

        .signup-headline {
          font-size: clamp(34px, 4vw, 54px);
          font-weight: 950;
          color: #fff; line-height: 1.05; letter-spacing: -2px; margin: 0 0 16px;
        }
        .signup-headline em {
          font-style: normal; display: block;
          background: linear-gradient(90deg, #818cf8, #c084fc, #e879f9);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .signup-subtext {
          font-size: 16px; color: rgba(255,255,255,0.6);
          line-height: 1.6; max-width: 380px; margin: 0 0 40px;
        }
        .signup-stats { display: flex; gap: 16px; animation: fadeUp 0.8s 0.3s ease both; }
        .signup-stat-card {
          flex: 1; background: rgba(255,255,255,0.03); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px;
        }
        .signup-stat-num { font-size: 24px; font-weight: 900; color: #fff; display: block; margin-bottom: 4px; }
        .signup-stat-label { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 600; text-transform: uppercase; }

        /* ── Right Action Panel ──────────────────────── */
        .signup-right {
          width: 580px;
          background: #0E0E16;
          border-left: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 48px;
          overflow-y: auto;
        }
        .signup-form-container { width: 100%; max-width: 480px; position: relative; z-index: 10; }
        .signup-title { font-size: 30px; font-weight: 800; letter-spacing: -1px; margin-bottom: 10px; color: #F0F0F5; }
        .signup-subtitle { color: rgba(240,240,245,0.45); font-size: 13px; margin-bottom: 32px; }

        .signup-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 18px; padding: 24px; margin-bottom: 24px;
        }
        .signup-section-title {
          font-size: 11px; font-weight: 700; color: #A78BFA;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px;
        }

        .signup-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 12px 14px; color: #fff !important; font-size: 14px; outline: none; transition: all 0.2s;
        }
        .signup-input:focus { border-color: #7C3AED; background: rgba(124,58,237,0.05); box-shadow: 0 0 0 4px rgba(124,58,237,0.1); }

        /* FIX: Select Dropdown Contrast Bug */
        .signup-select {
          width: 100%; background: #16161E;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
          padding: 12px 14px; color: #fff !important; font-size: 14px; outline: none;
          cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23A78BFA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; background-size: 16px;
        }
        .signup-select option {
          background-color: #16161E;
          color: #fff;
          padding: 12px;
        }
        .signup-select:focus { border-color: #818cf8; box-shadow: 0 0 0 4px rgba(129,140,248,0.1); }

        .signup-btn {
          width: 100%; padding: 16px; border: none; border-radius: 14px;
          background: linear-gradient(135deg, #7C3AED, #A78BFA);
          color: #fff; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s ease;
          box-shadow: 0 8px 25px -5px rgba(124,58,237,0.5);
        }
        .signup-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px -5px rgba(124,58,237,0.6); }
        .signup-btn:active { transform: translateY(0); }

        @media (max-width: 960px) {
          .signup-left { display: none; }
          .signup-right { width: 100%; padding: 48px 24px; }
        }
      `}</style>

      <div className="signup-root">
        {/* ── Left Branding Panel (Now Unified with Login) ── */}
        <div className="signup-left">
          <div className="signup-left-img" />
          <div className="signup-left-bg" />
          <div className="signup-left-mesh" />
          <div className="signup-left-lighting" />
          <Particles />
 
          <div className="signup-logo">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <circle cx="17" cy="17" r="17" fill="url(#logo_grad_s)" />
              <path d="M11 17H14L16 11L20 23L22 17H25" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="logo_grad_s" x1="0" y1="0" x2="34" y2="34">
                  <stop stopColor="#7C3AED" /><stop offset="1" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
            </svg>
            <span className="signup-logo-text">EVOFIT</span>
          </div>
 
          <div className="signup-left-content">
            <h2 className="signup-headline">Elevate Your<br /><em>Performance.</em></h2>
            <p className="signup-subtext">
              Experience the future of fitness with intelligent tracking, hyper-personalized insights, and cinematic workout analysis.
            </p>
            <div className="signup-stats">
              <div className="signup-stat-card">
                <span className="signup-stat-num">10k+</span>
                <span className="signup-stat-label">Active Users</span>
              </div>
              <div className="signup-stat-card">
                <span className="signup-stat-num">98%</span>
                <span className="signup-stat-label">Accuracy</span>
              </div>
              <div className="signup-stat-card">
                <span className="signup-stat-num">5</span>
                <span className="signup-stat-label">Classes</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Form ── */}
        <div className="signup-right">
          <div className="signup-form-container">
            <div className="signup-header">
               <h1 className="signup-title">Create Your Account</h1>
               <p className="signup-subtitle">Join the elite community of AI-driven performers.</p>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              {/* Profile Basics */}
              <div className="signup-section">
                <div className="signup-section-title">Account Credentials</div>
                <div className="signup-grid">
                  <div className="signup-input-group">
                    <label className="signup-label">Username</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      </span>
                      <input name="username" className="signup-input" style={{ paddingLeft: 36 }} placeholder="alex_pro" onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="signup-input-group">
                    <label className="signup-label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <input name="fullName" className="signup-input" placeholder="Alex Johnson" onChange={handleChange} />
                    </div>
                  </div>
                  <div className="signup-input-group signup-full">
                    <label className="signup-label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </span>
                      <input name="email" type="email" className="signup-input" style={{ paddingLeft: 36 }} placeholder="name@example.com" onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="signup-input-group">
                    <label className="signup-label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </span>
                      <input name="password" type="password" className="signup-input" style={{ paddingLeft: 36 }} placeholder="••••••••" onChange={handleChange} />
                    </div>
                  </div>
                  <div className="signup-input-group">
                    <label className="signup-label">Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                       <input name="confirmPassword" type="password" className="signup-input" placeholder="••••••••" onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Profile */}
              <div className="signup-section">
                <div className="signup-section-title">Physical Profile</div>
                <div className="signup-grid">
                  <div className="signup-input-group">
                    <label className="signup-label">Age</label>
                    <input name="age" type="number" className="signup-input" placeholder="24" onChange={handleChange} />
                  </div>
                  <div className="signup-input-group">
                    <label className="signup-label">Gender</label>
                    <select name="gender" className="signup-select" onChange={handleChange}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="signup-input-group">
                    <label className="signup-label">Current Weight (kg)</label>
                    <input name="weight" type="number" className="signup-input" placeholder="75" onChange={handleChange} />
                  </div>
                  <div className="signup-input-group">
                    <label className="signup-label">Height (cm)</label>
                    <input name="height" type="number" className="signup-input" placeholder="180" onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Fitness Goals */}
              <div className="signup-section">
                <div className="signup-section-title">Fitness Aspirations</div>
                <div className="signup-grid">
                  <div className="signup-input-group signup-full">
                    <label className="signup-label">Primary Fitness Goal</label>
                    <select name="fitnessGoal" className="signup-select" onChange={handleChange}>
                      <option>Build Strength/Muscle</option>
                      <option>Weight Loss</option>
                      <option>Endurance Training</option>
                      <option>General Fitness</option>
                    </select>
                  </div>
                  <div className="signup-input-group signup-full">
                    <label className="signup-label">Current Experience Level</label>
                    <select name="fitnessLevel" className="signup-select" onChange={handleChange}>
                      <option>Beginner (0-1 Years)</option>
                      <option>Intermediate (1-3 Years)</option>
                      <option>Advanced (3+ Years)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="signup-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account & Start Training ⚡'}
              </button>

              <div className="signup-footer">
                Already have an account? <Link to="/login">Sign In</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
