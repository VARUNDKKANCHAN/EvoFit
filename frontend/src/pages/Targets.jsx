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
  Plus, ChevronRight, Flame, Dumbbell, Activity, Timer, Sparkles
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

  if (loading) return <div className="flex items-center justify-center h-full"><div className="spinner" /></div>;

  return (
    <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', background: 'var(--bg-primary)', position: 'relative' }}>
      
      {/* ── TOP HEADER ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', animation: mounted ? 'fade-in-up 0.4s ease both' : 'none' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Targets & Progress
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            Visualize your fitness milestones and track weekly volume benchmarks.
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', 
          background: 'var(--purple-hover)', border: '1px solid var(--purple-glow)', 
          borderRadius: '12px', animation: 'pulse-glow 3s infinite' 
        }}>
          <Flame size={20} color="#A78BFA" fill="#7C3AED" />
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: 'var(--purple-light)', textTransform: 'uppercase' }}>Active Streak</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff' }}>12 Days</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* ── SET NEW TARGET CARD ───────────────────────────────────────── */}
        <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animation: mounted ? 'fade-in-up 0.5s ease both' : 'none', animationDelay: '0.1s' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--purple-hover)', border: '1px solid var(--purple-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TargetIcon size={18} color="var(--purple-light)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Set New Weekly Target</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Select Exercise</label>
                <select 
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                >
                  {EXERCISE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Weekly Rep Target</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number"
                    placeholder="e.g. 500"
                    value={repTarget}
                    onChange={(e) => setRepTarget(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 12px 12px 36px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                  <TrendingUp size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                </div>
              </div>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleSaveTarget}
            disabled={saving}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {saving ? 'Saving...' : <><Plus size={18} /> Save Weekly Target</>}
          </button>
        </div>

        {/* ── OVERALL PROGRESS CENTER ─────────────────────────────────── */}
        <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', animation: mounted ? 'fade-in-up 0.5s ease both' : 'none', animationDelay: '0.15s' }}>
          {/* Subtle background glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', background: 'var(--purple-glow)', filter: 'blur(60px)', opacity: 0.4, pointerEvents: 'none' }} />
          
          <div style={{ width: '180px', height: '180px', marginBottom: '20px', position: 'relative' }}>
             <CircularProgressbar
                value={progressData?.overall_percent || 0}
                strokeWidth={8}
                styles={buildStyles({
                  pathColor: `var(--purple-main)`,
                  trailColor: 'rgba(255,255,255,0.05)',
                  strokeLinecap: 'round',
                  pathTransitionDuration: 1.5,
                })}
             />
             <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#fff' }}>{progressData?.overall_percent}%</span>
                <span style={{ fontSize: '11px', color: 'var(--purple-light)', fontWeight: 700, letterSpacing: '0.05em' }}>OVERALL GOAL</span>
             </div>
          </div>
          
          <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700 }}>
            {progressData?.total_reps_done.toLocaleString()} reps done / {progressData?.total_reps_target.toLocaleString()} target
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Overall Goal Completion</p>
        </div>
      </div>

      {/* ── WEEKLY BREAKDOWN GRID ────────────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Weekly Breakdown Grid</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
             <span className="tag-pill" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>All Exercises</span>
             <span className="tag-pill">In Progress</span>
             <span className="tag-pill" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>Completed</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {progressData?.exercise_progress.map((ex, i) => (
            <div key={ex.exercise} className="card" style={{ padding: '20px', animation: mounted ? 'stagger-in 0.5s ease both' : 'none', animationDelay: `${0.2 + i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   {ex.exercise === 'dead' ? <Dumbbell size={16} color="var(--purple-light)" /> : <Activity size={16} color="var(--purple-light)" />}
                   <span style={{ fontWeight: 700, fontSize: '15px' }}>{ex.label}</span>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(52,211,153,0.1)', color: '#34D399', padding: '4px 8px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={10} fill="#34D399" /> {ex.streak_days} Day Streak
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{ex.percent_complete}% complete</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ex.current_reps} / {ex.target_reps} reps</span>
                </div>
                <div className="progress-bar" style={{ height: '8px' }}>
                   <div 
                    className="progress-fill" 
                    style={{ width: `${ex.percent_complete}%`, animation: 'fill-in 1s ease both' }} 
                   />
                </div>
              </div>

              <button 
                onClick={() => navigate(`/analytics?exercise=${ex.exercise}`)}
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--purple-glow)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                View Detailed Analysis <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '24px' }}>
        
        {/* ── TREND CHART ──────────────────────────────────────────────── */}
        <div className="card" style={{ padding: '24px', animation: mounted ? 'fade-in-up 0.5s ease both' : 'none', animationDelay: '0.4s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 4px' }}>Goal Completion Trend (Last 5 Weeks)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Historical completion percentage</p>
            </div>
            <TrendingUp size={20} color="var(--purple-light)" />
          </div>

          <div style={{ height: '240px', width: '100%', background: 'linear-gradient(180deg, rgba(124,58,237,0.02), transparent)', borderRadius: '12px', padding: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData?.weekly_trend}>
                <defs>
                   <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="var(--purple-light)" stopOpacity={1} />
                     <stop offset="100%" stopColor="var(--purple-main)" stopOpacity={0.6} />
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }} 
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(124,58,237,0.05)' }}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar 
                  dataKey="completion" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                  animationBegin={500}
                >
                  {progressData?.weekly_trend.map((entry, index) => (
                    <Cell key={`cell-${index}`} fillOpacity={entry.completion > 80 ? 1 : 0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── MILESTONES & BADGES ───────────────────────────────────────── */}
        <div style={{ animation: mounted ? 'fade-in-up 0.5s ease both' : 'none', animationDelay: '0.45s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Award size={18} color="var(--purple-light)" />
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Recent Milestones</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {progressData?.recent_achievements.length > 0 ? (
              progressData.recent_achievements.map((ach) => (
                <div key={ach.id} className="card" style={{ padding: '16px', background: 'linear-gradient(135deg, var(--bg-card), rgba(124,58,237,0.03))', display: 'flex', gap: '14px', alignItems: 'center' }}>
                   <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700, #B8860B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={20} color="#fff" />
                   </div>
                   <div>
                     <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700 }}>{ach.badge_name}</p>
                     <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{ach.description}</p>
                   </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                 <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>No milestones yet. Keep training to unlock badges!</p>
              </div>
            )}
            
            <button className="btn-secondary" style={{ width: '100%', marginTop: '8px' }}>
              View All Badges
            </button>
          </div>
        </div>

      </div>

      <footer style={{ marginTop: '48px', borderTop: '1px solid var(--border)', paddingTop: '20px', textAlign: 'center' }}>
         <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>© 2025 EvoFit Analytics · Precision Training Data</p>
      </footer>

    </div>
  );
}
