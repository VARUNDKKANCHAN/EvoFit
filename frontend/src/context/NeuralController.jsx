import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';

const NeuralContext = createContext(null);

export const useNeural = () => {
  const context = useContext(NeuralContext);
  if (!context) throw new Error('useNeural must be used within a NeuralProvider');
  return context;
};

export const NeuralProvider = ({ children }) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hoverIntensity, setHoverIntensity] = useState(0);
  const [focusPoint, setFocusPoint] = useState(null);
  const [tier, setTier] = useState('medium');
  const [pulses, setPulses] = useState([]);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (cores <= 2 || isMobile) setTier('low');
    else if (cores >= 8) setTier('high');
    else setTier('medium');
  }, []);

  const triggerPulse = (point = null) => {
    const id = Date.now();
    const origin = point || { x: (Math.random() * 2 - 1), y: (Math.random() * 2 - 1) };
    setPulses(prev => [...prev, { id, origin, startTime: Date.now() }]);
    setTimeout(() => {
      setPulses(prev => prev.filter(p => p.id !== id));
    }, 3000);
  };

  const value = {
    mouse,
    hoverIntensity,
    setHoverIntensity,
    focusPoint,
    setFocusPoint,
    tier,
    setTier,
    pulses,
    triggerPulse
  };

  return (
    <NeuralContext.Provider value={value}>
      {children}
    </NeuralContext.Provider>
  );
};
