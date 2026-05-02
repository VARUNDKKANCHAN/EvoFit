import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/auth';
import { useAuth } from '../context/AuthContext';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Dumbbell, Flame, Activity, ShieldCheck, Plus, Sparkles,
  ChevronRight, Trophy, Clock, Target, ArrowUpRight, Zap
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';

const EXERCISE_LABELS = {
  bench: 'Bench Press', dead: 'Deadlift', squat: 'Back Squat',
  ohp: 'Overhead Press', row: 'Barbell Row', pullups: 'Pull Ups', rest: 'Rest',
};

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

function KpiCard({ icon, label, value, accent = '#7C3AED', badge, children }) {
  return (
    <motion.div variants={fade} className="saas-card p-5 group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className="icon-circle" style={{ background: `${accent}14` }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
        {badge && <span className="status-pill" style={{ background: `${accent}14`, color: accent }}>{badge}</span>}
        {children}
      </div>
      <p className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-widest m-0 mb-1">{label}</p>
      <p className="text-3xl font-black text-evofit-text-primary m-0 tracking-tight">{value}</p>
    </motion.div>
  );
}

function SectionHeader({ title, subtitle, icon, action, onAction }) {
  return (
    <div className="flex justify-between items-end mb-6">
      <div>
        <h2 className="text-xl font-bold text-evofit-text-primary m-0 flex items-center gap-2">
          {title} <span className="text-evofit-purple-main">{icon}</span>
        </h2>
        {subtitle && <p className="text-sm text-evofit-text-muted m-0 mt-1">{subtitle}</p>}
      </div>
      {action && (
        <button onClick={onAction} className="flex items-center gap-1 text-xs font-semibold text-evofit-purple-main hover:text-evofit-purple-light transition-colors">
          {action} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('7D');

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(r => setData(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-evofit-bg-primary">
        <div className="w-10 h-10 rounded-full border-2 border-evofit-border border-t-evofit-purple-main animate-spin" />
      </div>
    );
  }

  const { kpis, trend_data, recent_sessions, targets, insights } = data || {};
  const prog = data?.user_progression || {};
  const xpPct = Math.min(100, Math.round(((prog.xp || 0) / (prog.xp_to_next_level || 1000)) * 100));

  return (
    <motion.div
      className="flex-1 bg-evofit-bg-primary min-h-screen py-6 px-5 md:px-8 overflow-y-auto"
      initial="hidden" animate="show" variants={stagger}
    >
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ── HERO ───────────────────────────────────────────── */}
        <motion.div variants={fade} className="saas-card p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-40 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1">
              <div className="flex gap-2 mb-4">
                <span className="status-pill" style={{ background: '#7C3AED14', color: '#7C3AED' }}>Personal Dashboard</span>
                <span className="status-pill" style={{ background: '#22C55E14', color: '#16A34A' }}>Active</span>
              </div>
              <h1 className="text-3xl font-bold text-evofit-text-primary m-0 mb-2 tracking-tight">
                Welcome back, <span className="text-evofit-purple-main">{user?.username || 'Athlete'}</span> 👋
              </h1>
              <p className="text-evofit-text-secondary m-0 text-base">
                Your performance is up <span className="text-[#22C55E] font-semibold">12%</span> this week. Today is a great day to crush your PR.
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                {[
                  { icon: <Trophy size={15} />, label: 'Global Rank', value: '#42', color: '#F59E0B' },
                  { icon: <Flame size={15} />, label: 'Active Streak', value: `${kpis?.active_streak || 0} days`, color: '#7C3AED' },
                  { icon: <ArrowUpRight size={15} />, label: 'Growth', value: '+12%', color: '#22C55E' },
                ].map(p => (
                  <div key={p.label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-evofit-border bg-evofit-bg-primary">
                    <span style={{ color: p.color }}>{p.icon}</span>
                    <div>
                      <p className="m-0 text-[10px] text-evofit-text-muted font-semibold uppercase tracking-wider">{p.label}</p>
                      <p className="m-0 text-sm font-bold text-evofit-text-primary">{p.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Level Progress */}
            <div className="xl:w-72 p-5 rounded-xl border border-evofit-border bg-evofit-bg-primary flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <p className="m-0 text-sm font-bold text-evofit-text-primary">Level Progress</p>
                <span className="text-lg font-black text-evofit-purple-main">Lvl {prog.level || 1}</span>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-evofit-text-muted font-medium mb-2">
                  <span>{(prog.xp || 0).toLocaleString()} XP</span>
                  <span>{(prog.xp_to_next_level || 1000).toLocaleString()} XP</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    style={{ background: '#7C3AED', width: `${xpPct}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[11px] text-evofit-text-muted mt-2 m-0 text-center">
                  {((prog.xp_to_next_level || 1000) - (prog.xp || 0)).toLocaleString()} XP to Level {(prog.level || 1) + 1}
                </p>
              </div>
              <button
                onClick={() => navigate('/trophy')}
                className="w-full py-2.5 rounded-lg border border-evofit-border text-[12px] font-semibold text-evofit-text-secondary hover:border-evofit-purple-main hover:text-evofit-purple-main transition-all flex items-center justify-center gap-1.5"
              >
                Explore Milestones <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── KPI GRID ───────────────────────────────────────── */}
        <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard icon={<Dumbbell size={18} />} label="Weekly Reps" value={(kpis?.total_reps_lifted || 0).toLocaleString()} badge="+14%" accent="#7C3AED" />
          <KpiCard icon={<ShieldCheck size={18} />} label="Avg Form Score" value={kpis?.avg_form_score > 0 ? `${kpis.avg_form_score}%` : '0%'} accent="#06B6D4">
            <div className="w-9 h-9">
              <CircularProgressbar value={kpis?.avg_form_score || 0} strokeWidth={13}
                styles={buildStyles({ pathColor: '#06B6D4', trailColor: '#E5E7EB', strokeLinecap: 'round' })} />
            </div>
          </KpiCard>
          <KpiCard icon={<Activity size={18} />} label="Consistency" value={kpis?.consistency_score > 0 ? `${kpis.consistency_score}%` : '0%'} accent="#7C3AED" />
          <KpiCard icon={<Flame size={18} />} label="Active Streak" value={`${kpis?.active_streak || 0} days`} badge="🔥 On Fire" accent="#F59E0B" />
        </motion.div>

        {/* ── CHART + ACTION PANEL ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">

          {/* Performance Chart */}
          <motion.div variants={fade} className="saas-card p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-evofit-text-primary m-0 flex items-center gap-2">
                  Performance Trend <Activity size={16} className="text-evofit-purple-main" />
                </h3>
                <p className="text-xs text-evofit-text-muted m-0 mt-0.5">Volume vs form quality over time</p>
              </div>
              <div className="flex gap-1 p-1 bg-evofit-bg-primary rounded-lg border border-evofit-border">
                {['7D', '30D', 'ALL'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} className={`chart-tab${activeTab === t ? ' active' : ''}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend_data || []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="repsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.8} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 12, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                    cursor={{ stroke: '#7C3AED', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="reps" fill="url(#repsFill)" stroke="#7C3AED" strokeWidth={2.5} name="Total Reps" dot={false} activeDot={{ r: 5, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="quality" stroke="#06B6D4" strokeWidth={2} name="Form Quality" dot={false} activeDot={{ r: 5, fill: '#06B6D4', stroke: '#fff', strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Action Panel */}
          <div className="flex flex-col gap-4">

            {/* Quick Upload */}
            <motion.div
              variants={fade}
              onClick={() => navigate('/upload')}
              className="saas-card p-5 border-2 border-dashed cursor-pointer text-center group flex flex-col items-center"
              style={{ borderColor: '#7C3AED33' }}
              whileHover={{ borderColor: '#7C3AED88' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                style={{ background: '#7C3AED14' }}>
                <Plus size={24} className="text-evofit-purple-main" />
              </div>
              <p className="text-sm font-bold text-evofit-text-primary m-0 mb-1">Quick Upload</p>
              <p className="text-xs text-evofit-text-muted m-0 mb-4">Drop training footage to analyze form instantly</p>
              <button className="premium-gradient text-white px-6 py-2 rounded-lg text-xs font-bold tracking-wide shadow-sm hover:shadow-md transition-shadow">
                Select Video
              </button>
            </motion.div>

            {/* AI Insights */}
            <motion.div variants={fade} className="saas-card p-5 flex-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="icon-circle" style={{ background: '#7C3AED14' }}>
                  <Sparkles size={16} className="text-evofit-purple-main" />
                </div>
                <p className="text-sm font-bold text-evofit-text-primary m-0">AI Insights</p>
              </div>
              <p className="text-xs text-evofit-text-secondary leading-relaxed m-0 mb-4 italic">
                "{insights?.[0] || 'Your recovery looks optimal. Focus on explosive movements to maximize performance gains.'}"
              </p>
              <button
                onClick={() => navigate('/chatbot')}
                className="w-full py-2.5 rounded-lg border border-evofit-border text-xs font-semibold text-evofit-text-secondary hover:border-evofit-purple-main hover:text-evofit-purple-main transition-all flex items-center justify-center gap-1.5"
              >
                Ask AI Coach <Zap size={12} />
              </button>
            </motion.div>
          </div>
        </div>

        {/* ── WEEKLY TARGETS ─────────────────────────────────── */}
        <motion.div variants={fade}>
          <SectionHeader title="Weekly Targets" subtitle="Track your goals for this week" icon={<Target size={18} />} action="Manage Targets" onAction={() => navigate('/targets')} />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {targets?.slice(0, 4).map((t, i) => {
              const done = t.is_achieved;
              return (
                <div key={i} className="saas-card p-5">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs font-semibold text-evofit-text-primary m-0 uppercase tracking-wide leading-tight">{t.label}</p>
                    <span className="status-pill" style={done
                      ? { background: '#22C55E14', color: '#16A34A' }
                      : { background: '#7C3AED14', color: '#7C3AED' }
                    }>{done ? 'Completed' : 'In Progress'}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-black text-evofit-text-primary">{t.reps_done}</span>
                    <span className="text-xs text-evofit-text-muted">/ {t.reps_target} reps</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(100, t.completion_pct)}%`, background: done ? '#22C55E' : '#7C3AED' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── RECENT SESSIONS ────────────────────────────────── */}
        <motion.div variants={fade} className="saas-card p-6">
          <SectionHeader title="Recent Sessions" icon={<Clock size={18} />} action="Full History" onAction={() => navigate('/history')} />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-evofit-border">
                  {['Exercise / Date', 'Volume', 'Form Stability', 'Action'].map((h, i) => (
                    <th key={h} className={`pb-3 text-[10px] font-bold text-evofit-text-muted uppercase tracking-widest ${i === 3 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent_sessions?.map(s => {
                  const good = s.form_score >= 80;
                  return (
                    <tr key={s.id} className="border-b border-evofit-border last:border-0 hover:bg-evofit-bg-primary transition-colors group">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg border border-evofit-border bg-evofit-bg-primary flex items-center justify-center text-evofit-text-muted group-hover:border-evofit-purple-main group-hover:text-evofit-purple-main transition-all">
                            <Dumbbell size={15} />
                          </div>
                          <div>
                            <p className="m-0 text-sm font-semibold text-evofit-text-primary">{EXERCISE_LABELS[s.exercise] || s.exercise}</p>
                            <p className="m-0 text-[11px] text-evofit-text-muted">{new Date(s.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-sm font-bold text-evofit-text-primary">{s.reps}</span>
                        <span className="text-[10px] text-evofit-text-muted ml-1">reps</span>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-semibold" style={{ color: good ? '#22C55E' : '#F59E0B' }}>{s.form_score}%</span>
                          <div className="progress-bar w-24 hidden sm:block">
                            <div className="progress-fill" style={{ width: `${s.form_score}%`, background: good ? '#22C55E' : '#F59E0B' }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => navigate('/analytics')}
                          className="p-2 rounded-lg border border-evofit-border text-evofit-text-muted hover:border-evofit-purple-main hover:text-evofit-purple-main transition-all"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <footer className="flex flex-col md:flex-row justify-between items-center gap-4 py-8 border-t border-evofit-border text-[11px] text-evofit-text-muted">
          <p className="m-0 font-medium">EvoFit Pro · High Performance Analytics</p>
          <div className="flex gap-6">
            {['Terms', 'Privacy', 'Support'].map(l => (
              <span key={l} className="cursor-pointer hover:text-evofit-purple-main transition-colors font-medium">{l}</span>
            ))}
          </div>
          <p className="m-0">© 2026 Evolution Fitness</p>
        </footer>

      </div>
    </motion.div>
  );
}
