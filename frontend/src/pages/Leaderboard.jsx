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
          className="w-16 h-16 border-4 border-evofit-border border-t-amber-500 rounded-full"
        />
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

  if (!data || !data.leaderboard) {
    return (
      <div className="flex items-center justify-center h-full bg-evofit-bg-primary min-h-screen">
        <p className="text-white font-bold">No leaderboard data available.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 md:px-7 overflow-y-auto bg-evofit-bg-primary min-h-screen font-inter relative pb-24">
      
      {/* Background FX - Tighter and richer */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[20%] right-[5%] w-[500px] h-[500px] bg-evofit-purple-main/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        className="w-full max-w-[1200px] z-10 relative flex flex-col gap-10"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        
        {/* Header & Your Standing Card - Combined for reduced empty space */}
        <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
          
          {/* Header Title */}
          <motion.div variants={itemVariants} className="text-left lg:w-1/3 w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-evofit-purple-main to-evofit-purple-light flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)] border border-white/20">
                <Crown size={24} className="text-white drop-shadow-md" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-evofit-text-primary tracking-tighter m-0">
                HALL OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-evofit-purple-main to-evofit-purple-light">LEGENDS</span>
              </h1>
            </div>
            <p className="text-evofit-text-secondary text-base font-bold mt-3">
              Outlift, outlast, and ascend the ranks to forge your legacy.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="bg-evofit-bg-secondary border border-evofit-border px-4 py-2 rounded-lg flex items-center gap-2">
                 <Shield size={16} className="text-evofit-text-muted" />
                 <span className="text-sm font-black text-evofit-text-primary">{data?.leaderboard?.length || 0} Total Athletes</span>
              </div>
            </div>
          </motion.div>

          {/* Current User Dashboard Plate */}
          <motion.div variants={itemVariants} className="lg:w-2/3 w-full glass-card p-[2px] rounded-[24px] bg-gradient-to-r from-evofit-purple-main via-evofit-purple-light to-amber-500 shadow-[0_0_40px_rgba(124,58,237,0.2)] group hover:shadow-[0_0_60px_rgba(124,58,237,0.3)] transition-all duration-500">
            <div className="bg-evofit-bg-secondary rounded-[22px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 h-full relative overflow-hidden">
              
              {/* Internal glow */}
              <div className="absolute right-0 top-0 w-64 h-64 bg-evofit-purple-main/5 blur-[50px] rounded-full" />

              <div className="flex items-center gap-5 z-10 w-full md:w-auto">
                <div className="relative shrink-0">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentUserInfo.color} flex items-center justify-center text-white text-3xl font-black shadow-lg ${currentUserInfo.shadow} border-4 border-evofit-bg-secondary`}>
                    {(user?.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-evofit-bg-secondary flex items-center justify-center border border-evofit-border`}>
                     <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${currentUserInfo.color} flex items-center justify-center text-white font-black text-xs`}>
                        L{currentLevel}
                     </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-evofit-text-secondary text-xs font-black uppercase tracking-[0.1em] mb-1 flex items-center gap-1.5">
                    <Target size={14} className="text-evofit-purple-light" /> {currentUserInfo.title}
                  </p>
                  <h2 className="text-2xl font-black text-evofit-text-primary m-0 tracking-tight flex items-baseline gap-3">
                    Rank #{data?.current_user_rank}
                    <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Top {Math.max(1, Math.round((data?.current_user_rank / data?.leaderboard?.length) * 100))}%
                    </span>
                  </h2>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] font-black text-evofit-text-secondary mb-1 uppercase">
                      <span>{currentUserXP.toLocaleString()} XP</span>
                      <span>{Math.round(100 - progressPct)}% to next Level</span>
                    </div>
                    <div className="w-full h-2.5 bg-evofit-bg-primary rounded-full overflow-hidden border border-evofit-border">
                      <div 
                        className={`h-full bg-gradient-to-r ${currentUserInfo.color} shadow-[0_0_10px_rgba(255,255,255,0.3)] relative`}
                        style={{ width: `${progressPct}%` }}
                      >
                         <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 z-10">
                 <button 
                   onClick={() => navigate('/upload')}
                   className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                 >
                   <Flame size={18} /> Compete Now
                 </button>
                 <button 
                   onClick={() => navigate('/profile')}
                   className="w-full md:w-auto bg-evofit-bg-primary border border-evofit-border hover:bg-evofit-bg-secondary text-evofit-text-primary px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                 >
                   <User size={16} /> View Profile
                 </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 3D Podium Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end mt-4 md:mt-10 h-[auto] md:h-[350px] px-2 max-w-5xl mx-auto w-full">
          
          {/* 2nd Place (Silver) */}
          {top3[1] && (
            <motion.div variants={itemVariants} className="relative group md:order-1 order-2">
              <div className="absolute inset-0 bg-gradient-to-t from-[#E2E8F0]/10 to-transparent rounded-t-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="glass-card flex flex-col items-center p-8 border-t-4 border-t-[#CBD5E1] bg-gradient-to-b from-[#94A3B8]/10 to-evofit-bg-secondary relative z-10 transform md:translate-y-8 hover:-translate-y-2 transition-all duration-300 shadow-premium-card">
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-br from-[#F1F5F9] to-[#94A3B8] text-gray-900 flex items-center justify-center font-black text-xl shadow-lg border-4 border-evofit-bg-secondary">
                  2
                </div>
                <div className="w-20 h-20 mt-4 rounded-full bg-gradient-to-br from-[#E2E8F0] to-[#64748B] flex items-center justify-center text-3xl font-black text-gray-900 shadow-inner mb-3 border-2 border-white/20">
                  {top3[1].username.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-black text-evofit-text-primary mb-1 truncate w-full text-center tracking-tight">{top3[1].username}</h3>
                <p className="text-evofit-text-muted text-xs font-black uppercase tracking-widest mb-4">Lvl {top3[1].level} {getRankInfo(top3[1].level).title}</p>
                <div className="px-5 py-2 rounded-xl bg-evofit-bg-primary text-evofit-text-primary font-black text-sm border border-evofit-border w-full text-center flex items-center justify-center gap-1.5">
                  <Zap size={16} className="fill-evofit-text-muted text-evofit-text-muted" /> {top3[1].xp.toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          )}

          {/* 1st Place (Gold) */}
          {top3[0] && (
            <motion.div variants={itemVariants} className="relative group md:order-2 order-1 z-20">
              <div className="absolute inset-0 bg-gradient-to-t from-evofit-purple-main/20 to-transparent rounded-t-[40px] blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="glass-card flex flex-col items-center p-10 border-t-4 border-t-evofit-purple-main bg-gradient-to-b from-evofit-purple-main/20 to-evofit-bg-secondary relative transform hover:-translate-y-4 transition-all duration-300 shadow-premium-card">
                <div className="absolute -top-14 w-full flex justify-center animate-bounce-slow">
                   <Crown size={60} className="text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.9)]" />
                </div>
                <div className="absolute -top-6 w-16 h-16 rounded-full bg-gradient-to-br from-evofit-purple-light to-evofit-purple-main text-white flex items-center justify-center font-black text-3xl shadow-purple-glow border-4 border-evofit-bg-secondary">
                  1
                </div>
                <div className="w-24 h-24 mt-6 rounded-full bg-gradient-to-br from-evofit-purple-light to-evofit-purple-main flex items-center justify-center text-4xl font-black text-white shadow-inner mb-4 border-4 border-white/20">
                  {top3[0].username.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-2xl font-black text-evofit-text-primary mb-1 truncate w-full text-center tracking-tight">{top3[0].username}</h3>
                <p className="text-evofit-purple-main text-xs font-black uppercase tracking-[0.15em] mb-5">Lvl {top3[0].level} {getRankInfo(top3[0].level).title}</p>
                <div className="px-6 py-2.5 rounded-xl bg-evofit-purple-main/15 text-evofit-purple-main font-black text-lg border border-evofit-purple-main/40 w-full text-center flex items-center justify-center gap-2 shadow-sm">
                  <Flame size={20} className="fill-evofit-purple-main" /> {top3[0].xp.toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          )}

          {/* 3rd Place (Bronze) */}
          {top3[2] && (
            <motion.div variants={itemVariants} className="relative group md:order-3 order-3">
              <div className="absolute inset-0 bg-gradient-to-t from-[#B45309]/10 to-transparent rounded-t-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="glass-card flex flex-col items-center p-8 border-t-4 border-t-[#D97706] bg-gradient-to-b from-[#B45309]/10 to-evofit-bg-secondary relative z-10 transform md:translate-y-12 hover:-translate-y-2 transition-all duration-300 shadow-premium-card">
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#92400E] text-white flex items-center justify-center font-black text-xl shadow-lg border-4 border-evofit-bg-secondary">
                  3
                </div>
                <div className="w-20 h-20 mt-4 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#92400E] flex items-center justify-center text-3xl font-black text-white shadow-inner mb-3 border-2 border-white/20">
                  {top3[2].username.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-black text-evofit-text-primary mb-1 truncate w-full text-center tracking-tight">{top3[2].username}</h3>
                <p className="text-evofit-text-muted text-xs font-black uppercase tracking-widest mb-4">Lvl {top3[2].level} {getRankInfo(top3[2].level).title}</p>
                <div className="px-5 py-2 rounded-xl bg-evofit-bg-primary text-evofit-text-primary font-black text-sm border border-evofit-border w-full text-center flex items-center justify-center gap-1.5 shadow-sm">
                  <Zap size={16} className="fill-evofit-text-muted text-evofit-text-muted" /> {top3[2].xp.toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Global Competitors List (Rank Plates) */}
        <div className="w-full mx-auto flex flex-col gap-5 mt-4">
          
          {/* Controls / Filters */}
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

          {/* List Rows */}
          <motion.div variants={containerVariants} className="flex flex-col gap-3">
            {rest.map((u) => {
              const rankInfo = getRankInfo(u.level);
              const isMe = u.is_current_user;
              // Add blue accent for ranks 4-10
              const isTop10 = u.rank >= 4 && u.rank <= 10;
              const borderClass = isMe ? 'border-evofit-purple-main' : isTop10 ? 'border-evofit-purple-light/30' : 'border-evofit-border';
              const bgClass = isMe ? 'bg-gradient-to-r from-evofit-purple-main/10 to-evofit-bg-secondary' : isTop10 ? 'bg-gradient-to-r from-evofit-purple-light/5 to-evofit-bg-secondary' : 'bg-evofit-bg-secondary';
              
              const rowProgressPct = Math.min(100, (u.xp / (u.level * 1000)) * 100);

              return (
                <motion.div 
                  variants={plateVariants} 
                  key={u.id}
                  onMouseEnter={() => setHoveredUser(u.id)}
                  onMouseLeave={() => setHoveredUser(null)}
                  className={`relative overflow-hidden rounded-[20px] p-4 md:p-5 flex items-center justify-between gap-4 transition-all duration-300 cursor-pointer border
                    ${borderClass} ${bgClass}
                    ${isMe ? 'shadow-[0_0_20px_rgba(124,58,237,0.15)] scale-[1.01] z-10' : 'hover:bg-white/[0.04] hover:border-evofit-purple-light/40 hover:scale-[1.02] hover:z-20 hover:shadow-xl'}
                  `}
                >
                  <div className="flex items-center gap-4 md:gap-6 w-full relative z-10">
                    
                    {/* Rank Badge */}
                    <div className="w-16 text-center shrink-0">
                      <span className={`text-2xl font-black ${isMe ? 'text-amber-500' : isTop10 ? 'text-blue-400' : 'text-gray-500'}`}>#{u.rank}</span>
                    </div>

                    {/* Avatar & Info */}
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black shrink-0 shadow-inner
                        ${isMe ? 'bg-evofit-purple-main text-white border-2 border-evofit-purple-light' : `bg-gradient-to-br ${rankInfo.color} text-white border-2 border-evofit-bg-secondary`}`}
                      >
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                           <h4 className={`text-xl font-bold truncate m-0 ${isMe ? 'text-evofit-text-primary' : 'text-evofit-text-primary'}`}>
                             {u.username}
                           </h4>
                           {isMe && <span className="text-evofit-purple-main text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full bg-evofit-purple-main/10 border border-evofit-purple-main/30">You</span>}
                           {isTop10 && !isMe && <span className="text-evofit-purple-light text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full bg-evofit-purple-main/10 border border-evofit-purple-main/30">Top 10</span>}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2">
                           <p className={`text-xs font-black uppercase tracking-widest m-0 ${isMe ? 'text-evofit-purple-main' : 'text-evofit-text-muted'}`}>
                             {rankInfo.title}
                           </p>
                           {/* Mini Progress bar inside row */}
                           <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[200px]">
                              <span className="text-[10px] font-black text-evofit-text-muted uppercase">LVL {u.level}</span>
                              <div className="flex-1 h-1.5 bg-evofit-bg-primary rounded-full overflow-hidden border border-evofit-border">
                                 <div className={`h-full bg-gradient-to-r ${rankInfo.color}`} style={{ width: `${rowProgressPct}%` }} />
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Level Badge (Mobile fallback or explicit) */}
                    <div className="hidden md:flex flex-col items-center justify-center w-16">
                       <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1.5">Level</span>
                       <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center font-black text-lg text-gray-300 shadow-inner">
                         {u.level}
                       </div>
                    </div>

                    {/* Total XP */}
                    <div className="text-right shrink-0 min-w-[100px]">
                      <span className="text-[10px] text-evofit-text-muted font-black uppercase tracking-widest block mb-1">Total XP</span>
                      <span className={`text-xl md:text-2xl font-black flex items-center justify-end gap-1.5 ${isMe ? 'text-evofit-purple-main' : 'text-evofit-text-primary'}`}>
                        {isMe || isTop10 ? <Zap size={18} className={isMe ? "fill-evofit-purple-main" : "fill-evofit-purple-light/50"} /> : null}
                        {u.xp.toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Action Arrow on Hover */}
                    <div className={`hidden md:flex items-center justify-center w-8 transition-opacity duration-300 ${hoveredUser === u.id ? 'opacity-100' : 'opacity-0'}`}>
                       <ChevronRight size={24} className={isMe ? 'text-amber-500' : 'text-gray-500'} />
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
