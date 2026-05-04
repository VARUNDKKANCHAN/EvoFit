import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SuccessToast from '../components/SuccessToast';
import api from '../api/auth';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, CheckCircle2, FileText, AlertCircle, X,
  Zap, BarChart2, ArrowRight, Clock, CheckCheck, Loader2
} from 'lucide-react';

const EXERCISE_LABELS = {
  bench: 'Bench Press', dead: 'Deadlift', squat: 'Back Squat',
  ohp: 'Overhead Press', row: 'Barbell Row', pullups: 'Pull Ups', rest: 'Rest',
};

const ALLOWED_EXT = ['.csv', '.pkl'];

const STEPS = [
  {
    icon: <UploadCloud size={20} />,
    title: 'Upload Data',
    desc: 'Export a merged sensor CSV/PKL with 6 columns: acc_x, acc_y, acc_z, gyr_x, gyr_y, gyr_z.',
    key: 'upload',
  },
  {
    icon: <Zap size={20} />,
    title: 'Run Prediction',
    desc: 'Our Random Forest model identifies exercise type, rep counts, and movement patterns.',
    key: 'predict',
  },
  {
    icon: <BarChart2 size={20} />,
    title: 'Optimize Form',
    desc: 'Use confidence scores and probability breakdowns to pinpoint form breakdowns.',
    key: 'optimize',
  },
];



const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function UploadPredict() {
  const navigate = useNavigate();
  const inputRef = useRef();

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // Active step: 0=upload, 1=predict, 2=optimize
  const activeStep = uploaded ? (loading ? 1 : 2) : 0;

  const fetchRecent = useCallback(async () => {
    try {
      const res = await api.get('/sessions/?days=30');
      setRecentSessions(res.data.slice(0, 5));
    } catch (_) {
      /* silently fail */
    } finally {
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecent(); }, [fetchRecent]);

  const isAllowed = (f) => ALLOWED_EXT.some(ext => f.name.toLowerCase().endsWith(ext));

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!isAllowed(f)) {
      setError('Unsupported file type. Please upload a .csv or .pkl file.');
      return;
    }
    setFile(f);
    setError('');
    setUploaded(false);

    // Simulate upload progress
    let prog = 0;
    setUploadProgress(0);
    const iv = setInterval(() => {
      prog += Math.random() * 25;
      if (prog >= 100) { prog = 100; clearInterval(iv); setUploaded(true); }
      setUploadProgress(Math.min(100, Math.round(prog)));
    }, 120);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const runPrediction = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/predict/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = res.data;

      sessionStorage.setItem('lastPrediction', JSON.stringify({ result: data, filename: file.name }));

      if (data.new_achievements?.length > 0) {
        data.new_achievements.forEach(badge =>
          toast.success(<SuccessToast title="🏆 Achievement Unlocked!" subtitle={badge} />, { icon: false })
        );
      }

      if (data.leveled_up) {
        setLoading(false);
        setLevelUpData({ xp: data.new_xp_total, filename: file.name, result: data });
        setShowLevelUp(true);
        fetchRecent(); // refresh list after new upload
      } else {
        fetchRecent();
        setTimeout(() => navigate('/analytics', { state: { result: data, filename: file.name } }), 400);
      }
    } catch (err) {
      setError(err.message || 'Could not reach the API. Is the backend running on port 8000?');
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setError('');
    setUploaded(false);
    setUploadProgress(0);
    setLoading(false);
  };

  return (
    <div className="flex-1 bg-evofit-bg-primary min-h-screen py-6 px-5 md:px-8 overflow-y-auto">

      {/* ── Level Up Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showLevelUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={400} colors={['#7C3AED', '#8B5CF6', '#22C55E', '#F59E0B']} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLevelUp(false)} />
            <motion.div initial={{ scale: 0.85, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="relative z-10 bg-evofit-bg-card rounded-2xl border border-evofit-border p-8 text-center max-w-sm w-full shadow-xl">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border-4 border-amber-500/20 flex items-center justify-center mb-5">
                <Zap size={36} className="text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-evofit-text-primary mb-1">Level Up!</h2>
              <p className="text-sm text-evofit-text-muted mb-6">You've reached a new rank. Your power grows!</p>
              <button onClick={() => { setShowLevelUp(false); navigate('/analytics', { state: { result: levelUpData.result, filename: levelUpData.filename } }); }}
                className="w-full premium-gradient text-white py-3 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-shadow">
                Continue to Analytics
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div className="max-w-[820px] mx-auto space-y-6" initial="hidden" animate="show" variants={stagger}>

        {/* ── Page Title ──────────────────────────────── */}
        <motion.div variants={fade}>
          <h1 className="text-2xl font-bold text-evofit-text-primary m-0 mb-1">AI Dataset Upload</h1>
          <p className="text-sm text-evofit-text-muted m-0">Upload your sensor data to begin AI-powered form analysis</p>
        </motion.div>

        {/* ── Process Steps ───────────────────────────── */}
        <motion.div variants={fade} className="saas-card p-5">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const isActive = activeStep === i;
              const isDone = activeStep > i;
              return (
                <React.Fragment key={s.key}>
                  <div className={`flex items-center gap-3 flex-1 min-w-0 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-evofit-purple-main/5' : ''}`}>
                    <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                      style={isDone
                        ? { background: '#22C55E14', color: '#22C55E' }
                        : isActive
                          ? { background: '#7C3AED14', color: '#7C3AED' }
                          : { background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      {isDone ? <CheckCheck size={18} /> : s.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold m-0 truncate"
                        style={{ color: isDone ? '#16A34A' : isActive ? '#7C3AED' : '#94A3B8' }}>
                        {s.title}
                      </p>
                      <p className="text-[11px] text-evofit-text-muted m-0 mt-0.5 truncate hidden sm:block">{s.desc}</p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <ArrowRight size={14} className="shrink-0 mx-1" style={{ color: activeStep > i ? '#22C55E' : '#CBD5E1' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>

        {/* ── Upload Card ──────────────────────────────── */}
        <motion.div variants={fade} className="saas-card p-8 text-center relative overflow-hidden">

          {/* Subtle top tint */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: '#7C3AED' }} />

          <input ref={inputRef} type="file" accept=".csv,.pkl" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />

          {!file ? (
            /* ── Empty state ── */
            <div
              className={`border-2 border-dashed rounded-xl py-14 px-6 transition-all duration-200 cursor-pointer select-none
                ${dragOver ? 'border-evofit-purple-main bg-evofit-purple-main/10 scale-[1.01]' : 'border-evofit-border hover:border-evofit-purple-main/50 hover:bg-evofit-purple-main/5'}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current.click()}
            >
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: '#7C3AED14', color: '#7C3AED' }}>
                  <UploadCloud size={32} />
                </div>
              </div>
              <p className="text-lg font-semibold text-evofit-text-primary m-0 mb-2">Upload your workout data</p>
              <p className="text-sm text-evofit-text-muted m-0 mb-6">Drop your sensor file or click to browse</p>
              <button
                className="premium-gradient text-white px-8 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
                onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}>
                Browse Files
              </button>
              <p className="text-[11px] text-evofit-text-muted m-0 mt-4">Supported formats: .csv · .pkl</p>
            </div>
          ) : (
            /* ── File selected state ── */
            <AnimatePresence mode="wait">
              <motion.div key="file-selected" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* File info row */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-evofit-border bg-evofit-bg-primary mb-5 text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#7C3AED14', color: '#7C3AED' }}>
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-evofit-text-primary m-0 truncate">{file.name}</p>
                    <p className="text-[11px] text-evofit-text-muted m-0">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  {uploaded
                    ? <CheckCircle2 size={20} className="shrink-0 text-[#22C55E]" />
                    : <span className="text-xs font-semibold text-evofit-purple-main shrink-0">{uploadProgress}%</span>}
                  {!loading && (
                    <button onClick={reset} className="p-1 rounded-lg hover:bg-evofit-bg-primary transition-colors shrink-0 text-evofit-text-muted hover:text-evofit-text-primary">
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                {!uploaded && (
                  <div className="progress-bar mb-5">
                    <motion.div className="progress-fill" style={{ background: '#7C3AED' }}
                      initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ ease: 'easeOut' }} />
                  </div>
                )}

                {/* Success banner */}
                {uploaded && !loading && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5" style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <CheckCircle2 size={16} style={{ color: '#22C55E' }} />
                    <p className="text-sm font-semibold m-0 text-[#22C55E]">File uploaded successfully — ready to analyse</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 justify-center flex-wrap">
                  <button
                    onClick={runPrediction}
                    disabled={loading || !uploaded}
                    className="premium-gradient text-white px-8 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Analysing…</>
                      : <><Zap size={15} /> Run Prediction</>}
                  </button>
                  {!loading && (
                    <button onClick={reset}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium border border-evofit-border text-evofit-text-secondary hover:border-evofit-purple-main hover:text-evofit-purple-main transition-all">
                      Change File
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        {/* ── Error ───────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-3 px-5 py-4 rounded-xl border" style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <AlertCircle size={17} style={{ color: '#EF4444' }} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium m-0" style={{ color: '#EF4444' }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── How It Works ─────────────────────────────── */}
        <motion.div variants={fade}>
          <h2 className="text-base font-semibold text-evofit-text-primary mb-4">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <div key={s.key} className="saas-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="icon-circle" style={{ background: '#7C3AED14', color: '#7C3AED' }}>{s.icon}</div>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: '#7C3AED' }}>{i + 1}</div>
                  <p className="text-sm font-semibold text-evofit-text-primary m-0">{s.title}</p>
                </div>
                <p className="text-xs text-evofit-text-muted m-0 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Recent Uploads ─────────────────────────────── */}
        <motion.div variants={fade} className="saas-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-evofit-text-primary m-0">Recent Uploads</h2>
            <span className="text-[11px] text-evofit-text-muted font-medium">Last 30 days</span>
          </div>

          {recentLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-evofit-text-muted">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading sessions…</span>
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: '#7C3AED0A', color: '#C4B5FD' }}>
                <FileText size={18} />
              </div>
              <p className="text-sm text-evofit-text-muted m-0">No sessions yet — upload your first file above</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentSessions.map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-evofit-bg-primary transition-colors cursor-default">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: '#7C3AED0A', color: '#7C3AED' }}>
                    <FileText size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-evofit-text-primary m-0 truncate">
                      {EXERCISE_LABELS[s.exercise] || s.exercise}
                    </p>
                    <p className="text-[11px] text-evofit-text-muted m-0 flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      &nbsp;·&nbsp;{s.reps} reps
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold" style={{ color: s.form_score >= 80 ? '#22C55E' : '#F59E0B' }}>
                      {s.form_score}%
                    </span>
                    <span className="status-pill" style={{ background: '#22C55E14', color: '#16A34A' }}>Processed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Footer ──────────────────────────────────── */}
        <footer className="text-center py-6 border-t border-evofit-border">
          <p className="text-[11px] text-evofit-text-muted m-0">© 2026 EvoFit Analytics · Precision Training Data</p>
        </footer>

      </motion.div>
    </div>
  );
}
