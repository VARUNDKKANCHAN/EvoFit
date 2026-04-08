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
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px', 
      overflowY: 'auto', 
      background: 'var(--bg-primary)',
      minHeight: '100vh'
    }}>
      {/* ── CENTRAL ARTBOARD (1440px) ─────────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: '1440px', animation: mounted ? 'fade-in 0.6s ease both' : 'none' }}>
        
        {/* ── TOP HEADER ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ animation: 'slide-in-left 0.5s ease both' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-1px', color: '#fff' }}>
              Targets & Progress
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', margin: 0 }}>
              Visualize your fitness milestones and track weekly volume benchmarks.
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 24px', 
            background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.3)', 
            borderRadius: '20px', boxShadow: '0 0 25px rgba(124, 58, 237, 0.15)',
            animation: 'pulse-glow 2.5s infinite' 
          }}>
            <Flame size={24} color="#A78BFA" fill="#7C3AED" />
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Streak</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fff' }}>{progressData?.current_streak || 0} Days</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 480px', gap: '28px', marginBottom: '28px' }}>
          
          {/* ── SET NEW TARGET SECTION ───────────────────────────────────── */}
          <div className="card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)' }}>
                <TargetIcon size={22} color="#A78BFA" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#fff' }}>Set New Weekly Target</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 600 }}>Exercise Perspective</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 18px', color: '#fff', fontSize: '15px', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                  >
                    {EXERCISE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <ChevronRight size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '16px', top: '16px', transform: 'rotate(90deg)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 600 }}>Weekly Rep Target</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number"
                    placeholder="e.g. 500"
                    value={repTarget}
                    onChange={(e) => setRepTarget(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 14px 14px 44px', color: '#fff', fontSize: '15px', outline: 'none' }}
                  />
                  <TrendingUp size={18} color="var(--purple-light)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                </div>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={handleSaveTarget}
              disabled={saving}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', fontSize: '16px', borderRadius: '14px', textTransform: 'uppercase', letterSpacing: '0.02em' }}
            >
              {saving ? 'Synchronizing...' : <><Plus size={20} /> Save New Target</>}
            </button>
          </div>

          {/* ── OVERALL PROGRESS CENTER ─────────────────────────────────── */}
          <div className="card" style={{ 
            padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            textAlign: 'center', position: 'relative', overflow: 'hidden', 
            border: '1px solid rgba(124, 58, 237, 0.2)',
            background: 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.08), transparent)'
          }}>
            <div style={{ width: '220px', height: '220px', marginBottom: '28px', position: 'relative', filter: 'drop-shadow(0 0 30px rgba(124, 58, 237, 0.15))' }}>
               <CircularProgressbar
                  value={progressData?.overall_percent || 0}
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: `#7C3AED`,
                    trailColor: 'rgba(255,255,255,0.04)',
                    strokeLinecap: 'round',
                    pathTransitionDuration: 2.0,
                  })}
               />
               <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '48px', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{progressData?.overall_percent}%</span>
                  <div style={{ width: '40px', height: '2px', background: 'var(--purple-light)', margin: '4px 0' }} />
                  <span style={{ fontSize: '11px', color: 'var(--purple-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>COMPLETE</span>
               </div>
            </div>
            
            <div style={{ animation: 'fade-in 1s ease both' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800, color: '#fff' }}>
                {progressData?.total_reps_done.toLocaleString()} reps done <span style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: 400 }}>/ {progressData?.total_reps_target.toLocaleString()} total target</span>
              </h4>
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-muted)', fontWeight: 500 }}>Overall Goal Completion</p>
            </div>
          </div>
        </div>

        {/* ── WEEKLY BREAKDOWN GRID ────────────────────────────────────── */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#fff' }}>Weekly Breakdown Grid</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
               <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.3)', color: '#22D3EE', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> Consistency Score: {progressData?.overall_form_score}%
               </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {progressData?.exercise_progress.map((ex, i) => (
              <div key={ex.exercise} className="card" style={{ 
                padding: '28px', borderRadius: '20px', background: 'var(--bg-card)', 
                animation: 'stagger-in 0.6s ease both', animationDelay: `${0.1 * i}s`,
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                position: 'relative', overflow: 'hidden'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {/* Subtle Cyan Glow for in-progress items */}
                {ex.percent_complete > 0 && ex.percent_complete < 100 && (
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: 'radial-gradient(circle at top right, rgba(34, 211, 238, 0.05), transparent)', pointerEvents: 'none' }} />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {ex.exercise === 'dead' ? <Dumbbell size={18} color="#A78BFA" /> : <Activity size={18} color="#A78BFA" />}
                     </div>
                     <span style={{ fontWeight: 800, fontSize: '18px', color: '#fff' }}>{ex.label}</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <Flame size={12} fill="#F59E0B" /> {ex.streak_days} DAY STREAK
                  </div>
                </div>
                
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--purple-light)', fontWeight: 700 }}>{ex.percent_complete}% complete</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{ex.current_reps} <span style={{ color: 'var(--text-muted)' }}>/ {ex.target_reps} reps</span></span>
                  </div>
                  <div className="progress-bar" style={{ height: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '5px' }}>
                     <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${ex.percent_complete}%`, 
                        background: 'linear-gradient(90deg, #7C3AED, #22D3EE)',
                        boxShadow: '0 0 15px rgba(124, 58, 237, 0.3)',
                        animation: 'fill-in 1.2s cubic-bezier(0.4, 0, 0.2, 1) both' 
                      }} 
                     />
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weekly Volume Fill Animation</p>
                </div>
  
                <button 
                  onClick={() => navigate(`/analytics?exercise=${ex.exercise}&session=latest`)}
                  style={{ 
                    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', 
                    borderRadius: '12px', padding: '12px', color: 'var(--text-secondary)', 
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  View Detailed Analysis <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
  
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '32px', marginBottom: '60px' }}>
          
          {/* ── GOAL PERFORMANCE TREND ─────────────────────────────────── */}
          <div className="card" style={{ padding: '36px', borderRadius: '24px', background: 'var(--bg-card)', boxShadow: '0 15px 45px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px', color: '#fff', letterSpacing: '-0.5px' }}>Goal Completion Trend (Last 5 Weeks)</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Historical performance synchronized with Analytics</p>
              </div>
              <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '10px', borderRadius: '12px' }}>
                <TrendingUp size={24} color="#A78BFA" />
              </div>
            </div>
  
            <div style={{ height: '320px', width: '100%', padding: '0 10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData?.weekly_trend}>
                  <defs>
                     <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.9} />
                       <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.6} />
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
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
                    cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
                    contentStyle={{ 
                      background: '#161621', border: '1px solid rgba(124, 58, 237, 0.3)', 
                      borderRadius: '12px', fontSize: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      color: '#fff', fontWeight: 600
                    }}
                    itemStyle={{ color: '#A78BFA' }}
                  />
                  <Bar 
                    dataKey="completion" 
                    fill="url(#trendGradient)" 
                    radius={[8, 8, 4, 4]} 
                    barSize={48}
                    animationDuration={1500}
                  >
                    {progressData?.weekly_trend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fillOpacity={entry.completion > 80 ? 1 : 0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
  
          {/* ── RECENT MILESTONES & BADGES ───────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={18} color="#A78BFA" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>Recent Milestones</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {progressData?.recent_achievements.length > 0 ? (
                progressData.recent_achievements.map((ach, i) => (
                  <div key={ach.id} className="card" style={{ 
                    padding: '24px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)',
                    display: 'flex', gap: '18px', alignItems: 'center', borderRadius: '18px',
                    animation: 'fade-in-up 0.5s ease both', animationDelay: `${0.5 + i * 0.1}s`
                  }}>
                     <div style={{ 
                       width: '56px', height: '56px', borderRadius: '18px', 
                       background: 'linear-gradient(135deg, #FFD700, #B8860B)', 
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       boxShadow: '0 0 20px rgba(184, 134, 11, 0.3)', flexShrink: 0
                     }}>
                        <Sparkles size={26} color="#fff" strokeWidth={2.5} />
                     </div>
                     <div>
                       <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#fff' }}>{ach.badge_name}</p>
                       <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 500 }}>{ach.description}</p>
                     </div>
                  </div>
                ))
              ) : (
                <div className="card" style={{ padding: '40px 24px', textAlign: 'center', borderRadius: '18px', background: 'rgba(255,255,255,0.01)' }}>
                   <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>No milestones yet. Keep training to unlock badges!</p>
                </div>
              )}
              
              <button 
                className="btn-secondary" 
                style={{ width: '100%', marginTop: '8px', padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                View All Badges
              </button>
            </div>
          </div>
  
        </div>
  
      </div>
      
      <footer style={{ width: '100%', maxWidth: '1440px', padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
         <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Privacy Policy</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Terms of Service</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Contact Coach</span>
         </div>
         <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>© 2025 EvoFit Analytics · High-Performance Training Systems</p>
      </footer>
    </div>
  );
}
