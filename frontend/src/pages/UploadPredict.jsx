import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/auth';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const REQUIRED_COLS = ['acc_x', 'acc_y', 'acc_z', 'gyr_x', 'gyr_y', 'gyr_z'];
const ALLOWED_EXT   = ['.csv', '.pkl'];

const STEPS = [
  {
    n: 1, title: 'Export Data',
    desc: 'Export a merged sensor CSV/PKL with 6 columns: acc_x, acc_y, acc_z, gyr_x, gyr_y, gyr_z.',
  },
  {
    n: 2, title: 'Run Prediction',
    desc: 'Our Random Forest model identifies the exercise type, rep counts, and movement patterns.',
  },
  {
    n: 3, title: 'Optimize Form',
    desc: 'Use confidence scores and probability breakdowns to spot where your form might be breaking down.',
  },
];

/* ── Ripple button ────────────────────────────────────────────── */
function RippleButton({ className, onClick, disabled, children, id }) {
  const btnRef = useRef();
  const handleClick = (e) => {
    if (disabled) return;
    const btn  = btnRef.current;
    const rect = btn.getBoundingClientRect();
    const d    = Math.max(btn.clientWidth, btn.clientHeight);
    const sp   = document.createElement('span');
    sp.style.cssText = `position:absolute;width:${d}px;height:${d}px;
      left:${e.clientX - rect.left - d / 2}px;top:${e.clientY - rect.top - d / 2}px;
      border-radius:50%;background:rgba(255,255,255,0.25);transform:scale(0);
      animation:ripple 0.55s linear;pointer-events:none;`;
    btn.appendChild(sp);
    sp.addEventListener('animationend', () => sp.remove());
    onClick && onClick(e);
  };
  return (
    <button
      id={id} ref={btnRef}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/* ── Floating background orbs ─────────────────────────────────── */
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full bg-evofit-purple-main/10 blur-[100px] animate-float" />
      <div className="absolute -bottom-16 left-40 w-[300px] h-[300px] rounded-full bg-evofit-purple-light/10 blur-[80px] animate-float animation-delay-[-3s]" />
      <div className="absolute top-[40%] right-1/4 w-[180px] h-[180px] rounded-full bg-evofit-purple-main/5 blur-[50px] animate-float animation-delay-[-1.5s]" />
    </div>
  );
}

export default function UploadPredict() {
  const navigate                = useNavigate();
  const [file, setFile]         = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const inputRef                = useRef();

  const isAllowed = (f) => ALLOWED_EXT.some(ext => f.name.toLowerCase().endsWith(ext));

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!isAllowed(f)) {
      setError(`Unsupported file type. Please upload a .csv or .pkl file.`);
      return;
    }
    setFile(f); setError('');
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const runPrediction = async () => {
    if (!file) return;
    setLoading(true); setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await api.post('/predict/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data;
      // Save to sessionStorage and navigate
      sessionStorage.setItem('lastPrediction', JSON.stringify({ result: data, filename: file.name }));

      // Achievement notifications
      if (data.new_achievements && data.new_achievements.length > 0) {
        data.new_achievements.forEach(badge => {
          toast.success(`🏆 Achievement Unlocked: ${badge}`, {
            style: { border: '1px solid #7C3AED', background: '#16161F', color: '#fff' }
          });
        });
      }

      // Delay navigation slightly if there are achievements
      if (data.leveled_up) {
        setLoading(false);
        setLevelUpData({ xp: data.new_xp_total, filename: file.name, result: data });
        setShowLevelUp(true);
      } else {
        const delay = data.new_achievements?.length > 0 ? 2000 : 0;
        setTimeout(() => {
          navigate('/analytics', { state: { result: data, filename: file.name } });
        }, delay);
      }
    } catch (err) {
      setError(err.message || 'Could not reach the API. Is the backend running on port 8000?');
      setLoading(false); // only stop loading on error, so UI doesn't flash before nav
    }
  };

  const handleContinueAfterLevelUp = () => {
    setShowLevelUp(false);
    navigate('/analytics', { state: { result: levelUpData.result, filename: levelUpData.filename } });
  };

  const reset = () => { setFile(null); setError(''); };

  const fileExt = file ? file.name.split('.').pop().toLowerCase() : null;

  return (
    <div className="flex-1 flex flex-col items-center py-6 md:py-8 px-4 md:px-6 overflow-y-auto relative z-10 bg-evofit-bg-primary font-inter min-h-full animate-page-enter">
      <BackgroundOrbs />
      
      <AnimatePresence>
        {showLevelUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#7C3AED', '#3B82F6', '#34D399', '#F472B6', '#F59E0B']} />
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              className="relative z-10 bg-gradient-to-br from-[#16161F] to-[#0D0D14] p-10 rounded-3xl border border-evofit-purple-main/50 text-center max-w-sm w-full shadow-[0_0_80px_rgba(124,58,237,0.3)]"
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-amber-500/20">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">LEVEL UP!</h2>
              <p className="text-evofit-text-secondary font-medium mb-8">You've reached a new rank. Your power grows!</p>
              <button 
                onClick={handleContinueAfterLevelUp}
                className="w-full bg-gradient-to-r from-evofit-purple-light to-evofit-purple-main text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-evofit-purple-main/40 transition-all hover:scale-105"
              >
                Continue to Analytics
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Heading ───────────────────────────────── */}
      <div className="w-full max-w-[760px] mb-6">
      </div>

      {/* ── Drop Zone ─────────────────────────────── */}
      <div
        className={`glass-card w-full max-w-[760px] p-8 md:p-14 text-center border-2 border-dashed transition-all duration-300 shadow-premium-card
          ${dragOver ? 'border-evofit-purple-main bg-evofit-purple-main/10 scale-[1.02]' : 'border-evofit-border hover:border-evofit-purple-main/50'}
          ${file ? 'cursor-default' : 'cursor-pointer'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current.click()}
      >
        <input ref={inputRef} type="file" accept=".csv,.pkl" className="hidden"
          onChange={(e) => handleFile(e.target.files[0])} />

        {/* Floating upload icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-evofit-purple-main/20 border border-evofit-purple-main/40 flex items-center justify-center animate-pulse-glow shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" className="text-evofit-purple-light">
              <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </div>
        </div>

        {file ? (
          <div className="animate-fade-in-up">
            {/* File type badge */}
            <div className="flex justify-center mb-3">
              <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border
                ${fileExt === 'pkl' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-blue-400/10 text-blue-400 border-blue-400/30'}`}>
                .{fileExt}
              </span>
            </div>
            <p className="text-lg font-bold text-evofit-text-primary m-0 mb-1">
              📄 {file.name}
            </p>
            <p className="text-[13px] text-evofit-text-muted m-0 mb-8 font-medium">
              {(file.size / 1024).toFixed(1)} KB — ready to analyse
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <RippleButton
                onClick={(e) => { e.stopPropagation(); runPrediction(); }}
                disabled={loading} 
                className={`premium-gradient text-white px-6 md:px-8 py-3.5 rounded-xl font-bold w-full sm:w-auto sm:min-w-[180px] hover:-translate-y-0.5 transition-all shadow-lg
                  ${loading ? 'opacity-70 grayscale pointer-events-none' : ''}`}>
                {loading ? '⏳ Analysing…' : '⚡ Run Prediction'}
              </RippleButton>
              <RippleButton
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="bg-evofit-bg-secondary border border-evofit-border text-evofit-text-primary px-6 md:px-8 py-3.5 rounded-xl font-bold w-full sm:w-auto hover:bg-evofit-purple-main/5 transition-all">
                Change File
              </RippleButton>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <p className="text-xl font-bold text-evofit-text-primary m-0 mb-2">
              Drop your sensor data here
            </p>
            <p className="text-sm text-evofit-text-secondary m-0 mb-8">
              Upload your session file to begin analysis
            </p>
            <RippleButton
              onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}
              className="bg-evofit-bg-secondary border border-evofit-border text-evofit-text-primary px-8 py-3.5 rounded-xl font-bold hover:bg-evofit-purple-main/5 transition-all">
              Browse Files
            </RippleButton>
          </div>
        )}
      </div>

      {/* ── Loading ───────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
          <div className="w-10 h-10 border-4 border-evofit-border border-t-evofit-purple-main rounded-full animate-spin" />
          <p className="text-evofit-text-secondary text-sm m-0 font-medium">
            Running feature engineering & classification…
          </p>
        </div>
      )}

      {/* ── Error ─────────────────────────────────── */}
      {error && (
        <div className="w-full max-w-[760px] mt-4 px-5 py-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fade-in-up">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-red-400 shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-red-400 text-sm m-0 font-semibold">{error}</p>
        </div>
      )}

      {/* ── How it works — staggered cards ────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 w-full max-w-[760px] mb-12">
        {STEPS.map(({ n, title, desc }, i) => (
          <div key={n} 
            className="glass-card p-6 flex flex-col gap-3 group transition-all duration-300 hover:-translate-y-1.5 hover:border-evofit-purple-main/50 hover:shadow-premium-card evofit-stagger-item"
            style={{ animationDelay: `${200 + i * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-evofit-purple-main text-white font-extrabold flex items-center justify-center text-sm shadow-lg group-hover:animate-bounce-subtle">
                {n}
              </div>
              <p className="font-extrabold text-sm m-0 text-evofit-text-primary tracking-tight uppercase">{title}</p>
            </div>
            <p className="text-[12px] text-evofit-text-secondary m-0 leading-relaxed font-medium">
              {desc}
            </p>
          </div>
        ))}
      </div>

      <footer className="w-full max-w-[760px] text-center py-6 border-t border-evofit-border mt-auto opacity-70">
        <p className="text-[12px] text-evofit-text-muted m-0 font-medium">
          © 2025 EvoFit Analytics · Precision Training Data
        </p>
      </footer>
    </div>
  );
}
