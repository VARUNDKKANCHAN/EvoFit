import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/auth';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  ChevronLeft, TrendingUp, Award, Activity, Calendar, Zap, 
  Dumbbell, Target, Sparkles, ArrowUpRight, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

const EXERCISE_LABELS = {
  bench: 'Bench Press',
  dead:  'Deadlift',
  squat: 'Back Squat',
  ohp:   'Overhead Press',
  row:   'Barbell Row',
  pullups: 'Pull Ups'
};

export default function TargetAnalysis() {
  const { exercise } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await api.get(`/exercise-analysis/${exercise}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch target analysis", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [exercise]);

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-evofit-bg-primary">
      <div className="w-10 h-10 border-4 border-evofit-border border-t-evofit-purple-main rounded-full animate-spin" />
    </div>
  );

  if (!data?.has_data) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-evofit-bg-primary">
       <div className="w-20 h-20 rounded-3xl bg-evofit-purple-main/10 flex items-center justify-center mb-6 text-evofit-purple-main">
          <Activity size={40} />
       </div>
       <h2 className="text-2xl font-bold text-evofit-text-primary mb-2">Insufficient Data</h2>
       <p className="text-evofit-text-secondary text-center max-w-sm mb-8">
         We need at least one completed session for <strong>{EXERCISE_LABELS[exercise] || exercise}</strong> to generate a performance analysis.
       </p>
       <button 
         onClick={() => navigate('/targets')}
         className="bg-evofit-purple-main text-white px-8 py-3 rounded-xl font-bold hover:bg-evofit-purple-light transition-all shadow-lg"
       >
         Back to Targets
       </button>
    </div>
  );

  return (
    <motion.div 
      className="flex-1 p-6 md:p-10 bg-evofit-bg-primary overflow-y-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/targets')}
            className="w-10 h-10 rounded-xl bg-evofit-bg-card border border-evofit-border flex items-center justify-center text-evofit-text-secondary hover:text-evofit-purple-main transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-evofit-purple-light text-[11px] font-black uppercase tracking-widest mb-1">
              <BarChart3 size={12} /> Deep Performance Analysis
            </div>
            <h1 className="text-3xl font-black text-evofit-text-primary tracking-tight uppercase">
              {EXERCISE_LABELS[exercise] || exercise}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-evofit-bg-card border border-evofit-border px-5 py-3 rounded-2xl shadow-sm">
          <div className="text-right">
            <p className="text-[10px] font-bold text-evofit-text-muted uppercase tracking-wider mb-0.5">Weekly Target</p>
            <p className="text-lg font-black text-evofit-text-primary leading-none">{data.current_target} <span className="text-[12px] font-bold text-evofit-text-muted">REPS</span></p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-evofit-purple-main/10 flex items-center justify-center text-evofit-purple-main">
            <Target size={20} />
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'All-Time PB', val: data.personal_bests.max_reps, sub: 'Reps in 1 Session', icon: <TrendingUp className="text-evofit-purple-light" /> },
          { label: 'Best Form', val: `${data.personal_bests.best_form}%`, sub: 'Peak Quality', icon: <Award className="text-amber-400" /> },
          { label: 'Total Volume', val: data.personal_bests.total_volume, sub: 'Lifetime Reps', icon: <Dumbbell className="text-blue-400" /> },
          { label: 'Sessions', val: data.personal_bests.session_count, sub: 'Completed', icon: <Calendar className="text-green-400" /> }
        ].map((kpi, idx) => (
          <motion.div key={idx} variants={itemVariants} className="glass-card p-6 shadow-premium-card hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-widest">{kpi.label}</span>
              {kpi.icon}
            </div>
            <p className="text-3xl font-black text-evofit-text-primary leading-none mb-1">{kpi.val}</p>
            <p className="text-[11px] font-bold text-evofit-text-muted uppercase">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Progression Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-8 shadow-premium-card">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-black text-evofit-text-primary uppercase tracking-tight">Progression Curve</h3>
              <p className="text-sm text-evofit-text-muted mt-1">Volume and quality over time</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-evofit-purple-light uppercase">
                <div className="w-2.5 h-2.5 rounded-full bg-evofit-purple-main" /> Reps
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Quality
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.progression}>
                <defs>
                  <linearGradient id="colorReps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple-main)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--purple-main)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700}} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="reps" stroke="var(--purple-main)" strokeWidth={3} fillOpacity={1} fill="url(#colorReps)" animationDuration={1500} />
                <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#FBBF24" strokeWidth={2} dot={{ r: 4, fill: '#FBBF24' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Insights & Coaching */}
        <motion.div variants={itemVariants} className="glass-card p-8 shadow-premium-card flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-evofit-purple-main/10 flex items-center justify-center text-evofit-purple-main">
              <Sparkles size={20} />
            </div>
            <h3 className="text-lg font-black text-evofit-text-primary uppercase tracking-tight">AI Insights</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            {data.insights.map((insight, idx) => (
              <div key={idx} className="flex gap-4 items-start p-4 bg-evofit-bg-secondary rounded-2xl border border-evofit-border">
                <div className="w-8 h-8 rounded-lg bg-evofit-bg-card border border-evofit-border flex items-center justify-center shrink-0">
                  <Zap size={14} className="text-evofit-purple-light" />
                </div>
                <p className="text-xs text-evofit-text-secondary leading-relaxed font-medium">
                  {insight}
                </p>
              </div>
            ))}
            {data.insights.length === 0 && (
              <p className="text-sm text-evofit-text-muted italic text-center py-10">
                Continue logging sessions to unlock advanced AI coaching insights.
              </p>
            )}
          </div>

          <div className="mt-8 p-5 bg-gradient-to-br from-evofit-purple-main to-evofit-purple-dark rounded-2xl text-white shadow-lg relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Consistency Rating</p>
                <p className="text-2xl font-black mb-2">{data.avg_recent_form}%</p>
                <p className="text-[11px] leading-relaxed font-medium opacity-90">
                  Your last 5 sessions show {data.avg_recent_form >= 90 ? 'elite' : data.avg_recent_form >= 70 ? 'solid' : 'developing'} technique consistency.
                </p>
             </div>
             <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
          </div>
        </motion.div>
      </div>

      {/* Secondary Chart: Session Duration vs Intensity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-8 shadow-premium-card">
          <h3 className="text-lg font-black text-evofit-text-primary uppercase tracking-tight mb-6">Volume Consistency</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.progression.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="date" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 10}} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="reps" fill="var(--purple-main)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-[10px] font-bold text-evofit-text-muted uppercase mt-4 tracking-widest">Recent 7 Sessions Distribution</p>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          className="glass-card p-8 shadow-premium-card flex flex-col justify-center items-center text-center border-dashed border-2 border-evofit-purple-main/20"
        >
          <div className="w-16 h-16 rounded-full bg-evofit-purple-main/5 flex items-center justify-center mb-4">
             <Target className="text-evofit-purple-main" size={32} />
          </div>
          <h4 className="text-xl font-black text-evofit-text-primary uppercase mb-2">Next Milestone</h4>
          <p className="text-sm text-evofit-text-secondary max-w-xs mb-6">
            You are currently at <strong>{Math.round((data.personal_bests.total_volume / 1000) * 100)}%</strong> of your way to the "1K Rep Master" achievement for {EXERCISE_LABELS[exercise] || exercise}.
          </p>
          <button 
            className="group flex items-center gap-2 text-evofit-purple-light font-black text-sm uppercase tracking-wider hover:text-evofit-purple-main transition-colors"
          >
            View Achievements <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
