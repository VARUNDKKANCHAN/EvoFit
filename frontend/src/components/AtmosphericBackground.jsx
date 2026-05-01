import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useNeural } from '../context/NeuralController';

export default function AtmosphericBackground() {
  const { focusPoint } = useNeural();
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { damping: 40, stiffness: 100 };
  const mouseX = useSpring(cursorX, springConfig);
  const mouseY = useSpring(cursorY, springConfig);
  
  const meshX = useSpring(cursorX, { damping: 50, stiffness: 80 });
  const meshY = useSpring(cursorY, { damping: 50, stiffness: 80 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set((e.clientX / window.innerWidth - 0.5) * -120); // Move opposite to mouse for parallax
      cursorY.set((e.clientY / window.innerHeight - 0.5) * -120);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY]);

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
      <motion.div 
        style={{
          position: 'absolute',
          inset: -200,
          background: 'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)',
          filter: 'blur(80px)',
          opacity: 0.8,
          x: mouseX,
          y: mouseY
        }} 
      />

      {/* Neural Mesh (CSS Grid Overlay) */}
      <motion.div 
        style={{
          position: 'absolute',
          inset: -100,
          backgroundImage: 'linear-gradient(rgba(129, 140, 248, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(129, 140, 248, 0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          x: meshX,
          y: meshY
        }} 
      />

      {/* Focus Overlay - Dynamic Dimming */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: focusPoint ? 'rgba(2, 6, 23, 0.9)' : 'rgba(2, 6, 23, 0.2)',
        transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 5
      }} />
    </div>
  );
}
