import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/auth';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, ReferenceLine
} from 'recharts';
import {
  ChevronLeft, TrendingUp, Award, Activity, Calendar, Zap,
  Dumbbell, Target, Sparkles, ArrowUpRight, BarChart3, ShieldCheck,
  Timer, Info, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const EXERCISE_LABELS = {
  bench:   'Bench Press',
  dead:    'Deadlift',
  squat:   'Back Squat',
  ohp:     'Overhead Press',
  row:     'Barbell Row',
  pullups: 'Pull Ups',
};

// ─── Animation Variants ──────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fade = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, accent = '#7C3AED', badge }) {
  return (
    <motion.div variants={fade} className="saas-card p-5 flex flex-col gap-3 group cursor-default">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-widest">{label}</span>
        <div className="icon-circle" style={{ background: `${accent}14` }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-black text-evofit-text-primary leading-none tracking-tight m-0">{value}</p>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-evofit-text-muted uppercase m-0">{sub}</p>
        {badge && (
          <span className="status-pill" style={{ background: `${accent}14`, color: accent }}>{badge}</span>
        )}
      </div>
    </motion.div>
  );
}

function ProgressRow({ label, value, pct, color = '#7C3AED' }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-evofit-text-muted font-medium">{label}</span>
        <span className="font-bold text-evofit-text-primary">{value}</span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          style={{ background: color, width: `${pct}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Custom Recharts Tooltip ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="saas-card px-4 py-3 text-sm shadow-lg">
      <p className="font-bold text-evofit-text-primary m-0 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="m-0 font-semibold" style={{ color: p.color }}>
          {p.name}: <span className="text-evofit-text-primary">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function TargetAnalysis() {
  const { exercise } = useParams();
  const navigate    = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('progression');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/exercise-analysis/${exercise}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch target analysis', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [exercise]);

  const label = EXERCISE_LABELS[exercise] || exercise;

  // ── Derived metrics ────────────────────────────────────────────────────────
  const formTier = useMemo(() => {
    const f = data?.avg_recent_form ?? 0;
    if (f >= 90) return { label: 'Elite',    color: '#22C55E' };
    if (f >= 75) return { label: 'Solid',    color: '#3B82F6' };
    if (f >= 55) return { label: 'Developing', color: '#F59E0B' };
    return           { label: 'Beginner',   color: '#EF4444' };
  }, [data]);

  const milestonePercent = useMemo(() => {
    if (!data) return 0;
    return Math.min(100, Math.round((data.personal_bests.total_volume / 1000) * 100));
  }, [data]);

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-evofit-bg-primary">
      <div className="w-10 h-10 rounded-full border-2 border-evofit-border border-t-evofit-purple-main animate-spin" />
    </div>
  );

  // ── Empty State ────────────────────────────────────────────────────────────
  if (!data?.has_data) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-screen bg-evofit-bg-primary">
      <div className="saas-card p-12 flex flex-col items-center text-center max-w-sm w-full">
        <div className="icon-circle w-16 h-16 mb-6" style={{ background: '#7C3AED14', borderRadius: 20 }}>
          <Activity size={36} style={{ color: '#7C3AED' }} />
        </div>
        <h2 className="text-xl font-bold text-evofit-text-primary m-0 mb-2">Insufficient Data</h2>
        <p className="text-sm text-evofit-text-muted leading-relaxed m-0 mb-8">
          We need at least one completed session for <strong className="text-evofit-text-primary">{label}</strong> to generate a performance report.
        </p>
        <button
          onClick={() => navigate('/targets')}
          className="premium-gradient text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
        >
          Back to Targets
        </button>
      </div>
    </div>
  );

  const pb = data.personal_bests;

  return (
    <motion.div
      className="flex-1 bg-evofit-bg-primary min-h-screen pb-20 font-inter"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-[1200px] mx-auto px-6 py-10">

        {/* ── BREADCRUMB / BACK ─────────────────────────────────────────────── */}
        <motion.div variants={fade} className="flex items-center gap-2 text-sm text-evofit-text-muted mb-8">
          <button
            onClick={() => navigate('/targets')}
            className="flex items-center gap-1.5 hover:text-evofit-purple-main transition-colors font-medium"
          >
            <ChevronLeft size={16} /> Targets
          </button>
          <ChevronRight size={14} className="opacity-40" />
          <span className="text-evofit-text-secondary font-semibold">{label}</span>
          <span className="status-pill ml-2" style={{ background: '#7C3AED14', color: '#7C3AED' }}>Deep Analysis</span>
        </motion.div>

        {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
        <motion.div variants={fade} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-widest m-0 mb-2 flex items-center gap-1.5">
              <BarChart3 size={12} /> Performance Analysis
            </p>
            <h1 className="text-3xl font-bold text-evofit-text-primary tracking-tight m-0">{label}</h1>
            <p className="text-evofit-text-muted mt-1 m-0 text-sm">
              Lifetime volume, form quality, and progression data.
            </p>
          </div>

          {/* Weekly Target Badge */}
          <div className="saas-card px-6 py-4 flex items-center gap-4 shrink-0">
            <div className="icon-circle" style={{ background: '#7C3AED14' }}>
              <Target size={18} style={{ color: '#7C3AED' }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-evofit-text-muted uppercase tracking-wider m-0">Weekly Target</p>
              <p className="text-xl font-black text-evofit-text-primary m-0 leading-tight">
                {data.current_target} <span className="text-xs font-bold text-evofit-text-muted">REPS</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── KPI GRID ──────────────────────────────────────────────────────── */}
        <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="All-Time PB"
            value={pb.max_reps}
            sub="Reps in 1 session"
            icon={<TrendingUp size={18} />}
            accent="#7C3AED"
            badge="+PR"
          />
          <KpiCard
            label="Best Form"
            value={`${pb.best_form}%`}
            sub="Peak quality"
            icon={<ShieldCheck size={18} />}
            accent="#22C55E"
          />
          <KpiCard
            label="Total Volume"
            value={(pb.total_volume || 0).toLocaleString()}
            sub="Lifetime reps"
            icon={<Dumbbell size={18} />}
            accent="#3B82F6"
          />
          <KpiCard
            label="Sessions"
            value={pb.session_count}
            sub="Completed"
            icon={<Calendar size={18} />}
            accent="#F59E0B"
          />
        </motion.div>

        {/* ── MAIN CHART + AI INSIGHTS ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Chart Card */}
          <motion.div variants={fade} className="lg:col-span-2 saas-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-evofit-text-primary m-0">Progression Curve</h3>
                <p className="text-xs text-evofit-text-muted m-0 mt-0.5">Volume and form quality over all sessions</p>
              </div>
              <div className="flex gap-1 p-1 bg-evofit-bg-primary rounded-lg border border-evofit-border shrink-0">
                {['progression', 'volume'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveChart(tab)}
                    className={`chart-tab${activeChart === tab ? ' active' : ''}`}
                  >
                    {tab === 'progression' ? 'Trend' : 'Volume'}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-5 mb-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-evofit-text-muted uppercase">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#7C3AED' }} /> Reps
              </div>
              {activeChart === 'progression' && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-evofit-text-muted uppercase">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#F59E0B' }} /> Form %
                </div>
              )}
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'progression' ? (
                  <AreaChart data={data.progression} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillReps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.8} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }} dy={8} />
                    <YAxis yAxisId="l" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }} />
                    <YAxis yAxisId="r" orientation="right" domain={[0, 100]} hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#7C3AED', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area yAxisId="l" type="monotone" dataKey="reps" name="Reps" stroke="#7C3AED" strokeWidth={2.5} fill="url(#fillReps)" dot={false} activeDot={{ r: 5, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }} />
                    <Line yAxisId="r" type="monotone" dataKey="quality" name="Form %" stroke="#F59E0B" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                ) : (
                  <BarChart data={data.progression.slice(-10)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.8} />
                    <XAxis dataKey="date" hide />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#7C3AED08' }} />
                    <Bar dataKey="reps" name="Reps" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AI Insights Card */}
          <motion.div variants={fade} className="saas-card p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-circle" style={{ background: '#7C3AED14' }}>
                <Sparkles size={18} style={{ color: '#7C3AED' }} />
              </div>
              <div>
                <h3 className="text-base font-bold text-evofit-text-primary m-0">AI Insights</h3>
                <p className="text-[11px] text-evofit-text-muted m-0">Powered by EvoFit Intelligence</p>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              {data.insights.length > 0 ? data.insights.map((insight, idx) => (
                <div key={idx} className="flex gap-3 p-4 bg-evofit-bg-primary rounded-xl border border-evofit-border">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#7C3AED', marginTop: 6 }} />
                  <p className="text-xs text-evofit-text-secondary leading-relaxed m-0 font-medium">{insight}</p>
                </div>
              )) : (
                <p className="text-sm text-evofit-text-muted italic text-center py-8 m-0">
                  Continue logging sessions to unlock coaching insights.
                </p>
              )}
            </div>

            {/* Consistency Rating */}
            <div className="mt-6 premium-gradient p-5 rounded-2xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 m-0 mb-1">Consistency Rating</p>
                <p className="text-3xl font-black m-0 mb-1 leading-none">{data.avg_recent_form}%</p>
                <p className="text-[11px] leading-relaxed font-medium opacity-90 m-0">
                  Last 5 sessions show <strong>{formTier.label}</strong> technique.
                </p>
              </div>
              <Sparkles className="absolute -bottom-3 -right-3 w-20 h-20 rotate-12 opacity-10" />
            </div>
          </motion.div>
        </div>

        {/* ── DEEP-DIVE ANALYSIS ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

          {/* Form Quality */}
          <motion.div variants={fade} className="saas-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="icon-circle" style={{ background: '#22C55E14' }}>
                <ShieldCheck size={18} style={{ color: '#22C55E' }} />
              </div>
              <h3 className="font-bold text-evofit-text-primary m-0">Form Quality</h3>
            </div>
            <div className="space-y-5">
              <ProgressRow
                label="Peak Form Score"
                value={`${pb.best_form}%`}
                pct={pb.best_form}
                color="#22C55E"
              />
              <ProgressRow
                label="Recent Consistency"
                value={`${data.avg_recent_form}%`}
                pct={data.avg_recent_form}
                color="#7C3AED"
              />
              <ProgressRow
                label="Stability Metric"
                value="High"
                pct={Math.min(100, data.avg_recent_form + 5)}
                color="#3B82F6"
              />
            </div>
          </motion.div>

          {/* Performance Timing */}
          <motion.div variants={fade} className="saas-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="icon-circle" style={{ background: '#3B82F614' }}>
                <Timer size={18} style={{ color: '#3B82F6' }} />
              </div>
              <h3 className="font-bold text-evofit-text-primary m-0">Volume Breakdown</h3>
            </div>
            <div className="space-y-5">
              <ProgressRow
                label="Weekly Progress"
                value={`${Math.round((data.personal_bests.total_volume / (data.current_target * 4)) * 100)}%`}
                pct={Math.min(100, Math.round((data.personal_bests.total_volume / (data.current_target * 4)) * 100))}
                color="#3B82F6"
              />
              <ProgressRow
                label="Target Adherence"
                value={`${data.current_target} reps/wk`}
                pct={Math.min(100, pb.session_count * 10)}
                color="#7C3AED"
              />
              <ProgressRow
                label="Session Frequency"
                value={`${pb.session_count} sessions`}
                pct={Math.min(100, pb.session_count * 5)}
                color="#F59E0B"
              />
            </div>
          </motion.div>

          {/* Endurance */}
          <motion.div variants={fade} className="saas-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="icon-circle" style={{ background: '#F59E0B14' }}>
                <TrendingUp size={18} style={{ color: '#F59E0B' }} />
              </div>
              <h3 className="font-bold text-evofit-text-primary m-0">Progression Rate</h3>
            </div>
            <div className="space-y-5">
              <ProgressRow
                label="Total Reps Done"
                value={`${pb.total_volume.toLocaleString()} reps`}
                pct={Math.min(100, milestonePercent)}
                color="#F59E0B"
              />
              <ProgressRow
                label="1K Rep Master"
                value={`${milestonePercent}%`}
                pct={milestonePercent}
                color="#EF4444"
              />
              <ProgressRow
                label="Peak Output"
                value={`${pb.max_reps} reps`}
                pct={Math.min(100, (pb.max_reps / 50) * 100)}
                color="#22C55E"
              />
            </div>
          </motion.div>
        </div>

        {/* ── MILESTONE BANNER ──────────────────────────────────────────────── */}
        <motion.div variants={fade} className="saas-card p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
          <div className="icon-circle w-16 h-16 shrink-0" style={{ background: '#7C3AED14', borderRadius: 20 }}>
            <Target size={32} style={{ color: '#7C3AED' }} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-widest m-0 mb-1">Next Milestone</p>
            <h4 className="text-lg font-bold text-evofit-text-primary m-0 mb-1">1K Rep Master — {label}</h4>
            <p className="text-sm text-evofit-text-muted m-0">
              You are <strong className="text-evofit-text-primary">{milestonePercent}%</strong> of the way to completing 1,000 total reps. Keep pushing!
            </p>
          </div>
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-evofit-purple-main">{milestonePercent}%</span>
              <span className="text-xs text-evofit-text-muted font-bold">COMPLETE</span>
            </div>
            <div className="progress-bar w-48">
              <motion.div
                className="progress-fill premium-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${milestonePercent}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-evofit-border text-[11px] text-evofit-text-muted">
          <div className="flex items-center gap-2">
            <Info size={14} />
            <span>Analysis based on {pb.session_count} recorded session{pb.session_count !== 1 ? 's' : ''}.</span>
          </div>
          <div className="flex gap-6">
            <button
              onClick={() => navigate('/targets')}
              className="hover:text-evofit-purple-main transition-colors font-medium flex items-center gap-1"
            >
              <ChevronLeft size={13} /> Back to Targets
            </button>
            <button
              onClick={() => navigate('/trophy')}
              className="hover:text-evofit-purple-main transition-colors font-medium flex items-center gap-1"
            >
              <Award size={13} /> Achievements
            </button>
            <button
              onClick={() => navigate('/history')}
              className="hover:text-evofit-purple-main transition-colors font-medium flex items-center gap-1"
            >
              <Activity size={13} /> Full History
            </button>
          </div>
        </footer>

      </div>
    </motion.div>
  );
}
