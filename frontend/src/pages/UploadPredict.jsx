import React, { useState, useRef, useCallback, useEffect } from 'react';
import PredictionResult from '../components/PredictionResult';

const STEPS = [
  { n: 1, title: 'Export Data',      desc: 'Export your workout from your wearable (MetaMotion, Garmin, Apple Health) as a raw CSV file.' },
  { n: 2, title: 'Run Prediction',   desc: 'Our Random Forest model identifies the exercise type, rep counts, and movement patterns.' },
  { n: 3, title: 'Optimize Form',    desc: 'Use confidence scores and probability breakdowns to spot where your form might be breaking down.' },
];

/* ── Ripple button wrapper ─────────────────────────────────── */
function RippleButton({ className, style, onClick, disabled, children, id }) {
  const btnRef = useRef();

  const handleClick = (e) => {
    if (disabled) return;
    const btn  = btnRef.current;
    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    const d = Math.max(btn.clientWidth, btn.clientHeight);
    circle.style.cssText = `
      position:absolute;width:${d}px;height:${d}px;
      left:${e.clientX - rect.left - d / 2}px;
      top:${e.clientY - rect.top  - d / 2}px;
      border-radius:50%;
      background:rgba(255,255,255,0.25);
      transform:scale(0);
      animation:ripple 0.55s linear;
      pointer-events:none;
    `;
    btn.appendChild(circle);
    circle.addEventListener('animationend', () => circle.remove());
    onClick && onClick(e);
  };

  return (
    <button
      id={id}
      ref={btnRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/* ── Animated background orbs ─────────────────────────────── */
function BackgroundOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* Large orb — top right */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-80px',
        width: '420px', height: '420px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)',
        animation: 'float 7s ease-in-out infinite',
      }} />
      {/* Medium orb — bottom left */}
      <div style={{
        position: 'absolute', bottom: '-60px', left: '160px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)',
        animation: 'float 9s ease-in-out infinite',
        animationDelay: '-3s',
      }} />
      {/* Small orb — center */}
      <div style={{
        position: 'absolute', top: '40%', right: '25%',
        width: '180px', height: '180px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)',
        animation: 'float 6s ease-in-out infinite',
        animationDelay: '-1.5s',
      }} />
    </div>
  );
}

export default function UploadPredict() {
  const [file, setFile]         = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');
  const [mounted, setMounted]   = useState(false);
  const inputRef                = useRef();

  useEffect(() => { setMounted(true); }, []);

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Only .csv files are supported. Please export your sensor data as CSV.');
      return;
    }
    setFile(f);
    setResult(null);
    setError('');
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
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('http://localhost:8000/predict/', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Prediction failed');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Could not reach the API server. Is the backend running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(''); };

  return (
    <>
      <BackgroundOrbs />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 24px 32px',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* ── Heading — fade-in-up ──────────────────── */}
        <div style={{
          width: '100%', maxWidth: '720px', marginBottom: '28px',
          animation: mounted ? 'fade-in-up 0.5s ease both' : 'none',
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Upload &amp; Predict
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            Transform raw sensor data into performance insights with AI-driven analysis.
          </p>
        </div>

        {/* ── Drop Zone — animated gradient border ── */}
        <div
          className={`upload-zone${dragOver ? ' drag-over' : ''}`}
          style={{
            width: '100%', maxWidth: '720px',
            padding: '60px 32px', textAlign: 'center',
            cursor: file ? 'default' : 'pointer',
            animation: mounted ? 'scale-in 0.45s ease both' : 'none',
            animationDelay: '0.1s',
            /* animated gradient border when drag-over */
            transition: 'all 0.3s ease, box-shadow 0.3s ease',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !file && inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {/* Pulsing + floating icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '22px' }}>
            <div
              className="upload-icon-ring"
              style={{ animation: 'pulse-glow 2.5s ease-in-out infinite, float 4s ease-in-out infinite' }}
            >
              <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="#A78BFA" strokeWidth="1.8">
                <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </div>
          </div>

          {file ? (
            <div style={{ animation: 'fade-in-up 0.35s ease both' }}>
              <p style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                📄 {file.name}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 24px' }}>
                {(file.size / 1024).toFixed(1)} KB — ready to analyse
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <RippleButton
                  id="btn-run-prediction"
                  className="btn-primary"
                  onClick={(e) => { e.stopPropagation(); runPrediction(); }}
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? '⏳ Analysing…' : '⚡ Run Prediction'}
                </RippleButton>
                <RippleButton
                  id="btn-change-file"
                  className="btn-secondary"
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                >
                  Change File
                </RippleButton>
              </div>
            </div>
          ) : (
            <div style={{ animation: 'fade-in 0.4s ease both' }}>
              <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>
                Drop your sensor data here
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 24px', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                Connect your wearable or upload a CSV file exported from your MetaMotion device.
              </p>
              <RippleButton
                id="btn-browse-files"
                className="btn-secondary"
                onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}
              >
                Browse Files
              </RippleButton>
            </div>
          )}
        </div>

        {/* ── Loading spinner ──────────────────────── */}
        {loading && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '14px', padding: '32px 0',
            animation: 'fade-in 0.3s ease both',
          }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Running feature engineering &amp; classification…
            </p>
          </div>
        )}

        {/* ── Error banner ─────────────────────────── */}
        {error && (
          <div style={{
            width: '100%', maxWidth: '720px', marginTop: '16px',
            padding: '14px 18px',
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            animation: 'fade-in-up 0.3s ease both',
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F87171" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={{ color: '#F87171', fontSize: '14px', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Prediction result ────────────────────── */}
        {result && (
          <div style={{ width: '100%', maxWidth: '720px', animation: 'slide-up 0.4s ease both' }}>
            <PredictionResult result={result} filename={file?.name} />
          </div>
        )}

        {/* ── How it works — staggered cards ─────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginTop: '32px',
          width: '100%',
          maxWidth: '720px',
        }}>
          {STEPS.map(({ n, title, desc }, i) => (
            <div
              key={n}
              className="card"
              style={{
                padding: '20px',
                animation: mounted ? 'stagger-in 0.5s ease both' : 'none',
                animationDelay: `${0.2 + i * 0.1}s`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(124,58,237,0.2)';
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div className="step-badge">{n}</div>
                <p style={{ fontWeight: 700, fontSize: '14px', margin: 0, color: 'var(--text-primary)' }}>{title}</p>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────── */}
      <footer style={{
        textAlign: 'center', padding: '14px',
        borderTop: '1px solid var(--border)',
        position: 'relative', zIndex: 1,
        animation: mounted ? 'fade-in 0.6s ease both' : 'none',
        animationDelay: '0.5s',
      }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          © 2025 EvoFit Analytics: Precision Training Data.
        </p>
      </footer>
    </>
  );
}
