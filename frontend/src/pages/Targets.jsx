import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Target as TargetIcon, Award, TrendingUp, CheckCircle2, 
  Plus, ChevronRight, Flame, Dumbbell, Activity, Timer, Sparkles, X, Trophy
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
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [allAchievements, setAllAchievements] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  
  // Form state
  const [selectedExercise, setSelectedExercise] = useState('bench');
  const [repTarget, setRepTarget] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await axios.get('http://localhost:8000/targets/progress');
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
      const res = await axios.get('http://localhost:8000/targets/achievements');
      setAllAchievements(res.data);
    } catch (err) {
      console.error("Failed to fetch achievements", err);
    } finally {
      setLoadingBadges(false);
    }
  };

  const openBadgesModal = () => {
    setShowBadgesModal(true);
    fetchAllAchievements();
  };

  const handleViewAnalysis = (exercise) => {
    // Store the selected exercise filter so Analytics can pick it up
    sessionStorage.setItem('analyticsExerciseFilter', exercise);
    navigate('/analytics');
  };

  const handleSaveTarget = async () => {
    if (!repTarget || isNaN(repTarget)) return;
    setSaving(true);
    try {
      await axios.post('http://localhost:8000/targets/', {
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
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-4 border-evofit-border border-t-evofit-purple-main rounded-full animate-spin" />
    </div>
  );

  /* ── Badges Modal ──────────────────────────────── */
  const BadgesModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowBadgesModal(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg glass-card p-8 animate-fade-in-up shadow-2xl border border-evofit-purple-main/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-evofit-purple-main/15 border border-evofit-purple-main/30 flex items-center justify-center">
              <Trophy size={20} className="text-evofit-purple-light" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold m-0 text-evofit-text-primary">All Badges</h3>
              <p className="text-[12px] text-evofit-text-muted m-0">{allAchievements.length} milestone{allAchievements.length !== 1 ? 's' : ''} unlocked</p>
            </div>
          </div>
          <button
            onClick={() => setShowBadgesModal(false)}
            className="w-8 h-8 rounded-full bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center text-evofit-text-secondary hover:text-evofit-text-primary hover:border-evofit-purple-main/40 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
          {loadingBadges ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-evofit-border border-t-evofit-purple-main rounded-full animate-spin" />
            </div>
          ) : allAchievements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center mx-auto mb-4">
                <Trophy size={24} className="text-evofit-text-muted" />
              </div>
              <p className="text-evofit-text-secondary font-semibold m-0 mb-1">No badges yet</p>
              <p className="text-[13px] text-evofit-text-muted m-0">Keep training to unlock your first milestone!</p>
            </div>
          ) : (
            allAchievements.map((ach, i) => (
              <div
                key={ach.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-evofit-bg-secondary border border-evofit-border hover:border-evofit-purple-main/30 transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(184,134,11,0.2)] shrink-0">
                  <Sparkles size={22} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 mb-0.5 text-[14px] font-extrabold text-evofit-text-primary truncate">{ach.badge_name}</p>
                  <p className="m-0 text-[12px] text-evofit-text-muted leading-relaxed">{ach.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-evofit-text-muted font-semibold m-0">
                    {new Date(ach.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-5 overflow-y-auto bg-evofit-bg-primary min-h-screen font-inter">
      {/* ── CENTRAL ARTBOARD (1440px) ─────────────────────────────────── */}
      <div className={`w-full max-w-[1440px] transition-opacity duration-600 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* ── TOP HEADER ─────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center mb-10">
          <div className="animate-slide-in-left">
            <h1 className="text-[32px] font-extrabold m-0 tracking-tight text-evofit-text-primary">
              Targets & Progress
            </h1>
            <p className="text-evofit-text-secondary text-base m-0">
              Visualize your fitness milestones and track weekly volume benchmarks.
            </p>
          </div>
          
          <div className="flex items-center gap-3.5 px-6 py-3 bg-evofit-purple-main/10 border border-evofit-purple-main/30 rounded-[20px] shadow-[0_0_25px_rgba(124,58,237,0.15)] animate-pulse-glow">
            <Flame size={24} className="text-evofit-purple-light fill-evofit-purple-main" />
            <div className="text-right">
              <p className="m-0 text-[11px] font-bold text-evofit-purple-light uppercase tracking-wider">Active Streak</p>
              <p className="m-0 text-xl font-extrabold text-evofit-text-primary">{progressData?.current_streak || 0} Days</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-7 mb-7">
          
          {/* ── SET NEW TARGET SECTION ───────────────────────────────────── */}
          <div className="glass-card p-8 flex flex-col justify-center shadow-premium-card">
            <div className="flex items-center gap-3.5 mb-7">
              <div className="w-12 h-12 rounded-xl bg-evofit-purple-main/15 border border-evofit-purple-main/30 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                <TargetIcon size={22} className="text-evofit-purple-light" />
              </div>
              <h3 className="text-[22px] font-bold m-0 text-evofit-text-primary">Set New Weekly Target</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-6 mb-8">
              <div>
                <label className="block text-sm text-evofit-text-secondary mb-2.5 font-semibold">Exercise Perspective</label>
                <div className="relative">
                  <select 
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="w-full bg-evofit-bg-secondary border border-evofit-border rounded-xl px-4 py-3.5 text-evofit-text-primary text-[15px] outline-none appearance-none cursor-pointer focus:border-evofit-purple-main transition-colors"
                  >
                    {EXERCISE_OPTIONS.map(opt => <option key={opt.value} className="bg-evofit-bg-secondary text-evofit-text-primary" value={opt.value}>{opt.label}</option>)}
                  </select>
                  <ChevronRight size={18} className="text-evofit-text-muted absolute right-4 top-4 rotate-90" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-evofit-text-secondary mb-2.5 font-semibold">Weekly Rep Target</label>
                <div className="relative">
                  <input 
                    type="number"
                    placeholder="e.g. 500"
                    value={repTarget}
                    onChange={(e) => setRepTarget(e.target.value)}
                    className="w-full bg-evofit-bg-secondary border border-evofit-border rounded-xl px-3.5 py-3.5 pl-11 text-evofit-text-primary text-[15px] outline-none focus:border-evofit-purple-main transition-colors"
                  />
                  <TrendingUp size={18} className="text-evofit-purple-light absolute left-4 top-4" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveTarget}
              disabled={saving}
              className="w-full premium-gradient text-white border-none py-4 rounded-xl font-bold text-base cursor-pointer hover:-translate-y-0.5 transition-all duration-200 uppercase tracking-wide flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 shadow-lg"
            >
              {saving ? 'Synchronizing...' : <><Plus size={20} /> Save New Target</>}
            </button>
          </div>

          {/* ── OVERALL PROGRESS CENTER ─────────────────────────────────── */}
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.08),transparent)] shadow-premium-card">
            <div className="w-[220px] h-[220px] mb-7 relative drop-shadow-[0_0_30px_rgba(124,58,237,0.15)]">
               <CircularProgressbar
                  value={progressData?.overall_percent || 0}
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: `#7C3AED`,
                    trailColor: 'var(--border)',
                    strokeLinecap: 'round',
                    pathTransitionDuration: 2.0,
                  })}
               />
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-[44px] font-extrabold text-evofit-text-primary leading-none tracking-tighter">
                      {progressData?.overall_percent || 0}%
                   </span>
                   <span className="text-[11px] text-evofit-text-muted mt-1 font-bold uppercase tracking-widest leading-none">Complete</span>
               </div>
            </div>
            
            <div className="animate-fade-in duration-1000">
              <div className="flex items-center gap-1.5 justify-center mt-6">
                <span className="text-3xl font-extrabold text-evofit-text-primary tracking-tight">{(progressData?.total_reps_done || 0).toLocaleString()}</span>
                <span className="text-sm text-evofit-text-muted font-medium mb-1.5">/ {(progressData?.total_reps_target || 0).toLocaleString()} reps done</span>
              </div>
              <p className="text-[13px] text-evofit-text-secondary mt-1 font-medium">Overall Goal Completion</p>
            </div>
          </div>
        </div>

        {/* ── WEEKLY BREAKDOWN GRID ────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold m-0 text-evofit-text-primary">Weekly Breakdown Grid</h3>
            <p className="text-[13px] text-evofit-text-muted m-0">Performance by Exercise</p>
            <div className="flex gap-3">
               <div className="px-4 py-2 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-bold flex items-center gap-1.5">
                  <Sparkles size={14} /> Consistency Score: {progressData?.overall_form_score}%
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progressData?.exercise_progress?.map((ex, i) => (
              <div key={ex.exercise} 
                className={`glass-card p-7 animate-stagger-in hover:-translate-y-1.5 hover:border-evofit-purple-main/40 transition-all duration-300 relative overflow-hidden`}
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                {/* Subtle Cyan Glow for in-progress items */}
                {ex.percent_complete > 0 && ex.percent_complete < 100 && (
                  <div className="absolute top-0 right-0 w-[60px] h-[60px] bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent)] pointer-events-none" />
                )}

                <div className="flex justify-between mb-6 items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                        {ex.exercise === 'dead' ? <Dumbbell size={18} className="text-evofit-purple-light" /> : <Activity size={18} className="text-evofit-purple-light" />}
                     </div>
                     <span className="font-extrabold text-[18px] text-evofit-text-primary uppercase">{ex.label}</span>
                  </div>
                  <div className="text-[11px] font-extrabold bg-amber-500/15 text-amber-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-500/20">
                    <Flame size={12} className="fill-amber-500" /> {ex.streak_days} DAY STREAK
                  </div>
                </div>
                
                <div className="mb-7">
                  <div className="flex justify-between text-sm mb-2.5">
                    <span className="text-evofit-purple-light font-bold">{ex.percent_complete}% complete</span>
                    <span className="text-evofit-text-primary font-bold">{ex.current_reps} <span className="text-evofit-text-muted">/ {ex.target_reps} reps</span></span>
                  </div>
                  <div className="h-2.5 bg-evofit-bg-secondary rounded-full overflow-hidden">
                     <div 
                      className="h-full bg-gradient-to-r from-evofit-purple-main to-cyan-400 shadow-[0_0_15px_rgba(124,58,237,0.3)] animate-fill-in duration-[1200ms] rounded-full" 
                      style={{ width: `${ex.percent_complete}%` }} 
                     />
                  </div>
                  <p className="m-0 mt-2 text-[10px] text-evofit-text-muted font-bold uppercase tracking-wider">Weekly Volume Progress</p>
                </div>
  
                <button 
                  onClick={() => handleViewAnalysis(ex.exercise)}
                  className="w-full bg-evofit-bg-secondary border border-evofit-border rounded-xl py-3 text-evofit-text-secondary text-[13px] font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:bg-evofit-purple-main/10 hover:text-evofit-purple-light hover:border-evofit-purple-main/30 group"
                >
                  View Detailed Analysis <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
  
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 mb-[60px]">
          
          {/* ── GOAL PERFORMANCE TREND ─────────────────────────────────── */}
          <div className="glass-card p-9 shadow-premium-card">
            <div className="flex justify-between mb-8 items-start">
              <div>
                <h3 className="text-[22px] font-extrabold m-0 mb-1.5 text-evofit-text-primary tracking-tight">Goal Completion Trend (5 Weeks)</h3>
                <p className="text-sm text-evofit-text-muted m-0 font-medium">Historical performance synchronized with Analytics</p>
              </div>
              <div className="bg-evofit-purple-main/10 p-2.5 rounded-xl">
                <TrendingUp size={24} className="text-evofit-purple-light" />
              </div>
            </div>
  
            <div className="h-80 w-full px-2.5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData?.weekly_trend || []}>
                  <defs>
                     <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.9} />
                       <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.6} />
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }} 
                    dy={12}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }} 
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'var(--purple-main)', opacity: 0.05, radius: 8 }}
                    contentStyle={{ 
                      background: 'var(--bg-card)', border: '1px solid var(--border)', 
                      borderRadius: '12px', fontSize: '14px', boxShadow: 'var(--card-shadow)',
                      color: 'var(--text-primary)', fontWeight: 600
                    }}
                    itemStyle={{ color: 'var(--purple-main)' }}
                  />
                  <Bar 
                    dataKey="completion" 
                    fill="url(#trendGradient)" 
                    radius={[8, 8, 4, 4]} 
                    barSize={48}
                    animationDuration={1500}
                  >
                    {progressData?.weekly_trend?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fillOpacity={entry.completion > 80 ? 1 : 0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
  
          {/* ── RECENT MILESTONES & BADGES ───────────────────────────────── */}
          <div className="flex flex-col gap-7">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-evofit-purple-main/10 flex items-center justify-center text-evofit-purple-light">
                <Award size={18} />
              </div>
              <h3 className="text-xl font-extrabold m-0 text-evofit-text-primary tracking-tight">Recent Milestones</h3>
            </div>
            
            <div className="flex flex-col gap-4">
                {progressData?.recent_achievements?.length > 0 ? (
                  progressData.recent_achievements.map((ach, i) => (
                    <div key={ach.id} 
                      className="glass-card p-6 bg-evofit-bg-secondary border border-evofit-border flex gap-4.5 items-center animate-fade-in-up"
                      style={{ animationDelay: `${0.5 + i * 0.1}s` }}
                    >
                     <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-[0_0_20px_rgba(184,134,11,0.3)] shrink-0">
                        <Sparkles size={26} className="text-white" strokeWidth={2.5} />
                     </div>
                     <div>
                       <p className="m-0 mb-1 text-[15px] font-extrabold text-evofit-text-primary">{ach.badge_name}</p>
                       <p className="m-0 text-[13px] text-evofit-text-muted leading-relaxed font-medium">{ach.description}</p>
                     </div>
                  </div>
                ))
              ) : (
                <div className="glass-card p-10 text-center bg-evofit-bg-secondary border border-evofit-border">
                   <p className="m-0 text-sm text-evofit-text-muted font-medium">No milestones yet. Keep training to unlock badges!</p>
                </div>
              )}
              
              <button 
                onClick={openBadgesModal}
                className="w-full bg-transparent text-evofit-text-primary border border-evofit-border py-3.5 rounded-xl font-bold text-sm cursor-pointer hover:border-evofit-purple-main hover:text-evofit-purple-light hover:bg-evofit-purple-main/5 transition-all duration-200 uppercase tracking-widest mt-2 flex items-center justify-center gap-2"
              >
                <Trophy size={14} /> View All Badges
              </button>
            </div>
          </div>
  
        </div>
  
      </div>
      
      {/* Badges Modal */}
      {showBadgesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg p-8 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-evofit-text-primary">All Achievements</h2>
              <button onClick={() => setShowBadgesModal(false)} className="text-evofit-text-muted hover:text-evofit-text-primary">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
              {allAchievements.map((ach) => (
                <div key={ach.id} className="flex items-center gap-4 p-4 bg-evofit-bg-secondary rounded-xl border border-evofit-border">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-evofit-text-primary">{ach.badge_name}</p>
                    <p className="text-xs text-evofit-text-muted">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="w-full max-w-[1440px] py-10 border-t border-evofit-border text-center">
         <div className="flex justify-center gap-6 mb-4">
            <span className="text-[12px] text-evofit-text-muted font-semibold cursor-pointer hover:text-evofit-purple-light transition-colors">Privacy Policy</span>
            <span className="text-[12px] text-evofit-text-muted font-semibold cursor-pointer hover:text-evofit-purple-light transition-colors">Terms of Service</span>
            <span className="text-[12px] text-evofit-text-muted font-semibold cursor-pointer hover:text-evofit-purple-light transition-colors">Contact Coach</span>
         </div>
         <p className="m-0 text-[13px] text-evofit-text-muted font-medium">© 2025 EvoFit Analytics · High-Performance Training Systems</p>
      </footer>
    </div>
  );
}
