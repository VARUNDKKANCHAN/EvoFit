import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/upload',
    label: 'Upload & Predict',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: '/targets',
    label: 'Targets',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    to: '/chatbot',
    label: 'AI Chatbot',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const navigate    = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const w = collapsed ? '64px' : '240px';

  return (
    <aside style={{
      background:     'var(--bg-sidebar)',
      borderRight:    '1px solid var(--border)',
      width:          w,
      minHeight:      '100vh',
      display:        'flex',
      flexDirection:  'column',
      flexShrink:     0,
      transition:     'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      overflow:       'hidden',
    }}>

      {/* ── Logo ─────────────────────────────── */}
      <div style={{
        padding:        collapsed ? '24px 0' : '28px 20px 20px',
        borderBottom:   '1px solid var(--border)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap:            '10px',
        transition:     'padding 0.3s ease',
        animation:      'slide-in-left 0.4s ease both',
      }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.5))' }}>
          <rect width="28" height="28" rx="8" fill="url(#lg)" />
          <path d="M7 14h4l3-6 4 12 3-6h2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28">
              <stop stopColor="#6D28D9" /><stop offset="1" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
        </svg>
        {!collapsed && (
          <span style={{
            fontSize:     '20px',
            fontWeight:   800,
            letterSpacing:'-0.5px',
            background:   'linear-gradient(135deg, #fff 40%, var(--purple-light))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace:   'nowrap',
            animation:    'fade-in 0.25s ease both',
          }}>
            EvoFit
          </span>
        )}
      </div>

      {/* ── Navigation ───────────────────────── */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {!collapsed && (
          <p style={{
            fontSize:       '10px',
            fontWeight:     700,
            letterSpacing:  '0.1em',
            color:          'var(--text-muted)',
            padding:        '8px 20px 4px',
            textTransform:  'uppercase',
            whiteSpace:     'nowrap',
            animation:      'fade-in 0.3s ease both',
          }}>
            Main Menu
          </p>
        )}

        {NAV.map(({ to, label, icon }, idx) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            style={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding:        collapsed ? '11px 0'   : '11px 20px',
              margin:         collapsed ? '2px 6px'  : '2px 10px',
              animation:      `slide-in-left 0.35s ease both`,
              animationDelay: `${0.05 * idx}s`,
            }}
          >
            <span style={{ flexShrink: 0, transition: 'transform 0.2s ease' }}>{icon}</span>
            {!collapsed && (
              <span style={{ whiteSpace: 'nowrap', animation: 'fade-in 0.2s ease both' }}>{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom controls ───────────────────── */}
      <div style={{
        padding:     collapsed ? '12px 6px 20px' : '12px 10px 20px',
        borderTop:   '1px solid var(--border)',
        animation:   'fade-in-up 0.5s ease both',
        animationDelay: '0.3s',
      }}>
        {/* Collapse / Expand */}
        <button
          id="btn-collapse-sidebar"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed(c => !c)}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap:            '10px',
            width:          '100%',
            padding:        collapsed ? '10px 0' : '10px 10px',
            margin:         '2px 0',
            borderRadius:   '10px',
            background:     'none',
            border:         'none',
            cursor:         'pointer',
            color:          'var(--text-secondary)',
            fontSize:       '14px',
            fontWeight:     500,
            transition:     'background 0.2s, color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <svg
            width="16" height="16" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth="2"
            style={{
              transform:  collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
              flexShrink: 0,
            }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {!collapsed && <span style={{ animation: 'fade-in 0.2s ease both' }}>Collapse</span>}
        </button>

        {/* Logout */}
        <button
          id="btn-logout"
          title="Logout"
          onClick={() => navigate('/')}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap:            '10px',
            width:          '100%',
            padding:        collapsed ? '10px 0' : '10px 10px',
            margin:         '2px 0',
            borderRadius:   '10px',
            background:     'none',
            border:         'none',
            cursor:         'pointer',
            color:          '#F87171',
            fontSize:       '14px',
            fontWeight:     500,
            transition:     'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, transition: 'transform 0.2s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span style={{ animation: 'fade-in 0.2s ease both' }}>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
