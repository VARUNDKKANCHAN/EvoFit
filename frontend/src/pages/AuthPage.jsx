import React, { useState, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Activity, 
  Heart, 
  Zap, 
  Target, 
  Eye, 
  EyeOff, 
  User, 
  Lock, 
  Mail, 
  ChevronRight,
  Wifi,
  BarChart3,
  Dna,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Cinematic Neural Background ── */
const NeuralBackground = () => {
  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-ai-nebula opacity-90" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Orbital Lines */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-indigo-500/10 rounded-full animate-orbit" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-purple-500/5 rounded-full animate-orbit" style={{ animationDirection: 'reverse', animationDuration: '35s' }} />

      {/* Animated Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-indigo-400/20 blur-[1px]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

/* ── Holographic Athlete Silhouette ── */
const AthleteHologram = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10"
      >
        <svg width="400" height="600" viewBox="0 0 200 300" className="drop-shadow-[0_0_30px_rgba(129,140,248,0.4)]">
          {/* Wireframe Silhouette */}
          <path 
            d="M100,20 L110,40 L105,60 L95,60 L90,40 Z" 
            fill="none" stroke="#818cf8" strokeWidth="0.5" className="opacity-40"
          />
          <path 
            d="M95,60 L105,60 L115,100 L110,160 L90,160 L85,100 Z" 
            fill="none" stroke="#818cf8" strokeWidth="0.5" className="opacity-60"
          />
          {/* Limbs & Joints */}
          <g stroke="#818cf8" strokeWidth="1" fill="none">
            <circle cx="100" cy="30" r="10" className="animate-pulse" /> {/* Head */}
            <line x1="85" y1="70" x2="60" y2="120" /> {/* Left Arm */}
            <line x1="60" y1="120" x2="50" y2="170" /> 
            <line x1="115" y1="70" x2="140" y2="120" /> {/* Right Arm */}
            <line x1="140" y1="120" x2="150" y2="170" />
            <line x1="90" y1="160" x2="80" y2="220" /> {/* Left Leg */}
            <line x1="80" y1="220" x2="85" y2="280" />
            <line x1="110" y1="160" x2="120" y2="220" /> {/* Right Leg */}
            <line x1="120" y1="220" x2="115" y2="280" />
          </g>
          {/* Glowing Joints */}
          <g fill="#c084fc">
            <circle cx="85" cy="70" r="2" className="animate-pulse" />
            <circle cx="115" cy="70" r="2" className="animate-pulse" />
            <circle cx="60" cy="120" r="2" className="animate-pulse" />
            <circle cx="140" cy="120" r="2" className="animate-pulse" />
            <circle cx="100" cy="160" r="2" className="animate-pulse" />
            <circle cx="80" cy="220" r="2" className="animate-pulse" />
            <circle cx="120" cy="220" r="2" className="animate-pulse" />
          </g>
        </svg>
      </motion.div>
      
      {/* Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/20 blur-[100px] rounded-full" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-purple-600/10 blur-[80px] rounded-full" />
    </div>
  );
};



export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const isLogin = location.pathname === '/login';
  
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const rootRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!rootRef.current) return;
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth) * 100;
    const y = (clientY / window.innerHeight) * 100;
    rootRef.current.style.setProperty('--mouse-x', `${x}%`);
    rootRef.current.style.setProperty('--mouse-y', `${y}%`);
  };
  
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    username: '', 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    age: '', 
    weight: '', 
    height: '', 
    gender: 'Male',
    fitnessGoal: 'Build Strength/Muscle', 
    fitnessLevel: 'Intermediate'
  });

  const handleLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  const handleSignupChange = (e) => setSignupForm({ ...signupForm, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) return;
    setIsSubmitting(true);
    try {
      const success = await login(loginForm.username, loginForm.password);
      if (success) {
        navigate('/dashboard');
      } else {
        alert("Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      alert("An error occurred during sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupForm.username || !signupForm.email || !signupForm.password) {
      alert("Please fill in all required fields.");
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await register({
        username: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
        full_name: signupForm.fullName,
        age: parseInt(signupForm.age) || null,
        weight_kg: parseFloat(signupForm.weight) || null,
        height_cm: parseFloat(signupForm.height) || null,
        gender: signupForm.gender,
        fitness_goal: signupForm.fitnessGoal,
        fitness_level: signupForm.fitnessLevel
      });
      if (success) {
        alert("Account created successfully! Please sign in.");
        navigate('/login');
      } else {
        alert("Registration failed. Account may already exist.");
      }
    } catch (err) {
      alert("An error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      ref={rootRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#020617] flex flex-col lg:flex-row overflow-hidden font-['Inter']"
      style={{
        '--mouse-glow': 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.08), transparent 40%)'
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--mouse-glow)' }} />
      
      {/* ── LEFT SIDE: AI VISUALIZER ── */}
      <div className="relative flex-1 hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        <NeuralBackground />
        
        {/* Top: Logo */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            <Activity className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">EVOFIT<span className="text-indigo-400">.AI</span></span>
        </div>

        {/* Center: Hologram & Hero */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 py-12">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full max-h-[600px]">
            <AthleteHologram />
          </div>

          <div className="mt-auto w-full text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl xl:text-7xl font-black text-white leading-none tracking-tight mb-6"
            >
              Elevate Your<br />
              <span className="text-gradient-purple">Performance.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/50 max-w-md leading-relaxed mb-12"
            >
              Train smarter with real-time AI performance intelligence, biomechanical analysis, and adaptive coaching.
            </motion.p>
            
            {/* Widgets removed as per request */}
          </div>
        </div>

        {/* Bottom: Trust Metrics */}
        <div className="relative z-20 flex items-center justify-between border-t border-white/5 pt-8 mt-12">
          <div className="flex flex-col">
            <span className="text-white font-bold">10K+</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Tracked Athletes</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-white font-bold">98.2%</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Motion Accuracy</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-white font-bold">5M+</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">AI Reps Analyzed</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: AUTH PANEL ── */}
      <div className="relative w-full lg:w-[600px] flex items-center justify-center p-6 lg:p-12 z-30 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[460px] bg-glass-premium rounded-[32px] p-8 lg:p-12 border border-white/10 relative overflow-hidden"
        >
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">AI Systems Online</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                {isLogin ? 'Welcome Back' : 'Your AI Coach Is Ready'}
              </h2>
              <p className="text-white/40 text-sm font-medium">
                {isLogin ? 'Enter your credentials to access the hub.' : 'Begin your elite performance journey today.'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex p-1.5 bg-white/5 rounded-2xl mb-8 border border-white/5">
              <Link to="/login" className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all text-center ${isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}>
                Sign In
              </Link>
              <Link to="/signup" className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all text-center ${!isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}>
                Get Started
              </Link>
            </div>

            {/* Form */}
            <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div 
                    key="login-fields"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Athlete ID</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input 
                          name="username"
                          type="text" 
                          placeholder="alex_pro_24"
                          value={loginForm.username}
                          onChange={handleLoginChange}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Secure Access Key</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input 
                          name="password"
                          type={showPass ? 'text' : 'password'} 
                          placeholder="••••••••"
                          value={loginForm.password}
                          onChange={handleLoginChange}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/10 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                        >
                          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="signup-fields"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Full Name</label>
                        <input name="fullName" placeholder="Alex Johnson" onChange={handleSignupChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/10 outline-none focus:border-indigo-500/50 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Username</label>
                        <input name="username" placeholder="alex_pro" onChange={handleSignupChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/10 outline-none focus:border-indigo-500/50 transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Email Address</label>
                      <input name="email" type="email" placeholder="alex@performance.com" onChange={handleSignupChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/10 outline-none focus:border-indigo-500/50 transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Access Key</label>
                        <input name="password" type="password" placeholder="••••••••" onChange={handleSignupChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/10 outline-none focus:border-indigo-500/50 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Confirm</label>
                        <input name="confirmPassword" type="password" placeholder="••••••••" onChange={handleSignupChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/10 outline-none focus:border-indigo-500/50 transition-all" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                       <div className="space-y-1">
                         <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Age</label>
                         <input name="age" type="number" placeholder="24" onChange={handleSignupChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-indigo-500/50" />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Weight (kg)</label>
                         <input name="weight" type="number" placeholder="75" onChange={handleSignupChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-indigo-500/50" />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Height (cm)</label>
                         <input name="height" type="number" placeholder="180" onChange={handleSignupChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-indigo-500/50" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Gender</label>
                        <select name="gender" onChange={handleSignupChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-indigo-500/50 appearance-none">
                          <option className="bg-[#020617]">Male</option>
                          <option className="bg-[#020617]">Female</option>
                          <option className="bg-[#020617]">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Fitness Goal</label>
                        <select name="fitnessGoal" onChange={handleSignupChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-indigo-500/50 appearance-none">
                          <option className="bg-[#020617]">Build Strength/Muscle</option>
                          <option className="bg-[#020617]">Weight Loss</option>
                          <option className="bg-[#020617]">Endurance</option>
                          <option className="bg-[#020617]">General Fitness</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Experience Level</label>
                      <select name="fitnessLevel" onChange={handleSignupChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-indigo-500/50 appearance-none">
                        <option className="bg-[#020617]">Beginner</option>
                        <option className="bg-[#020617]">Intermediate</option>
                        <option className="bg-[#020617]">Advanced</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10">{isSubmitting ? 'Initializing Systems...' : 'Launch Performance Hub'}</span>
                  <ChevronRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-white/20">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted biometric-grade authentication</span>
              </div>
              <div className="w-full flex items-center gap-4">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-white/10 text-[10px] font-black uppercase tracking-widest">System Integrated</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1 text-[10px] font-bold text-white/40">
                  <Wifi size={12} className="text-emerald-500" />
                  <span>Cloud Sync</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-white/40">
                  <Cpu size={12} className="text-indigo-400" />
                  <span>Neural Core v2.0</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.02] mix-blend-overlay">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
      </div>
    </div>
  );
}
