import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, ComposedChart, Cell, PieChart, Pie
} from 'recharts';
import { 
  Activity, Dumbbell, Award, Flame, TrendingUp, Plus, 
  ChevronRight, Sparkles, Trophy, Bell, Clock, ShieldCheck, AlertCircle, Zap
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const EXERCISE_COLORS = {
  bench: '#7C3AED',
  dead: '#3B82F6',
  squat: '#34D399',
  ohp: '#F472B6',
  row: '#9CA3AF'
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-evofit-bg-primary">
        <div className="w-12 h-12 border-4 border-evofit-border border-t-evofit-purple-main rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, trend_data, recent_sessions, distribution, targets, insights } = data || {};

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-7 overflow-y-auto bg-evofit-bg-primary min-h-screen font-inter">
      {/* ── CENTRAL ARTBOARD (1440px) ─────────────────────────────────── */}
      <div className="evofit-page-container">
        
        {/* ── TOP HEADER (Welcome) ─────────────────────────────────────────── */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-[32px] font-extrabold m-0 tracking-tight text-evofit-text-primary">
              Welcome back, Alex 👋
            </h1>
            <p className="text-evofit-text-secondary text-base m-0 mt-1 font-medium">
              Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Your training performance is peaking.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 rounded-xl bg-evofit-bg-secondary border border-evofit-border text-[13px] font-bold text-evofit-text-secondary">
                UK-S1 <span className="ml-1 text-evofit-text-muted">Pro</span>
             </div>
             <button className="premium-gradient text-white px-6 py-2.5 rounded-xl font-bold text-[14px] shadow-purple-glow hover:-translate-y-0.5 transition-all">
                Go Premium
             </button>
          </div>
        </div>

        {/* ── XP LEVEL PROGRESS BAR ────────────────────────────────────────── */}
        {data?.user_progression && (
          <div className="glass-card p-6 mb-7 flex items-center justify-between gap-6 shadow-premium-card animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0 group-hover:scale-105 transition-transform">
                <Trophy size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="m-0 text-[18px] font-extrabold text-evofit-text-primary flex items-center gap-2">
                  Level {data.user_progression.level} <Zap size={16} className="text-amber-500 fill-amber-500" />
                </h3>
                <p className="m-0 text-[13px] text-evofit-text-muted font-medium">Keep hitting targets to rank up</p>
              </div>
            </div>
            <div className="flex-1 max-w-[500px]">
              <div className="flex justify-between text-[12px] font-bold text-evofit-text-secondary mb-2">
                <span>{data.user_progression.xp.toLocaleString()} XP</span>
                <span>{data.user_progression.xp_to_next_level.toLocaleString()} XP</span>
              </div>
              <div className="h-3 w-full bg-evofit-bg-secondary border border-evofit-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (data.user_progression.xp / data.user_progression.xp_to_next_level) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── HERO KPI ROW (4 Cards) ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7 mb-7">
          
          {/* KPI 1: Total Reps */}
          <div className="glass-card p-7 shadow-premium-card hover:border-evofit-purple-main/30 transition-all group relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[13px] text-evofit-text-muted font-bold uppercase tracking-widest m-0">This Week's Reps</p>
                <div className="w-9 h-9 rounded-lg bg-evofit-purple-main/10 flex items-center justify-center text-evofit-purple-light group-hover:scale-110 transition-transform">
                   <Dumbbell size={18} />
                </div>
             </div>
             <div className="flex items-end gap-2.5">
                <h2 className="text-[36px] font-extrabold m-0 text-evofit-text-primary tracking-tighter">
                  {kpis?.total_reps_lifted?.toLocaleString() || 0}
                </h2>
                {kpis?.total_reps_lifted > 0 && (
                  <div className="flex items-center gap-1 text-[13px] text-cyan-400 font-bold mb-2">
                     <TrendingUp size={14} /> Tracking
                  </div>
                )}
             </div>
           </div>

          {/* KPI 2: Avg Form Score */}
          <div className="glass-card p-7 shadow-premium-card hover:border-evofit-purple-main/30 transition-all group">
             <div className="flex justify-between items-start mb-1">
                <p className="text-[13px] text-evofit-text-muted font-bold uppercase tracking-widest m-0">Avg. Form Score</p>
                <div className="w-[45px] h-[45px]">
                   <CircularProgressbar
                      value={kpis?.avg_form_score || 0}
                      strokeWidth={12}
                      styles={buildStyles({
                        pathColor: `#22D3EE`,
                        trailColor: 'rgba(255,255,255,0.05)',
                        strokeLinecap: 'round',
                      })}
                   />
                </div>
             </div>
             <div className="flex items-end gap-2.5">
                <h2 className="text-[36px] font-extrabold m-0 text-evofit-text-primary tracking-tighter">
                  {kpis?.avg_form_score > 0 ? `${kpis.avg_form_score}%` : '0%'}
                </h2>
                <p className="text-[12px] text-evofit-text-muted mb-2 font-bold">
                  {kpis?.avg_form_score >= 90 ? 'Excellent' : kpis?.avg_form_score >= 70 ? 'Good' : 'N/A'}
                </p>
             </div>
           </div>

          {/* KPI 3: Consistency */}
          <div className="glass-card p-7 shadow-premium-card border-evofit-purple-main/40 bg-evofit-purple-main/[0.03] hover:bg-evofit-purple-main/[0.05] transition-all group">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[13px] text-evofit-purple-light font-bold uppercase tracking-widest m-0">Consistency</p>
                <div className="flex gap-0.5 items-end h-6">
                   {kpis?.consistency_score > 0 ? (
                     [4, 7, 5, 9, 6].map((h, i) => (
                       <div key={i} className="w-1 bg-evofit-purple-main/40 rounded-full" style={{ height: `${h * 10}%` }} />
                     ))
                   ) : (
                     <Activity size={16} className="text-evofit-text-muted" />
                   )}
                </div>
             </div>
             <div className="flex items-end gap-2.5">
                <h2 className="text-[36px] font-extrabold m-0 text-evofit-text-primary tracking-tighter">
                  {kpis?.consistency_score > 0 ? `${kpis.consistency_score}%` : '0%'}
                </h2>
             </div>
           </div>

          {/* KPI 4: Streak */}
          <div className="glass-card p-7 shadow-premium-card hover:border-amber-500/30 transition-all group">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[13px] text-evofit-text-muted font-bold uppercase tracking-widest m-0">Active Streak</p>
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                   <Flame size={20} className={kpis?.active_streak > 0 ? "fill-amber-500" : ""} />
                </div>
             </div>
             <div className="flex items-end gap-2.5">
                <h2 className="text-[36px] font-extrabold m-0 text-evofit-text-primary tracking-tighter">
                  {kpis?.active_streak || 0} Days
                </h2>
                {kpis?.active_streak > 10 && (
                  <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 font-black mb-2 uppercase">Record High</div>
                )}
             </div>
           </div>
        </div>

        {/* ── QUICK UPLOAD + LAST SESSION ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-7 mb-7">
           <div 
             onClick={() => navigate('/upload')}
             className="glass-card p-10 border-2 border-dashed border-evofit-border flex flex-col items-center justify-center text-center hover:border-evofit-purple-main/50 transition-all group cursor-pointer"
           >
              <div className="w-[70px] h-[70px] rounded-full bg-evofit-purple-main/10 flex items-center justify-center mb-6 shadow-purple-glow">
                 <Plus size={32} className="text-evofit-purple-light group-hover:rotate-90 transition-transform duration-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-evofit-text-primary mb-2">Quick Upload Session</h3>
              <p className="text-evofit-text-secondary text-sm max-w-[400px] mb-8 leading-relaxed">
                 Drop your training footage here. Our AI will analyze your form, reps, and intensity in real-time.
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/upload'); }}
                className="premium-gradient text-white px-10 py-3.5 rounded-xl font-bold text-base shadow-lg hover:-translate-y-1 transition-all"
              >
                 Browse Files
              </button>
           </div>

           {recent_sessions?.length > 0 ? (
             <div className="glass-card p-8 shadow-premium-card flex flex-col">
                <h4 className="text-[14px] font-bold text-evofit-text-muted uppercase tracking-widest mb-6">Last Session Summary</h4>
                <div className="flex-1 space-y-7">
                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[12px] text-evofit-text-muted font-bold m-0 uppercase mb-1">
                           {recent_sessions[0].exercise === 'dead' ? 'Leg Hypertrophy A' : recent_sessions[0].exercise === 'bench' ? 'Peak Strength Base' : 'Full Volume B'}
                         </p>
                         <p className="text-[11px] text-evofit-text-muted m-0 font-medium">
                           {new Date(recent_sessions[0].date).toLocaleDateString()} · {recent_sessions[0].form_score >= 90 ? 'High Intensity' : 'Standard'}
                         </p>
                      </div>
                      <div className="px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-[11px] text-cyan-400 font-black uppercase">
                         {recent_sessions[0].form_score}% Form
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6">
                      <div className="bg-evofit-bg-secondary p-4 rounded-2xl border border-evofit-border">
                         <p className="text-[10px] text-evofit-text-muted font-bold uppercase mb-1">Replay</p>
                         <p className="text-lg font-black text-evofit-text-primary m-0">Available</p>
                      </div>
                      <div className="bg-evofit-bg-secondary p-4 rounded-2xl border border-evofit-border">
                         <p className="text-[10px] text-evofit-text-muted font-bold uppercase mb-1">Total Reps</p>
                         <p className="text-lg font-black text-evofit-text-primary m-0">{recent_sessions[0].reps} Reps</p>
                      </div>
                   </div>

                   <div className="p-4 rounded-2xl bg-evofit-purple-main/5 border border-evofit-purple-main/15 flex items-start gap-3">
                      <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-evofit-text-secondary leading-relaxed m-0 font-medium">
                         Consistent rhythm detected throughout the set. Excellent mechanical tension.
                      </p>
                   </div>

                   <button 
                      onClick={() => navigate('/analytics')}
                      className="w-full bg-evofit-bg-secondary border border-evofit-border py-3.5 rounded-xl text-[13px] font-bold text-evofit-text-primary hover:border-evofit-purple-main/40 transition-all"
                   >
                      View Session Breakdown
                   </button>
                </div>
             </div>
           ) : (
             <div className="glass-card p-8 shadow-premium-card flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-evofit-bg-secondary flex items-center justify-center mb-4 text-evofit-text-muted">
                   <Clock size={20} />
                </div>
                <h4 className="text-[14px] font-bold text-evofit-text-primary mb-1">No Activity Logged</h4>
                <p className="text-[12px] text-evofit-text-muted">Start training to see your latest session highlights here.</p>
             </div>
           )}
        </div>

        {/* ── PERFORMANCE TREND CHART (Area + Line) ────────────────────── */}
        <div className="glass-card p-9 mb-7 shadow-premium-card overflow-hidden">
           <div className="flex justify-between items-start mb-10">
              <div>
                 <h3 className="text-[22px] font-extrabold text-evofit-text-primary m-0 tracking-tight">Last 7 Days Performance Trend</h3>
                 <p className="text-sm text-evofit-text-muted m-0 mt-1 font-medium italic">Correlation between total volume and mechanical form score</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2.5 cursor-pointer">
                    <div className="w-10 h-1 rounded-full bg-evofit-purple-main shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                    <span className="text-[11px] font-black text-evofit-text-muted uppercase tracking-widest hover:text-evofit-text-primary transition-colors">Volume Trend (Area Fill)</span>
                 </div>
                 <div className="flex items-center gap-2.5 cursor-pointer">
                    <div className="w-10 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    <span className="text-[11px] font-black text-evofit-text-muted uppercase tracking-widest hover:text-evofit-text-primary transition-colors">Form Quality (Light Beam)</span>
                 </div>
              </div>
           </div>

           <div className="h-[380px] w-full mt-5 relative px-2">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={trend_data || []}>
                    <defs>
                      <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                         <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
                    <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }} 
                       dy={15}
                    />
                    <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }} 
                       domain={[0, 'auto']}
                    />
                    <Tooltip 
                       cursor={{ fill: 'rgba(124,58,237,0.05)', radius: 12 }}
                       contentStyle={{ 
                          background: 'var(--bg-card)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '16px', 
                          boxShadow: 'var(--card-shadow)',
                          fontSize: '14px',
                          color: 'var(--text-primary)',
                          fontWeight: 700
                       }}
                       itemStyle={{ color: 'var(--purple-main)' }}
                    />
                    <Area 
                       type="monotone" 
                       dataKey="reps" 
                       fill="url(#colorArea)" 
                       stroke="#A78BFA" 
                       strokeWidth={3} 
                       animationDuration={2000}
                    />
                    <Line 
                       type="monotone" 
                       dataKey="quality" 
                       stroke="#22D3EE" 
                       strokeWidth={3} 
                       dot={{ fill: '#22D3EE', r: 5, strokeWidth: 2, stroke: 'var(--bg-card)' }}
                       activeDot={{ r: 8, fill: '#22D3EE', stroke: 'white', strokeWidth: 2 }}
                       animationDuration={2500}
                    />
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* ── WEEKLY TARGETS GRID ────────────────────────────────────────── */}
        <div className="mb-[60px]">
            <div className="flex justify-between items-center mb-7">
               <div>
                  <h3 className="text-xl font-extrabold text-evofit-text-primary m-0 tracking-tight">Your Weekly Targets</h3>
                  <p className="text-sm text-evofit-text-muted m-0 font-medium">Track your progression against predefined goals</p>
               </div>
               <button 
                 onClick={() => navigate('/targets')}
                 className="text-evofit-purple-light text-sm font-bold flex items-center gap-1.5 hover:underline"
               >
                  View in targets <ChevronRight size={16} />
               </button>
            </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {targets?.length > 0 ? (
                targets.map((t, i) => (
                  <div key={i} className="glass-card p-6 shadow-premium-card border-evofit-border hover:border-evofit-purple-main/30 transition-all flex flex-col gap-4">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                           <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-evofit-purple-light">
                              {t.icon_type === 'activity' ? <Activity size={18} /> : <TrendingUp size={18} />}
                           </div>
                           <span className="text-[14px] font-bold text-evofit-text-primary">{t.label}</span>
                        </div>
                        <span className="text-[12px] font-black text-evofit-purple-light">{t.completion_pct}%</span>
                     </div>
                     <div className="h-2 bg-evofit-bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-evofit-purple-main rounded-full animate-fill-in duration-[1500ms]" style={{ width: `${t.completion_pct}%` }} />
                     </div>
                     <div className="flex justify-between items-center mt-1">
                        <p className="text-[11px] text-evofit-text-muted m-0 font-medium">{t.reps_done} / {t.reps_target} reps</p>
                        <p className="text-[9px] text-evofit-text-muted font-bold uppercase">Tracking</p>
                     </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center glass-card border-evofit-border group hover:border-evofit-purple-main/30 transition-all">
                   <div className="w-12 h-12 rounded-xl bg-evofit-bg-secondary flex items-center justify-center text-evofit-text-muted mb-4">
                      <Award size={24} />
                   </div>
                   <h4 className="text-[15px] font-bold text-evofit-text-primary mb-1">No Active Targets</h4>
                   <p className="text-[13px] text-evofit-text-muted mb-6">Set weekly goals to track your progression here.</p>
                   <button 
                     onClick={() => navigate('/targets')}
                     className="bg-evofit-bg-secondary border border-evofit-border px-5 py-2 rounded-xl text-[12px] font-bold text-evofit-text-primary hover:text-evofit-purple-light hover:border-evofit-purple-main/40 transition-all"
                   >
                      Setup My First Target
                   </button>
                </div>
              )}
           </div>
        </div>

        {/* ── RECENT SESSIONS & INSIGHTS ─────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1.2fr] gap-8 mb-[60px]">
           
           {/* Section Left: Recent Sessions Table */}
           <div className="glass-card p-9 shadow-premium-card">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-xl font-extrabold text-evofit-text-primary m-0 tracking-tight">Recent Sessions</h3>
                    <p className="text-xs text-evofit-text-muted mt-0.5 font-bold uppercase tracking-wider">Viewing Last 5 Events</p>
                 </div>
                 <button 
                   onClick={() => navigate('/history')}
                   className="text-evofit-purple-light text-sm font-bold flex items-center gap-1.5 hover:underline"
                 >
                    View history <ChevronRight size={16} />
                 </button>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-evofit-border">
                          <th className="pb-4 text-[12px] font-black text-evofit-text-muted uppercase tracking-widest pl-2">Workout Name</th>
                          <th className="pb-4 text-[12px] font-black text-evofit-text-muted uppercase tracking-widest px-4">Volume</th>
                          <th className="pb-4 text-[12px] font-black text-evofit-text-muted uppercase tracking-widest px-4">Avg. Form</th>
                          <th className="pb-4 text-[12px] font-black text-evofit-text-muted uppercase tracking-widest px-4">Trend</th>
                          <th className="pb-4 text-[12px] font-black text-evofit-text-muted uppercase tracking-widest text-right pr-2">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {recent_sessions?.length > 0 ? (
                         recent_sessions.map((session, i) => (
                          <tr key={session.id} className="group hover:bg-white/[0.02] transition-colors">
                             <td className="py-5 pl-2">
                                <p className="text-[14px] font-bold text-evofit-text-primary m-0">
                                  {session.exercise === 'dead' ? 'Leg Hypertrophy A' : session.exercise === 'bench' ? 'Peak Strength Base' : 'Full Volume B'}
                                </p>
                                <p className="text-[11px] text-evofit-text-muted m-0 mt-0.5 uppercase font-bold tracking-tighter">
                                  {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                             </td>
                             <td className="py-5 px-4 font-extrabold text-[15px] text-evofit-text-primary whitespace-nowrap">
                                {session.reps} Reps
                             </td>
                             <td className="py-5 px-4">
                                <div className="flex items-center gap-3">
                                   <span className={`text-[13px] font-bold ${session.form_score >= 90 ? 'text-cyan-400' : 'text-amber-400'}`}>{session.form_score}%</span>
                                   <div className="w-24 h-1.5 bg-evofit-bg-secondary rounded-full overflow-hidden hidden md:block">
                                      <div className={`h-full rounded-full ${session.form_score >= 90 ? 'bg-cyan-400' : 'bg-amber-400'}`} style={{ width: `${session.form_score}%` }} />
                                   </div>
                                </div>
                             </td>
                             <td className="py-5 px-4">
                                <div className="w-16 h-8">
                                   <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={session.sparkline_data.map((v, idx) => ({ v, idx }))}>
                                         <Line 
                                           type="monotone" 
                                           dataKey="v" 
                                           stroke={session.form_score >= 90 ? '#22D3EE' : '#FBBF24'} 
                                           strokeWidth={2} 
                                           dot={false} 
                                           animationDuration={2000}
                                         />
                                      </LineChart>
                                   </ResponsiveContainer>
                                </div>
                             </td>
                             <td className="py-5 text-right pr-2">
                                <button 
                                  onClick={() => navigate('/analytics')}
                                  className="w-8 h-8 rounded-lg bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center text-evofit-text-muted group-hover:text-evofit-purple-light group-hover:border-evofit-purple-main transition-all"
                                >
                                   <ChevronRight size={16} />
                                </button>
                             </td>
                          </tr>
                         ))
                       ) : (
                         <tr>
                           <td colSpan="5" className="py-12 text-center">
                              <p className="text-evofit-text-muted text-[13px] italic font-medium">No results found in your training history.</p>
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Section Right: Key Insights */}
           <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-evofit-purple-main/10 flex items-center justify-center text-evofit-purple-light">
                    <Sparkles size={18} />
                 </div>
                 <h3 className="text-xl font-extrabold text-evofit-text-primary m-0 tracking-tight">Key Insights</h3>
              </div>
              
              <div className="space-y-5">
                 {insights?.length > 0 ? (
                    insights.map((insight, i) => (
                      <div key={i} className="glass-card p-6 border-evofit-border hover:border-evofit-purple-main/30 transition-all flex items-start gap-4">
                         <div className="w-12 h-12 rounded-[16px] bg-evofit-bg-secondary flex items-center justify-center shrink-0 border border-evofit-border">
                            <Sparkles size={20} className="text-evofit-purple-light" />
                         </div>
                         <div>
                            <p className="text-[15px] font-extrabold text-evofit-text-primary m-0 mb-1">AI Observation</p>
                            <p className="text-[13px] text-evofit-text-secondary m-0 leading-relaxed font-medium">{insight}</p>
                         </div>
                      </div>
                    ))
                 ) : (
                    <div className="glass-card p-6 border-evofit-border flex flex-col items-center justify-center text-center py-10">
                       <div className="w-10 h-10 rounded-full bg-evofit-bg-secondary flex items-center justify-center mb-3 text-evofit-text-muted">
                          <AlertCircle size={18} />
                       </div>
                       <p className="text-evofit-text-muted text-[12px] font-medium m-0">Insufficient data for AI insights.</p>
                    </div>
                 )}
                 
                 {/* Exercise Distribution Donut */}
                 <div className="glass-card p-7 shadow-premium-card mt-4 overflow-hidden relative">
                    <h4 className="text-[14px] font-bold text-evofit-text-primary m-0 mb-6 uppercase tracking-widest">Exercise Distribution</h4>
                    <div className="flex items-center gap-4 h-[160px]">
                       <div className="w-1/2 h-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie 
                                  data={distribution || []} 
                                  innerRadius={50} 
                                  outerRadius={75} 
                                  paddingAngle={5} 
                                  dataKey="value" 
                                  stroke="none"
                                >
                                   {distribution?.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={entry.fill} />
                                   ))}
                                </Pie>
                                <Tooltip contentStyle={{ display: 'none' }} />
                             </PieChart>
                          </ResponsiveContainer>
                       </div>
                       <div className="w-1/2 space-y-2">
                          {distribution?.map((d) => (
                            <div key={d.name} className="flex justify-between items-center text-[11px] font-black uppercase tracking-tighter">
                               <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                                  <span className="text-evofit-text-secondary">{d.name}</span>
                               </div>
                               <span className="text-evofit-text-primary">{d.value} reps</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="w-full py-12 border-t border-evofit-border flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-purple-glow">
                 <Trophy size={20} className="text-white" />
              </div>
              <div>
                 <p className="m-0 text-[15px] font-extrabold text-evofit-text-primary">EvoFit Pro Intelligence</p>
                 <p className="m-0 text-[11px] text-evofit-text-muted font-bold uppercase tracking-wider">Advanced High-Performance Training System</p>
              </div>
           </div>
           
           <div className="flex gap-8">
              {['Privacy Policy', 'Service Terms', 'Get Coach Help'].map(link => (
                <span key={link} className="text-[12px] text-evofit-text-muted font-bold cursor-pointer hover:text-white transition-colors uppercase tracking-widest underline decoration-transparent hover:decoration-evofit-purple-main underline-offset-4">
                   {link}
                </span>
              ))}
           </div>
           
           <div className="text-right">
              <p className="m-0 text-[11px] text-evofit-text-muted font-bold uppercase tracking-wider">© 2025 Evolution Fitness Logic Ltd.</p>
              <p className="m-0 text-[10px] text-evofit-text-muted font-medium mt-1">Version 2.4.1 (Stable Build)</p>
           </div>
        </footer>

      </div>
    </div>
  );
}
