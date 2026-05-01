import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Shield, Zap, Crown, Flame, Target, ChevronRight, Activity, Filter, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/auth';
import { useAuth } from '../context/AuthContext';

// Helper to determine rank title and color based on Level
const getRankInfo = (level) => {
  if (level >= 50) return { title: 'Titan', color: 'from-fuchsia-500 to-purple-600', shadow: 'shadow-fuchsia-500/50', border: 'border-fuchsia-500' };
  if (level >= 30) return { title: 'Grandmaster', color: 'from-red-500 to-rose-600', shadow: 'shadow-rose-500/50', border: 'border-rose-500' };
  if (level >= 20) return { title: 'Master', color: 'from-blue-400 to-indigo-600', shadow: 'shadow-blue-500/50', border: 'border-blue-500' };
  if (level >= 10) return { title: 'Elite', color: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/50', border: 'border-emerald-500' };
  if (level >= 5)  return { title: 'Challenger', color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/50', border: 'border-amber-500' };
  return { title: 'Novice', color: 'from-slate-400 to-slate-600', shadow: 'shadow-slate-500/50', border: 'border-slate-500' };
};

export default function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [timeFilter, setTimeFilter] = useState('All-time');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/users/leaderboard');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  const plateVariants = {
    hidden: { opacity: 0, x: -30 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-evofit-bg-primary min-h-screen">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-evofit-border border-t-evofit-purple-main rounded-full"
        />
      </div>
    );
  }

  if (!data || !data.leaderboard) {
    return (
      <div className="flex items-center justify-center h-full bg-evofit-bg-primary min-h-screen">
        <p className="text-evofit-text-primary font-bold">No leaderboard data available.</p>
      </div>
    );
  }

  const top3 = data?.leaderboard?.slice(0, 3) || [];
  const rest = data?.leaderboard?.slice(3) || [];
  const currentUserInfo = getRankInfo(user?.level || 1);
  const currentUserXP = data?.current_user_xp || 0;
  const currentLevel = user?.level || 1;
  const xpForNextLevel = currentLevel * 1000;
  const progressPct = Math.min(100, Math.max(0, (currentUserXP / xpForNextLevel) * 100));

  return (
    <div className="flex-1 flex flex-col items-center py-6 px-4 md:px-7 overflow-y-auto bg-evofit-bg-primary min-h-screen font-inter relative pb-24">
      
      {/* Background FX - Tighter and richer */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[10%] w-[600px] h-[600px] bg-evofit-purple-main/5 rounded-full blur-[140px]" />
        <div className="absolute top-[20%] right-[5%] w-[500px] h-[500px] bg-evofit-purple-light/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        className="w-full max-w-[1200px] z-10 relative flex flex-col gap-8"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        
        {/* Header & Your Standing Card - Tighter Alignment */}
        <div className="flex flex-col lg:flex-row items-center gap-6 justify-between mt-2">
          
          {/* Unified Gradient Header */}
          <motion.div variants={itemVariants} className="text-left lg:w-1/3 w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-evofit-purple-main to-evofit-purple-light flex items-center justify-center shadow-purple-glow border border-white/20">
                <Crown size={24} className="text-white drop-shadow-md" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter m-0 uppercase leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-evofit-purple-main via-evofit-purple-light to-evofit-purple-main animate-shimmer bg-[length:200%_auto]">
                  Hall of Legends
                </span>
              </h1>
            </div>
            <p className="text-evofit-text-secondary text-sm font-bold mt-2 max-w-sm">
              Outlift, outlast, and ascend the ranks to forge your legacy.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="bg-evofit-bg-secondary border border-evofit-border px-3 py-1.5 rounded-lg flex items-center gap-2">
                 <Shield size={14} className="text-evofit-purple-main" />
                 <span className="text-xs font-black text-evofit-text-primary">{data?.leaderboard?.length || 0} Total Athletes</span>
              </div>
            </div>
          </motion.div>

          {/* Current User Dashboard Plate - Enhanced Rank # */}
          <motion.div variants={itemVariants} className="lg:w-2/3 w-full glass-card p-[1px] rounded-[24px] bg-gradient-to-r from-evofit-purple-main/40 via-evofit-purple-light/20 to-evofit-purple-main/40 shadow-premium-card group hover:shadow-purple-glow transition-all duration-500">
            <div className="bg-evofit-bg-secondary rounded-[23px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 h-full relative overflow-hidden">
              
              <div className="flex items-center gap-6 z-10 w-full md:w-auto">
                {/* Heroic Rank Display */}
                <div className="flex flex-col items-center justify-center shrink-0 min-w-[100px] border-r border-evofit-border pr-6">
                   <span className="text-xs font-black text-evofit-text-muted uppercase tracking-widest mb-1">Rank</span>
                   <div className="relative">
                      <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-evofit-purple-light to-evofit-purple-main drop-shadow-sm">
                        #{data?.current_user_rank}
                      </span>
                      <motion.div 
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 blur-xl bg-evofit-purple-main/20 -z-10" 
                      />
                   </div>
                </div>

                <div className="relative shrink-0 ml-2">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentUserInfo.color} flex items-center justify-center text-white text-2xl font-black shadow-lg ${currentUserInfo.shadow} border-2 border-evofit-bg-secondary`}>
                    {(user?.username || '?').charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-black text-evofit-text-primary m-0 tracking-tight flex items-center gap-2">
                    {user?.username}
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">
                      Top {Math.max(1, Math.round((data?.current_user_rank / data?.leaderboard?.length) * 100))}%
                    </span>
                  </h2>
                  
                  {/* Enhanced Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-black text-evofit-text-secondary mb-1.5 uppercase tracking-wide">
                      <span className="text-evofit-purple-main">{currentUserXP.toLocaleString()} XP</span>
                      <span>{Math.round(100 - progressPct)}% TO LEVEL {currentLevel + 1}</span>
                    </div>
                    <div className="w-full h-3 bg-evofit-bg-primary rounded-full overflow-hidden border border-evofit-border relative shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${currentUserInfo.color} relative`}
                      >
                         <div className="absolute top-0 right-0 bottom-0 w-6 bg-white/30 skew-x-12 translate-x-2 animate-pulse" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 z-10">
                 <button 
                   onClick={() => navigate('/upload')}
                   className="w-full md:w-auto bg-evofit-purple-main hover:bg-evofit-purple-light text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-purple-glow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                 >
                   <Flame size={18} className="fill-white" /> Compete Now
                 </button>
                 <button 
                   onClick={() => navigate('/profile')}
                   className="w-full md:w-auto bg-transparent border-2 border-evofit-purple-main/30 hover:border-evofit-purple-main text-evofit-purple-main px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                 >
                   <User size={16} /> Profile
                 </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Podium Grid - Enhanced Depth and Scaling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-4 h-[auto] md:h-[380px] px-2 max-w-5xl mx-auto w-full">
          
          {/* 2nd Place (Silver) */}
          {top3[1] && (
            <motion.div variants={itemVariants} className="relative group md:order-1 order-2">
              <div className="glass-card flex flex-col items-center p-8 border-t-4 border-t-slate-300 bg-gradient-to-b from-slate-400/10 to-evofit-bg-secondary relative z-10 transform md:translate-y-8 hover:-translate-y-2 transition-all duration-300 shadow-premium-card">
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-400 text-slate-900 flex items-center justify-center font-black text-xl shadow-lg border-4 border-evofit-bg-secondary">
                  2
                </div>
                <div className="w-20 h-20 mt-4 rounded-full bg-gradient-to-br from-slate-200 to-slate-500 flex items-center justify-center text-3xl font-black text-slate-900 shadow-inner mb-3 border-2 border-white/20">
                  {top3[1].username.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-black text-evofit-text-primary mb-1 truncate w-full text-center tracking-tight">{top3[1].username}</h3>
                <p className="text-evofit-text-muted text-xs font-black uppercase tracking-widest mb-4">Lvl {top3[1].level} {getRankInfo(top3[1].level).title}</p>
                <div className="px-5 py-2 rounded-xl bg-evofit-bg-primary text-evofit-text-primary font-black text-sm border border-evofit-border w-full text-center flex items-center justify-center gap-1.5">
                  <Zap size={16} className="fill-slate-400 text-slate-400" /> {top3[1].xp.toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          )}

          {/* 1st Place (Gold) - The Hero */}
          {top3[0] && (
            <motion.div variants={itemVariants} className="relative group md:order-2 order-1 z-20 scale-105">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-400/20 to-transparent rounded-t-[40px] blur-3xl opacity-60 animate-pulse-glow" />
              <div className="glass-card flex flex-col items-center p-10 border-t-4 border-t-amber-400 bg-gradient-to-b from-amber-400/10 to-evofit-bg-secondary relative transform hover:-translate-y-4 transition-all duration-300 shadow-[0_-20px_50px_rgba(245,158,11,0.2)]">
                <div className="absolute -top-16 w-full flex justify-center">
                   <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                      <Crown size={70} className="text-amber-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]" />
                   </motion.div>
                </div>
                <div className="absolute -top-6 w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-white flex items-center justify-center font-black text-3xl shadow-[0_0_30px_rgba(245,158,11,0.5)] border-4 border-evofit-bg-secondary">
                  1
                </div>
                <div className="w-24 h-24 mt-6 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 flex items-center justify-center text-4xl font-black text-white shadow-inner mb-4 border-4 border-amber-300/40">
                  {top3[0].username.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-2xl font-black text-evofit-text-primary mb-1 truncate w-full text-center tracking-tight">{top3[0].username}</h3>
                <p className="text-amber-500 text-xs font-black uppercase tracking-[0.15em] mb-5">Lvl {top3[0].level} {getRankInfo(top3[0].level).title}</p>
                <div className="px-6 py-2.5 rounded-xl bg-amber-400/20 text-amber-600 font-black text-lg border border-amber-400/40 w-full text-center flex items-center justify-center gap-2 shadow-md">
                  <Flame size={20} className="fill-amber-500 text-amber-500" /> {top3[0].xp.toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          )}

          {/* 3rd Place (Bronze) */}
          {top3[2] && (
            <motion.div variants={itemVariants} className="relative group md:order-3 order-3">
              <div className="glass-card flex flex-col items-center p-8 border-t-4 border-t-orange-700 bg-gradient-to-b from-orange-900/10 to-evofit-bg-secondary relative z-10 transform md:translate-y-12 hover:-translate-y-2 transition-all duration-300 shadow-premium-card">
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-800 text-white flex items-center justify-center font-black text-xl shadow-lg border-4 border-evofit-bg-secondary">
                  3
                </div>
                <div className="w-20 h-20 mt-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-900 flex items-center justify-center text-3xl font-black text-white shadow-inner mb-3 border-2 border-white/20">
                  {top3[2].username.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-black text-evofit-text-primary mb-1 truncate w-full text-center tracking-tight">{top3[2].username}</h3>
                <p className="text-orange-700 text-xs font-black uppercase tracking-widest mb-4">Lvl {top3[2].level} {getRankInfo(top3[2].level).title}</p>
                <div className="px-5 py-2 rounded-xl bg-evofit-bg-primary text-evofit-text-primary font-black text-sm border border-evofit-border w-full text-center flex items-center justify-center gap-1.5 shadow-sm">
                  <Zap size={16} className="fill-orange-600 text-orange-600" /> {top3[2].xp.toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Global Competitors List (Rank Plates) */}
        <div className="w-full mx-auto flex flex-col gap-5 mt-4">
          
          {/* Controls / Section Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2 bg-evofit-bg-secondary p-5 rounded-2xl border border-evofit-border shadow-sm">
            <div className="flex items-center gap-3">
              <Activity size={24} className="text-evofit-purple-main" />
              <h3 className="text-xl font-black text-evofit-text-primary m-0 uppercase tracking-widest">Global Rankings</h3>
            </div>
            
            <div className="flex items-center gap-2 bg-evofit-bg-primary/50 p-1.5 rounded-xl border border-evofit-border">
               {['Daily', 'Weekly', 'All-time'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${timeFilter === filter ? 'bg-evofit-bg-secondary text-evofit-purple-main shadow-md' : 'text-evofit-text-muted hover:text-evofit-text-primary'}`}
                  >
                     {filter}
                  </button>
               ))}
            </div>
          </div>

          {/* List Rows - Enhanced Hover & Progress */}
          <motion.div variants={containerVariants} className="flex flex-col gap-3">
            {rest.map((u) => {
              const rankInfo = getRankInfo(u.level);
              const isMe = u.is_current_user;
              const isTop10 = u.rank >= 4 && u.rank <= 10;
              const borderClass = isMe ? 'border-evofit-purple-main shadow-[0_0_15px_rgba(124,58,237,0.2)]' : isTop10 ? 'border-evofit-purple-light/20' : 'border-evofit-border';
              const bgClass = isMe ? 'bg-evofit-purple-main/[0.03]' : 'bg-evofit-bg-secondary';
              
              const rowProgressPct = Math.min(100, (u.xp / (u.level * 1000)) * 100);

              return (
                <motion.div 
                  variants={plateVariants} 
                  key={u.id}
                  onMouseEnter={() => setHoveredUser(u.id)}
                  onMouseLeave={() => setHoveredUser(null)}
                  className={`relative overflow-hidden rounded-[20px] p-4 md:p-5 flex items-center justify-between gap-4 transition-all duration-300 cursor-pointer border shadow-sm
                    ${borderClass} ${bgClass}
                    hover:scale-[1.02] hover:z-10 hover:shadow-xl hover:border-evofit-purple-main/40
                  `}
                >
                  <div className="flex items-center gap-4 md:gap-6 w-full relative z-10">
                    
                    {/* Rank Badge */}
                    <div className="w-16 text-center shrink-0">
                      <span className={`text-2xl font-black ${isMe ? 'text-evofit-purple-main' : isTop10 ? 'text-evofit-purple-light' : 'text-evofit-text-muted'}`}>#{u.rank}</span>
                    </div>

                    {/* Avatar & Info */}
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black shrink-0 shadow-inner
                        ${isMe ? 'bg-evofit-purple-main text-white' : `bg-gradient-to-br ${rankInfo.color} text-white border-2 border-evofit-bg-secondary`}`}
                      >
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                           <h4 className="text-xl font-black truncate m-0 text-evofit-text-primary">
                             {u.username}
                           </h4>
                           {isMe && <span className="text-white text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full bg-evofit-purple-main">You</span>}
                           {isTop10 && !isMe && <span className="text-evofit-purple-main text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full bg-evofit-purple-main/10 border border-evofit-purple-main/20">Elite</span>}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2">
                           <p className={`text-[10px] font-black uppercase tracking-widest m-0 ${isMe ? 'text-evofit-purple-main' : 'text-evofit-text-muted'}`}>
                             {rankInfo.title}
                           </p>
                           {/* Enhanced Row Progress bar */}
                           <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[200px]">
                              <span className="text-[9px] font-black text-evofit-text-muted uppercase">LVL {u.level}</span>
                              <div className="flex-1 h-2 bg-evofit-bg-primary rounded-full overflow-hidden border border-evofit-border shadow-inner">
                                 <div className={`h-full bg-gradient-to-r ${rankInfo.color}`} style={{ width: `${rowProgressPct}%` }} />
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Total XP */}
                    <div className="text-right shrink-0 min-w-[100px] border-l border-evofit-border pl-6">
                      <span className="text-[10px] text-evofit-text-muted font-black uppercase tracking-widest block mb-1">Total XP</span>
                      <span className={`text-xl md:text-2xl font-black flex items-center justify-end gap-1.5 ${isMe ? 'text-evofit-purple-main' : 'text-evofit-text-primary'}`}>
                        {(isMe || isTop10) && <Zap size={18} className="fill-current" />}
                        {u.xp.toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Action Arrow on Hover */}
                    <div className={`hidden md:flex items-center justify-center w-8 transition-all duration-300 ${hoveredUser === u.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                       <ChevronRight size={24} className="text-evofit-purple-main" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
