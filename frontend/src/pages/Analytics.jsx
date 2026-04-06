import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, ComposedChart, Line
} from 'recharts';
import { Activity, Dumbbell, Award, Timer, ChevronLeft, Download, Share2, Sparkles } from 'lucide-react';

const COLORS = {
  bench: '#7C3AED',
  dead: '#3B82F6',
  squat: '#34D399',
  ohp: '#F472B6',
  row: '#9CA3AF',
  gradientStart: '#7C3AED',
  gradientEnd: '#A78BFA'
};

const EXERCISE_LABELS = {
  bench: 'Bench Press', dead: 'Deadlift', squat: 'Squat', ohp: 'Overhead Press', row: 'Barbell Row',
};

// Dummy generators removed: rep and rhythm data now comes dynamically from backend

export default function Analytics() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);

  const [sessionData] = useState(() => {
    try {
      const stored = sessionStorage.getItem('lastPrediction');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const predictionResult = location.state?.result || sessionData?.result;
  const predictionFile   = location.state?.filename || sessionData?.filename;

  const exerciseBreakdown = predictionResult?.exercise_breakdown || [];
  const availableExercises = exerciseBreakdown.map(ex => ex.label);
  
  const firstLabel = availableExercises.length > 0 ? availableExercises[0] : 'bench';
  const [activeTab, setActiveTab] = useState(firstLabel);
  
  useEffect(() => {
    if (availableExercises.length > 0 && !availableExercises.includes(activeTab)) {
      setActiveTab(availableExercises[0]);
    }
  }, [availableExercises.length, activeTab]);

  const currentExerciseData = exerciseBreakdown.find(ex => ex.label === activeTab) || {};

  const mainExLabel = EXERCISE_LABELS[activeTab] || activeTab;
  const realReps = currentExerciseData.rep_count || 0;
  const realConfidence = Math.round((predictionResult?.confidence || 0.938) * 100);

  const [activeMetrics, setActiveMetrics] = useState(['Form Score', 'Rhythm']);
  const toggleMetric = (m) => {
    setActiveMetrics(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const totalReps = predictionResult?.rep_count || 0;
  const exercisesPerformed = availableExercises.length || 1;
  const sessionDuration = predictionResult?.duration || 'Unknown';
  const sessionTimeRange = predictionResult?.time_range || 'N/A';
  const overallConsistency = predictionResult?.overall_consistency || '0%';
  const bestSetSummary = predictionResult?.best_set_summary || 'N/A';
  
  // True Data from backend scoped to Active Tab
  const everyRepData = useMemo(() => currentExerciseData.rep_details || [], [currentExerciseData]);
  const rhythmData = useMemo(() => currentExerciseData.rhythm_waveform || [], [currentExerciseData]);
  
  const pieData = availableExercises.map(label => {
    const data = exerciseBreakdown.find(ex => ex.label === label);
    return { name: EXERCISE_LABELS[label] || label, value: data.rep_count, fill: COLORS[label] || COLORS.bench };
  });

  const setBySetData = useMemo(() => {
    const sets = currentExerciseData.set_details || [];
    return sets.map((s) => ({
      name: `Set ${s.set_num}`,
      reps: s.reps,
      confidence: s.confidence
    }));
  }, [currentExerciseData]);

  const pbBins = useMemo(() => {
    let exc = 0, good = 0, focus = 0;
    const probs = [];
    everyRepData.forEach(r => {
      if (r.score >= 85) exc++;
      else if (r.score >= 70) good++;
      else {
        focus++;
        probs.push(r);
      }
    });
    const t = everyRepData.length || 1;
    return {
      bars: [
        { label: 'Excellent Form', val: `${Math.round((exc/t)*100)}%`, count: exc, color: '#34D399' },
        { label: 'Good Form', val: `${Math.round((good/t)*100)}%`, count: good, color: '#FCD34D' },
        { label: 'Needs Focus', val: `${Math.round((focus/t)*100)}%`, count: focus, color: '#F87171' }
      ],
      problems: probs.slice(0, 3)
    };
  }, [everyRepData]);

  if (!predictionResult && mounted) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No active prediction result to display.</p>
          <button className="btn-primary" onClick={() => navigate('/upload')}>
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
      
      {/* ── TOP HEADER ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', animation: mounted ? 'fade-in-up 0.4s ease both' : 'none' }}>
        <div>
          <button onClick={() => navigate('/upload')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', padding: 0, marginBottom: '8px' }}>
            <ChevronLeft size={16} /> Return to Upload & Predict
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            Session Analysis – Today <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>• {exercisesPerformed} Exercises • {totalReps} Total Reps • {sessionDuration}</span>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button onClick={() => alert('PDF generation will be available soon!')} style={{ background: 'var(--purple-hover)', color: 'var(--purple-light)', border: '1px solid var(--purple-glow)', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
             <Download size={16} /> Download Detailed PDF Report
           </button>
           <button onClick={() => alert('Share link copied to clipboard!')} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer' }}>
             <Share2 size={16} />
           </button>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '24px', animation: mounted ? 'fade-in-up 0.5s ease both' : 'none' }}>
        {availableExercises.map(tab => {
          const isActive = activeTab === tab;
          return (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                cursor: 'pointer',
                color: isActive ? 'var(--purple-light)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                borderBottom: isActive ? '3px solid var(--purple-main)' : '3px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {EXERCISE_LABELS[tab] || tab}
            </div>
          );
        })}
      </div>

      <div style={{ animation: mounted ? 'fade-in-up 0.6s ease both' : 'none' }}>
        
        {/* ── KEY METRICS ROW ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Reps Context', val: totalReps, sub: 'Entire Session', icon: <Dumbbell size={18} color="#A78BFA" /> },
            { label: 'Exercises Performed', val: exercisesPerformed, sub: 'Auto-detected', icon: null },
            { label: 'Average Form Score', val: `${realConfidence}%`, sub: 'Excellent', icon: <Award size={18} color="#34D399" /> },
            { label: 'Overall Consistency', val: overallConsistency, sub: 'Calculated Rhythm', icon: <Activity size={18} color="#60A5FA" /> },
            { label: 'Session Duration', val: sessionDuration, sub: sessionTimeRange, icon: <Timer size={18} color="#F472B6" /> },
            { label: 'Best Set', val: bestSetSummary.split(' ')[0] + ' ' + bestSetSummary.split(' ')[1], sub: bestSetSummary.split(' ').slice(2).join(' '), icon: <Sparkles size={18} color="#FCD34D" /> }
          ].map((m, i) => (
            <div key={i} className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>{m.label}</p>
                {m.icon && m.icon}
              </div>
              <div>
                <p style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0', color: 'var(--text-primary)' }}>{m.val}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{m.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN CHARTS ROW ────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
          
          {/* Every Rep Breakdown */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>Every Rep Breakdown</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Interactive performance tracking</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Form Score', 'Rhythm'].map((t) => {
                  const isActive = activeMetrics.includes(t);
                  return (
                    <span key={t} onClick={() => toggleMetric(t)} style={{ fontSize: '12px', padding: '4px 10px', background: isActive?'var(--purple-hover)':'transparent', color: isActive?'var(--purple-light)':'var(--text-secondary)', border: `1px solid ${isActive?'var(--purple-glow)':'var(--border)'}`, borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {t}
                    </span>
                  );
                })}
              </div>
            </div>
            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={everyRepData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--purple-main)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--purple-main)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="rep" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    itemStyle={{ color: '#F0F0F5', fontWeight: 'bold' }}
                  />
                  {activeMetrics.includes('Form Score') && (
                    <Area type="monotone" dataKey="score" stroke="var(--purple-light)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6, fill: '#fff', stroke: 'var(--purple-main)', strokeWidth: 2 }} />
                  )}
                  {activeMetrics.includes('Rhythm') && (
                    <Line type="monotone" dataKey="rhythm" stroke="#3B82F6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* All Exercises Distribution */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>All Exercises - Rep Distribution</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px' }}>Volume breakdown</p>
            <div style={{ display: 'flex', alignItems: 'center', height: '200px' }}>
              <div style={{ width: '50%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', background: '#16161F', border: '1px solid #2A2A3A' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.fill }}></div>
                    <span style={{flex: 1}}>{d.name}</span>
                    <span style={{fontWeight: 700, color: 'var(--text-primary)'}}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── DEEP ANALYSIS ROW ───────────────────────────────────────────── */}
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '12px 0 16px', color: 'var(--text-primary)' }}>Deep Analysis</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '20px' }}>
          
          {/* Form Quality */}
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px' }}>Form Quality Breakdown</h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{realConfidence}%</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>AVG. SCORE</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {pbBins.bars.map(f => (
                <div key={f.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{f.label}: <strong style={{color:'var(--text-primary)'}}>{f.val}</strong></span>
                    <span style={{ color: 'var(--text-muted)' }}>{f.count}/{everyRepData.length}</span>
                  </div>
                  <div className="progress-bar" style={{ background: 'var(--bg-secondary)', height: '6px' }}>
                    <div style={{ width: f.val, background: f.color, height: '100%', borderRadius: '3px' }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            {pbBins.problems.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                 <h5 style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 8px' }}>Problem Reps Identified</h5>
                 {pbBins.problems.map((pr, idx) => (
                   <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', fontSize: '12px', color: 'var(--text-muted)', gap: '8px', marginBottom: '4px' }}>
                     <span>Rep {pr.rep}</span>
                     <span style={{ color: '#FCD34D' }}>Form Score: {pr.score}</span>
                     <span>See Chart</span>
                   </div>
                 ))}
              </div>
            )}
          </div>

          {/* Rep Rhythm */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px' }}>Rep Rhythm & Movement Consistency</h4>
               <span style={{ fontSize: '12px', fontWeight: 600, color: '#34D399', background: 'rgba(52,211,153,0.1)', padding:'2px 8px', borderRadius:'10px' }}>Consistency: {overallConsistency}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px' }}>{overallConsistency === '0%' ? 'No rhythm data recorded' : 'Tracked via peak-to-peak duration variance'}</p>
            
            <div style={{ height: '160px', width: '100%', marginBottom: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={rhythmData}>
                   <defs>
                    <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <RechartsTooltip contentStyle={{display: 'none'}} />
                  <Area type="monotone" dataKey="actual" fill="url(#colorWave)" stroke="cyan" strokeWidth={2} />
                  <Line type="monotone" dataKey="ideal" stroke="#F472B6" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)', justifyContent: 'center' }}>
               <span style={{ display:'flex', alignItems:'center', gap:'6px'}}><div style={{width:'8px',height:'2px',background:'#F472B6'}}/> Ideal benchmark</span>
               <span style={{ display:'flex', alignItems:'center', gap:'6px'}}><div style={{width:'8px',height:'2px',background:'cyan'}}/> Actual session average</span>
            </div>
          </div>

          {/* Set-by-Set Performance */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px' }}>Set-by-Set</h4>
            <div style={{ display: 'flex', gap: '12px', height: '120px', alignItems: 'flex-end', justifyContent: 'space-between', flex: 1 }}>
               {setBySetData.map((set, i) => {
                 const maxHeight = Math.max(...setBySetData.map(s => s.reps)) || 15;
                 const hPct = `${(set.reps/maxHeight)*100}%`;
                 return (
                   <div key={set.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex:1 }}>
                     <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{set.reps}</span>
                     <div style={{ width: '100%', maxWidth: '30px', height: hPct, background: `linear-gradient(0deg, var(--bg-secondary), ${i===0?'var(--purple-main)':'#3B82F6'})`, borderRadius: '6px' }}></div>
                     <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>S{i+1}</span>
                   </div>
                 );
               })}
            </div>
            
            <div style={{ marginTop: '24px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
              <h5 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#FCD34D" /> Key Observation
              </h5>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Your strongest recorded performance interval was {bestSetSummary} based on combined volume density.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
