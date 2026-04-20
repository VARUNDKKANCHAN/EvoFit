import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

/* ── Level tier colors ── */
const getLevelTier = (level) => {
  if (level >= 20) return { name: 'Legend', color: '#F59E0B', gradient: 'from-amber-500 to-yellow-300', glow: 'rgba(245,158,11,0.4)' };
  if (level >= 10) return { name: 'Elite', color: '#6366F1', gradient: 'from-indigo-500 to-purple-400', glow: 'rgba(99,102,241,0.4)' };
  if (level >= 5)  return { name: 'Pro', color: '#10B981', gradient: 'from-emerald-500 to-teal-400', glow: 'rgba(16,185,129,0.4)' };
  return { name: 'Rookie', color: '#A78BFA', gradient: 'from-violet-500 to-purple-400', glow: 'rgba(167,139,250,0.4)' };
};

const fitnessGoals = [
  'Build Strength/Muscle',
  'Weight Loss',
  'Endurance',
  'General Fitness',
  'Athletic Performance',
  'Rehabilitation',
];

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

function StatCard({ label, value, unit, icon }) {
  return (
    <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-5 flex flex-col gap-2 hover:border-evofit-purple-main/40 transition-all duration-200 shadow-sm">
      <div className="flex items-center gap-2 text-evofit-purple-light text-xs font-bold uppercase tracking-wider">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-black text-evofit-text-primary">
        {value != null ? (
          <>{value}<span className="text-sm font-medium text-evofit-text-muted ml-1">{unit}</span></>
        ) : (
          <span className="text-evofit-text-muted text-base font-medium">Not set</span>
        )}
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = 'text', icon, placeholder, min, max }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-evofit-text-muted flex items-center gap-2">
        <span>{icon}</span> {label}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className="bg-evofit-bg-secondary border border-evofit-border rounded-xl px-4 py-3 text-evofit-text-primary text-sm outline-none focus:border-evofit-purple-main focus:ring-2 focus:ring-evofit-purple-main/20 transition-all duration-200 w-full placeholder:text-evofit-text-muted"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, icon }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-evofit-text-muted flex items-center gap-2">
        <span>{icon}</span> {label}
      </label>
      <select
        name={name}
        value={value ?? ''}
        onChange={onChange}
        className="bg-evofit-bg-secondary border border-evofit-border rounded-xl px-4 py-3 text-evofit-text-primary text-sm outline-none focus:border-evofit-purple-main focus:ring-2 focus:ring-evofit-purple-main/20 transition-all duration-200 w-full appearance-none cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%237C3AED' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', backgroundSize: '18px', paddingRight: '40px' }}
      >
        <option value="">Select...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

export default function UserProfile() {
  const { user, updateProfile, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    age: '',
    weight_kg: '',
    height_cm: '',
    gender: '',
    fitness_goal: '',
  });

  // Sync form with user data when it loads
  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.fullName || user.full_name || '',
        age: user.age || '',
        weight_kg: user.weight_kg || '',
        height_cm: user.height_cm || '',
        gender: user.gender || '',
        fitness_goal: user.fitness_goal || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      full_name: form.full_name || null,
      age: form.age ? parseInt(form.age) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      gender: form.gender || null,
      fitness_goal: form.fitness_goal || null,
    };
    const success = await updateProfile(payload);
    setSaving(false);
    if (success) setEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        full_name: user.fullName || user.full_name || '',
        age: user.age || '',
        weight_kg: user.weight_kg || '',
        height_cm: user.height_cm || '',
        gender: user.gender || '',
        fitness_goal: user.fitness_goal || '',
      });
    }
    setEditing(false);
  };

  if (!user) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="text-[#6B7280] text-center">
          <p className="text-4xl mb-4">🔐</p>
          <p className="text-lg font-semibold text-white">Not logged in</p>
          <p className="text-sm mt-1">Please log in to view your profile.</p>
        </div>
      </main>
    );
  }

  const tier = getLevelTier(user.level ?? 1);
  const xp = user.xp ?? 0;
  const level = user.level ?? 1;
  const xpToNext = level * 1000;
  const xpProgress = Math.min(100, Math.round((xp / xpToNext) * 100));
  const initials = (user.fullName || user.username || '?').slice(0, 2).toUpperCase();
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  // BMI calc
  const bmi = (user.weight_kg && user.height_cm)
    ? (user.weight_kg / ((user.height_cm / 100) ** 2)).toFixed(1)
    : null;

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-evofit-bg-primary">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">

        {/* ── Hero Card ── */}
        <div className="relative rounded-3xl overflow-hidden border border-evofit-border bg-evofit-bg-card" style={{ boxShadow: `0 0 60px ${tier.glow}20` }}>
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 60% at 20% 50%, ${tier.glow} 0%, transparent 70%)` }} />
          
          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center text-3xl md:text-4xl font-black text-white border-2"
                style={{
                  background: `linear-gradient(135deg, #6D28D9, #A78BFA)`,
                  borderColor: tier.color,
                  boxShadow: `0 0 30px ${tier.glow}`,
                }}
              >
                {initials}
              </div>
              {/* Level badge */}
              <div
                className="absolute -bottom-2 -right-2 text-xs font-black px-2 py-0.5 rounded-full text-black"
                style={{ background: `linear-gradient(135deg, ${tier.color}, ${tier.color}CC)` }}
              >
                Lv.{level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-black text-evofit-text-primary truncate">
                  {user.fullName || user.username}
                </h1>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: `${tier.color}20`, color: tier.color, border: `1px solid ${tier.color}40` }}
                >
                  {tier.name}
                </span>
              </div>
              <p className="text-evofit-text-muted text-sm mb-1">@{user.username} · {user.email}</p>
              <p className="text-evofit-text-muted text-xs mb-4">Member since {memberSince}</p>

              {/* XP Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold" style={{ color: tier.color }}>Level {level} — {tier.name}</span>
                  <span className="text-evofit-text-muted">{xp.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
                </div>
                <div className="h-2 rounded-full bg-evofit-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${xpProgress}%`,
                      background: `linear-gradient(90deg, #6D28D9, ${tier.color})`,
                      boxShadow: `0 0 8px ${tier.glow}`,
                    }}
                  />
                </div>
                <p className="text-evofit-text-muted text-xs mt-1">{xpToNext - xp} XP to Level {level + 1}</p>
              </div>
            </div>

            {/* Edit button */}
            <div className="shrink-0">
              {!editing ? (
                <button
                  id="edit-profile-btn"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    id="cancel-profile-btn"
                    onClick={handleCancel}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-evofit-text-secondary border border-evofit-border hover:border-evofit-border-hover transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    id="save-profile-btn"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}
                  >
                    {saving ? 'Saving...' : '✓ Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Age" value={user.age} unit="yrs" icon="🎂" />
          <StatCard label="Weight" value={user.weight_kg} unit="kg" icon="⚖️" />
          <StatCard label="Height" value={user.height_cm} unit="cm" icon="📏" />
          <StatCard label="BMI" value={bmi} unit="" icon="💪" />
        </div>

        {/* ── Profile Form / Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Personal Information */}
          <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-black text-evofit-purple-light uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Personal Information
            </h2>

            {editing ? (
              <div className="space-y-4">
                <InputField label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} icon="👤" placeholder="Alex Johnson" />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Age" name="age" type="number" value={form.age} onChange={handleChange} icon="🎂" placeholder="24" min="13" max="100" />
                  <SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange} options={genderOptions} icon="⚧" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Full Name', value: user.fullName || '—', icon: '👤' },
                  { label: 'Username', value: `@${user.username}`, icon: '🏷️' },
                  { label: 'Email', value: user.email, icon: '✉️' },
                  { label: 'Age', value: user.age ? `${user.age} years old` : '—', icon: '🎂' },
                  { label: 'Gender', value: user.gender || '—', icon: '⚧' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-evofit-border last:border-0">
                    <span className="text-xs text-evofit-text-muted flex items-center gap-2"><span>{icon}</span>{label}</span>
                    <span className="text-sm font-semibold text-evofit-text-primary">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fitness Profile */}
          <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-black text-evofit-purple-light uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Fitness Profile
            </h2>

            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Weight (kg)" name="weight_kg" type="number" value={form.weight_kg} onChange={handleChange} icon="⚖️" placeholder="75" min="30" max="300" />
                  <InputField label="Height (cm)" name="height_cm" type="number" value={form.height_cm} onChange={handleChange} icon="📏" placeholder="180" min="100" max="250" />
                </div>
                <SelectField label="Primary Goal" name="fitness_goal" value={form.fitness_goal} onChange={handleChange} options={fitnessGoals} icon="🎯" />
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Primary Goal', value: user.fitness_goal || '—', icon: '🎯' },
                  { label: 'Weight', value: user.weight_kg ? `${user.weight_kg} kg` : '—', icon: '⚖️' },
                  { label: 'Height', value: user.height_cm ? `${user.height_cm} cm` : '—', icon: '📏' },
                  { label: 'BMI', value: bmi ? `${bmi} ${bmi < 18.5 ? '(Underweight)' : bmi < 25 ? '(Normal)' : bmi < 30 ? '(Overweight)' : '(Obese)'}` : '—', icon: '💪' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-evofit-border last:border-0">
                    <span className="text-xs text-evofit-text-muted flex items-center gap-2"><span>{icon}</span>{label}</span>
                    <span className="text-sm font-semibold text-evofit-text-primary">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Account Info ── */}
        <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-6">
          <h2 className="text-sm font-black text-evofit-purple-light uppercase tracking-wider mb-5 flex items-center gap-2">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-evofit-text-muted mb-1">User ID</p>
              <p className="font-mono text-sm font-bold text-evofit-text-primary">#{user.id}</p>
            </div>
            <div>
              <p className="text-xs text-evofit-text-muted mb-1">Member Since</p>
              <p className="text-sm font-semibold text-evofit-text-primary">{memberSince}</p>
            </div>
            <div>
              <p className="text-xs text-evofit-text-muted mb-1">Account Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-sm font-semibold text-emerald-500">Active</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
