import React from 'react';
import { useNavigate } from 'react-router-dom';

const EXERCISE_ICONS = {
  bench: '🏋️',
  dead:  '💀',
  ohp:   '🔝',
  row:   '🚣',
  squat: '🦵',
  rest:  '😴',
};

const EXERCISE_LABELS = {
  bench: 'Bench Press',
  dead:  'Deadlift',
  ohp:   'Overhead Press',
  row:   'Barbell Row',
  squat: 'Squat',
  rest:  'Rest / Recovery',
};

export default function PredictionResult({ result, filename }) {
  const navigate = useNavigate();

  if (!result) return null;

  const label       = result.predicted_label || 'unknown';
  const confidence  = Math.round((result.confidence || 0) * 100);
  const reps        = result.rep_count || 0;
  const rows        = result.rows_analysed || 0;
  const probs       = result.probabilities || {};
  const displayName = EXERCISE_LABELS[label] || label;
  const icon        = EXERCISE_ICONS[label] || '🏋️';

  // Sort probabilities
  const sortedProbs = Object.entries(probs).sort((a, b) => b[1] - a[1]);

  return (
    <div className="result-card" style={{ padding: '28px', marginTop: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '36px' }}>{icon}</span>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>EXERCISE DETECTED</p>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-primary)' }}>
              {displayName}
            </h2>
          </div>
        </div>
        <span className="tag-pill">✓ Prediction Complete</span>
      </div>

      {/* Key Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Rep Count', value: reps, unit: 'reps', color: '#A78BFA' },
          { label: 'Confidence', value: `${confidence}%`, unit: '', color: '#34D399' },
          { label: 'Samples', value: rows, unit: 'rows', color: '#60A5FA' },
        ].map(({ label: l, value, unit, color }) => (
          <div
            key={l}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{l}</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color, margin: 0 }}>{value}</p>
            {unit && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{unit}</p>}
          </div>
        ))}
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Model Confidence</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#34D399' }}>{confidence}%</span>
        </div>
        <div className="confidence-bar">
          <div className="confidence-fill" style={{ width: `${confidence}%` }} />
        </div>
      </div>

      {/* Probability breakdown */}
      {sortedProbs.length > 0 && (
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Class Probabilities
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedProbs.map(([cls, prob]) => {
              const pct = Math.round(prob * 100);
              const isTop = cls === label;
              return (
                <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '90px', fontSize: '13px', color: isTop ? 'var(--purple-light)' : 'var(--text-secondary)', fontWeight: isTop ? 600 : 400 }}>
                    {EXERCISE_LABELS[cls] || cls}
                  </span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: isTop ? 'linear-gradient(90deg,#6D28D9,#A78BFA)' : '#3A3A55' }} />
                  </div>
                  <span style={{ width: '36px', textAlign: 'right', fontSize: '12px', color: isTop ? 'var(--purple-light)' : 'var(--text-muted)', fontWeight: isTop ? 600 : 400 }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Analysed from: <span style={{ color: 'var(--text-secondary)' }}>{filename}</span>
          </p>
        </div>
        <button 
          onClick={() => navigate('/history')}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          View in History →
        </button>
      </div>
    </div>
  );
}
