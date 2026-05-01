import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Shield, ArrowUp, Zap, Crown, Flame, Target } from 'lucide-react';
import api from '../api/auth';
import { useAuth } from '../context/AuthContext';

// Helper to determine rank title and color based on Level
const getRankInfo = (level) => {
  if (level >= 50) return { title: 'Titan', color: 'from-fuchsia-500 to-purple-600', shadow: 'shadow-fuchsia-500/50' };
  if (level >= 30) return { title: 'Grandmaster', color: 'from-red-500 to-rose-600', shadow: 'shadow-rose-500/50' };
  if (level >= 20) return { title: 'Master', color: 'from-blue-400 to-indigo-600', shadow: 'shadow-blue-500/50' };
  if (level >= 10) return { title: 'Elite', color: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/50' };
  if (level >= 5)  return { title: 'Challenger', color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/50' };
  return { title: 'Novice', color: 'from-slate-400 to-slate-600', shadow: 'shadow-slate-500/50' };
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredUser, setHoveredUser] = useState(null);

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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  const plateVariants = {
    hidden: { opacity: 0, x: -50 },
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

  const top3 = data?.leaderboard?.slice(0, 3) || [];
  const rest = data?.leaderboard?.slice(3) || [];
  const currentUserInfo = getRankInfo(user?.level || 1);

  return (
    <div className="flex-1 flex flex-col items-center py-6 md:py-12 px-4 md:px-7 overflow-y-auto bg-[#0A0A0A] min-h-screen font-inter relative">
      
      {/* Background FX */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-evofit-purple-main/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        className="w-full max-w-5xl z-10 relative"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        
        {/* Header Area */}
        <motion.div variants={itemVariants} className="text-center mb-16 relative">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(245,158,11,0.4)] rotate-3 border border-amber-300/50"
          >
            <Crown size={40} className="text-white drop-shadow-md" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tighter mb-4 uppercase">
            Hall of Legends
          </h1>
          <p className="text-evofit-text-secondary text-lg max-w-xl mx-auto font-medium">
            The global arena. Outlift, outlast, and ascend the ranks to forge your legacy.
          </p>
        </motion.div>

        {/* Current User Dashboard Plate */}
        <motion.div variants={itemVariants} className="glass-card p-1 mb-16 rounded-[24px] bg-gradient-to-r from-evofit-purple-main/40 via-fuchsia-500/20 to-evofit-purple-main/40 shadow-[0_0_40px_rgba(124,58,237,0.15)] group hover:shadow-[0_0_60px_rgba(124,58,237,0.3)] transition-all duration-500">
          <div className="bg-[#121212] rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentUserInfo.color} flex items-center justify-center text-white text-3xl font-black shadow-lg ${currentUserInfo.shadow} border-4 border-[#121212]`}>
                  {(user?.username || '?').charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-[#121212] flex items-center justify-center">
                   <div className="w-8 h-8 rounded-full bg-evofit-purple-main flex items-center justify-center text-white font-black text-sm">
                      L{user?.level || 1}
                   </div>
                </div>
              </div>
              <div>
                <p className="text-evofit-purple-light text-xs font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                  <Target size={14} /> {currentUserInfo.title} Rank
                </p>
                <h2 className="text-3xl font-black text-white m-0 tracking-tight">Your Standing</h2>
                <p className="text-evofit-text-secondary mt-1 font-medium">Top {Math.max(1, Math.round((data?.current_user_rank / data?.leaderboard?.length) * 100))}% globally</p>
              </div>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
               <div className="flex-1 md:flex-none bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[120px]">
                  <p className="text-evofit-text-muted text-[10px] font-black uppercase tracking-widest mb-1">Global Rank</p>
                  <p className="text-3xl font-black text-white m-0">#{data?.current_user_rank}</p>
               </div>
               <div className="flex-1 md:flex-none bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[120px]">
                  <p className="text-amber-500/70 text-[10px] font-black uppercase tracking-widest mb-1">Total Power (XP)</p>
                  <p className="text-3xl font-black text-amber-400 m-0 flex items-center gap-1">
                    <Zap size={20} className="fill-amber-400" /> {data?.current_user_xp?.toLocaleString()}
                  </p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* 3D Podium Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-end mb-16 h-[auto] md:h-[350px] px-4">
          
          {/* 2nd Place (Silver) */}
          {top3[1] && (
            <motion.div variants={itemVariants} className="relative group md:order-1 order-2">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-400/20 to-transparent rounded-t-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="glass-card flex flex-col items-center p-8 border-t-4 border-t-gray-300 bg-gradient-to-b from-gray-400/10 to-transparent relative z-10 transform md:translate-y-12 hover:-translate-y-4 transition-all duration-500 cursor-default">
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-gray-300 text-black flex items-center justify-center font-black text-xl shadow-[0_0_30px_rgba(209,213,219,0.5)] border-4 border-[#121212]">
                  2
                </div>
                <div className="w-20 h-20 mt-4 rounded-2xl bg-[#1A1A1A] border border-gray-500/30 flex items-center justify-center text-4xl font-black text-gray-300 shadow-inner mb-4">
                  {top3[1].username.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-black text-white mb-1 truncate w-full text-center">{top3[1].username}</h3>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">Lvl {top3[1].level} {getRankInfo(top3[1].level).title}</p>
                <div className="px-4 py-1.5 rounded-xl bg-gray-400/10 text-gray-300 font-black text-sm border border-gray-400/20 w-full text-center">
                  {top3[1].xp.toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          )}

          {/* 1st Place (Gold) */}
          {top3[0] && (
            <motion.div variants={itemVariants} className="relative group md:order-2 order-1 z-20">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-400/30 to-transparent rounded-t-[40px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="glass-card flex flex-col items-center p-10 border-t-4 border-t-amber-400 bg-gradient-to-b from-amber-500/10 to-[#121212] relative transform hover:-translate-y-6 transition-all duration-500 cursor-default shadow-[0_-10px_40px_rgba(245,158,11,0.15)]">
                <div className="absolute -top-14 w-full flex justify-center">
                   <Crown size={60} className="text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" />
                </div>
                <div className="absolute -top-6 w-16 h-16 rounded-full bg-amber-400 text-black flex items-center justify-center font-black text-3xl shadow-[0_0_40px_rgba(245,158,11,0.8)] border-4 border-[#121212]">
                  1
                </div>
                <div className="w-24 h-24 mt-6 rounded-[2rem] bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-5xl font-black text-white shadow-inner mb-5 border-2 border-amber-200/50">
                  {top3[0].username.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-2xl font-black text-white mb-1 truncate w-full text-center">{top3[0].username}</h3>
                <p className="text-amber-500 text-[13px] font-black uppercase tracking-[0.2em] mb-5">Lvl {top3[0].level} {getRankInfo(top3[0].level).title}</p>
                <div className="px-6 py-2 rounded-xl bg-amber-400/20 text-amber-400 font-black text-lg border border-amber-400/40 w-full text-center flex items-center justify-center gap-2">
                  <Flame size={20} className="fill-amber-400" /> {top3[0].xp.toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          )}

          {/* 3rd Place (Bronze) */}
          {top3[2] && (
            <motion.div variants={itemVariants} className="relative group md:order-3 order-3">
              <div className="absolute inset-0 bg-gradient-to-t from-orange-700/20 to-transparent rounded-t-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="glass-card flex flex-col items-center p-8 border-t-4 border-t-[#CD7F32] bg-gradient-to-b from-[#CD7F32]/10 to-transparent relative z-10 transform md:translate-y-20 hover:-translate-y-4 transition-all duration-500 cursor-default">
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-[#CD7F32] text-white flex items-center justify-center font-black text-xl shadow-[0_0_30px_rgba(205,127,50,0.5)] border-4 border-[#121212]">
                  3
                </div>
                <div className="w-20 h-20 mt-4 rounded-2xl bg-[#1A1A1A] border border-[#CD7F32]/30 flex items-center justify-center text-4xl font-black text-[#CD7F32] shadow-inner mb-4">
                  {top3[2].username.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-black text-white mb-1 truncate w-full text-center">{top3[2].username}</h3>
                <p className="text-[#CD7F32] text-sm font-bold uppercase tracking-widest mb-4">Lvl {top3[2].level} {getRankInfo(top3[2].level).title}</p>
                <div className="px-4 py-1.5 rounded-xl bg-[#CD7F32]/10 text-[#CD7F32] font-black text-sm border border-[#CD7F32]/20 w-full text-center">
                  {top3[2].xp.toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Global Competitors List (Rank Plates) */}
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Shield size={20} className="text-evofit-text-muted" />
            <h3 className="text-lg font-black text-evofit-text-primary m-0 uppercase tracking-widest">The Vanguard</h3>
            <div className="h-px bg-evofit-border flex-1 ml-4" />
          </div>

          <motion.div variants={containerVariants} className="flex flex-col gap-3">
            {rest.map((u) => {
              const rankInfo = getRankInfo(u.level);
              const isMe = u.is_current_user;
              return (
                <motion.div 
                  variants={plateVariants} 
                  key={u.id}
                  onMouseEnter={() => setHoveredUser(u.id)}
                  onMouseLeave={() => setHoveredUser(null)}
                  className={`relative overflow-hidden glass-card p-4 md:p-5 flex items-center justify-between gap-4 transition-all duration-300 cursor-default
                    ${isMe ? 'bg-evofit-purple-main/10 border-evofit-purple-main shadow-[0_0_20px_rgba(124,58,237,0.15)] scale-[1.02] z-10' : 'hover:bg-white/[0.04] hover:border-white/20 hover:scale-[1.01] hover:z-20'}
                  `}
                >
                  {/* Hover Glow */}
                  <AnimatePresence>
                    {hoveredUser === u.id && !isMe && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" 
                      />
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-4 md:gap-6 w-full relative z-10">
                    <div className="w-12 text-center shrink-0">
                      <span className={`text-xl font-black ${isMe ? 'text-evofit-purple-light' : 'text-evofit-text-muted'}`}>#{u.rank}</span>
                    </div>

                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0 border-2 shadow-inner
                        ${isMe ? 'bg-evofit-purple-main text-white border-evofit-purple-light' : `bg-[#1A1A1A] text-white border-gray-700`}`}
                      >
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-lg font-bold truncate m-0 ${isMe ? 'text-white' : 'text-gray-200'}`}>
                          {u.username} {isMe && <span className="text-evofit-purple-light text-[10px] ml-2 uppercase tracking-widest font-black px-2 py-0.5 rounded-full bg-evofit-purple-main/20 border border-evofit-purple-main/30">You</span>}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 truncate">
                          {rankInfo.title}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col items-end justify-center mr-6">
                       <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Level</span>
                       <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-sm text-gray-300">
                         {u.level}
                       </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-1">Total XP</span>
                      <span className={`text-lg md:text-xl font-black flex items-center justify-end gap-1 ${isMe ? 'text-evofit-purple-light' : 'text-white'}`}>
                        {isMe ? <Zap size={16} className="fill-evofit-purple-light" /> : null}
                        {u.xp.toLocaleString()}
                      </span>
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
