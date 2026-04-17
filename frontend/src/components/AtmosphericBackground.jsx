import React from 'react';
import { useNeural } from '../context/NeuralController';

export default function AtmosphericBackground() {
  const { focusPoint } = useNeural();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      pointerEvents: 'none',
      background: '#020617',
      overflow: 'hidden'
    }}>
      {/* Cinematic Gradient Atmosphere */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.4) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.3) 0%, transparent 60%)',
        filter: 'blur(80px)',
        opacity: 0.8,
        animation: 'pulse 12s ease-in-out infinite alternate'
      }} />

      {/* Neural Mesh (CSS Grid Overlay) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(129, 140, 248, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(129, 140, 248, 0.08) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        opacity: 0.2,
        maskImage: 'radial-gradient(circle at center, black, transparent 85%)'
      }} />

      {/* Focus Overlay - Dynamic Dimming */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: focusPoint ? 'rgba(2, 6, 23, 0.9)' : 'rgba(2, 6, 23, 0.2)',
        transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 5
      }} />

      <style>{`
        @keyframes pulse {
          from { transform: scale(1); opacity: 0.6; }
          to { transform: scale(1.1); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
