import React, { useState, useRef, useCallback } from 'react';
import PredictionResult from '../components/PredictionResult';

const STEPS = [
  {
    n: 1,
    title: 'Export Data',
    desc: 'Export your workout from your wearable device (MetaMotion, Garmin, Apple Health) as a raw CSV file.',
  },
  {
    n: 2,
    title: 'Run Prediction',
    desc: 'Our Random Forest model identifies the exercise type, rep counts, and analyses your movement patterns.',
  },
  {
    n: 3,
    title: 'Optimize Form',
    desc: 'Use confidence scores and probability breakdowns to identify where your form might be breaking down.',
  },
];

export default function UploadPredict() {
  const [file, setFile]           = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const inputRef                  = useRef();

  /* ── File helpers ───────── */
  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
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
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }, [handleFile]);

  /* ── Predict ────────────── */
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
      setError(err.message || 'Could not reach the API server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'auto' }}>
      {/* ── Page Header ────────────────────────────── */}
      <header className="header">
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Upload &amp; Predict</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Session: Thu, Apr 3
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: '16px' }}>
          {/* Bell */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--text-secondary)" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: '1px solid var(--bg-secondary)' }} />
          </div>
          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Alex Johnson</p>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--purple-light)' }}>Pro Member</p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6D28D9,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
              AJ
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '32px 36px', maxWidth: '860px', width: '100%' }}>
        {/* Heading */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Upload &amp; Predict
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            Transform raw sensor data into performance insights with AI-driven analysis.
          </p>
        </div>

        {/* ── Drop Zone ─────────────────────────── */}
        <div
          className={`upload-zone${dragOver ? ' drag-over' : ''}`}
          style={{ padding: '52px 32px', textAlign: 'center' }}
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

          {/* Icon ring */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div className="upload-icon-ring">
              <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="#A78BFA" strokeWidth="1.8">
                <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </div>
          </div>

          {file ? (
            <>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                📄 {file.name}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 20px' }}>
                {(file.size / 1024).toFixed(1)} KB — ready to analyse
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={(e) => { e.stopPropagation(); runPrediction(); }} disabled={loading}>
                  {loading ? 'Analysing…' : '⚡ Run Prediction'}
                </button>
                <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); setError(''); }}>
                  Change File
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Drop your sensor data here
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 22px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                Connect your wearable or upload CSV files exported from your MetaMotion device.
              </p>
              <button
                className="btn-secondary"
                onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}
              >
                Browse Files
              </button>
            </>
          )}
        </div>

        {/* ── Loading ────────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '32px', marginTop: '20px' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Running feature engineering and classification…
            </p>
          </div>
        )}

        {/* ── Error ─────────────────────────────── */}
        {error && (
          <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F87171" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={{ color: '#F87171', fontSize: '14px', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Result ────────────────────────────── */}
        {result && <PredictionResult result={result} filename={file?.name} />}

        {/* ── Steps ─────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' }}>
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="card" style={{ padding: '20px' }}>
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
      <footer style={{ textAlign: 'center', padding: '16px', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          © 2025 EvoFit Analytics: Precision Training Data.
        </p>
      </footer>
    </main>
  );
}
