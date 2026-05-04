import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Crown, Flame, User, ChevronRight, Filter, Activity, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/auth';
import { useAuth } from '../context/AuthContext';

// Simplified Rank Info for SaaS look
const getRankInfo = (level) => {
  if (level >= 50) return { title: 'Titan', color: 'bg-purple-600', text: 'text-purple-600', bg: 'bg-purple-50' };
  if (level >= 30) return { title: 'Grandmaster', color: 'bg-rose-600', text: 'text-rose-600', bg: 'bg-rose-50' };
  if (level >= 20) return { title: 'Master', color: 'bg-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-50' };
  if (level >= 10) return { title: 'Elite', color: 'bg-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (level >= 5)  return { title: 'Challenger', color: 'bg-amber-600', text: 'text-amber-600', bg: 'bg-amber-50' };
  return { title: 'Novice', color: 'bg-slate-600', text: 'text-slate-600', bg: 'bg-slate-50' };
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
      <div className="flex items-center justify-center h-full bg-[#F8FAFC] min-h-screen">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-[#E5E7EB] border-t-[#7C3AED] rounded-full"
        />
      </div>
    );
  }

  if (!data || !data.leaderboard) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F8FAFC] min-h-screen">
        <p className="text-[#64748B] font-medium">No leaderboard data available.</p>
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
  const xpForNextLevel = currentLevel * 1000;
  const progressPct = Math.min(100, Math.max(0, (currentUserXP / xpForNextLevel) * 100));

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen font-inter pb-12">
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Leaderboard</h1>
          <p className="text-[#64748B] text-sm mt-1">Track global performance rankings</p>
        </header>

        {/* Your Rank Summary Card */}
        <div className="mb-12">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="flex flex-col items-center justify-center px-6 border-r border-[#E5E7EB]">
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">Your Rank</span>
                <span className="text-4xl font-bold text-[#7C3AED]">#{data?.current_user_rank > 0 ? data.current_user_rank : '—'}</span>
              </div>
              
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-full bg-[#F1F5F9] flex items-center justify-center text-xl font-bold text-[#0F172A] border border-[#E5E7EB]">
                  {(user?.username || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#0F172A]">{user?.username}</h2>
                    <span className="bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#22C55E]/20">
                      Top {101 - (data?.percentile || 0)}% globally
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#64748B]">Level {user?.level}</span>
                    <div className="w-32 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden border border-[#E5E7EB]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        className="h-full bg-[#7C3AED]"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#94A3B8]">{Math.round(progressPct)}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/upload')}
              className="w-full md:w-auto bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
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
                    className={`w-full bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm flex flex-col items-center transition-all hover:border-[#7C3AED]/30 cursor-pointer ${isFirst ? 'py-10 border-b-4 border-b-[#7C3AED]' : ''}`}
                  >
                    {isFirst && (
                      <div className="absolute -top-6">
                        <Crown size={32} className="text-[#F59E0B] drop-shadow-sm" />
                      </div>
                    )}
                    
                    <div className={`relative mb-4 ${isFirst ? 'w-24 h-24' : 'w-20 h-20'}`}>
                      <div className="w-full h-full rounded-full bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-3xl font-bold text-[#0F172A] shadow-inner">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm border-2 border-white ${isFirst ? 'bg-[#7C3AED]' : 'bg-[#94A3B8]'}`}>
                        {u.rank}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-[#0F172A] mb-1 truncate w-full text-center">{u.username}</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${rankInfo.text}`}>
                      Lvl {u.level} • {rankInfo.title}
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-[#0F172A] font-bold text-sm bg-[#F8FAFC] px-4 py-1.5 rounded-full border border-[#E5E7EB]">
                      <Zap size={14} className="text-[#7C3AED] fill-[#7C3AED]" />
                      {u.xp.toLocaleString()} XP
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Table Container */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs / Filters */}
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[#7C3AED]" />
              <h3 className="font-bold text-[#0F172A]">Global Rankings</h3>
            </div>
            
            <div className="flex p-1 bg-[#F1F5F9] rounded-lg">
              {['Daily', 'Weekly', 'All-time'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setTimeFilter(filter);
                    setLimit(50); // Reset limit when filter changes
                  }}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    timeFilter === filter 
                    ? 'bg-white text-[#7C3AED] shadow-sm' 
                    : 'text-[#64748B] hover:text-[#0F172A]'
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
                <tr className="bg-[#F8FAFC]">
                  <th className="px-6 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider text-center">Level</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {rest.map((u) => {
                  const isMe = u.is_current_user;
                  const rankInfo = getRankInfo(u.level);
                  const rowProgressPct = Math.min(100, (u.xp / (u.level * 1000)) * 100);

                  return (
                    <motion.tr 
                      key={u.id}
                      onClick={() => navigate(`/analytics`)}
                      className={`group transition-all hover:bg-[#F8FAFC] cursor-pointer ${isMe ? 'bg-[#7C3AED]/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${isMe ? 'text-[#7C3AED]' : 'text-[#64748B]'}`}>#{u.rank}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${isMe ? 'bg-[#7C3AED] text-white border-[#7C3AED]' : 'bg-[#F1F5F9] text-[#0F172A] border-[#E5E7EB]'}`}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#0F172A]">{u.username}</span>
                              {isMe && <span className="bg-[#7C3AED] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">You</span>}
                            </div>
                            <span className="text-[10px] text-[#64748B] font-medium tracking-wide uppercase">{rankInfo.title}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-bold text-[#0F172A]">{u.level}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden border border-[#E5E7EB]">
                          <div 
                            className={`h-full ${rankInfo.color}`} 
                            style={{ width: `${rowProgressPct}%` }} 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-sm font-bold text-[#0F172A]">{u.xp.toLocaleString()}</span>
                          <Zap size={14} className="text-[#94A3B8]" />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {data.total_count > limit && (
            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E5E7EB] text-center">
              <button 
                onClick={() => setLimit(prev => prev + 50)}
                disabled={fetchingMore}
                className="text-[11px] font-bold text-[#64748B] hover:text-[#7C3AED] transition-colors uppercase tracking-widest disabled:opacity-50"
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
