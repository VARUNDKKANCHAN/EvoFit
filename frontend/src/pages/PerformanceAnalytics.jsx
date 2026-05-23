import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { 
  Activity, 
  Dumbbell, 
  Clock, 
  Zap, 
  ChevronRight, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldCheck, 
  Timer, 
  BarChart3,
  Lightbulb,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MetricTooltip from '../components/MetricTooltip';

const TOOLTIP_CONTENT = {
  formScore: "Overall quality of your movement based on joint alignment and range of motion.",
  totalReps: "Total number of completed repetitions during this session.",
  consistency: "How well you maintained your form throughout the entire set.",
  duration: "The total time elapsed from your first rep to your last.",
  bestSet: "Your highest performance set based on weight, reps, and form quality.",
  formQuality: "A deep dive into your movement precision and range of motion.",
  stability: "Measurement of how much your body wobbled or deviated from the ideal path.",
  rhythm: "The consistency of your repetition tempo (concentric and eccentric phases).",
  tut: "Total time your muscles were under load during the movement.",
  fatigue: "Visualization of how your performance declined as the session progressed.",
  recovery: "How quickly your performance returns to baseline after a set."
};

const MOCK_DATA = {
  formScore: 94,
  status: 'Excellent',
  totalReps: 142,
  consistency: '92%',
  duration: '48m 12s',
  bestSet: '12 reps @ 85kg',
  exercise: 'Bench Press',
  chartData: [
    { name: 'Rep 1', score: 88, rhythm: 1.2 },
    { name: 'Rep 2', score: 92, rhythm: 1.1 },
    { name: 'Rep 3', score: 95, rhythm: 1.0 },
    { name: 'Rep 4', score: 91, rhythm: 1.3 },
    { name: 'Rep 5', score: 96, rhythm: 1.1 },
    { name: 'Rep 6', score: 98, rhythm: 1.0 },
    { name: 'Rep 7', score: 94, rhythm: 1.2 },
    { name: 'Rep 8', score: 95, rhythm: 1.1 },
    { name: 'Rep 9', score: 89, rhythm: 1.4 },
    { name: 'Rep 10', score: 93, rhythm: 1.2 },
  ],
  insights: [
    "Your form remained highly stable even as fatigue set in during later sets.",
    "Concentric speed decreased by 12% in the final set, suggesting near-failure effort.",
    "Rhythm consistency improved by 8% compared to your previous session."
  ]
};

export default function PerformanceAnalytics() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeExercise, setActiveExercise] = useState('Bench Press');

  // --- DATA LOADING ---
  const [sessionData] = useState(() => {
    try {
      const stored = sessionStorage.getItem('lastPrediction');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const predictionResult = location.state?.result || sessionData?.result;
  
  const exerciseBreakdown = predictionResult?.exercise_breakdown || [];
  const currentExerciseData = exerciseBreakdown.find(ex => ex.label === activeExercise.toLowerCase()) || exerciseBreakdown[0] || {};
  
  const displayData = useMemo(() => {
    if (!predictionResult) return MOCK_DATA;

    const repDetails = currentExerciseData.rep_details || [];
    const chartData = repDetails.map((r, i) => ({
      name: `Rep ${r.rep}`,
      score: r.score,
      rhythm: r.rhythm || 1.0
    }));

    return {
      formScore: Math.round(repDetails.reduce((acc, r) => acc + (r.score || 0), 0) / (repDetails.length || 1)),
      status: (repDetails.length > 0 && repDetails[0].score > 85) ? 'Excellent' : 'Good',
      totalReps: predictionResult.rep_count || repDetails.length,
      consistency: predictionResult.overall_consistency || 'N/A',
      duration: predictionResult.duration || 'N/A',
      bestSet: predictionResult.best_set_summary || 'N/A',
      exercise: currentExerciseData.label || 'Exercise',
      chartData: chartData.length > 0 ? chartData : MOCK_DATA.chartData,
      insights: [
        predictionResult.ai_insight || "No specific AI insight available for this session.",
        `Stability score: ${currentExerciseData.stability_score || 'N/A'}`,
        `Tempo ratio: ${currentExerciseData.tempo_ratio || 'N/A'}`
      ]
    };
  }, [predictionResult, currentExerciseData]);

  // Update active exercise if data is present
  useState(() => {
    if (exerciseBreakdown.length > 0) {
      setActiveExercise(exerciseBreakdown[0].label);
    }
  }, [exerciseBreakdown]);

  // Animation variants
  const containerVars = {
    animate: { transition: { staggerChildren: 0.05 } }
  };
  
  const itemVars = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex-1 min-h-full" style={{ background: 'var(--bg-primary)' }}>
      <motion.div 
        variants={containerVars}
        initial="initial"
        animate="animate"
        className="max-w-[1400px] mx-auto p-6 md:p-10"
      >
        {/* --- SUB-HEADER / EXERCISE SELECT --- */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Active Exercise</span>
              <div className="flex items-center gap-3">
                {exerciseBreakdown.length > 1 ? (
                  <select 
                    value={activeExercise} 
                    onChange={(e) => setActiveExercise(e.target.value)}
                    className="px-4 py-2 rounded-xl shadow-sm text-sm font-bold outline-none transition-all cursor-pointer appearance-none pr-10"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '16px',
                    }}
                  >
                    {exerciseBreakdown.map(ex => (
                      <option key={ex.label} value={ex.label}>{ex.label.charAt(0).toUpperCase() + ex.label.slice(1)}</option>
                    ))}
                  </select>
                ) : (
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <Dumbbell size={16} style={{ color: 'var(--purple-main)' }} />
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {activeExercise.charAt(0).toUpperCase() + activeExercise.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end md:self-center">
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors shadow-sm hover:opacity-80"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <BarChart3 size={16} />
              <span>Full Report</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm hover:opacity-90"
              style={{ background: 'var(--purple-main)' }}
            >
              <Zap size={16} />
              <span>Share Insight</span>
            </button>
          </div>
        </header>

        {/* --- KPI SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* PRIMARY KPI */}
          <motion.div
            variants={itemVars}
            className="lg:col-span-1 rounded-2xl p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group saas-card"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.04] group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck size={120} style={{ color: 'var(--purple-main)' }} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-6">
                <MetricTooltip content={TOOLTIP_CONTENT.formScore}>
                  <span className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Average Form Score
                  </span>
                </MetricTooltip>
                <div className="p-2 rounded-lg" style={{ background: 'rgba(124,58,237,0.1)' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--purple-main)' }} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  {displayData.formScore}%
                </span>
                <div className="flex items-center text-sm font-bold px-2 py-0.5 rounded-full" style={{ color: '#22C55E', background: 'rgba(34,197,94,0.1)' }}>
                  <ArrowUpRight size={14} />
                  <span>2.4%</span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Performance Tier</span>
                <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: '#22C55E' }}>
                   <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22C55E' }} />
                   {displayData.status}
                </span>
              </div>
            </div>
          </motion.div>

          {/* SUPPORTING KPIs */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: 'Total Reps', val: displayData.totalReps, sub: '+12 from last week', icon: <Dumbbell size={20} />, tooltipKey: 'totalReps' },
              { label: 'Consistency', val: displayData.consistency, sub: 'High Stability', icon: <Activity size={20} />, tooltipKey: 'consistency' },
              { label: 'Session Duration', val: displayData.duration, sub: 'Active time', icon: <Clock size={20} />, tooltipKey: 'duration' },
              { label: 'Best Set', val: displayData.bestSet, sub: 'Personal Record', icon: <Zap size={20} />, tooltipKey: 'bestSet' },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                variants={itemVars}
                className="rounded-2xl p-6 shadow-sm saas-card group"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <MetricTooltip content={TOOLTIP_CONTENT[kpi.tooltipKey]}>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{kpi.label}</span>
                  </MetricTooltip>
                  <div
                    className="p-2 rounded-xl transition-colors"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                  >
                    {kpi.icon}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{kpi.val}</span>
                  <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{kpi.sub}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- MAIN CHART --- */}
        <motion.div variants={itemVars} className="rounded-2xl p-8 shadow-sm mb-8 saas-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>Rep-by-Rep Form Analysis</h3>
              <p className="text-sm mt-1 m-0" style={{ color: 'var(--text-muted)' }}>Real-time form score tracking across current session</p>
            </div>
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
            >
              {['Score', 'Rhythm'].map((tab) => (
                <button 
                  key={tab}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === 'Score' ? 'shadow-sm' : 'hover:opacity-80'}`}
                  style={tab === 'Score'
                    ? { background: 'var(--bg-card)', color: 'var(--purple-main)', border: '1px solid var(--border)' }
                    : { background: 'transparent', color: 'var(--text-muted)' }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScorePA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple-main)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--purple-main)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  domain={[60, 100]}
                />
                <RechartsTooltip 
                  cursor={{ stroke: 'var(--purple-main)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid var(--border)', 
                    background: 'var(--bg-card)',
                    boxShadow: 'var(--card-shadow)',
                    padding: '12px',
                    color: 'var(--text-primary)',
                  }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-muted)', fontSize: 11 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="var(--purple-main)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorScorePA)" 
                  activeDot={{ r: 6, fill: 'var(--purple-main)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* --- DEEP ANALYSIS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* A. Form Quality */}
          <motion.div variants={itemVars} className="rounded-2xl p-6 shadow-sm saas-card">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                <ShieldCheck size={18} />
              </div>
              <MetricTooltip content={TOOLTIP_CONTENT.formQuality}>
                <h3 className="font-bold m-0" style={{ color: 'var(--text-primary)' }}>Form Quality</h3>
              </MetricTooltip>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: 'var(--text-muted)' }}>Form Breakdown</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Excellent</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: '88%', background: '#22C55E' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <MetricTooltip content={TOOLTIP_CONTENT.stability}>
                    <span style={{ color: 'var(--text-muted)' }}>Stability Metric</span>
                  </MetricTooltip>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>94/100</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: '94%', background: 'var(--purple-main)' }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* B. Performance Timing */}
          <motion.div variants={itemVars} className="rounded-2xl p-6 shadow-sm saas-card">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                <Timer size={18} />
              </div>
              <MetricTooltip content={TOOLTIP_CONTENT.rhythm}>
                <h3 className="font-bold m-0" style={{ color: 'var(--text-primary)' }}>Performance Timing</h3>
              </MetricTooltip>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: 'var(--text-muted)' }}>Rhythm</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Consistent</span>
                </div>
                <div className="flex gap-1 h-2">
                  {[100, 95, 98, 92, 96, 94].map((h, i) => (
                    <div key={i} className="flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(59,130,246,0.15)' }}>
                       <div className="h-full" style={{ width: `${h}%`, background: '#3B82F6' }} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <MetricTooltip content={TOOLTIP_CONTENT.tut}>
                    <span style={{ color: 'var(--text-muted)' }}>Time Under Tension</span>
                  </MetricTooltip>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>2.4s avg</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: '72%', background: '#60A5FA' }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* C. Endurance */}
          <motion.div variants={itemVars} className="rounded-2xl p-6 shadow-sm saas-card">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}>
                <TrendingUp size={18} />
              </div>
              <MetricTooltip content={TOOLTIP_CONTENT.fatigue}>
                <h3 className="font-bold m-0" style={{ color: 'var(--text-primary)' }}>Endurance</h3>
              </MetricTooltip>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: 'var(--text-muted)' }}>Fatigue Map</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Low Decline</span>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {[40, 45, 42, 38, 35, 30].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{ height: `${h}px`, background: 'rgba(249,115,22,0.25)' }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <MetricTooltip content={TOOLTIP_CONTENT.recovery}>
                    <span style={{ color: 'var(--text-muted)' }}>Recovery Rate</span>
                  </MetricTooltip>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Optimal</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: '85%', background: '#FB923C' }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- INSIGHT SECTION --- */}
        <motion.div variants={itemVars} className="rounded-2xl p-8 shadow-sm saas-card">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(124,58,237,0.1)' }}>
              <Lightbulb size={20} style={{ color: 'var(--purple-main)' }} />
            </div>
            <h3 className="text-xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Key Performance Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ul className="space-y-4">
              {displayData.insights.map((insight, i) => (
                <li key={i} className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--purple-main)' }} />
                  <p className="leading-relaxed text-sm font-medium m-0" style={{ color: 'var(--text-secondary)' }}>
                    {insight}
                  </p>
                </li>
              ))}
            </ul>
            
            <div
              className="rounded-2xl p-6 flex flex-col justify-center"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: 'var(--purple-main)' }}
                >
                  AI
                </div>
                <div>
                  <p className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>Coach's Suggestion</p>
                  <p className="text-xs m-0" style={{ color: 'var(--text-muted)' }}>Powered by EvoFit Intelligence</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed italic m-0" style={{ color: 'var(--text-secondary)' }}>
                "Based on your current stability metrics, we recommend increasing your working weight by 2.5kg for the next session. Your form is exceptionally consistent at this volume."
              </p>
            </div>
          </div>
        </motion.div>

        {/* --- FOOTER --- */}
        <footer
          className="mt-12 flex flex-col sm:flex-row items-center justify-between pt-8 gap-4 pb-12"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Info size={16} />
            <span>Data updated based on your most recent prediction session.</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              Documentation
            </button>
            <button
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              Support
            </button>
            <button
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              Feedback
            </button>
          </div>
        </footer>

      </motion.div>
    </div>
  );
}
