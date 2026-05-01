import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, ComposedChart, Cell, PieChart, Pie
} from 'recharts';
import { 
  Activity, Dumbbell, Award, Flame, TrendingUp, Plus, Check,
  ChevronRight, Sparkles, Trophy, Bell, Clock, ShieldCheck, AlertCircle, Zap, User, Target, ArrowUpRight
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion, AnimatePresence } from 'framer-motion';

const EXERCISE_LABELS = {
  bench: 'Bench Press',
  dead:  'Deadlift',
  squat: 'Back Squat',
  ohp:   'Overhead Press',
  row:   'Barbell Row',
  pullups: 'Pull Ups',
  rest:  'Rest / Recovery',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/summary');
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
      <div className="flex items-center justify-center h-full bg-evofit-bg-primary min-h-screen">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-evofit-border border-t-evofit-purple-main rounded-full"
        />
      </div>
    );
  }

  const { kpis, trend_data, recent_sessions, distribution, targets, insights } = data || {};

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 flex flex-col items-center py-6 md:py-8 px-4 md:px-7 overflow-y-auto bg-evofit-bg-primary min-h-screen font-inter relative">
      
      {/* Background Decorative Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] bg-evofit-purple-main/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-evofit-purple-light/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        className="w-full max-w-[1440px] z-10 relative"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        
        {/* ── TOP HERO SECTION ─────────────────────────────────────────── */}
        <div className="flex flex-col xl:flex-row gap-7 mb-10">
          
          {/* Welcome Card */}
          <motion.div 
            variants={itemVariants}
            className="flex-1 glass-card p-8 md:p-10 relative overflow-hidden bg-gradient-to-br from-evofit-bg-secondary to-evofit-bg-primary border-evofit-border shadow-premium-card"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-evofit-purple-main/5 blur-[80px] rounded-full -mr-20 -mt-20" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 bg-evofit-purple-main/10 rounded-full border border-evofit-purple-main/20 text-[11px] font-black text-evofit-purple-light uppercase tracking-widest">
                  Personal Dashboard
                </div>
                <div className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-[11px] font-black text-amber-500 uppercase tracking-widest">
                  Peak Performance
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-evofit-text-primary tracking-tighter m-0 mb-3 leading-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-evofit-purple-main to-evofit-purple-light">{user?.username || 'Athlete'}</span> 👋
              </h1>
              <p className="text-evofit-text-secondary text-base md:text-lg max-w-2xl m-0 font-medium">
                Your training intensity is up <span className="text-emerald-500 font-bold">12%</span> this week. Today is a great day to crush your Back Squat PR.
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-8">
                 <div className="flex items-center gap-3 bg-evofit-bg-primary/50 px-5 py-3 rounded-2xl border border-evofit-border">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                       <Trophy size={20} className="text-white" />
                    </div>
                    <div>
                       <p className="m-0 text-[10px] text-evofit-text-muted font-black uppercase tracking-widest">Global Rank</p>
                       <p className="m-0 text-lg font-black text-evofit-text-primary">#42</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 bg-evofit-bg-primary/50 px-5 py-3 rounded-2xl border border-evofit-border">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-evofit-purple-main to-evofit-purple-light flex items-center justify-center shadow-lg">
                       <Flame size={20} className="text-white fill-white" />
                    </div>
                    <div>
                       <p className="m-0 text-[10px] text-evofit-text-muted font-black uppercase tracking-widest">Active Streak</p>
                       <p className="m-0 text-lg font-black text-evofit-text-primary">{kpis?.active_streak || 0} Days</p>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* XP Progress Card */}
          <motion.div 
            variants={itemVariants}
            className="xl:w-[400px] glass-card p-8 bg-evofit-bg-secondary border-evofit-border shadow-premium-card flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="m-0 text-lg font-black text-evofit-text-primary uppercase tracking-widest">Current Level</h3>
                <span className="text-2xl font-black text-evofit-purple-main">Lvl {data?.user_progression?.level || 1}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-black text-evofit-text-secondary uppercase">
                  <span>{data?.user_progression?.xp.toLocaleString()} XP</span>
                  <span>{data?.user_progression?.xp_to_next_level.toLocaleString()} XP</span>
                </div>
                <div className="h-4 w-full bg-evofit-bg-primary rounded-full overflow-hidden border border-evofit-border shadow-inner relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (data?.user_progression?.xp / data?.user_progression?.xp_to_next_level) * 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-evofit-purple-main to-evofit-purple-light shadow-[0_0_10px_rgba(124,58,237,0.5)] relative"
                  >
                     <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 skew-x-12 animate-pulse" />
                  </motion.div>
                </div>
                <p className="text-[11px] text-evofit-text-muted font-bold text-center italic">
                  Earn {((data?.user_progression?.xp_to_next_level || 1000) - (data?.user_progression?.xp || 0)).toLocaleString()} more XP to reach Level {(data?.user_progression?.level || 1) + 1}
                </p>
              </div>
            </div>

            <button className="w-full mt-8 bg-evofit-bg-primary border border-evofit-border py-4 rounded-2xl text-[13px] font-black text-evofit-text-primary uppercase tracking-widest hover:border-evofit-purple-main/40 transition-all flex items-center justify-center gap-2">
               Explore Milestones <ChevronRight size={16} />
            </button>
          </motion.div>
        </div>

        {/* ── KPI GRID ─────────────────────────────────────────────────── */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7 mb-10">
          
          {/* Reps KPI */}
          <motion.div variants={itemVariants} className="glass-card p-7 shadow-premium-card hover:border-evofit-purple-main/30 transition-all group">
             <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-evofit-purple-main/10 flex items-center justify-center text-evofit-purple-light group-hover:scale-110 transition-transform">
                   <Dumbbell size={20} />
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-black bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                   <ArrowUpRight size={12} /> +14%
                </div>
             </div>
             <p className="text-[12px] text-evofit-text-muted font-black uppercase tracking-widest m-0 mb-1">Weekly Reps</p>
             <h2 className="text-4xl font-black text-evofit-text-primary tracking-tighter m-0">
               {kpis?.total_reps_lifted?.toLocaleString() || 0}
             </h2>
          </motion.div>

          {/* Form Score KPI */}
          <motion.div variants={itemVariants} className="glass-card p-7 shadow-premium-card hover:border-cyan-400/30 transition-all group">
             <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                   <ShieldCheck size={20} />
                </div>
                <div className="w-10 h-10">
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
             <p className="text-[12px] text-evofit-text-muted font-black uppercase tracking-widest m-0 mb-1">Avg. Form Score</p>
             <h2 className="text-4xl font-black text-evofit-text-primary tracking-tighter m-0">
               {kpis?.avg_form_score > 0 ? `${kpis.avg_form_score}%` : '0%'}
             </h2>
          </motion.div>

          {/* Consistency KPI */}
          <motion.div variants={itemVariants} className="glass-card p-7 shadow-premium-card hover:border-evofit-purple-light/30 transition-all group">
             <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-evofit-purple-light/10 flex items-center justify-center text-evofit-purple-light group-hover:scale-110 transition-transform">
                   <Activity size={20} />
                </div>
                <div className="flex gap-1 items-end h-8">
                   {[4, 7, 5, 9, 6].map((h, i) => (
                     <motion.div 
                       key={i} 
                       initial={{ height: 0 }}
                       animate={{ height: `${h * 10}%` }}
                       transition={{ delay: i * 0.1, duration: 1 }}
                       className="w-1.5 bg-evofit-purple-light/30 rounded-full" 
                     />
                   ))}
                </div>
             </div>
             <p className="text-[12px] text-evofit-text-muted font-black uppercase tracking-widest m-0 mb-1">Consistency</p>
             <h2 className="text-4xl font-black text-evofit-text-primary tracking-tighter m-0">
               {kpis?.consistency_score > 0 ? `${kpis.consistency_score}%` : '0%'}
             </h2>
          </motion.div>

          {/* Streak KPI */}
          <motion.div variants={itemVariants} className="glass-card p-7 shadow-premium-card hover:border-amber-500/30 transition-all group border-amber-500/20 bg-amber-500/[0.02]">
             <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                   <Flame size={20} className={kpis?.active_streak > 0 ? "fill-amber-500" : ""} />
                </div>
                <div className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase">On Fire</div>
             </div>
             <p className="text-[12px] text-evofit-text-muted font-black uppercase tracking-widest m-0 mb-1">Active Streak</p>
             <h2 className="text-4xl font-black text-evofit-text-primary tracking-tighter m-0">
               {kpis?.active_streak || 0} <span className="text-lg text-evofit-text-muted">Days</span>
             </h2>
          </motion.div>
        </motion.div>

        {/* ── QUICK ACTIONS & DATA VIZ ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 mb-10">
          
          {/* Performance Trend Chart */}
          <motion.div variants={itemVariants} className="glass-card p-9 shadow-premium-card overflow-hidden">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                   <h3 className="text-2xl font-black text-evofit-text-primary m-0 tracking-tight flex items-center gap-3">
                     Performance Trend <Activity size={20} className="text-evofit-purple-main" />
                   </h3>
                   <p className="text-sm text-evofit-text-muted m-0 mt-1 font-medium">Correlation between volume and form quality</p>
                </div>
                <div className="flex bg-evofit-bg-primary p-1 rounded-xl border border-evofit-border">
                   {['7D', '30D', 'ALL'].map(t => (
                     <button key={t} className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all ${t === '7D' ? 'bg-evofit-bg-secondary text-evofit-purple-main shadow-md' : 'text-evofit-text-muted hover:text-evofit-text-primary'}`}>{t}</button>
                   ))}
                </div>
             </div>

             <div className="h-[350px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={trend_data || []}>
                      <defs>
                        <linearGradient id="colorReps" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
                      <XAxis 
                         dataKey="date" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 800 }} 
                         dy={10}
                      />
                      <YAxis 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 800 }} 
                      />
                      <Tooltip 
                         cursor={{ fill: 'rgba(124,58,237,0.05)', radius: 8 }}
                         contentStyle={{ 
                            background: 'var(--bg-card)', 
                            border: '1px solid var(--border)', 
                            borderRadius: '16px', 
                            boxShadow: 'var(--card-shadow)',
                            fontSize: '12px',
                            fontWeight: 800,
                            padding: '12px'
                         }}
                      />
                      <Area 
                         type="monotone" 
                         dataKey="reps" 
                         fill="url(#colorReps)" 
                         stroke="#7C3AED" 
                         strokeWidth={3} 
                         name="Total Reps"
                         animationDuration={1500}
                      />
                      <Line 
                         type="monotone" 
                         dataKey="quality" 
                         stroke="#22D3EE" 
                         strokeWidth={3} 
                         name="Form Quality"
                         dot={{ fill: '#22D3EE', r: 4, strokeWidth: 2, stroke: 'var(--bg-card)' }}
                         activeDot={{ r: 6, fill: '#22D3EE', stroke: 'white', strokeWidth: 2 }}
                         animationDuration={1500}
                      />
                   </ComposedChart>
                </ResponsiveContainer>
             </div>
          </motion.div>

          {/* Quick Action & Insights Column */}
          <div className="flex flex-col gap-8">
             
             {/* Quick Upload Action */}
             <motion.div 
               variants={itemVariants}
               onClick={() => navigate('/upload')}
               className="glass-card p-8 border-2 border-dashed border-evofit-purple-main/20 flex flex-col items-center justify-center text-center hover:border-evofit-purple-main/50 bg-evofit-purple-main/[0.02] transition-all group cursor-pointer relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-evofit-purple-main/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-2xl bg-evofit-purple-main/10 flex items-center justify-center mb-6 shadow-purple-glow text-evofit-purple-main group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                   <Plus size={32} />
                </div>
                <h3 className="text-xl font-black text-evofit-text-primary mb-2 uppercase tracking-tight">Quick Upload</h3>
                <p className="text-evofit-text-secondary text-sm max-w-[280px] mb-8 font-medium">
                   Drop your training footage to analyze your form instantly.
                </p>
                <button className="premium-gradient text-white px-10 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-purple-glow transition-all">
                   Select Video
                </button>
             </motion.div>

             {/* Dynamic Insights / AI Coach Tip */}
             <motion.div variants={itemVariants} className="glass-card p-8 shadow-premium-card border-l-4 border-l-amber-500 bg-amber-500/[0.02]">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Sparkles size={22} />
                   </div>
                   <h4 className="m-0 text-lg font-black text-evofit-text-primary uppercase tracking-tight">AI Insights</h4>
                </div>
                <p className="text-sm text-evofit-text-secondary leading-relaxed font-bold m-0 mb-6 italic">
                   "{insights?.[0] || 'Your recovery is looking optimal today. Focus on explosive concentric movements to maximize XP gains.'}"
                </p>
                <button 
                   onClick={() => navigate('/chatbot')}
                   className="w-full bg-evofit-bg-secondary border border-evofit-border py-3.5 rounded-xl text-[12px] font-black text-evofit-text-primary uppercase tracking-widest hover:border-evofit-purple-main/40 transition-all flex items-center justify-center gap-2"
                >
                   Ask AI Coach <Activity size={14} />
                </button>
             </motion.div>
          </div>
        </div>

        {/* ── WEEKLY TARGETS ─────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="mb-10">
           <div className="flex justify-between items-end mb-8">
              <div>
                 <h3 className="text-2xl font-black text-evofit-text-primary m-0 tracking-tight flex items-center gap-3">
                   Weekly Targets <Target size={22} className="text-evofit-purple-main" />
                 </h3>
                 <p className="text-sm text-evofit-text-muted mt-1 font-medium">Track your goals for this week</p>
              </div>
              <button 
                onClick={() => navigate('/targets')}
                className="text-evofit-purple-light text-xs font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-all"
              >
                 Manage Targets <ChevronRight size={14} />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {targets?.slice(0, 4).map((t, i) => (
                <div key={i} className="glass-card p-6 shadow-premium-card border-evofit-border hover:border-evofit-purple-main/30 transition-all group">
                   <div className="flex justify-between items-center mb-4">
                      <p className="m-0 text-[13px] font-black text-evofit-text-primary uppercase tracking-tight">{t.label}</p>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${t.is_achieved ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-evofit-bg-primary text-evofit-text-muted border border-evofit-border'}`}>
                        {t.is_achieved ? 'Completed' : 'In Progress'}
                      </span>
                   </div>
                   <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-black text-evofit-text-primary">{t.reps_done}</span>
                      <span className="text-xs text-evofit-text-muted font-bold">/ {t.reps_target} reps</span>
                   </div>
                   <div className="h-2 bg-evofit-bg-primary rounded-full overflow-hidden border border-evofit-border">
                      <div 
                        className={`h-full transition-all duration-1000 ${t.is_achieved ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-evofit-purple-main'}`}
                        style={{ width: `${t.completion_pct}%` }} 
                      />
                   </div>
                </div>
              ))}
           </div>
        </motion.div>

        {/* ── RECENT ACTIVITY ────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="glass-card p-8 md:p-10 shadow-premium-card mb-10 overflow-hidden">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-evofit-text-primary m-0 tracking-tight uppercase">Recent Sessions</h3>
              <button 
                onClick={() => navigate('/history')}
                className="bg-evofit-bg-primary border border-evofit-border px-5 py-2.5 rounded-xl text-[11px] font-black text-evofit-text-primary uppercase tracking-widest hover:border-evofit-purple-main transition-all flex items-center gap-2"
              >
                 Full History <Clock size={14} />
              </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-evofit-border">
                       <th className="pb-5 text-[11px] font-black text-evofit-text-muted uppercase tracking-widest pl-2">Exercise / Date</th>
                       <th className="pb-5 text-[11px] font-black text-evofit-text-muted uppercase tracking-widest px-4">Volume</th>
                       <th className="pb-5 text-[11px] font-black text-evofit-text-muted uppercase tracking-widest px-4">Form Stability</th>
                       <th className="pb-5 text-[11px] font-black text-evofit-text-muted uppercase tracking-widest text-right pr-2">Analytics</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {recent_sessions?.map((session) => (
                      <tr key={session.id} className="group hover:bg-evofit-bg-secondary transition-colors">
                         <td className="py-6 pl-2">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center text-evofit-purple-light group-hover:bg-evofit-purple-main group-hover:text-white transition-all">
                                  <Dumbbell size={18} />
                               </div>
                               <div>
                                  <p className="text-base font-black text-evofit-text-primary m-0 uppercase tracking-tight">{EXERCISE_LABELS[session.exercise] || session.exercise}</p>
                                  <p className="text-[11px] text-evofit-text-muted m-0 font-bold uppercase tracking-tighter mt-0.5">{new Date(session.date).toLocaleDateString()}</p>
                               </div>
                            </div>
                         </td>
                         <td className="py-6 px-4">
                            <span className="text-lg font-black text-evofit-text-primary">{session.reps}</span>
                            <span className="text-[10px] text-evofit-text-muted font-black uppercase ml-1.5">Reps</span>
                         </td>
                         <td className="py-6 px-4">
                            <div className="flex items-center gap-3">
                               <span className={`text-sm font-black ${session.form_score >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{session.form_score}%</span>
                               <div className="w-24 h-2 bg-evofit-bg-primary rounded-full overflow-hidden border border-evofit-border hidden sm:block">
                                  <div className={`h-full rounded-full ${session.form_score >= 90 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} style={{ width: `${session.form_score}%` }} />
                               </div>
                            </div>
                         </td>
                         <td className="py-6 text-right pr-2">
                            <button 
                              onClick={() => navigate('/analytics')}
                              className="p-3 rounded-xl bg-evofit-bg-primary border border-evofit-border text-evofit-text-muted group-hover:text-evofit-purple-main group-hover:border-evofit-purple-main transition-all"
                            >
                               <ChevronRight size={18} />
                            </button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </motion.div>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <footer className="w-full py-12 border-t border-evofit-border flex flex-col md:flex-row justify-between items-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center shadow-purple-glow">
                 <Sparkles size={24} className="text-white" />
              </div>
              <div>
                 <p className="m-0 text-lg font-black text-evofit-text-primary tracking-tight">EvoFit Pro</p>
                 <p className="m-0 text-[10px] text-evofit-text-muted font-black uppercase tracking-widest mt-0.5">High Performance Analytics v2.8</p>
              </div>
           </div>
           
           <div className="flex gap-8">
              {['Terms', 'Privacy', 'Support'].map(link => (
                <span key={link} className="text-[11px] text-evofit-text-muted font-black uppercase tracking-widest cursor-pointer hover:text-evofit-purple-main transition-colors">{link}</span>
              ))}
           </div>
           
           <div className="text-center md:text-right">
              <p className="m-0 text-[11px] text-evofit-text-muted font-black uppercase tracking-widest">© 2025 Evolution Fitness</p>
              <div className="flex items-center justify-center md:justify-end gap-2 mt-1">
                 <ShieldCheck size={12} className="text-emerald-500" />
                 <span className="text-[9px] font-bold text-evofit-text-muted uppercase">Data Encrypted & Secure</span>
              </div>
           </div>
        </footer>

      </motion.div>
    </div>
  );
}
