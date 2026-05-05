import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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

function StatCard({ label, value, unit, icon, color = 'bg-evofit-purple-main/10', textColor = 'text-evofit-purple-main' }) {
  return (
    <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-[14px]`}>
          {icon}
        </div>
        <span className="text-[12px] font-bold text-evofit-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-black text-evofit-text-primary">
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
      <main className="flex-1 flex flex-col items-center justify-center bg-evofit-bg-primary">
        <div className="text-evofit-text-muted text-center">
          <p className="text-4xl mb-4">🔐</p>
          <p className="text-lg font-bold text-evofit-text-primary">Not logged in</p>
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
        <div className="relative rounded-2xl overflow-hidden border border-evofit-border bg-evofit-bg-card shadow-sm">
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-4xl md:text-5xl font-black text-white border-4 border-evofit-bg-card shadow-xl"
                style={{
                  background: `linear-gradient(135deg, #7C3AED, #8B5CF6)`,
                  boxShadow: `0 0 40px ${tier.glow}40`,
                }}
              >
                {initials}
              </div>
              {/* Level badge */}
              <div
                className="absolute -bottom-1 -right-1 text-[11px] font-black px-3 py-1 rounded-full text-white shadow-lg border-2 border-evofit-bg-card"
                style={{ background: `linear-gradient(135deg, #7C3AED, #8B5CF6)` }}
              >
                LVL {level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black text-evofit-text-primary tracking-tight">
                  {user.fullName || user.username}
                </h1>
                <span
                  className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-widest"
                  style={{ background: `${tier.color}15`, color: tier.color, border: `1px solid ${tier.color}30` }}
                >
                  {tier.name}
                </span>
              </div>
              <p className="text-evofit-text-muted text-[15px] font-medium mb-1">@{user.username} · {user.email}</p>
              <p className="text-evofit-text-muted text-[13px] mb-6">Member since {memberSince}</p>

              {/* XP Bar */}
              <div className="max-w-md">
                <div className="flex justify-between text-[12px] font-bold mb-2 uppercase tracking-wide">
                  <span style={{ color: tier.color }}>Progression — {xpProgress}%</span>
                  <span className="text-evofit-text-muted">{xp.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
                </div>
                <div className="h-2.5 rounded-full bg-evofit-bg-primary overflow-hidden border border-evofit-border/50">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${xpProgress}%`,
                      background: `linear-gradient(90deg, #7C3AED, #8B5CF6)`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Edit button */}
            <div className="shrink-0 pt-4 md:pt-0">
              {!editing ? (
                <button
                  id="edit-profile-btn"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-all duration-200 hover:shadow-lg bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    id="cancel-profile-btn"
                    onClick={handleCancel}
                    className="px-5 py-3 rounded-lg text-sm font-bold text-evofit-text-secondary border border-evofit-border hover:bg-evofit-bg-secondary transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    id="save-profile-btn"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 rounded-lg text-sm font-bold text-white transition-all bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Age" value={user.age} unit="yrs" icon="🎂" color="bg-blue-500/10" textColor="text-blue-500" />
          <StatCard label="Weight" value={user.weight_kg} unit="kg" icon="⚖️" color="bg-orange-500/10" textColor="text-orange-500" />
          <StatCard label="Height" value={user.height_cm} unit="cm" icon="📏" color="bg-emerald-500/10" textColor="text-emerald-500" />
          <StatCard label="BMI" value={bmi} unit="" icon="💪" color="bg-purple-500/10" textColor="text-purple-500" />
        </div>

        {/* ── Profile Form / Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Personal Information */}
          <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-6">
            <h2 className="text-[13px] font-bold text-evofit-text-muted uppercase tracking-[0.1em] mb-6 flex items-center gap-2">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Personal Information
            </h2>

            {editing ? (
              <div className="space-y-5">
                <InputField label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} icon="👤" placeholder="Alex Johnson" />
                <div className="grid grid-cols-2 gap-5">
                  <InputField label="Age" name="age" type="number" value={form.age} onChange={handleChange} icon="🎂" placeholder="24" min="13" max="100" />
                  <SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange} options={genderOptions} icon="⚧" />
                </div>
              </div>
            ) : (
              <div className="divide-y divide-evofit-border">
                {[
                  { label: 'Full Name', value: user.fullName || '—' },
                  { label: 'Username', value: `@${user.username}` },
                  { label: 'Email', value: user.email },
                  { label: 'Age', value: user.age ? `${user.age} years old` : '—' },
                  { label: 'Gender', value: user.gender || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <span className="text-[13px] font-medium text-evofit-text-muted">{label}</span>
                    <span className="text-[14px] font-bold text-evofit-text-primary">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fitness Profile */}
          <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-6">
            <h2 className="text-[13px] font-bold text-evofit-text-muted uppercase tracking-[0.1em] mb-6 flex items-center gap-2">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Fitness Profile
            </h2>

            {editing ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <InputField label="Weight (kg)" name="weight_kg" type="number" value={form.weight_kg} onChange={handleChange} icon="⚖️" placeholder="75" min="30" max="300" />
                  <InputField label="Height (cm)" name="height_cm" type="number" value={form.height_cm} onChange={handleChange} icon="📏" placeholder="180" min="100" max="250" />
                </div>
                <SelectField label="Primary Goal" name="fitness_goal" value={form.fitness_goal} onChange={handleChange} options={fitnessGoals} icon="🎯" />
              </div>
            ) : (
              <div className="divide-y divide-evofit-border">
                {[
                  { label: 'Primary Goal', value: user.fitness_goal || '—' },
                  { label: 'Weight', value: user.weight_kg ? `${user.weight_kg} kg` : '—' },
                  { label: 'Height', value: user.height_cm ? `${user.height_cm} cm` : '—' },
                  { label: 'BMI', value: bmi ? `${bmi} ${bmi < 18.5 ? '(Underweight)' : bmi < 25 ? '(Normal)' : bmi < 30 ? '(Overweight)' : '(Obese)'}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <span className="text-[13px] font-medium text-evofit-text-muted">{label}</span>
                    <span className="text-[14px] font-bold text-evofit-text-primary">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Account Info ── */}
        <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-6">
          <h2 className="text-[13px] font-bold text-evofit-text-muted uppercase tracking-[0.1em] mb-6 flex items-center gap-2">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Account Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-4 rounded-xl bg-evofit-bg-primary border border-evofit-border">
              <p className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-wider mb-1.5">User ID</p>
              <p className="font-mono text-sm font-bold text-evofit-text-primary">#{user.id}</p>
            </div>
            <div className="p-4 rounded-xl bg-evofit-bg-primary border border-evofit-border">
              <p className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-wider mb-1.5">Member Since</p>
              <p className="text-sm font-bold text-evofit-text-primary">{memberSince}</p>
            </div>
            <div className="p-4 rounded-xl bg-evofit-bg-primary border border-evofit-border">
              <p className="text-[11px] font-bold text-evofit-text-muted uppercase tracking-wider mb-1.5">Account Status</p>
              <div className="flex items-center gap-2.5 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[14px] font-bold text-emerald-600">Verified Active</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
