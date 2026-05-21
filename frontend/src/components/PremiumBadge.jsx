import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

// Faceted/Multi-layered high-fidelity SVG designs for a luxurious 3D gaming feel
const GLYPHS = {
  star: (
    <svg className="w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]" viewBox="0 0 100 100" fill="none">
      <defs>
        {/* Facet gradients for 3D look */}
        <linearGradient id="star-f1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>
        <linearGradient id="star-f2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFA000" />
          <stop offset="100%" stopColor="#FF6F00" />
        </linearGradient>
        <linearGradient id="star-f3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
      </defs>
      {/* 3D Bevelled Faceted Star segments */}
      {/* Top Point Left */}
      <path d="M50 8L50 50L63.5 35.5Z" fill="url(#star-f1)" />
      {/* Top Point Right */}
      <path d="M50 8L36.5 35.5L50 50Z" fill="url(#star-f2)" />
      {/* Right Point Top */}
      <path d="M63.5 35.5L50 50L94 39.8Z" fill="url(#star-f3)" />
      {/* Right Point Bottom */}
      <path d="M94 39.8L50 50L72 61.2Z" fill="url(#star-f2)" />
      {/* Bottom Right Point Left */}
      <path d="M72 61.2L50 50L77.2 91.5Z" fill="url(#star-f1)" />
      {/* Bottom Right Point Right */}
      <path d="M77.2 91.5L50 50L50 77.2Z" fill="url(#star-f3)" />
      {/* Bottom Left Point Left */}
      <path d="M50 77.2L50 50L22.8 91.5Z" fill="url(#star-f2)" />
      {/* Bottom Left Point Right */}
      <path d="M22.8 91.5L50 50L28 61.2Z" fill="url(#star-f1)" />
      {/* Left Point Top */}
      <path d="M28 61.2L50 50L6 39.8Z" fill="url(#star-f3)" />
      {/* Left Point Bottom */}
      <path d="M6 39.8L50 50L36.5 35.5Z" fill="url(#star-f2)" />
      
      {/* White Diamond Sparkle core */}
      <path d="M50 42L53 50L50 58L47 50Z" fill="#FFF" opacity="0.8" />
    </svg>
  ),
  trophy: (
    <svg className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="gold-bright" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFEE3" />
          <stop offset="40%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="gold-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="gem-color" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>
      {/* 3D Handles */}
      <path d="M22 28C12 28 10 46 24 50" stroke="url(#gold-bright)" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M78 28C88 28 90 46 76 50" stroke="url(#gold-bright)" strokeWidth="6.5" strokeLinecap="round" />
      
      <path d="M22 28C12 28 10 46 24 50" stroke="url(#gold-dark)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <path d="M78 28C88 28 90 46 76 50" stroke="url(#gold-dark)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      {/* Main chalice bowl with facets */}
      <path d="M25 24H75V44C75 58 63 68 50 68C37 68 25 58 25 44V24Z" fill="url(#gold-bright)" stroke="#FFF" strokeWidth="1" />
      <path d="M50 24H75V44C75 58 63 68 50 68V24Z" fill="url(#gold-dark)" opacity="0.25" />
      
      {/* 3D Rim bevel */}
      <ellipse cx="50" cy="24" rx="25" ry="3.5" fill="url(#gold-dark)" stroke="#FFF" strokeWidth="1" />
      <ellipse cx="50" cy="24" rx="22" ry="2" fill="#78350F" />

      {/* Stem */}
      <path d="M44 68H56V80H44V68Z" fill="url(#gold-bright)" />
      <path d="M50 68H56V80H50V68Z" fill="url(#gold-dark)" opacity="0.3" />
      
      {/* Bevelled Base */}
      <path d="M30 80H70L74 88H26L30 80Z" fill="url(#gold-bright)" stroke="#FFF" strokeWidth="1" />
      <path d="M50 80H70L74 88H50V80Z" fill="url(#gold-dark)" opacity="0.35" />

      {/* Glowing Gem in Center */}
      <path d="M50 36L56 44L50 52L44 44Z" fill="url(#gem-color)" stroke="#FFF" strokeWidth="1" />
      <circle cx="50" cy="44" r="2" fill="#FFF" opacity="0.8" />
    </svg>
  ),
  target: (
    <svg className="w-full h-full filter drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="target-mesh" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0891B2" stopOpacity="0.4" />
          <stop offset="80%" stopColor="#1E1B4B" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Cyber radar grid background */}
      <circle cx="50" cy="50" r="44" fill="url(#target-mesh)" />
      
      {/* Segmented outer tech rings */}
      <circle cx="50" cy="50" r="40" stroke="#06B6D4" strokeWidth="1" opacity="0.3" />
      <circle cx="50" cy="50" r="34" stroke="#22D3EE" strokeWidth="3.5" strokeDasharray="30 20 5 10 40 10" />
      <circle cx="50" cy="50" r="24" stroke="#0891B2" strokeWidth="2.5" strokeDasharray="4 6" />
      <circle cx="50" cy="50" r="14" stroke="#22D3EE" strokeWidth="1.5" />
      
      {/* High-tech reticles */}
      <path d="M50 4V12M50 88V96M4 50H12M88 50H96" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" />
      
      {/* Glowing crosshair spikes */}
      <path d="M34 34L40 40M66 34L60 40M34 66L40 60M66 66L60 60" stroke="#06B6D4" strokeWidth="2" />
      
      {/* 3D Core Lens */}
      <circle cx="50" cy="50" r="6" fill="#FFF" className="animate-pulse" />
      <circle cx="50" cy="50" r="3" fill="#22D3EE" />
    </svg>
  ),
  pulse: (
    <svg className="w-full h-full filter drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="neon-pulse" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
        <linearGradient id="gold-bolt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* Thick glowing waveform line */}
      <path
        d="M8 50H26L34 16L46 84L54 38L62 58L68 50H92"
        stroke="url(#neon-pulse)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner bright highlight stroke for 3D neon tube effect */}
      <path
        d="M8 50H26L34 16L46 84L54 38L62 58L68 50H92"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      
      {/* Energetic golden lightning bolt intersecting */}
      <path
        d="M58 14L40 48H52L36 86L68 44H50L58 14Z"
        fill="url(#gold-bolt)"
        stroke="#FFF"
        strokeWidth="1.5"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
        opacity="0.9"
      />
    </svg>
  ),
  shield: (
    <svg className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.55)]" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="iron-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="iron-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="trim-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>
      {/* Thick gold outer border shield */}
      <path
        d="M16 18C40 18 48 8 50 4C52 8 60 18 84 18C84 50 74 78 50 96C26 78 16 50 16 18Z"
        fill="url(#trim-gold)"
        stroke="#FFF"
        strokeWidth="1"
      />
      {/* Heavy iron plate inner segments */}
      <path
        d="M21 23C42 23 48 14 50 10C52 14 58 23 79 23C79 50 70 74 50 90C30 74 21 50 21 23Z"
        fill="url(#iron-light)"
      />
      {/* Left side shadows for 3D division */}
      <path
        d="M21 23C42 23 48 14 50 10V90C30 74 21 50 21 23Z"
        fill="url(#iron-dark)"
        opacity="0.45"
      />
      
      {/* Crossed steel bands */}
      <path d="M21 40L79 65M21 65L79 40" stroke="url(#trim-gold)" strokeWidth="3" opacity="0.8" />

      {/* Raised central metal boss star */}
      <path
        d="M50 28L53 38L62 38L55 44L58 53L50 47L42 53L45 44L38 38L47 38L50 28Z"
        fill="url(#trim-gold)"
        stroke="#FFF"
        strokeWidth="1"
      />
    </svg>
  ),
  flame: (
    <svg className="w-full h-full filter drop-shadow-[0_4px_10px_rgba(234,88,12,0.55)]" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="gas-fuchsia" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#701A75" />
          <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gas-orange" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="60%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gas-yellow" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#FFF" />
        </linearGradient>
      </defs>
      {/* Outer Fuchsia energy plume */}
      <path
        d="M50 92C78 92 88 66 82 38C82 10 50 2 50 2C50 2 40 22 40 40C40 56 22 66 18 78C14 90 22 92 50 92Z"
        fill="url(#gas-fuchsia)"
        opacity="0.8"
      />
      {/* Main hot orange plasma layer */}
      <path
        d="M50 92C70 92 78 70 74 44C74 18 50 8 50 8C50 8 42 28 42 46C42 60 28 68 24 78C20 88 28 92 50 92Z"
        fill="url(#gas-orange)"
      />
      {/* Blazing white-hot core */}
      <path
        d="M50 92C62 92 68 78 66 54C66 30 50 18 50 18C50 18 46 38 46 52C46 64 38 72 36 80C34 88 38 92 50 92Z"
        fill="url(#gas-yellow)"
      />
    </svg>
  ),
  medal: (
    <svg className="w-full h-full filter drop-shadow-[0_5px_8px_rgba(0,0,0,0.5)]" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="ribbon-red" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#991B1B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
        <linearGradient id="ribbon-blue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="gold-coin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="35%" stopColor="#FCD34D" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>
      {/* Folded satin ribbon stripes */}
      <path d="M26 4H38L50 44L38 44L26 4Z" fill="url(#ribbon-red)" stroke="#000" strokeWidth="0.5" />
      <path d="M74 4H62L50 44L62 44L74 4Z" fill="url(#ribbon-blue)" stroke="#000" strokeWidth="0.5" />
      <path d="M38 4H62L50 44L38 44Z" fill="#FFF" />
      <path d="M46 4H54L50 44L46 4Z" fill="url(#ribbon-red)" />
      
      {/* Medallion hanging ring */}
      <circle cx="50" cy="42" r="6" stroke="url(#gold-coin)" strokeWidth="3" fill="none" />
      
      {/* Heavy bevelled gold medallion coin */}
      <circle cx="50" cy="64" r="28" fill="url(#gold-coin)" stroke="#FFF" strokeWidth="1.5" />
      {/* Inset ring with gear/cog teeth */}
      <circle cx="50" cy="64" r="23" stroke="#78350F" strokeWidth="2.5" strokeDasharray="3 2" />
      
      {/* Detailed center 3D star */}
      <path
        d="M50 48L53 58L62 58L55 64L57 74L50 68L43 74L45 64L38 58L47 58L50 48Z"
        fill="#FFE082"
        stroke="#78350F"
        strokeWidth="0.8"
      />
    </svg>
  ),
  crown: (
    <svg className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="cr-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBE3" />
          <stop offset="40%" stopColor="#FBBF24" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <radialGradient id="velvet" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="80%" stopColor="#881337" />
          <stop offset="100%" stopColor="#4C0519" />
        </radialGradient>
      </defs>
      
      {/* Inner Royal Crimson Velvet cap */}
      <path d="M22 68C18 36 82 36 78 68H22Z" fill="url(#velvet)" />

      {/* Base Gold band */}
      <path d="M18 68H82V80H18V68Z" fill="url(#cr-gold)" stroke="#FFF" strokeWidth="1" />
      {/* Alternate gems on base band */}
      <circle cx="28" cy="74" r="3.5" fill="#EF4444" stroke="#FFF" strokeWidth="0.5" />
      <circle cx="42" cy="74" r="3.5" fill="#3B82F6" stroke="#FFF" strokeWidth="0.5" />
      <circle cx="58" cy="74" r="3.5" fill="#10B981" stroke="#FFF" strokeWidth="0.5" />
      <circle cx="72" cy="74" r="3.5" fill="#EF4444" stroke="#FFF" strokeWidth="0.5" />

      {/* Royal Spires */}
      <path
        d="M18 68L10 32L32 50L50 14L68 50L90 32L82 68H18Z"
        fill="url(#cr-gold)"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Gems at spire peaks */}
      <circle cx="10" cy="32" r="5.5" fill="#3B82F6" stroke="#FFF" strokeWidth="1" />
      <circle cx="32" cy="50" r="3.5" fill="#10B981" stroke="#FFF" strokeWidth="1" />
      <circle cx="50" cy="14" r="7" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
      <circle cx="68" cy="50" r="3.5" fill="#10B981" stroke="#FFF" strokeWidth="1" />
      <circle cx="90" cy="32" r="5.5" fill="#3B82F6" stroke="#FFF" strokeWidth="1" />
    </svg>
  ),
  award: (
    <svg className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="aw-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBE3" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
      </defs>
      
      {/* 3D Laurel wreath leaf details (individual overlapping clusters) */}
      {/* Left wreath side */}
      <path d="M30 68C20 60 16 42 26 26" stroke="url(#aw-gold)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M22 60L14 54M20 48L12 40M22 36L14 26M26 26L18 16" stroke="url(#aw-gold)" strokeWidth="3" strokeLinecap="round" />
      {/* Right wreath side */}
      <path d="M70 68C80 60 84 42 74 26" stroke="url(#aw-gold)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M78 60L86 54M80 48L88 40M78 36L86 26M74 26L82 16" stroke="url(#aw-gold)" strokeWidth="3" strokeLinecap="round" />

      {/* Ribbon drape hanging down */}
      <path d="M40 56L34 88L50 80L66 88L60 56H40Z" fill="url(#aw-gold)" stroke="#78350F" strokeWidth="1" />
      <path d="M50 56L66 88L60 88L50 56" fill="#9A3412" opacity="0.3" />

      {/* Main Bevelled center medallion */}
      <circle cx="50" cy="46" r="18" fill="url(#aw-gold)" stroke="#FFF" strokeWidth="1" />
      <circle cx="50" cy="46" r="14" fill="#78350F" />
      
      {/* Inner star */}
      <path d="M50 36L52 42L58 43L53 48L55 54L50 50L45 54L47 48L42 43L48 42L50 36Z" fill="url(#aw-gold)" />
    </svg>
  ),
  voyager: (
    <svg className="w-full h-full filter drop-shadow-[0_0_15px_rgba(167,139,250,0.6)]" viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="vy-hull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF" />
          <stop offset="30%" stopColor="#F1F5F9" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="vy-wings" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="40%" stopColor="#C084FC" />
          <stop offset="70%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
        <linearGradient id="vy-thruster" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="25%" stopColor="#F59E0B" />
          <stop offset="60%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#701A75" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="thruster-core" cx="50%" cy="20%" r="50%">
          <stop offset="0%" stopColor="#FFF" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>
      
      {/* 3D Stardust massive flame thruster trail */}
      <motion.path
        animate={{ scaleY: [1, 1.12, 1], scaleX: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        d="M60 76L46 118L60 102L74 118L60 76Z"
        fill="url(#vy-thruster)"
        className="origin-top"
      />
      <circle cx="60" cy="80" r="6" fill="url(#thruster-core)" />
      
      {/* Multi-layered wings with gold trims */}
      <path d="M28 82L60 36L92 82L60 72L28 82Z" fill="url(#vy-wings)" stroke="#FFD54F" strokeWidth="1.5" />
      <path d="M60 36L92 82L60 72V36Z" fill="#000" opacity="0.2" /> {/* Right half shadow */}

      {/* Main metallic fuselage capsule */}
      <path d="M60 10C66 28 72 58 70 78H50C48 58 54 28 60 10Z" fill="url(#vy-hull)" stroke="#FFF" strokeWidth="1" />
      <path d="M60 10C60 10 65 34 68 78H50C48 34 53 10 60 10Z" fill="#E2E8F0" opacity="0.3" />
      <path d="M60 10V78H70C72 58 66 28 60 10Z" fill="#475569" opacity="0.25" /> {/* Half fuselage shadow */}

      {/* High-tech reflective Cockpit glass */}
      <path d="M60 20C63 28 65 38 64 45H56C55 38 57 28 60 20Z" fill="#22D3EE" stroke="#FFF" strokeWidth="0.8" />
      <path d="M60 20V45H64C65 38 63 28 60 20Z" fill="#0891B2" opacity="0.4" />

      {/* Raised Gold emblem insignia */}
      <path d="M60 54L63 60L70 61L65 66L66 72L60 69L54 72L55 66L50 61L57 60L60 54Z" fill="#FFB300" stroke="#FFF" strokeWidth="0.8" />
    </svg>
  ),
};

// Styling profiles for premium AAA game token containers
const RARITY_STYLING = {
  Common: {
    bg: 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950',
    border: 'border-slate-500/80',
    shadow: 'shadow-[0_12px_24px_rgba(0,0,0,0.6),_inset_0_2px_4px_rgba(255,255,255,0.15)]',
    glow: 'rgba(148,163,184,0.3)',
    rimColor: 'border-slate-600/40',
  },
  Rare: {
    bg: 'bg-gradient-to-br from-[#06182c] via-[#0b132b] to-[#1c2541]',
    border: 'border-cyan-400/90',
    shadow: 'shadow-[0_0_25px_rgba(34,211,238,0.5),_inset_0_2px_6px_rgba(255,255,255,0.25),_0_12px_28px_rgba(0,0,0,0.7)]',
    glow: 'rgba(34,211,238,0.55)',
    rimColor: 'border-cyan-500/30',
  },
  Elite: {
    bg: 'bg-gradient-to-br from-[#120024] via-[#1a0826] to-[#020005]',
    border: 'border-amber-400',
    shadow: 'shadow-[0_0_40px_rgba(167,139,250,0.75),_inset_0_3px_10px_rgba(255,255,255,0.3),_0_16px_36px_rgba(0,0,0,0.85)]',
    glow: 'rgba(192,132,252,0.8)',
    rimColor: 'border-amber-400/30',
  },
};

export default function PremiumBadge({ 
  icon = 'star', 
  rarity = 'Common', 
  isLocked = false, 
  size = 76,
  badgeName = ''
}) {
  const styling = RARITY_STYLING[rarity] || RARITY_STYLING.Common;
  const normalizedIcon = icon.toLowerCase();
  
  // Decide which glyph to render
  const glyph = GLYPHS[normalizedIcon] || GLYPHS.star;

  // Elite badges float gently in space
  const floatTransition = rarity === 'Elite' && !isLocked ? {
    animate: {
      y: [-4, 4, -4],
      rotate: [-1, 1, -1]
    },
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  // Rare badges scale slightly on energetic pulse
  const breatheTransition = rarity === 'Rare' && !isLocked ? {
    animate: {
      scale: [0.97, 1.03, 0.97]
    },
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  // Combine motions
  const motionProps = {
    ...floatTransition,
    ...breatheTransition,
  };

  return (
    <div 
      className="relative flex items-center justify-center shrink-0" 
      style={{ width: size, height: size }}
    >
      {/* ── Rotating Constellation Outer Halo (for Elite badges) ── */}
      {!isLocked && rarity === 'Elite' && (
        <>
          {/* Pulsing cosmic nebula background */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-60 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${styling.glow} 0%, transparent 70%)`,
              transform: 'scale(1.4)'
            }}
          />
          {/* Slowly spinning thin planetary ring with dots */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-amber-400/25 rounded-full pointer-events-none"
            style={{ transform: 'scale(1.18)' }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-fuchsia-400/20 rounded-full pointer-events-none"
            style={{ transform: 'scale(1.28)' }}
          />
        </>
      )}

      {/* ── Pulsing neon halo (for Rare badges) ── */}
      {!isLocked && rarity === 'Rare' && (
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40 pointer-events-none animate-pulse-glow"
          style={{
            background: `radial-gradient(circle, ${styling.glow} 0%, transparent 65%)`,
            transform: 'scale(1.3)'
          }}
        />
      )}

      {/* ── Main 3D Token Motion Container ── */}
      <motion.div
        {...motionProps}
        className={`relative w-full h-full flex items-center justify-center border-[3px] rounded-[24%] overflow-hidden group select-none transition-all duration-300 ${styling.bg} ${styling.border} ${styling.shadow} ${
          isLocked ? 'opacity-40 grayscale contrast-75 brightness-75' : 'hover:scale-108 hover:border-white cursor-pointer'
        }`}
      >
        {/* Subtle diagonal lines backing (carbon texture) */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%)] bg-[length:10px_10px]" />

        {/* ── 3D GLOSS DOME REFLECTION OVERLAYS ── */}
        <div className="absolute inset-0 z-20 pointer-events-none rounded-[inherit]">
          {/* Glistening gloss arc highlight at top left */}
          <div 
            className="absolute -top-[35%] -left-[20%] w-[140%] h-[80%] rounded-full opacity-40" 
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)',
              transform: 'rotate(-12deg)'
            }}
          />
          {/* Deep edge shadows */}
          <div className="absolute inset-0 border border-white/20 rounded-[inherit]" />
          <div className="absolute inset-0.5 border border-black/35 rounded-[inherit]" />
          
          {/* Subtle warm bounce light reflection at bottom rim */}
          <div 
            className={`absolute bottom-1.5 left-1/4 right-1/4 h-1 blur-[0.5px] rounded-full ${rarity === 'Elite' ? 'bg-amber-300/20' : rarity === 'Rare' ? 'bg-cyan-300/25' : 'bg-slate-200/20'}`}
          />
        </div>

        {/* Dynamic backdrop line matrix (for Elite rarity) */}
        {!isLocked && rarity === 'Elite' && (
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-full h-full opacity-15 flex items-center justify-center pointer-events-none scale-125"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-300 stroke-[0.8] stroke-dasharray-[3_3]">
              <circle cx="50" cy="50" r="42" fill="none" />
              <path d="M50 0V100M0 50H100M15 15L85 85M15 85L85 15" />
            </svg>
          </motion.div>
        )}

        {/* ── Locked Shield Frost glass overlay ── */}
        {isLocked ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-[2px] z-10 text-slate-400">
            {/* Outline of original glyph semi-visible in background */}
            <div className="w-[58%] h-[58%] opacity-15 filter blur-[1px]">
              {glyph}
            </div>
            {/* Padlock centered */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                <Lock size={size > 64 ? 22 : 16} className="text-slate-200" />
              </div>
            </div>
          </div>
        ) : (
          /* ── Glowing 3D inner glyph ── */
          <div className="w-[66%] h-[66%] relative flex items-center justify-center z-10 group-hover:scale-108 transition-transform duration-300">
            {glyph}
          </div>
        )}
      </motion.div>

      {/* Floating sparkles for Elite badges in space */}
      {!isLocked && rarity === 'Elite' && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {/* Sparkle 1 */}
          <motion.div
            animate={{
              y: [-12, -36],
              x: [-8, -24],
              opacity: [0, 1, 0],
              scale: [0.4, 1.1, 0.4],
            }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
            className="absolute top-1 left-1 text-amber-300 text-xs font-bold"
          >
            ✦
          </motion.div>
          {/* Sparkle 2 */}
          <motion.div
            animate={{
              y: [-8, -32],
              x: [12, 28],
              opacity: [0, 1, 0],
              scale: [0.5, 1.3, 0.5],
            }}
            transition={{ duration: 2.8, repeat: Infinity, delay: 1.4 }}
            className="absolute top-3 right-0 text-fuchsia-300 text-sm font-bold"
          >
            ✦
          </motion.div>
        </div>
      )}
    </div>
  );
}
