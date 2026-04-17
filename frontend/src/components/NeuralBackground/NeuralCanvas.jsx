import React from 'react';
import { useNeural } from '../../context/NeuralController';

export default function NeuralCanvas() {
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
        background: 'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
        filter: 'blur(60px)',
        opacity: 0.6
      }} />

      {/* Animated Subtle Grid / Noise */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.1,
        maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
      }} />

      {/* Focus Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: focusPoint ? 'rgba(2, 6, 23, 0.8)' : 'transparent',
        transition: 'background 0.6s ease',
        zIndex: 2
      }} />
    </div>
  );
}
