import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/auth';
import { useAuth } from '../context/AuthContext';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip as RechartsTooltip
} from 'recharts';
import {
  Users, Dumbbell, ShieldCheck, Activity, Zap, Trophy,
  Info, Sparkles, ChevronRight, BarChart3, AlertCircle, RefreshCw,
  Award, TrendingUp, TrendingDown, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EXERCISE_LABELS = {
  bench: 'Bench Press',
  squat: 'Back Squat',
  ohp: 'Overhead Press',
  dead: 'Deadlift',
  row: 'Barbell Row'
};

const EXERCISE_ICONS = {
  bench: <Dumbbell size={16} />,
  squat: <Trophy size={16} />,
  ohp: <Zap size={16} />,
  dead: <Activity size={16} />,
  row: <BarChart3 size={16} />
};

const METRIC_LABELS = {
  power: 'Concentric Power',
  stability: 'Stability Index',
  consistency: 'Consistency Index',
  volume: 'Repetitions Volume',
  form: 'Form Quality'
};

const METRIC_ICONS = {
  power: <Zap size={15} className="text-amber-500" />,
  stability: <ShieldCheck size={15} className="text-blue-500" />,
  consistency: <Activity size={15} className="text-green-500" />,
  volume: <BarChart3 size={15} className="text-purple-500" />,
  form: <Target size={15} className="text-cyan-500" />
};

export default function CohortComparison() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeExercise, setActiveExercise] = useState('bench');

  const fetchCohortData = () => {
    setLoading(true);
    setError(null);
    api.get('/cohort/comparison')
      .then(response => {
        setData(response.data);
      })
      .catch(err => {
        console.error(err);
        setError("Could not load community benchmarking data. Please verify the backend is running.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCohortData();
  }, []);

  // Format Radar Chart data dynamically based on the active exercise
  const radarData = useMemo(() => {
    if (!data) return [];
    
    const userExStats = data.user_stats?.[activeExercise] || {};
    const cohortAvgEx = data.community_avg?.[activeExercise] || {};
    
    const axes = [
      { subject: 'Power', key: 'power' },
      { subject: 'Stability', key: 'stability' },
      { subject: 'Consistency', key: 'consistency' },
      { subject: 'Volume', key: 'volume' },
      { subject: 'Form Quality', key: 'form' }
    ];

    return axes.map(axis => {
      let uVal = 0;
      let cVal = 0;

      if (axis.key === 'power') {
        uVal = userExStats.power || 0;
        cVal = cohortAvgEx.power || 0;
      } else if (axis.key === 'stability') {
        uVal = userExStats.stability || 0;
        cVal = cohortAvgEx.stability || 0;
      } else if (axis.key === 'consistency') {
        uVal = userExStats.consistency || 0;
        cVal = cohortAvgEx.consistency || 0;
      } else if (axis.key === 'volume') {
        uVal = (userExStats.volume || 0) * 5.0;
        cVal = (cohortAvgEx.volume || 0) * 5.0;
      } else if (axis.key === 'form') {
        uVal = userExStats.form || 0;
        cVal = cohortAvgEx.form || 0;
      }

      return {
        subject: axis.subject,
        'You': Math.round(uVal),
        'Community Average': Math.round(cVal),
      };
    });
  }, [data, activeExercise]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-evofit-bg-primary gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-evofit-border border-t-evofit-purple-main animate-spin" />
        <p className="text-sm font-semibold text-evofit-text-muted">Compiling community average comparisons...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-evofit-bg-primary py-10 px-6">
        <div className="saas-card max-w-md p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-evofit-text-primary">Failed to Load Benchmarks</h2>
          <p className="text-sm text-evofit-text-muted leading-relaxed">
            {error || "An unexpected error occurred while compiling relative fitness scores."}
          </p>
          <button
            onClick={fetchCohortData}
            className="premium-gradient text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 mx-auto active:scale-95"
          >
            <RefreshCw size={14} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const userStats = data.user_stats?.[activeExercise] || {};
  const communityAvg = data.community_avg?.[activeExercise] || {};
  const scoringMatrix = data.scoring_matrix?.[activeExercise] || {};
  const otherProfiles = data.other_profiles || {};
  const athleteMetadata = data.metadata || {};
  const coachingInsight = data.coaching_insights?.[activeExercise] || "";

  const otherUsersList = Object.keys(otherProfiles);
  const userHasActualData = userStats.has_data === true;

  const fade = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }
  };
  
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } }
  };

  return (
    <motion.div
      className="flex-1 bg-evofit-bg-primary min-h-screen py-6 px-5 md:px-8 overflow-y-auto"
      initial="hidden" animate="show" variants={stagger}
    >
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* ── HEADER (EXACTLY ZERO UPLOAD BUTTONS HERE) ─────── */}
        <motion.div variants={fade} className="saas-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-35 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div>
            <div className="flex gap-2 mb-2">
              <span className="status-pill" style={{ background: '#7C3AED14', color: '#7C3AED' }}>Community Benchmark</span>
              <span className="status-pill" style={{ background: '#06B6D414', color: '#06B6D4' }}>Live Grading</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-evofit-text-primary m-0 tracking-tight flex items-center gap-2">
              Dynamic Community Benchmark <Users className="text-evofit-purple-main" size={24} />
            </h1>
            <p className="text-evofit-text-secondary m-0 text-sm mt-1 leading-relaxed">
              Benchmark your movement profile directly against the average scores of the active EvoFit training community.
            </p>
          </div>
        </motion.div>

        {/* ── EXERCISE NAVIGATION TABS ───────────────────────── */}
        <motion.div variants={fade} className="flex flex-wrap gap-2 p-1.5 bg-evofit-bg-card rounded-2xl border border-evofit-border">
          {Object.keys(EXERCISE_LABELS).map((key) => {
            const active = activeExercise === key;
            return (
              <button
                key={key}
                onClick={() => setActiveExercise(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-evofit-purple-main text-white shadow-md shadow-evofit-purple-main/20'
                    : 'text-evofit-text-muted hover:text-evofit-text-primary hover:bg-evofit-bg-primary'
                }`}
              >
                {EXERCISE_ICONS[key]}
                <span>{EXERCISE_LABELS[key]}</span>
              </button>
            );
          })}
        </motion.div>

        {/* ── DYNAMIC COCKPIT RENDER ─────────────────────────── */}
        {userHasActualData ? (
          /* ── DYNAMIC VIEW: ACTIVE USER DATA PRESENT ── */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
            {/* Radar Chart Panel */}
            <motion.div variants={fade} className="saas-card p-6 flex flex-col justify-between min-h-[420px]">
              <div>
                <h2 className="text-lg font-bold text-evofit-text-primary m-0 flex items-center gap-2">
                  You vs. Community Average <Sparkles size={16} className="text-evofit-purple-main" />
                </h2>
                <p className="text-xs text-evofit-text-muted m-0 mt-0.5">Real-time overlays of your average metrics against the active database population.</p>
              </div>
              
              <div className="flex-1 h-[280px] w-full min-h-[280px] relative flex items-center justify-center mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#E5E7EB" opacity={0.6} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B' }} />
                    <RechartsTooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, fontWeight: 600, boxShadow: 'var(--card-shadow)' }}
                    />
                    <Radar name="You" dataKey="You" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.15} strokeWidth={2.5} />
                    <Radar name="Community Average" dataKey="Community Average" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.06} strokeWidth={1.5} />
                    <Legend tick={{ fill: '#64748B', fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Coach Insight Panel */}
            <div className="flex flex-col gap-6">
              {/* AI Suggestion */}
              <motion.div variants={fade} className="saas-card p-6 flex flex-col justify-between flex-grow">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-evofit-purple-main/10 flex items-center justify-center text-evofit-purple-main">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-evofit-text-primary m-0">AI Coach Observation</h3>
                      <p className="text-[10px] text-evofit-text-muted m-0">Deltas analysis & mechanical advice</p>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl border border-evofit-border bg-evofit-bg-primary/50 relative overflow-hidden">
                    <p className="text-xs text-evofit-text-secondary leading-relaxed m-0 italic font-medium">
                      "{coachingInsight}"
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-evofit-border text-[11px] text-evofit-text-muted flex items-start gap-1.5 leading-relaxed">
                  <Info size={13} className="text-evofit-purple-main shrink-0 mt-0.5" />
                  <span>Relative Delta measures your score subtract the average community score. Performance tiers score your mechanical proficiency accordingly.</span>
                </div>
              </motion.div>
              
              {/* Active User Stats Card */}
              <motion.div variants={fade} className="saas-card p-6">
                <h3 className="text-xs font-bold text-evofit-text-muted uppercase tracking-widest m-0 mb-4">Your Average Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Form Score', val: `${userStats.form}%`, color: '#06B6D4' },
                    { label: 'Stability', val: `${userStats.stability}%`, color: '#7C3AED' },
                    { label: 'Power', val: `${userStats.power}%`, color: '#3B82F6' },
                    { label: 'Consistency', val: `${userStats.consistency}%`, color: '#F59E0B' },
                  ].map(stat => (
                    <div key={stat.label} className="p-3.5 rounded-xl border border-evofit-border bg-evofit-bg-primary">
                      <p className="text-[10px] text-evofit-text-muted font-bold uppercase tracking-wider m-0 mb-1">{stat.label}</p>
                      <p className="text-xl font-black text-evofit-text-primary m-0" style={{ color: stat.color }}>{stat.val}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          /* ── EMPTY STATE: ACTUALLY ZERO USER DATA FOUND (EXACTLY ONE UPLOAD BUTTON RENDERED) ── */
          <motion.div 
            variants={fade}
            className="saas-card p-10 text-center space-y-6 flex flex-col items-center justify-center min-h-[380px] border border-dashed border-evofit-border relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-[0.02] pointer-events-none"
              style={{ background: 'radial-gradient(circle, var(--purple-main) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
            <div className="w-16 h-16 rounded-full bg-evofit-purple-main/10 flex items-center justify-center text-evofit-purple-main animate-pulse">
              <AlertCircle size={32} />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-evofit-text-primary mb-1">Actual Workout Data Required</h3>
              <p className="text-xs text-evofit-text-muted leading-relaxed">
                You haven't logged any actual workout sessions for <strong>{EXERCISE_LABELS[activeExercise]}</strong> in the database yet. EvoFit comparisons are built 100% on your real-time training CSV uploads.
              </p>
            </div>
            <button 
              onClick={() => navigate('/upload')}
              className="premium-gradient text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
            >
              Upload CSV File
            </button>
          </motion.div>
        )}

        {/* ── COMMUNITY GRADING CENTER & SCOREBOARD ──────────── */}
        {userHasActualData && Object.keys(scoringMatrix).length > 0 && (
          <motion.div variants={fade} className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-evofit-text-primary m-0 flex items-center gap-2">
                Community Grading Center & Scoreboard <Award size={18} className="text-amber-500" />
              </h2>
              <p className="text-xs text-evofit-text-muted m-0 mt-0.5">Your mechanical scores scored and graded relative to active community averages.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(METRIC_LABELS).map((metricKey) => {
                const metricScore = scoringMatrix[metricKey] || {};
                const gradeInfo = metricScore.grade_info || {};
                const isPositive = metricScore.delta >= 0;
                
                return (
                  <div 
                    key={metricKey} 
                    className="saas-card p-5 flex flex-col justify-between border border-evofit-border hover:border-evofit-purple-main/30 hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.02] group-hover:opacity-[0.05] pointer-events-none transition-all duration-300"
                      style={{ background: 'radial-gradient(circle, var(--purple-main) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
                    
                    <div className="space-y-4">
                      {/* Metric Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-evofit-bg-primary border border-evofit-border flex items-center justify-center">
                            {METRIC_ICONS[metricKey]}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-evofit-text-primary m-0">{METRIC_LABELS[metricKey]}</h3>
                            <p className="text-[9px] text-evofit-text-muted m-0">Dynamic performance scaling</p>
                          </div>
                        </div>

                        {/* Performance Tier Glowing Pill */}
                        <div 
                          className="px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider animate-pulse-glow"
                          style={{
                            background: `${gradeInfo.color}14`,
                            color: gradeInfo.color,
                            border: `1px solid ${gradeInfo.color}30`
                          }}
                        >
                          {gradeInfo.grade}
                        </div>
                      </div>

                      {/* Score Comparison Display */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-b border-evofit-border/50 py-3">
                        <div className="text-center border-r border-evofit-border/50">
                          <p className="text-[9px] text-evofit-text-muted font-bold uppercase tracking-wider m-0">Your Score</p>
                          <p className="text-base font-black text-evofit-text-primary m-0 mt-1">
                            {metricKey === 'volume' ? `${metricScore.user_score} reps` : `${metricScore.user_score}%`}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-evofit-text-muted font-bold uppercase tracking-wider m-0">Community Avg</p>
                          <p className="text-base font-bold text-evofit-text-secondary m-0 mt-1">
                            {metricKey === 'volume' ? `${metricScore.community_score} reps` : `${metricScore.community_score}%`}
                          </p>
                        </div>
                      </div>

                      {/* Critique Sentence */}
                      <p className="text-[11px] text-evofit-text-secondary leading-relaxed m-0 italic font-medium">
                        "{gradeInfo.description}"
                      </p>
                    </div>

                    {/* Relative Delta Badge */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-evofit-border/30">
                      <span className="text-[9px] text-evofit-text-muted font-bold uppercase tracking-wider">Relative Delta</span>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                        isPositive 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/25'
                      }`}>
                        {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        <span>{isPositive ? '+' : ''}{metricScore.delta}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── COHORT COMPARISON TABLE ────────────────────────── */}
        <motion.div variants={fade} className="saas-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-evofit-text-primary m-0 flex items-center gap-2">
                Comparative Matrix ({EXERCISE_LABELS[activeExercise]}) <BarChart3 size={16} className="text-evofit-purple-main" />
              </h2>
              <p className="text-xs text-evofit-text-muted m-0 mt-0.5">Side-by-side dynamic audit scores compared directly against active community average benchmarks.</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-evofit-border">
                  {['Athlete Profile', 'Power Index', 'Stability Index', 'Consistency', 'Avg Reps', 'Form Quality'].map((h) => (
                    <th key={h} className="pb-3.5 text-[10px] font-bold text-evofit-text-muted uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 1. Active User Row */}
                <tr className="border-b border-evofit-border hover:bg-evofit-bg-primary/20 transition-colors bg-evofit-purple-main/5 font-semibold">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-evofit-purple-main animate-pulse" />
                      <span className="text-sm font-bold text-evofit-text-primary">
                        You ({data.username || 'Athlete'})
                      </span>
                    </div>
                  </td>
                  {userHasActualData ? (
                    <>
                      <td className="py-4 pr-4 text-sm text-evofit-text-primary font-bold">{userStats.power}%</td>
                      <td className="py-4 pr-4 text-sm text-evofit-text-primary font-bold">{userStats.stability}%</td>
                      <td className="py-4 pr-4 text-sm text-evofit-text-primary font-bold">{userStats.consistency}%</td>
                      <td className="py-4 pr-4 text-sm text-evofit-text-primary font-bold">{userStats.volume} reps</td>
                      <td className="py-4 pr-4 text-sm text-evofit-purple-main font-black">{userStats.form}%</td>
                    </>
                  ) : (
                    <td colSpan="5" className="py-4 pr-4 text-xs text-evofit-text-muted italic">
                      No actual training data logged — upload a CSV to map comparison.
                    </td>
                  )}
                </tr>

                {/* 2. Other Community Members Side-by-Side */}
                {otherUsersList.map(username => {
                  const stats = otherProfiles[username]?.[activeExercise] || {};
                  const info = athleteMetadata[username] || { name: username.replace("_", " ").title(), specialty: "Challenger" };
                  
                  return (
                    <tr key={username} className="border-b border-evofit-border/40 hover:bg-evofit-bg-primary/45 transition-colors">
                      <td className="py-4 pr-4">
                        <div>
                          <p className="text-sm font-semibold text-evofit-text-primary m-0">{info.name}</p>
                          <p className="text-[9px] text-evofit-text-muted m-0 mt-0.5">{info.specialty}</p>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-sm text-evofit-text-secondary">{stats.power}%</td>
                      <td className="py-4 pr-4 text-sm text-evofit-text-secondary">{stats.stability}%</td>
                      <td className="py-4 pr-4 text-sm text-evofit-text-secondary">{stats.consistency}%</td>
                      <td className="py-4 pr-4 text-sm text-evofit-text-secondary">{stats.volume} reps</td>
                      <td className="py-4 pr-4 text-sm font-bold text-evofit-text-primary">{stats.form}%</td>
                    </tr>
                  );
                })}
                
                {/* 3. Cohort Average Row */}
                <tr className="border-t border-evofit-border bg-slate-50/5 hover:bg-evofit-bg-primary transition-colors font-semibold">
                  <td className="py-4 pr-4 text-sm font-bold text-evofit-text-primary font-bold">Community Average</td>
                  <td className="py-4 pr-4 text-sm text-evofit-text-secondary">{communityAvg.power}%</td>
                  <td className="py-4 pr-4 text-sm text-evofit-text-secondary">{communityAvg.stability}%</td>
                  <td className="py-4 pr-4 text-sm text-evofit-text-secondary">{communityAvg.consistency}%</td>
                  <td className="py-4 pr-4 text-sm text-evofit-text-secondary">{communityAvg.volume} reps</td>
                  <td className="py-4 pr-4 text-sm font-bold text-[#06B6D4]">{communityAvg.form}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <footer className="flex flex-col md:flex-row justify-between items-center gap-4 py-8 border-t border-evofit-border text-[11px] text-evofit-text-muted">
          <p className="m-0 font-medium">EvoFit Pro · Dynamic Community Benchmarking</p>
          <div className="flex gap-6">
            {['Abstract', 'Community Guidelines', 'Config Schema'].map(l => (
              <span key={l} className="cursor-pointer hover:text-evofit-purple-main transition-colors font-medium">{l}</span>
            ))}
          </div>
          <p className="m-0">© 2026 Evolution Fitness</p>
        </footer>

      </div>
    </motion.div>
  );
}
