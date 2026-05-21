import React from 'react';
import { motion } from 'framer-motion';

// Tier configs with names, colors, gradients, and highly detailed 3D game vector templates
export const LEVEL_TIERS = [
  {
    name: 'Initiate',
    minLvl: 1,
    color: '#94A3B8',
    gradient: 'from-slate-500 to-slate-700',
    bg: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900',
    glow: 'rgba(148,163,184,0.3)',
    renderVector: (level) => (
      <svg className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" stroke="#94A3B8" strokeWidth="5.5" />
        <circle cx="50" cy="50" r="32" stroke="#475569" strokeWidth="3" strokeDasharray="6 4" />
        {/* Steel Plate Bevel lines */}
        <path d="M15 50H85M50 15V85" stroke="#475569" strokeWidth="1" opacity="0.4" />
        {/* Decorative rivets around the border */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <circle
            key={deg}
            cx={50 + 38 * Math.cos((deg * Math.PI) / 180)}
            cy={50 + 38 * Math.sin((deg * Math.PI) / 180)}
            r="2"
            fill="#FFF"
            opacity="0.75"
          />
        ))}
      </svg>
    )
  },
  {
    name: 'Vanguard',
    minLvl: 5,
    color: '#34D399',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950',
    glow: 'rgba(52,211,153,0.45)',
    renderVector: (level) => (
      <svg className="w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="vanguard-wing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="50%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#065F46" />
          </linearGradient>
        </defs>
        {/* Vanguard Chevron wings flanking */}
        <path d="M10 20L42 12L50 48L10 20Z" fill="url(#vanguard-wing)" opacity="0.8" />
        <path d="M90 20L58 12L50 48L90 20Z" fill="url(#vanguard-wing)" opacity="0.8" />
        
        {/* Fortified Chevron Shield */}
        <path d="M18 24L50 10L82 24V56C82 72 68 86 50 92C32 86 18 72 18 56V24Z" stroke="url(#vanguard-wing)" strokeWidth="4.5" strokeLinejoin="round" />
        
        {/* Double layered rising chevrons inside */}
        <path d="M30 60L50 40L70 60" stroke="#34D399" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36 72L50 58L64 72" stroke="#A7F3D0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
      </svg>
    )
  },
  {
    name: 'Warrior',
    minLvl: 10,
    color: '#F472B6',
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-gradient-to-br from-pink-900 via-rose-950 to-slate-950',
    glow: 'rgba(244,114,182,0.5)',
    renderVector: (level) => (
      <svg className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="war-rose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBCFE8" />
            <stop offset="55%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#9D174D" />
          </linearGradient>
          <linearGradient id="claymore-silver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
        </defs>
        {/* Crossed 3D swords hilt and blades in background */}
        <path d="M22 78L78 22M78 78L22 22" stroke="url(#claymore-silver)" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M18 72H28M72 72H82" stroke="#FBBF24" strokeWidth="4.5" /> {/* Gold pommel guards */}
        
        {/* Core Knightly Crest Shield */}
        <path d="M14 20C40 20 48 10 50 4C52 10 60 20 86 20C86 50 76 76 50 94C24 76 14 50 14 20Z" fill="none" stroke="url(#war-rose)" strokeWidth="5" strokeLinejoin="round" />
        
        {/* Center glowing ruby core */}
        <circle cx="50" cy="50" r="10" fill="url(#war-rose)" stroke="#FFF" strokeWidth="1" />
        <circle cx="47" cy="47" r="3" fill="#FFF" opacity="0.7" />
      </svg>
    )
  },
  {
    name: 'Titan',
    minLvl: 15,
    color: '#A78BFA',
    gradient: 'from-purple-500 to-indigo-600',
    bg: 'bg-gradient-to-br from-purple-900 via-indigo-950 to-[#0c051a]',
    glow: 'rgba(167,139,250,0.55)',
    renderVector: (level) => (
      <svg className="w-full h-full filter drop-shadow-[0_5px_8px_rgba(0,0,0,0.6)]" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="titan-heavy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E9D5FF" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
        </defs>
        {/* Winged iron fortifications flanking */}
        <path d="M8 32H20V68H8L8 32Z" fill="url(#titan-heavy)" opacity="0.6" />
        <path d="M92 32H80V68H92L92 32Z" fill="url(#titan-heavy)" opacity="0.6" />
        
        {/* Heavily Fortified Wall Crest Shield */}
        <path d="M12 24C12 24 50 14 50 4C50 14 88 24 88 24V58C88 76 68 88 50 94C32 88 12 76 12 58V24Z" stroke="url(#titan-heavy)" strokeWidth="5.5" strokeLinejoin="round" />
        
        {/* Fortress Tower segments inside */}
        <path d="M30 74V50H38V40H62V50H70V74H30Z" fill="none" stroke="url(#titan-heavy)" strokeWidth="4.5" strokeLinejoin="round" />
        <line x1="42" y1="32" x2="58" y2="32" stroke="url(#titan-heavy)" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    name: 'Elite',
    minLvl: 25,
    color: '#FBBF24',
    gradient: 'from-amber-400 to-yellow-600',
    bg: 'bg-gradient-to-br from-amber-900 via-yellow-950 to-[#120700]',
    glow: 'rgba(251,191,36,0.65)',
    renderVector: (level) => (
      <svg className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.65)]" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="elite-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFBE3" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="90%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
        </defs>
        {/* Angelic/Draconic detailed wings on the crest sides */}
        <path d="M22 34C6 34 16 80 50 94C84 80 94 34 78 34C75 44 65 52 50 52C35 52 25 44 22 34Z" fill="none" stroke="url(#elite-gold)" strokeWidth="4" strokeLinejoin="round" />
        
        {/* Triple Crown Spire inside */}
        <path d="M28 44L34 22L50 36L66 22L72 44H28Z" fill="url(#elite-gold)" stroke="#FFF" strokeWidth="0.8" />
        <circle cx="50" cy="36" r="3.5" fill="#FFF" />
      </svg>
    )
  },
  {
    name: 'Master',
    minLvl: 40,
    color: '#60A5FA',
    gradient: 'from-blue-400 to-cyan-500',
    bg: 'bg-gradient-to-br from-[#0c244c] via-[#05132d] to-[#010512]',
    glow: 'rgba(96,165,250,0.7)',
    renderVector: (level) => (
      <svg className="w-full h-full filter drop-shadow-[0_0_12px_rgba(96,165,250,0.5)]" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="master-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
        </defs>
        
        {/* Sacred Geometry Crystal Octagon Outer Border */}
        <path d="M30 8H70L92 36V68L70 92H30L8 68V36L30 8Z" fill="none" stroke="url(#master-cyan)" strokeWidth="5.5" strokeLinejoin="round" />
        
        {/* Nested faceted diamond-shard core */}
        <path d="M50 20L72 50L50 80L28 50L50 20Z" fill="none" stroke="url(#master-cyan)" strokeWidth="3.5" strokeLinejoin="round" />
        <line x1="50" y1="20" x2="50" y2="80" stroke="url(#master-cyan)" strokeWidth="2.5" />
        <line x1="28" y1="50" x2="72" y2="50" stroke="url(#master-cyan)" strokeWidth="2.5" />
      </svg>
    )
  },
  {
    name: 'Grandmaster',
    minLvl: 60,
    color: '#F87171',
    gradient: 'from-red-500 to-orange-600',
    bg: 'bg-gradient-to-br from-red-900 via-orange-950 to-[#120100]',
    glow: 'rgba(248,113,113,0.75)',
    renderVector: (level) => (
      <svg className="w-full h-full filter drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gm-blaze" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#FECACA" />
          </linearGradient>
        </defs>
        {/* Dragon wings wrapping around bottom */}
        <path d="M10 24C14 10 50 16 50 16C50 16 86 10 90 24C94 56 76 86 50 96C24 86 6 56 10 24Z" fill="none" stroke="url(#gm-blaze)" strokeWidth="5.5" strokeLinejoin="round" />
        
        {/* Flame fire core rising from base */}
        <path d="M50 82C58 82 66 72 64 56C64 42 50 24 50 24C50 24 46 36 46 48C46 60 38 66 36 72C34 78 42 82 50 82Z" fill="url(#gm-blaze)" stroke="#FFF" strokeWidth="0.8" />
      </svg>
    )
  },
  {
    name: 'Evo Legend',
    minLvl: 100,
    color: '#C084FC',
    gradient: 'from-fuchsia-500 via-purple-500 to-violet-600',
    bg: 'bg-gradient-to-br from-fuchsia-950 via-purple-950 to-[#080012]',
    glow: 'rgba(192,132,252,0.85)',
    renderVector: (level) => (
      <svg className="w-full h-full filter drop-shadow-[0_0_18px_rgba(167,139,250,0.6)]" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="leg-cosmic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D0FE" />
            <stop offset="50%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>
        </defs>
        {/* Cosmic star bursts geometry */}
        <circle cx="50" cy="50" r="44" stroke="url(#leg-cosmic)" strokeWidth="5" />
        <path d="M50 4L96 50L50 96L4 50L50 4Z" fill="none" stroke="url(#leg-cosmic)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M22 22H78V78H22V22Z" fill="none" stroke="url(#leg-cosmic)" strokeWidth="2.5" strokeLinejoin="round" opacity="0.5" />
        
        {/* Centered glowing master navigation star */}
        <path d="M50 26L54 40L68 40L57 48L61 62L50 53L39 62L43 48L32 40L46 40L50 26Z" fill="url(#leg-cosmic)" stroke="#FFF" strokeWidth="1.5" />
      </svg>
    )
  }
];

export const getLevelTier = (level) => {
  const sortedTiers = [...LEVEL_TIERS].sort((a, b) => b.minLvl - a.minLvl);
  const matched = sortedTiers.find(t => level >= t.minLvl);
  return matched || LEVEL_TIERS[0];
};

export default function LevelCrest({ 
  level = 1, 
  size = 72, 
  showGlow = true,
  animate = true
}) {
  const tier = getLevelTier(level);

  // Floating gaming token animations for Lvl 15+
  const floatTransition = animate && level >= 15 ? {
    animate: {
      y: [-3, 3, -3],
      rotate: [-0.5, 0.5, -0.5],
      boxShadow: [
        `0 0 20px ${tier.glow}, inset 0 2px 4px rgba(255,255,255,0.25)`,
        `0 0 35px ${tier.glow}, inset 0 2px 8px rgba(255,255,255,0.35)`,
        `0 0 20px ${tier.glow}, inset 0 2px 4px rgba(255,255,255,0.25)`
      ]
    },
    transition: {
      duration: 4.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  // Sparkles or flame particles for high tier progress
  const renderParticles = () => {
    if (!showGlow || level < 60) return null;
    return (
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {/* Ember 1 */}
        <motion.span
          animate={{ y: [0, -22], x: [-6, 6], opacity: [0, 1, 0], scale: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
          className="absolute top-0 left-1/4 text-[10px]"
          style={{ color: tier.color }}
        >
          ✦
        </motion.span>
        {/* Ember 2 */}
        <motion.span
          animate={{ y: [4, -18], x: [6, -6], opacity: [0, 1, 0], scale: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 1.0 }}
          className="absolute top-1 right-1/4 text-[8px]"
          style={{ color: tier.color }}
        >
          ✦
        </motion.span>
      </div>
    );
  };

  return (
    <div 
      className="relative flex items-center justify-center shrink-0" 
      style={{ width: size, height: size }}
    >
      {/* ── Outer dynamic glow rings (Evo Legend / Grandmaster) ── */}
      {showGlow && level >= 60 && (
        <>
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-50 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${tier.glow} 0%, transparent 70%)`,
              transform: 'scale(1.3)'
            }}
          />
          {level >= 100 && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-fuchsia-400/25 rounded-full pointer-events-none"
              style={{ transform: 'scale(1.15)' }}
            />
          )}
        </>
      )}

      {/* ── Main Bevelled Shield Card ── */}
      <motion.div
        {...(animate ? floatTransition : {})}
        className={`relative w-full h-full flex items-center justify-center rounded-[22%] border-2 border-white/20 shadow-lg overflow-hidden select-none transition-all duration-300 ${tier.bg}`}
      >
        {/* Carbon texture backing sheet */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%)] bg-[length:8px_8px]" />

        {/* ── 3D GLOSS DOME REFLECTION OVERLAYS ── */}
        <div className="absolute inset-0 z-20 pointer-events-none rounded-[inherit]">
          {/* Convex gloss sheet overlay */}
          <div 
            className="absolute -top-[35%] -left-[20%] w-[140%] h-[80%] rounded-full opacity-40" 
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)',
              transform: 'rotate(-15deg)'
            }}
          />
          {/* Steel border line rings */}
          <div className="absolute inset-0 border border-white/25 rounded-[inherit]" />
          <div className="absolute inset-0.5 border border-black/35 rounded-[inherit]" />
        </div>

        {/* Vector SVG Emblem in background */}
        <div className="absolute inset-2 opacity-85 flex items-center justify-center z-0">
          {tier.renderVector(level)}
        </div>

        {/* ── Level text centered inside shield ── */}
        <div className="relative flex flex-col items-center justify-center z-10 pointer-events-none select-none">
          <span 
            className="text-[9px] font-black uppercase tracking-widest leading-none opacity-60"
            style={{ color: tier.color }}
          >
            Lvl
          </span>
          <span 
            className="text-[17px] font-black leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-white tracking-tighter"
            style={{ fontSize: size < 52 ? '13px' : size > 80 ? '22px' : '17px' }}
          >
            {level}
          </span>
        </div>
      </motion.div>

      {/* Sparks if Lvl 60+ */}
      {renderParticles()}
    </div>
  );
}
