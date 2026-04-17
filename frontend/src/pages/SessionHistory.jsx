import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  History, Search, Filter, Calendar, Activity, 
  ChevronRight, Dumbbell, Sparkles, ArrowRight, Clock
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

const EXERCISE_LABELS = {
  bench: 'Bench Press',
  dead:  'Deadlift',
  squat: 'Back Squat',
  ohp:   'Overhead Press',
  row:   'Barbell Row',
  pullups: 'Pull Ups',
  rest:  'Rest / Recovery',
};

export default function SessionHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [daysFilter, setDaysFilter] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      let url = 'http://127.0.0.1:8000/sessions/';
      if (daysFilter !== null) {
        url += `?days=${daysFilter}`;
      }
      const res = await axios.get(url);
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [daysFilter]);

  const filteredSessions = sessions.filter(s => 
    s.exercise.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewSessionDetail = async (sessionId) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/sessions/${sessionId}`);
      // Store in session storage to "mimic" a fresh prediction and navigate to Analytics
      sessionStorage.setItem('lastPrediction', JSON.stringify({ result: res.data }));
      navigate('/analytics');
    } catch (err) {
      console.error("Failed to fetch session detail", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-evofit-bg-primary">
        <div className="w-12 h-12 border-4 border-evofit-border border-t-evofit-purple-main rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-7 overflow-y-auto bg-evofit-bg-primary min-h-screen font-inter">
      {/* ── CENTRAL ARTBOARD (1200px) ─────────────────────────────────── */}
      <div className="evofit-page-container">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2 text-evofit-purple-light uppercase tracking-widest font-black text-xs">
              <History size={14} /> Training Log
            </div>
            <h1 className="text-4xl font-extrabold m-0 tracking-tight text-evofit-text-primary">Workout History</h1>
            <p className="text-evofit-text-secondary text-lg m-0 mt-2 font-medium max-w-[600px]">
              Every rep, every set, every milestone. Review your past performance and track your evolution.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-evofit-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search by exercise (e.g. Bench, Squat)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-evofit-bg-secondary border border-evofit-border rounded-2xl py-3.5 pl-12 pr-4 text-sm text-evofit-text-primary focus:outline-none focus:border-evofit-purple-main/50 transition-all shadow-inner"
              />
           </div>
           <button className="flex items-center justify-center gap-2 bg-evofit-bg-secondary border border-evofit-border px-6 py-3.5 rounded-2xl text-sm font-bold text-evofit-text-secondary hover:text-evofit-text-primary hover:border-evofit-purple-main/40 transition-all">
              <Filter size={18} /> Filters
           </button>
           <button 
             onClick={() => setDaysFilter(daysFilter === 30 ? null : 30)}
             className={`flex items-center justify-center gap-2 border px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${
               daysFilter === 30 
                 ? 'bg-evofit-purple-main/20 border-evofit-purple-main text-evofit-purple-light' 
                 : 'bg-evofit-bg-secondary border-evofit-border text-evofit-text-secondary hover:text-evofit-text-primary hover:border-evofit-purple-main/40'
             }`}
           >
              <Calendar size={18} /> Last 30 Days
           </button>
        </div>

        {/* Sessions List */}
        <div className="space-y-4 pb-12">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((s, i) => (
              <div 
                key={s.id} 
                onClick={() => viewSessionDetail(s.id)}
                className="glass-card p-6 md:p-5 shadow-premium-card hover:border-evofit-purple-main/40 transition-all group cursor-pointer grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_80px] items-start md:items-center gap-4 md:gap-6"
              >
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                       <Dumbbell size={20} className="text-evofit-purple-light" />
                    </div>
                    <div>
                       <h3 className="text-base font-extrabold text-evofit-text-primary m-0 uppercase tracking-tight">
                         {EXERCISE_LABELS[s.exercise] || s.exercise}
                       </h3>
                       <p className="text-xs text-evofit-text-muted m-0 font-bold mt-0.5">
                         {new Date(s.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                       </p>
                    </div>
                 </div>

                 <div className="flex flex-col">
                    <p className="text-[10px] text-evofit-text-muted font-bold uppercase mb-1">Total Reps</p>
                    <p className="text-[15px] font-black text-evofit-text-primary m-0">{s.reps} Reps</p>
                 </div>

                 <div className="flex flex-col">
                    <p className="text-[10px] text-evofit-text-muted font-bold uppercase mb-1">Avg. Form</p>
                    <div className="flex items-center gap-2">
                       <p className={`text-[15px] font-black m-0 ${s.form_score >= 90 ? 'text-cyan-400' : 'text-amber-400'}`}>
                         {s.form_score}%
                       </p>
                       <div className="w-12 h-1 bg-evofit-bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.form_score >= 90 ? 'bg-cyan-400' : 'bg-amber-400'}`} style={{ width: `${s.form_score}%` }} />
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col">
                    <p className="text-[10px] text-evofit-text-muted font-bold uppercase mb-1">Trend Map</p>
                    <div className="w-20 h-8">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={s.sparkline_data.map((v, idx) => ({ v, idx }))}>
                             <Line 
                               type="monotone" 
                               dataKey="v" 
                               stroke={s.form_score >= 90 ? '#22D3EE' : '#FBBF24'} 
                               strokeWidth={2} 
                               dot={false} 
                               animationDuration={2000}
                             />
                          </LineChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="flex justify-end pr-2">
                    <button className="w-10 h-10 rounded-xl bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center text-evofit-text-muted group-hover:text-evofit-purple-light group-hover:border-evofit-purple-main/40 transition-all shadow-inner">
                       <ArrowRight size={18} />
                    </button>
                 </div>
              </div>
            ))
          ) : (
            <div className="glass-card py-24 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 rounded-full bg-evofit-bg-secondary flex items-center justify-center mb-6 text-evofit-text-muted border border-evofit-border">
                  <Activity size={36} opacity={0.3} />
               </div>
               <h3 className="text-xl font-bold text-evofit-text-primary mb-2">No Sessions Found</h3>
               <p className="text-evofit-text-secondary max-w-sm font-medium">
                 Your training history is empty or matches no search results. Start a session from the upload tab!
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
