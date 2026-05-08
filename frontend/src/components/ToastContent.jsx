import React from 'react';

/**
 * ToastContent — unified branded toast for all notification types.
 * Replaces the old SuccessToast + bare toast.error/info calls.
 *
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {string} title
 * @param {string} subtitle
 * @param {function} closeToast  — injected by react-toastify
 */

const TYPE_CONFIG = {
  success: {
    color: '#22C55E',
    glowColor: 'rgba(34,197,94,0.30)',
    icon: (
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
        <path d="M1.5 5L5.5 9L12.5 1.5" stroke="white" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  error: {
    color: '#EF4444',
    glowColor: 'rgba(239,68,68,0.28)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white"
        strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  warning: {
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.28)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white"
        strokeWidth="2.5" strokeLinecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  info: {
    color: '#7C3AED',
    glowColor: 'rgba(124,58,237,0.28)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white"
        strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="8" />
        <polyline points="12 12 12 16" />
      </svg>
    ),
  },
};

const ToastContent = ({ type = 'info', title, subtitle, closeToast }) => {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

  return (
    <div
      className="animate-toast-slide-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--bg-card)',
        padding: '14px 16px',
        borderRadius: '14px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow), 0 0 0 1px rgba(255,255,255,0.03) inset',
        minWidth: '300px',
        maxWidth: '380px',
        pointerEvents: 'auto',
      }}
    >
      {/* Coloured icon circle */}
      <div
        style={{
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: cfg.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 14px ${cfg.glowColor}`,
        }}
      >
        {cfg.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: '13.5px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.25,
        }}>
          {title}
        </p>
        {subtitle && (
          <p style={{
            margin: '3px 0 0',
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.45,
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={closeToast}
        style={{
          flexShrink: 0,
          padding: '8px',
          marginRight: '-4px',
          borderRadius: '10px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'var(--bg-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = 0.8; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        aria-label="Dismiss notification"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default ToastContent;
