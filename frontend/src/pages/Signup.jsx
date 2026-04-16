import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
       // A toast will be handled or a simple alert for now
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
        @keyframes floatDotSignup {
          from { transform: translateY(0px); }
          to   { transform: translateY(-30px); }
        }
        @keyframes signupFadeIn {
          from { opacity: 0; transform: scale(0.98) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .signup-root {
          display: flex;
          min-height: 100vh;
          background: #07070E;
          font-family: 'Inter', sans-serif;
          color: #F0F0F5;
        }

        /* ── Left Sticky Panel ────────────────────── */
        .signup-left {
          width: 400px;
          background: linear-gradient(180deg, #0E0E16 0%, #07070E 100%);
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }
        .signup-left-glow {
          position: absolute;
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%);
          filter: blur(40px);
          z-index: 0;
        }
        .signup-loader {
           position: relative; width: 180px; height: 180px; margin: 40px auto;
           display: flex; align-items: center; justify-content: center;
        }
        .signup-loader-spinner {
          position: absolute; inset: 0;
          border: 2px solid rgba(124,58,237,0.1);
          border-top-color: #7C3AED;
          border-radius: 50%;
          animation: spinSlow 3s linear infinite;
        }
        .signup-left-content { position: relative; z-index: 2; text-align: center; }
        .signup-left-footer { font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; z-index: 2; }

        /* ── Right Scrollable Form ─────────────────── */
        .signup-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          overflow-y: auto;
          background: #07070E;
        }
        .signup-form-container {
          width: 100%;
          max-width: 580px;
          animation: signupFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .signup-header { margin-bottom: 40px; text-align: center; }
        .signup-title { font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; }
        .signup-subtitle { color: rgba(240,240,245,0.45); font-size: 14px; }

        /* Card Sectioning */
        .signup-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 24px;
        }
        .signup-section-title {
          font-size: 13px; font-weight: 700; color: #A78BFA;
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-bottom: 24px; display: flex; align-items: center; gap: 10px;
        }
        .signup-section-title::after {
          content: ''; flex: 1; height: 1px; background: rgba(167,139,250,0.15);
        }

        .signup-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .signup-full { grid-column: span 2; }

        .signup-input-group { margin-bottom: 4px; }
        .signup-label {
          display: block; font-size: 12px; font-weight: 600;
          color: rgba(240,240,245,0.6); margin-bottom: 8px;
        }
        .signup-input, .signup-select {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .signup-input:focus, .signup-select:focus {
          border-color: rgba(124,58,237,0.5);
          background: rgba(124,58,237,0.06);
          box-shadow: 0 0 0 4px rgba(124,58,237,0.1);
        }

        .signup-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #7C3AED, #A78BFA);
          border: none; border-radius: 14px;
          color: #fff; font-weight: 700; font-size: 15px;
          cursor: pointer; transition: all 0.3s ease;
          margin-top: 10px;
          box-shadow: 0 10px 25px -5px rgba(124,58,237,0.4);
        }
        .signup-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(124,58,237,0.5);
        }

        .signup-footer {
          text-align: center; margin-top: 24px;
          font-size: 14px; color: rgba(240,240,245,0.4);
        }
        .signup-footer a { color: #A78BFA; font-weight: 600; text-decoration: none; }

        @media (max-width: 900px) {
          .signup-left { display: none; }
          .signup-grid { grid-template-columns: 1fr; }
          .signup-full { grid-column: span 1; }
        }
      `}</style>

      <div className="signup-root">
        {/* ── Left Branding ── */}
        <div className="signup-left">
          <Particles />
          <div className="signup-left-glow" />
          
          <div className="signup-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 'bold' }}>⚡</div>
            <span style={{ fontWeight: 800, fontSize: 20 }}>EVOFIT PRO</span>
          </div>

          <div className="signup-left-content">
             <div className="signup-loader">
                <div className="signup-loader-spinner" />
                <div style={{ fontSize: 40 }}>🧘</div>
             </div>
             <h2 style={{ fontSize: 24, fontWeight: 800, margin: '20px 0 10px' }}>Evolve Your Body</h2>
             <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>
               Personalize your AI profile to get hyper-targeted feedback on your form and progress.
             </p>
          </div>

          <div className="signup-left-footer">
            12k+ Athletes Synced • 99% Precision
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
                    <input name="username" className="signup-input" placeholder="alex_pro" onChange={handleChange} required />
                  </div>
                  <div className="signup-input-group">
                    <label className="signup-label">Full Name</label>
                    <input name="fullName" className="signup-input" placeholder="Alex Johnson" onChange={handleChange} />
                  </div>
                  <div className="signup-input-group signup-full">
                    <label className="signup-label">Email Address</label>
                    <input name="email" type="email" className="signup-input" placeholder="name@example.com" onChange={handleChange} required />
                  </div>
                  <div className="signup-input-group">
                    <label className="signup-label">Password</label>
                    <input name="password" type="password" className="signup-input" placeholder="••••••••" onChange={handleChange} />
                  </div>
                  <div className="signup-input-group">
                    <label className="signup-label">Confirm Password</label>
                    <input name="confirmPassword" type="password" className="signup-input" placeholder="••••••••" onChange={handleChange} />
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
