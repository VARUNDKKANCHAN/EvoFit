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
    <div className="flex-1 bg-[#F8FAFC] min-h-screen font-inter">
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
              <span className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">Active Exercise</span>
              <div className="flex items-center gap-3">
                {exerciseBreakdown.length > 1 ? (
                  <select 
                    value={activeExercise} 
                    onChange={(e) => setActiveExercise(e.target.value)}
                    className="bg-white border border-[#E5E7EB] px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-[#0F172A] outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all cursor-pointer appearance-none pr-10 relative"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                  >
                    {exerciseBreakdown.map(ex => (
                      <option key={ex.label} value={ex.label}>{ex.label.charAt(0).toUpperCase() + ex.label.slice(1)}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] px-4 py-2 rounded-xl shadow-sm">
                    <Dumbbell size={16} className="text-[#7C3AED]" />
                    <span className="text-[#0F172A] text-sm font-bold">{activeExercise.charAt(0).toUpperCase() + activeExercise.slice(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end md:self-center">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#64748B] bg-white border border-[#E5E7EB] rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <BarChart3 size={16} />
              <span>Full Report</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#7C3AED] rounded-xl hover:bg-[#6D28D9] transition-colors shadow-sm">
              <Zap size={16} />
              <span>Share Insight</span>
            </button>
          </div>
        </header>

        {/* --- KPI SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* PRIMARY KPI */}
          <motion.div variants={itemVars} className="lg:col-span-1 bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck size={120} className="text-[#7C3AED]" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-6">
                <MetricTooltip content={TOOLTIP_CONTENT.formScore}>
                  <span className="text-[#64748B] text-sm font-medium uppercase tracking-wider">Average Form Score</span>
                </MetricTooltip>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <ShieldCheck size={20} className="text-[#7C3AED]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-extrabold text-[#0F172A]">{displayData.formScore}%</span>
                <div className="flex items-center text-[#22C55E] text-sm font-bold bg-green-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight size={14} />
                  <span>2.4%</span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-[#F1F5F9]">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] text-sm">Performance Tier</span>
                <span className="text-[#22C55E] text-sm font-bold flex items-center gap-1.5">
                   <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
                   {displayData.status}
                </span>
              </div>
            </div>
          </motion.div>

          {/* SUPPORTING KPIs */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: 'Total Reps', val: displayData.totalReps, sub: '+12 from last week', icon: <Dumbbell size={20} />, color: 'purple' },
              { label: 'Consistency', val: displayData.consistency, sub: 'High Stability', icon: <Activity size={20} />, color: 'blue' },
              { label: 'Session Duration', val: displayData.duration, sub: 'Active time', icon: <Clock size={20} />, color: 'orange' },
              { label: 'Best Set', val: displayData.bestSet, sub: 'Personal Record', icon: <Zap size={20} />, color: 'amber' },
            ].map((kpi, i) => (
              <motion.div key={i} variants={itemVars} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:border-[#7C3AED]/30 transition-colors group">
                <div className="flex items-center justify-between mb-4">
                  <MetricTooltip content={
                    kpi.label === 'Total Reps' ? TOOLTIP_CONTENT.totalReps :
                    kpi.label === 'Consistency' ? TOOLTIP_CONTENT.consistency :
                    kpi.label === 'Session Duration' ? TOOLTIP_CONTENT.duration :
                    TOOLTIP_CONTENT.bestSet
                  }>
                    <span className="text-[#64748B] text-sm font-medium">{kpi.label}</span>
                  </MetricTooltip>
                  <div className={`p-2 rounded-xl bg-slate-50 text-[#64748B] group-hover:text-[#7C3AED] transition-colors`}>
                    {kpi.icon}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-[#0F172A]">{kpi.val}</span>
                  <span className="text-xs text-[#64748B] mt-1">{kpi.sub}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- MAIN CHART --- */}
        <motion.div variants={itemVars} className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">Rep-by-Rep Form Analysis</h3>
              <p className="text-sm text-[#64748B]">Real-time form score tracking across current session</p>
            </div>
            <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-xl border border-[#E5E7EB]">
              {['Score', 'Rhythm'].map((tab) => (
                <button 
                  key={tab}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === 'Score' ? 'bg-white text-[#7C3AED] shadow-sm border border-[#E5E7EB]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
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
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  domain={[60, 100]}
                />
                <RechartsTooltip 
                  cursor={{ stroke: '#7C3AED', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #E5E7EB', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '13px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#7C3AED" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  activeDot={{ r: 6, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* --- DEEP ANALYSIS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* A. Form Quality */}
          <motion.div variants={itemVars} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-[#22C55E]">
                <ShieldCheck size={18} />
              </div>
              <MetricTooltip content={TOOLTIP_CONTENT.formQuality}>
                <h3 className="font-bold text-[#0F172A]">Form Quality</h3>
              </MetricTooltip>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#64748B]">Form Breakdown</span>
                  <span className="font-bold text-[#0F172A]">Excellent</span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#22C55E] w-[88%] rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <MetricTooltip content={TOOLTIP_CONTENT.stability}>
                    <span className="text-[#64748B]">Stability Metric</span>
                  </MetricTooltip>
                  <span className="font-bold text-[#0F172A]">94/100</span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#7C3AED] w-[94%] rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* B. Performance Timing */}
          <motion.div variants={itemVars} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <Timer size={18} />
              </div>
              <MetricTooltip content={TOOLTIP_CONTENT.rhythm}>
                <h3 className="font-bold text-[#0F172A]">Performance Timing</h3>
              </MetricTooltip>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#64748B]">Rhythm</span>
                  <span className="font-bold text-[#0F172A]">Consistent</span>
                </div>
                <div className="flex gap-1 h-2">
                  {[100, 95, 98, 92, 96, 94].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-100 rounded-full overflow-hidden">
                       <div className="bg-blue-500 h-full" style={{ width: `${h}%` }} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <MetricTooltip content={TOOLTIP_CONTENT.tut}>
                    <span className="text-[#64748B]">Time Under Tension</span>
                  </MetricTooltip>
                  <span className="font-bold text-[#0F172A]">2.4s avg</span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 w-[72%] rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* C. Endurance */}
          <motion.div variants={itemVars} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                <TrendingUp size={18} />
              </div>
              <MetricTooltip content={TOOLTIP_CONTENT.fatigue}>
                <h3 className="font-bold text-[#0F172A]">Endurance</h3>
              </MetricTooltip>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#64748B]">Fatigue Map</span>
                  <span className="font-bold text-[#0F172A]">Low Decline</span>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {[40, 45, 42, 38, 35, 30].map((h, i) => (
                    <div key={i} className="flex-1 bg-orange-100 rounded-sm" style={{ height: `${h}px` }} />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <MetricTooltip content={TOOLTIP_CONTENT.recovery}>
                    <span className="text-[#64748B]">Recovery Rate</span>
                  </MetricTooltip>
                  <span className="font-bold text-[#0F172A]">Optimal</span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 w-[85%] rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- INSIGHT SECTION --- */}
        <motion.div variants={itemVars} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Lightbulb size={20} className="text-[#7C3AED]" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">Key Performance Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ul className="space-y-4">
              {displayData.insights.map((insight, i) => (
                <li key={i} className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#7C3AED] shrink-0" />
                  <p className="text-[#334155] leading-relaxed text-sm font-medium">{insight}</p>
                </li>
              ))}
            </ul>
            
            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-[#E5E7EB] flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-bold">AI</div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Coach's Suggestion</p>
                  <p className="text-xs text-[#64748B]">Powered by EvoFit Intelligence</p>
                </div>
              </div>
              <p className="text-sm text-[#334155] leading-relaxed italic">
                "Based on your current stability metrics, we recommend increasing your working weight by 2.5kg for the next session. Your form is exceptionally consistent at this volume."
              </p>
            </div>
          </div>
        </motion.div>

        {/* --- FOOTER --- */}
        <footer className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-[#E5E7EB] pt-8 gap-4 pb-12">
          <div className="flex items-center gap-2 text-[#64748B] text-sm">
            <Info size={16} />
            <span>Data updated 2 hours ago based on session #4829</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-[#64748B] text-sm font-medium hover:text-[#7C3AED] transition-colors">Documentation</button>
            <button className="text-[#64748B] text-sm font-medium hover:text-[#7C3AED] transition-colors">Support</button>
            <button className="text-[#64748B] text-sm font-medium hover:text-[#7C3AED] transition-colors">Feedback</button>
          </div>
        </footer>

      </motion.div>
    </div>
  );
}
