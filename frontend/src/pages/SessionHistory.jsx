import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/auth';
import { 
  Search, Filter, Calendar, Activity, 
  ChevronRight, Dumbbell, ArrowUpRight, 
  Clock, TrendingUp, Award, BarChart3,
  ChevronDown, SortDesc
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

// --- Helper Components ---

const FilterPill = ({ label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${
      active 
        ? 'bg-evofit-purple-main text-white border-evofit-purple-main shadow-md shadow-evofit-purple-main/20' 
        : 'bg-evofit-bg-card text-evofit-text-secondary border-evofit-border hover:border-evofit-purple-main/30'
    }`}
  >
    {Icon && <Icon size={14} />}
    {label}
  </button>
);

const SummaryCard = ({ label, value, icon: Icon, colorClass }) => (
  <div className="bg-evofit-bg-card border border-evofit-border rounded-xl p-5 flex items-center gap-4 flex-1">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-wider m-0">{label}</p>
      <p className="text-xl font-bold text-evofit-text-primary m-0 mt-0.5">{value}</p>
    </div>
  </div>
);

const WorkoutRow = ({ session, onClick }) => {
  const date = new Date(session.date);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div 
      onClick={() => onClick(session.id)}
      className="group flex items-center gap-4 py-3 px-4 border-b border-evofit-border last:border-b-0 hover:bg-evofit-bg-primary/50 transition-colors cursor-pointer"
    >
      {/* Left: Icon & Name */}
      <div className="flex items-center gap-4 flex-[2] min-w-0">
        <div className="w-9 h-9 rounded-lg bg-evofit-bg-primary flex items-center justify-center text-evofit-text-muted group-hover:bg-evofit-purple-main/10 group-hover:text-evofit-purple-main transition-colors shrink-0 border border-evofit-border">
          <Dumbbell size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-evofit-text-primary m-0 truncate">
            {EXERCISE_LABELS[session.exercise] || session.exercise}
          </p>
          <p className="text-[12px] text-evofit-text-muted m-0 mt-0.5">
            {formattedDate} • {formattedTime}
          </p>
        </div>
      </div>

      {/* Center: Reps */}
      <div className="flex-[1] text-center hidden sm:block">
        <p className="text-[11px] font-bold text-evofit-text-muted uppercase m-0">Total Reps</p>
        <p className="text-[14px] font-bold text-evofit-text-primary m-0">{session.reps}</p>
      </div>

      {/* Center: Form */}
      <div className="flex-[1] text-center">
        <p className="text-[11px] font-bold text-evofit-text-muted uppercase m-0">Avg. Form</p>
        <p className={`text-[14px] font-bold m-0 ${session.form_score >= 90 ? 'text-green-600' : 'text-amber-500'}`}>
          {session.form_score}%
        </p>
      </div>

      {/* Right: Sparkline */}
      <div className="flex-[1.5] h-8 hidden md:block">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={session.sparkline_data.map((v, idx) => ({ v, idx }))}>
            <Line 
              type="monotone" 
              dataKey="v" 
              stroke="#7C3AED" 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={true}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Action */}
      <div className="w-8 flex justify-end">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-evofit-text-muted/30 group-hover:text-evofit-purple-main group-hover:bg-evofit-purple-main/10 transition-all">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
};

export default function SessionHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      let url = '/sessions/';
      const params = [];
      if (daysFilter !== null) params.push(`days=${daysFilter}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const res = await api.get(url);
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

  // Derived data
  const filteredAndSortedSessions = useMemo(() => {
    let result = sessions.filter(s => {
      const matchesSearch = s.exercise.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (EXERCISE_LABELS[s.exercise] || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesExercise = exerciseFilter === 'all' || s.exercise === exerciseFilter;
      return matchesSearch && matchesExercise;
    });

    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOrder === 'highest_form') {
      result.sort((a, b) => b.form_score - a.form_score);
    }

    return result;
  }, [sessions, searchQuery, exerciseFilter, sortOrder]);

  const groupedSessions = useMemo(() => {
    const groups = {
      today: [],
      thisWeek: [],
      earlier: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    filteredAndSortedSessions.forEach(s => {
      const d = new Date(s.date);
      if (d >= today) {
        groups.today.push(s);
      } else if (d >= oneWeekAgo) {
        groups.thisWeek.push(s);
      } else {
        groups.earlier.push(s);
      }
    });

    return groups;
  }, [filteredAndSortedSessions]);

  const summaryStats = useMemo(() => {
    if (sessions.length === 0) return { total: 0, avgForm: 0, bestExercise: '-' };
    
    const total = sessions.length;
    const avgForm = Math.round(sessions.reduce((acc, s) => acc + s.form_score, 0) / total);
    
    // Count occurrences for best exercise
    const counts = {};
    sessions.forEach(s => counts[s.exercise] = (counts[s.exercise] || 0) + 1);
    const bestKey = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    const bestExercise = EXERCISE_LABELS[bestKey] || bestKey;

    return { total, avgForm, bestExercise };
  }, [sessions]);

  const viewSessionDetail = async (sessionId) => {
    try {
      const res = await api.get(`/sessions/${sessionId}`);
      sessionStorage.setItem('lastPrediction', JSON.stringify({ result: res.data }));
      navigate('/analytics');
    } catch (err) {
      console.error("Failed to fetch session detail", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-evofit-bg-primary">
        <div className="w-10 h-10 border-2 border-evofit-border border-t-evofit-purple-main rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-evofit-bg-primary min-h-screen font-inter pb-20">
      <div className="max-w-[1000px] mx-auto px-6 py-10 animate-fade-in">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-evofit-text-primary m-0">Workout History</h1>
          <p className="text-sm text-evofit-text-muted mt-1 m-0">Track and analyze your past training sessions to optimize performance.</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-4 mb-10">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-evofit-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search exercise history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-evofit-bg-card border border-evofit-border rounded-xl py-3 pl-12 pr-4 text-sm text-evofit-text-primary focus:outline-none focus:ring-2 focus:ring-evofit-purple-main/20 focus:border-evofit-purple-main transition-all placeholder:text-evofit-text-muted/50"
            />
          </div>

          {/* Pill Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <FilterPill 
                label="All Sessions" 
                active={exerciseFilter === 'all'} 
                onClick={() => setExerciseFilter('all')} 
              />
              <div className="relative">
                <select 
                  value={exerciseFilter}
                  onChange={(e) => setExerciseFilter(e.target.value)}
                  className={`appearance-none bg-evofit-bg-card border border-evofit-border rounded-full px-4 py-2 pr-10 text-sm font-bold focus:outline-none hover:border-evofit-purple-main/30 cursor-pointer ${exerciseFilter !== 'all' ? 'border-evofit-purple-main text-evofit-purple-main ring-1 ring-evofit-purple-main/20' : 'text-evofit-text-secondary'}`}
                >
                  <option value="all">Exercise Type</option>
                  {Object.entries(EXERCISE_LABELS).map(([key, label]) => (
                    <option key={key} value={key} className="bg-evofit-bg-card">{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-evofit-text-muted pointer-events-none" size={14} />
              </div>
            </div>

            <div className="h-6 w-px bg-evofit-border mx-1" />

            <FilterPill 
              label="Last 7 Days" 
              icon={Calendar}
              active={daysFilter === 7} 
              onClick={() => setDaysFilter(daysFilter === 7 ? null : 7)} 
            />
            <FilterPill 
              label="Last 30 Days" 
              active={daysFilter === 30} 
              onClick={() => setDaysFilter(daysFilter === 30 ? null : 30)} 
            />

            <div className="ml-auto flex items-center gap-2">
              <p className="text-[12px] font-bold text-evofit-text-muted uppercase tracking-wider mr-1">Sort</p>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-transparent text-sm font-bold text-evofit-text-secondary focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest_form">Highest Form</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <SummaryCard 
            label="Total Sessions" 
            value={summaryStats.total} 
            icon={Activity} 
            colorClass="bg-evofit-purple-main/10 text-evofit-purple-main" 
          />
          <SummaryCard 
            label="Avg. Form Score" 
            value={`${summaryStats.avgForm}%`} 
            icon={TrendingUp} 
            colorClass="bg-green-500/10 text-green-500" 
          />
          <SummaryCard 
            label="Main Exercise" 
            value={summaryStats.bestExercise} 
            icon={Award} 
            colorClass="bg-blue-500/10 text-blue-500" 
          />
        </div>

        {/* Activity List */}
        <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl overflow-hidden shadow-sm">
          {filteredAndSortedSessions.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-center px-10">
              <div className="w-16 h-16 rounded-full bg-evofit-bg-primary flex items-center justify-center text-evofit-text-muted/30 mb-4 border border-evofit-border">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-lg font-bold text-evofit-text-primary m-0">No activities found</h3>
              <p className="text-sm text-evofit-text-muted mt-1 max-w-[280px]">Adjust your filters or start a new workout session to see it here.</p>
            </div>
          ) : (
            <>
              {/* Group: Today */}
              {groupedSessions.today.length > 0 && (
                <div>
                  <div className="bg-evofit-bg-primary/50 px-5 py-2 border-b border-evofit-border">
                    <p className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-widest">Today</p>
                  </div>
                  {groupedSessions.today.map(s => <WorkoutRow key={s.id} session={s} onClick={viewSessionDetail} />)}
                </div>
              )}

              {/* Group: This Week */}
              {groupedSessions.thisWeek.length > 0 && (
                <div>
                  <div className="bg-evofit-bg-primary/50 px-5 py-2 border-b border-evofit-border border-t first:border-t-0">
                    <p className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-widest">This Week</p>
                  </div>
                  {groupedSessions.thisWeek.map(s => <WorkoutRow key={s.id} session={s} onClick={viewSessionDetail} />)}
                </div>
              )}

              {/* Group: Earlier */}
              {groupedSessions.earlier.length > 0 && (
                <div>
                  <div className="bg-evofit-bg-primary/50 px-5 py-2 border-b border-evofit-border border-t first:border-t-0">
                    <p className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-widest">Earlier</p>
                  </div>
                  {groupedSessions.earlier.map(s => <WorkoutRow key={s.id} session={s} onClick={viewSessionDetail} />)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-[12px] text-evofit-text-muted mt-8">
          Showing {filteredAndSortedSessions.length} sessions. Data synced with EvoFit Cloud.
        </p>

      </div>
    </div>
  );
}
