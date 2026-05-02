import React, { useState, useEffect } from 'react';
import api from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { 
  Target as TargetIcon, Award, TrendingUp, CheckCircle2, 
  Plus, ChevronRight, Flame, Dumbbell, Activity, Timer, Sparkles, X, Trophy, ArrowUpRight
} from 'lucide-react';

const EXERCISE_OPTIONS = [
  { value: 'bench', label: 'Bench Press' },
  { value: 'dead', label: 'Deadlift' },
  { value: 'squat', label: 'Squat' },
  { value: 'ohp', label: 'Overhead Press' },
  { value: 'row', label: 'Barbell Row' }
];

export default function Targets() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [allAchievements, setAllAchievements] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  
  // Form state
  const [selectedExercise, setSelectedExercise] = useState('bench');
  const [repTarget, setRepTarget] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProgress = async () => {
    try {
      const res = await api.get('/targets/progress');
      setProgressData(res.data);
    } catch (err) {
      console.error("Failed to fetch progress", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAchievements = async () => {
    setLoadingBadges(true);
    try {
      const res = await api.get('/targets/achievements');
      setAllAchievements(res.data);
    } catch (err) {
      console.error("Failed to fetch achievements", err);
    } finally {
      setLoadingBadges(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleViewAnalysis = (exercise) => {
    sessionStorage.setItem('analyticsExerciseFilter', exercise);
    navigate('/analytics');
  };

  const handleSaveTarget = async () => {
    if (!repTarget || isNaN(repTarget)) return;
    setSaving(true);
    try {
      await api.post('/targets/', {
        exercise: selectedExercise,
        weekly_rep_target: parseInt(repTarget)
      });
      setRepTarget('');
      fetchProgress();
    } catch (err) {
      console.error("Failed to save target", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-evofit-bg-primary">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-evofit-border border-t-evofit-purple-main rounded-full"
      />
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-evofit-bg-primary pb-20 font-inter text-evofit-text-primary">
      <motion.div 
        className="max-w-7xl mx-auto px-6 pt-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── HEADER SECTION ─────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-evofit-text-primary tracking-tight">Targets & Progress</h1>
            <p className="text-evofit-text-muted mt-1">Set your weekly benchmarks and visualize your performance trends.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3 px-4 py-2 bg-evofit-bg-card border border-evofit-border rounded-full shadow-sm">
            <div className="w-8 h-8 rounded-full bg-evofit-purple-main/10 flex items-center justify-center text-evofit-purple-main">
              <Flame size={18} className="fill-evofit-purple-main" />
            </div>
            <div className="pr-1">
              <span className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-wider block leading-none">Active Streak</span>
              <span className="text-lg font-bold text-evofit-text-primary leading-none">{progressData?.current_streak || 0} Days</span>
            </div>
          </div>
        </motion.div>

        {/* ── TARGET SETUP + PROGRESS (COMBINED) ─────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-evofit-bg-card border border-evofit-border rounded-2xl p-6 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-evofit-text-muted uppercase tracking-wider mb-6">Quick Target Setup</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <select 
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="w-full bg-evofit-bg-primary border border-evofit-border rounded-xl px-4 py-3 text-evofit-text-primary text-sm outline-none focus:ring-2 focus:ring-evofit-purple-main/20 focus:border-evofit-purple-main transition-all appearance-none cursor-pointer"
                >
                  {EXERCISE_OPTIONS.map(opt => <option key={opt.value} value={opt.value} className="bg-evofit-bg-card">{opt.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <input 
                  type="number"
                  placeholder="Enter target reps"
                  value={repTarget}
                  onChange={(e) => setRepTarget(e.target.value)}
                  className="w-full bg-evofit-bg-primary border border-evofit-border rounded-xl px-4 py-3 text-evofit-text-primary text-sm outline-none focus:ring-2 focus:ring-evofit-purple-main/20 focus:border-evofit-purple-main transition-all"
                />
              </div>
              <button 
                onClick={handleSaveTarget}
                disabled={saving}
                className="bg-evofit-purple-main hover:bg-evofit-purple-light text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-evofit-purple-main/20 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {saving ? 'Saving...' : <><Plus size={18} /> Update Target</>}
              </button>
            </div>
          </div>

          <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-6 shadow-sm flex items-center gap-6">
            <div className="w-24 h-24 shrink-0">
              <CircularProgressbar
                value={progressData?.overall_percent || 0}
                strokeWidth={12}
                styles={buildStyles({
                  pathColor: `var(--purple-main)`,
                  trailColor: 'var(--border)',
                  strokeLinecap: 'round',
                  pathTransitionDuration: 1.5,
                })}
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-evofit-text-primary leading-tight">{progressData?.overall_percent || 0}%</p>
              <p className="text-sm font-semibold text-evofit-text-muted mb-1">Overall Weekly Completion</p>
              <p className="text-xs text-evofit-text-secondary">
                <span className="font-bold text-evofit-text-primary">{progressData?.total_reps_done || 0}</span> / {progressData?.total_reps_target || 0} reps
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── PRIORITY EXERCISES ─────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-evofit-text-primary">Priority Exercises</h3>
            <span className="text-xs font-bold text-evofit-text-muted uppercase tracking-widest">Main Benchmarks</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {progressData?.exercise_progress?.slice(0, 2).map((ex, i) => (
              <motion.div 
                key={ex.exercise}
                whileHover={{ y: -4 }}
                className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-8 shadow-sm group transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[11px] font-bold text-evofit-purple-main uppercase tracking-widest bg-evofit-purple-main/5 px-2.5 py-1 rounded-md mb-2 inline-block">High Priority</span>
                    <h4 className="text-2xl font-bold text-evofit-text-primary uppercase">{ex.label}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-evofit-text-primary leading-none">{ex.percent_complete}%</p>
                    <p className="text-[11px] font-bold text-evofit-text-muted uppercase mt-1">Completed</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-evofit-text-muted font-medium">Progress Track</span>
                    <span className="text-evofit-text-primary font-bold">{ex.current_reps} <span className="text-evofit-text-muted font-normal">/ {ex.target_reps} reps</span></span>
                  </div>
                  <div className="h-2.5 bg-evofit-bg-primary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${ex.percent_complete}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-evofit-purple-main rounded-full shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => handleViewAnalysis(ex.exercise)}
                  className="w-full bg-evofit-bg-primary hover:bg-evofit-purple-main hover:text-white border border-evofit-border hover:border-evofit-purple-main py-4 rounded-xl text-sm font-bold text-evofit-text-primary transition-all flex items-center justify-center gap-2 group"
                >
                  View Detailed Analysis <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── SECONDARY EXERCISES GRID ─────────────────────────────────── */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-evofit-text-primary">Secondary Exercises</h3>
            <div className="h-[1px] flex-1 bg-evofit-border mx-6"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {progressData?.exercise_progress?.slice(2).map((ex) => (
              <motion.div 
                key={ex.exercise}
                whileHover={{ y: -2 }}
                className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-5 shadow-sm transition-all"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-evofit-text-primary uppercase text-sm">{ex.label}</span>
                  <span className="text-[11px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">+{ex.streak_days} Streak</span>
                </div>
                
                <div className="flex justify-between text-[13px] mb-2 font-medium">
                  <span className="text-evofit-text-muted">{ex.percent_complete}% Done</span>
                  <span className="text-evofit-text-primary">{ex.current_reps} / {ex.target_reps}</span>
                </div>
                
                <div className="h-1.5 bg-evofit-bg-primary rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${ex.percent_complete}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-evofit-purple-main rounded-full"
                  />
                </div>

                <button 
                  onClick={() => handleViewAnalysis(ex.exercise)}
                  className="w-full py-2.5 rounded-lg text-xs font-bold text-evofit-text-muted hover:text-evofit-purple-main hover:bg-evofit-purple-main/5 transition-all"
                >
                  Full Report
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── WEEKLY TREND GRAPH ─────────────────────────────────── */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-evofit-bg-card border border-evofit-border rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold text-evofit-text-primary">Weekly Trend</h3>
                <p className="text-sm text-evofit-text-muted mt-1">Goal completion percentage over the last 5 weeks</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-evofit-bg-primary border border-evofit-border flex items-center justify-center text-evofit-purple-main">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData?.weekly_trend || []}>
                  <defs>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--purple-main)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--purple-main)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} 
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', 
                      borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ color: 'var(--purple-main)', fontWeight: 'bold' }}
                    labelStyle={{ marginBottom: '4px', fontWeight: 'bold', color: 'var(--text-primary)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completion" 
                    stroke="var(--purple-main)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorComp)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ── MILESTONES / ACHIEVEMENTS ───────────────────────────────── */}
          <motion.div variants={itemVariants} className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-evofit-purple-main/10 flex items-center justify-center text-evofit-purple-main">
                <Award size={20} />
              </div>
              <h3 className="text-xl font-bold text-evofit-text-primary">Milestones</h3>
            </div>
            
            <div className="space-y-4">
              {progressData?.recent_achievements?.length > 0 ? (
                progressData.recent_achievements.map((ach) => (
                  <div key={ach.id} className="flex gap-4 items-start group">
                    <div className="w-12 h-12 rounded-xl bg-evofit-bg-primary border border-evofit-border flex items-center justify-center shrink-0 group-hover:border-evofit-purple-main/30 transition-colors">
                      <Trophy size={20} className="text-evofit-purple-main" />
                    </div>
                    <div>
                      <p className="font-bold text-evofit-text-primary text-sm leading-tight">{ach.badge_name}</p>
                      <p className="text-[13px] text-evofit-text-muted mt-0.5 leading-snug">{ach.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 px-4 bg-evofit-bg-primary rounded-xl border border-dashed border-evofit-border">
                   <p className="text-sm text-evofit-text-muted font-medium leading-relaxed">No milestones yet.<br/>Push your limits to unlock badges.</p>
                </div>
              )}
              
              <button 
                onClick={() => {
                  setShowBadgesModal(true);
                  fetchAllAchievements();
                }}
                className="w-full bg-evofit-bg-primary text-evofit-text-primary border border-evofit-border py-3.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-evofit-bg-card hover:shadow-sm transition-all uppercase tracking-widest mt-4"
              >
                View All Achievements
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Badges Modal */}
      <AnimatePresence>
        {showBadgesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBadgesModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg bg-evofit-bg-card rounded-2xl shadow-2xl border border-evofit-border overflow-hidden"
            >
              <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-evofit-border">
                <div>
                  <h2 className="text-xl font-bold text-evofit-text-primary">All Achievements</h2>
                  <p className="text-sm text-evofit-text-muted mt-0.5">Your journey of excellence</p>
                </div>
                <button onClick={() => setShowBadgesModal(false)} className="w-10 h-10 rounded-full hover:bg-evofit-bg-primary flex items-center justify-center text-evofit-text-muted transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                {loadingBadges ? (
                  <div className="flex justify-center py-12">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-3 border-evofit-border border-t-evofit-purple-main rounded-full"
                    />
                  </div>
                ) : allAchievements.map((ach) => (
                  <div key={ach.id} className="flex items-center gap-4 p-4 bg-evofit-bg-primary rounded-xl border border-evofit-border hover:border-evofit-purple-main/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-evofit-bg-card border border-evofit-border flex items-center justify-center shadow-sm">
                      <Award size={24} className="text-evofit-purple-main" />
                    </div>
                    <div>
                      <p className="font-bold text-evofit-text-primary">{ach.badge_name}</p>
                      <p className="text-xs text-evofit-text-muted mt-0.5">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


