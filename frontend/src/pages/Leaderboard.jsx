import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Crown, Flame, User, ChevronRight, Filter, Activity, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/auth';
import { useAuth } from '../context/AuthContext';

// Simplified Rank Info for SaaS look
const getRankInfo = (level) => {
  if (level >= 50) return { title: 'Titan', color: 'bg-purple-600', text: 'text-purple-600', bg: 'bg-purple-500/10' };
  if (level >= 30) return { title: 'Grandmaster', color: 'bg-rose-600', text: 'text-rose-600', bg: 'bg-rose-500/10' };
  if (level >= 20) return { title: 'Master', color: 'bg-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-500/10' };
  if (level >= 10) return { title: 'Elite', color: 'bg-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-500/10' };
  if (level >= 5)  return { title: 'Challenger', color: 'bg-amber-600', text: 'text-amber-600', bg: 'bg-amber-500/10' };
  return { title: 'Novice', color: 'bg-slate-600', text: 'text-slate-600', bg: 'bg-slate-500/10' };
};

export default function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [timeFilter, setTimeFilter] = useState('All-time');
  const [limit, setLimit] = useState(50);

  const fetchLeaderboard = async (filter, currentLimit) => {
    try {
      if (currentLimit > 50) setFetchingMore(true);
      else setLoading(true);

      const res = await api.get(`/users/leaderboard?timeframe=${filter}&limit=${currentLimit}`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(timeFilter, limit);
  }, [timeFilter, limit]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full bg-evofit-bg-primary min-h-screen">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-evofit-border border-t-evofit-purple-main rounded-full"
        />
      </div>
    );
  }

  if (!data || !data.leaderboard) {
    return (
      <div className="flex items-center justify-center h-full bg-evofit-bg-primary min-h-screen">
        <p className="text-evofit-text-muted font-medium">No leaderboard data available.</p>
      </div>
    );
  }

  const sortedLeaderboard = [...data.leaderboard].sort((a, b) => a.rank - b.rank);
  const top3 = sortedLeaderboard.slice(0, 3);
  const rest = sortedLeaderboard.slice(3);
  
  // Normalize podium for horizontal display: [2nd, 1st, 3rd]
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);

  const currentUserXP = data?.current_user_xp || 0;
  const currentLevel = user?.level || 1;
  const xpForNextLevel = Math.max(1, currentLevel) * 1000;
  const progressPct = Math.min(100, Math.max(0, (currentUserXP / xpForNextLevel) * 100));

  return (
    <div className="flex-1 bg-evofit-bg-primary min-h-screen font-inter pb-12">
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-evofit-text-primary tracking-tight">Leaderboard</h1>
          <p className="text-evofit-text-muted text-sm mt-1">Track global performance rankings</p>
        </header>

        {/* Your Rank Summary Card */}
        <div className="mb-12">
          <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="flex flex-col items-center justify-center px-6 border-r border-evofit-border">
                <span className="text-xs font-semibold text-evofit-text-muted uppercase tracking-wider mb-1">Your Rank</span>
                <span className="text-4xl font-bold text-evofit-purple-main">#{data?.current_user_rank > 0 ? data.current_user_rank : '—'}</span>
              </div>
              
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-full bg-evofit-bg-secondary flex items-center justify-center text-xl font-bold text-evofit-text-primary border border-evofit-border">
                  {(user?.username || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-evofit-text-primary">{user?.username}</h2>
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Top {101 - (data?.percentile || 0)}% globally
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs font-semibold text-evofit-text-muted">Level {user?.level}</span>
                    <div className="w-32 h-1.5 bg-evofit-bg-secondary rounded-full overflow-hidden border border-evofit-border">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        className="h-full bg-evofit-purple-main"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-evofit-text-muted">{Math.round(progressPct)}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/upload')}
              className="w-full md:w-auto bg-evofit-purple-main hover:bg-evofit-purple-light text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <Flame size={16} className="fill-white" />
              Compete Now
            </button>
          </div>
        </div>

        {/* Podium Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
            {podium.map((u, idx) => {
              const isFirst = u.rank === 1;
              const rankInfo = getRankInfo(u.level);
              
              return (
                <motion.div 
                  key={u.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative flex flex-col items-center ${isFirst ? 'order-1 md:order-2 z-10' : idx === 0 ? 'order-2 md:order-1' : 'order-3'}`}
                >
                  <div 
                    onClick={() => navigate(`/analytics`)} // Navigate to public profile/analytics
                    className={`w-full bg-evofit-bg-card border border-evofit-border rounded-2xl p-8 shadow-sm flex flex-col items-center transition-all hover:border-evofit-purple-main/30 cursor-pointer ${isFirst ? 'py-10 border-b-4 border-b-evofit-purple-main' : ''}`}
                  >
                    {isFirst && (
                      <div className="absolute -top-6">
                        <Crown size={32} className="text-amber-500 drop-shadow-sm" />
                      </div>
                    )}
                    
                    <div className={`relative mb-4 ${isFirst ? 'w-24 h-24' : 'w-20 h-20'}`}>
                      <div className="w-full h-full rounded-full bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center text-3xl font-bold text-evofit-text-primary shadow-inner">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm border-2 border-white dark:border-evofit-bg-card ${isFirst ? 'bg-evofit-purple-main' : 'bg-evofit-text-muted'}`}>
                        {u.rank}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-evofit-text-primary mb-1 truncate w-full text-center">{u.username}</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${rankInfo.text}`}>
                      Lvl {u.level} • {rankInfo.title}
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-evofit-text-primary font-bold text-sm bg-evofit-bg-secondary px-4 py-1.5 rounded-full border border-evofit-border">
                      <Zap size={14} className="text-evofit-purple-main fill-evofit-purple-main" />
                      {u.xp.toLocaleString()} XP
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Table Container */}
        <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs / Filters */}
          <div className="px-6 py-4 border-b border-evofit-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-evofit-purple-main" />
              <h3 className="font-bold text-evofit-text-primary">Global Rankings</h3>
            </div>
            
            <div className="flex p-1 bg-evofit-bg-secondary rounded-lg">
              {['Daily', 'Weekly', 'All-time'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setTimeFilter(filter);
                    setLimit(50); // Reset limit when filter changes
                  }}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    timeFilter === filter 
                    ? 'bg-evofit-bg-card text-evofit-purple-main shadow-sm' 
                    : 'text-evofit-text-muted hover:text-evofit-text-primary'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-evofit-bg-primary">
                  <th className="px-6 py-3 text-[10px] font-bold text-evofit-text-muted uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-evofit-text-muted uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-evofit-text-muted uppercase tracking-wider text-center">Level</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-evofit-text-muted uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-evofit-text-muted uppercase tracking-wider text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-evofit-border">
                {rest.map((u) => {
                  const isMe = u.is_current_user;
                  const rankInfo = getRankInfo(u.level);
                  const rowProgressPct = Math.min(100, (u.xp / (Math.max(1, u.level) * 1000)) * 100);

                  return (
                    <motion.tr 
                      key={u.id}
                      onClick={() => navigate(`/analytics`)}
                      className={`group transition-all hover:bg-evofit-bg-primary cursor-pointer ${isMe ? 'bg-evofit-purple-main/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${isMe ? 'text-evofit-purple-main' : 'text-evofit-text-muted'}`}>#{u.rank}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${isMe ? 'bg-evofit-purple-main text-white border-evofit-purple-main' : 'bg-evofit-bg-secondary text-evofit-text-primary border-evofit-border'}`}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-evofit-text-primary">{u.username}</span>
                              {isMe && <span className="bg-evofit-purple-main text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">You</span>}
                            </div>
                            <span className="text-[10px] text-evofit-text-muted font-medium tracking-wide uppercase">{rankInfo.title}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-bold text-evofit-text-primary">{u.level}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32 h-1.5 bg-evofit-bg-secondary rounded-full overflow-hidden border border-evofit-border">
                          <div 
                            className={`h-full ${rankInfo.color}`} 
                            style={{ width: `${rowProgressPct}%` }} 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-sm font-bold text-evofit-text-primary">{u.xp.toLocaleString()}</span>
                          <Zap size={14} className="text-evofit-text-muted" />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {data.total_count > limit && (
            <div className="px-6 py-4 bg-evofit-bg-primary border-t border-evofit-border text-center">
              <button 
                onClick={() => setLimit(prev => prev + 50)}
                disabled={fetchingMore}
                className="text-[11px] font-bold text-evofit-text-muted hover:text-evofit-purple-main transition-colors uppercase tracking-widest disabled:opacity-50"
              >
                {fetchingMore ? 'Loading...' : 'View More Rankings'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
