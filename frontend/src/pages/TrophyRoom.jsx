import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Star, Trophy, Target, Zap, Shield, Flame, Sparkles, Clock, ChevronRight } from 'lucide-react';

const ICON_MAP = {
  star: <Star size={24} className="text-amber-400" />,
  trophy: <Trophy size={24} className="text-yellow-500" />,
  target: <Target size={24} className="text-red-400" />,
  pulse: <Zap size={24} className="text-cyan-400" />,
  shield: <Shield size={24} className="text-blue-400" />,
  flame: <Flame size={24} className="text-orange-500" />,
};

export default function TrophyRoom() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Badges');

  const fetchAchievements = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/achievements/');
      setAchievements(res.data);
    } catch (err) {
      console.error("Failed to fetch achievements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

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
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2 text-evofit-purple-light uppercase tracking-widest font-black text-xs">
              <Sparkles size={14} /> Rewards & Progression
            </div>
            <h1 className="text-4xl font-extrabold m-0 tracking-tight text-evofit-text-primary">Trophy Room</h1>
            <p className="text-evofit-text-secondary text-lg m-0 mt-2 font-medium max-w-[600px]">
              Celebrating your dedication and milestones in form perfection and strength.
            </p>
          </div>
          <div className="glass-card px-8 py-5 flex items-center gap-6 shadow-premium-card border-evofit-purple-main/20">
             <div className="text-center">
                <p className="text-[10px] text-evofit-text-muted font-bold uppercase mb-1">Total Badges</p>
                <p className="text-2xl font-black text-evofit-text-primary m-0">{achievements.length}</p>
             </div>
             <div className="w-px h-8 bg-evofit-border" />
             <div className="text-center">
                <p className="text-[10px] text-evofit-text-muted font-bold uppercase mb-1">XP Level</p>
                <p className="text-2xl font-black text-evofit-purple-light m-0">12</p>
             </div>
          </div>
        </div>

        {/* Categories / Filters */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
           {['All Badges', 'Form Mastery', 'Strength Goals', 'Consistency'].map((cat) => (
             <button 
               key={cat} 
               onClick={() => setActiveCategory(cat)}
               className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all
               ${activeCategory === cat ? 'bg-evofit-purple-main text-white shadow-lg shadow-evofit-purple-main/20' : 'bg-evofit-bg-secondary text-evofit-text-secondary border border-evofit-border hover:border-evofit-purple-main/40 hover:text-evofit-text-primary'}`}>
               {cat}
             </button>
           ))}
        </div>

        {/* Achievement Grid */}
        {(() => {
          const filtered = achievements.filter(badge => {
            if (activeCategory === 'All Badges') return true;
            const name = badge.badge_name.toLowerCase();
            const desc = badge.description.toLowerCase();
            if (activeCategory === 'Form Mastery') return name.includes('form') || name.includes('sniper') || desc.includes('form') || desc.includes('control');
            if (activeCategory === 'Strength Goals') return name.includes('rep') || name.includes('volume') || name.includes('club') || desc.includes('reps');
            if (activeCategory === 'Consistency') return name.includes('consisten') || desc.includes('consisten');
            return true;
          });

          if (filtered.length === 0) {
            return (
              <div className="glass-card py-20 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 rounded-full bg-evofit-bg-secondary flex items-center justify-center mb-6 text-evofit-text-muted border border-evofit-border">
                    <Trophy size={36} opacity={0.3} />
                 </div>
                 <h3 className="text-xl font-bold text-evofit-text-primary mb-2">No {activeCategory} Badges Yet</h3>
                 <p className="text-evofit-text-secondary max-w-sm mb-8 font-medium">
                   Keep training to unlock these exclusive badges.
                 </p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((badge) => (
                <div key={badge.id} className="glass-card p-6 shadow-premium-card hover:border-evofit-purple-main/40 transition-all group relative overflow-hidden flex items-start gap-6 cursor-default">
                   {/* Radial Glow Background */}
                   <div className="absolute -top-10 -right-10 w-32 h-32 bg-evofit-purple-main/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   
                   <div className="w-16 h-16 rounded-2xl bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 relative">
                      <div className="absolute inset-0 bg-evofit-purple-main/5 rounded-2xl animate-pulse group-hover:block hidden" />
                      {ICON_MAP[badge.icon] || <Award size={24} className="text-evofit-purple-light" />}
                   </div>
                   
                   <div className="flex-1">
                      <h3 className="text-base font-extrabold text-evofit-text-primary mb-1 mt-1">{badge.badge_name}</h3>
                      <p className="text-xs text-evofit-text-secondary leading-relaxed mb-3 font-medium">{badge.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-evofit-text-muted font-bold uppercase tracking-wider">
                         <Clock size={12} /> Unlocked {new Date(badge.unlocked_at).toLocaleDateString()}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          );
        })()}



        {/* Milestone Footer */}
        <div className="mt-16 glass-card p-8 border-evofit-purple-main/10 bg-gradient-to-r from-evofit-bg-secondary to-evofit-purple-main/[0.03] flex flex-col md:flex-row items-center gap-8 justify-between">
           <div className="space-y-2">
              <h4 className="text-lg font-black text-evofit-text-primary m-0 uppercase tracking-tighter">Upcoming Milestone</h4>
              <p className="text-sm text-evofit-text-secondary font-medium m-0">Unlock the <span className="text-evofit-purple-light font-bold">1,000 Reps Elite</span> badge. Just 696 reps to go!</p>
           </div>
           <div className="w-full md:w-64">
              <div className="flex justify-between text-xs font-black uppercase mb-2 text-evofit-text-muted">
                 <span>Progress</span>
                 <span className="text-evofit-purple-light">30.4%</span>
              </div>
              <div className="h-2 bg-evofit-bg-primary rounded-full overflow-hidden border border-evofit-border">
                 <div className="h-full bg-evofit-purple-main rounded-full" style={{ width: '30.4%' }} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
