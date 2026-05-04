import React, { useState, useEffect } from 'react';
import api from '../api/auth';
import { 
  Award, 
  Star, 
  Trophy, 
  Target, 
  Zap, 
  Shield, 
  Flame, 
  Sparkles, 
  Clock, 
  ChevronRight,
  Lock,
  CheckCircle2,
  TrendingUp,
  Medal,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ICON_MAP = {
  star: <Star size={24} />,
  trophy: <Trophy size={24} />,
  target: <Target size={24} />,
  pulse: <Zap size={24} />,
  shield: <Shield size={24} />,
  flame: <Flame size={24} />,
  medal: <Medal size={24} />,
  crown: <Crown size={24} />,
  award: <Award size={24} />,
};

const RARITY_CONFIG = {
  Common: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  Rare: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  Elite: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
};

export default function TrophyRoom() {
  const [data, setData] = useState({ 
    level: 4, 
    xp: 750, 
    next_level_xp: 1000,
    total_badges: 12, 
    achievements: [] 
  });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Badges');

  const fetchAchievements = async () => {
    try {
      const res = await api.get('/achievements/');
      // Enrich data with some mock properties if they don't exist for the UI demonstration
      const enrichedAchievements = res.data.achievements.map((a, i) => ({
        ...a,
        rarity: i % 5 === 0 ? 'Elite' : i % 3 === 0 ? 'Rare' : 'Common',
        category: a.badge_name.toLowerCase().includes('form') ? 'Form Mastery' : 
                  a.badge_name.toLowerCase().includes('rep') ? 'Strength Goals' : 
                  'Consistency'
      }));
      setData({
        ...res.data,
        achievements: enrichedAchievements
      });
    } catch (err) {
      console.error("Failed to fetch achievements", err);
      // Fallback for demonstration if API fails
      setData(prev => ({
        ...prev,
        achievements: [
          { id: 1, badge_name: "Early Bird", description: "Complete a workout before 7 AM.", icon: "star", unlocked_at: "2024-05-01", rarity: "Common", category: "Consistency", is_locked: false },
          { id: 2, badge_name: "Form Sniper", description: "Maintain 95% form accuracy for 3 sets.", icon: "target", unlocked_at: "2024-05-02", rarity: "Rare", category: "Form Mastery", is_locked: false },
          { id: 3, badge_name: "Centurion", description: "Perform 100 reps in a single session.", icon: "flame", unlocked_at: null, rarity: "Elite", category: "Strength Goals", is_locked: true },
          { id: 4, badge_name: "Iron Mind", description: "Complete 7 days of consecutive workouts.", icon: "shield", unlocked_at: "2024-04-28", rarity: "Rare", category: "Consistency", is_locked: false },
          { id: 5, badge_name: "Power Surge", description: "Increase your volume by 20% in one week.", icon: "pulse", unlocked_at: null, rarity: "Elite", category: "Strength Goals", is_locked: true },
          { id: 6, badge_name: "Perfect Set", description: "Zero form errors in a 12-rep set.", icon: "trophy", unlocked_at: "2024-05-03", rarity: "Rare", category: "Form Mastery", is_locked: false },
        ]
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const categories = ['All Badges', 'Form Mastery', 'Strength Goals', 'Consistency'];
  
  const filteredBadges = data.achievements.filter(badge => 
    activeCategory === 'All Badges' || badge.category === activeCategory
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F8FAFC]">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  const xpProgress = (data.xp / data.next_level_xp) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto bg-[#F8FAFC] min-h-screen font-inter"
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* ── HERO SECTION ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-[#7C3AED] font-semibold text-sm mb-3">
              <Sparkles size={16} />
              <span>Personal Achievements</span>
            </div>
            <h1 className="text-4xl font-bold text-[#0F172A] mb-3">Trophy Room</h1>
            <p className="text-[#64748B] text-lg max-w-xl">
              You're doing great! Every rep and every drop of sweat is a step closer to your ultimate fitness goals.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Current Level</p>
                <p className="text-3xl font-bold text-[#0F172A]">Level {data.level || 4}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED]">
                <TrendingUp size={24} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-[#64748B]">{data.xp || 750} / {data.next_level_xp || 1000} XP</span>
                <span className="text-xs font-bold text-[#7C3AED]">{Math.round(xpProgress)}%</span>
              </div>
              <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#7C3AED] rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS ROW ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Total Badges</p>
            <p className="text-2xl font-bold text-[#0F172A]">{data.total_badges || 12}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Unlocked</p>
            <p className="text-2xl font-bold text-[#22C55E]">{data.achievements.filter(a => !a.is_locked).length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Completion</p>
            <p className="text-2xl font-bold text-[#0F172A]">
              {data.achievements.length > 0 
                ? Math.round((data.achievements.filter(a => !a.is_locked).length / data.achievements.length) * 100) 
                : 0}%
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Global Rank</p>
            <p className="text-2xl font-bold text-[#7C3AED]">Top 5%</p>
          </div>
        </div>

        {/* ── FILTERS ─────────────────────────────────────────────────── */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap border ${
                activeCategory === cat
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-md shadow-purple-200'
                  : 'bg-white text-[#64748B] border-[#E5E7EB] hover:border-[#7C3AED]/30 hover:text-[#0F172A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── BADGE GRID ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <AnimatePresence mode="popLayout">
            {filteredBadges.map((badge) => (
              <motion.div
                layout
                key={badge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                className={`bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm transition-all relative overflow-hidden group ${
                  badge.is_locked ? 'opacity-60 grayscale' : 'hover:border-[#7C3AED]/40'
                }`}
              >
                {!badge.is_locked && (
                  <div className="absolute top-0 right-0 p-3">
                    <div className="w-6 h-6 bg-[#22C55E]/10 rounded-full flex items-center justify-center text-[#22C55E]">
                      <CheckCircle2 size={14} />
                    </div>
                  </div>
                )}
                
                <div className="flex gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                    badge.is_locked 
                    ? 'bg-slate-50 border-slate-100 text-slate-300' 
                    : 'bg-purple-50 border-purple-100 text-[#7C3AED] group-hover:scale-110 transition-transform duration-300'
                  }`}>
                    {badge.is_locked ? <Lock size={24} /> : (ICON_MAP[badge.icon] || <Award size={24} />)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#0F172A] leading-tight">{badge.badge_name}</h3>
                      {badge.rarity && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-tighter border ${RARITY_CONFIG[badge.rarity].bg} ${RARITY_CONFIG[badge.rarity].text} ${RARITY_CONFIG[badge.rarity].border}`}>
                          {badge.rarity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                      {badge.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-auto">
                      {badge.is_locked ? (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Lock size={10} /> Locked
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> {new Date(badge.unlocked_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Subtle Hover Glow */}
                {!badge.is_locked && (
                  <div className="absolute inset-0 bg-[#7C3AED]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── UPCOMING MILESTONE ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#7C3AED]/20 p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-purple-200">
                <Crown size={36} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xl font-bold text-[#0F172A]">Upcoming: Elite Voyager</h4>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded uppercase font-black tracking-tighter border border-amber-200">
                    Elite
                  </span>
                </div>
                <p className="text-[#64748B] text-sm max-w-md">
                  Complete 50 perfect-form sessions to unlock this prestigious badge. You're almost there!
                </p>
              </div>
            </div>

            <div className="w-full md:w-80">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-[#64748B] uppercase">42 / 50 Sessions</span>
                <span className="text-sm font-bold text-[#7C3AED]">84%</span>
              </div>
              <div className="h-3 bg-[#F1F5F9] rounded-full overflow-hidden border border-[#E5E7EB]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '84%' }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] rounded-full"
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-2 text-right font-medium">
                8 sessions remaining
              </p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
