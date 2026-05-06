import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const { notify } = useNotifications();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users'

  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers()
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      notify('error', 'Fetch Error', 'Could not load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    try {
      const newStatus = !targetUser.is_active;
      await adminApi.updateUserStatus(targetUser.id, newStatus);
      
      setUsers(users.map(u => 
        u.id === targetUser.id ? { ...u, is_active: newStatus } : u
      ));
      
      notify('success', 'User Updated', `${targetUser.username}'s account has been ${newStatus ? 'activated' : 'deactivated'}.`);
    } catch (error) {
      notify('error', 'Action Failed', error.response?.data?.detail || 'Could not update user status.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) return null;
  if (!user?.isAdmin) return <Navigate to="/dashboard" />;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-evofit-text-primary m-0">Admin Control Center</h2>
          <p className="text-evofit-text-muted text-sm m-0 mt-1">Platform-wide management and system health monitoring.</p>
        </div>
        <div className="flex items-center gap-2 bg-evofit-bg-secondary p-1 rounded-xl border border-evofit-border">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-evofit-purple-main text-white shadow-lg' : 'text-evofit-text-muted hover:text-evofit-text-primary'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-evofit-purple-main text-white shadow-lg' : 'text-evofit-text-muted hover:text-evofit-text-primary'}`}
          >
            User Management
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard 
                title="Total Users" 
                value={stats?.total_users ?? '...'} 
                subtitle={`${stats?.active_users ?? 0} Active Accounts`}
                icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
                color="var(--purple-main)"
              />
              <StatCard 
                title="Total Sessions" 
                value={stats?.total_sessions ?? '...'} 
                subtitle={`${stats?.sessions_today ?? 0} Sessions Today`}
                icon={<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>}
                color="#3B82F6"
              />
              <StatCard 
                title="Platform Volume" 
                value={(stats?.total_reps ?? 0).toLocaleString()} 
                subtitle="Total Repetitions Lifted"
                icon={<><path d="M6 18h12"/><path d="M6 6h12"/><path d="M6 12h12"/></>}
                color="#10B981"
              />
              <StatCard 
                title="Avg. Form Score" 
                value={`${stats?.avg_form_score ?? '0.0'}%`} 
                subtitle="System-wide Quality"
                icon={<><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></>}
                color="#F59E0B"
              />
            </div>

            {/* Recent System Activity Placeholder */}
            <div className="bg-evofit-bg-card border border-evofit-border rounded-3xl p-8 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-evofit-purple-main/5 blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-evofit-purple-main/10 flex items-center justify-center text-evofit-purple-light mb-4">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20v-6M6 20V10M18 20V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-evofit-text-primary m-0">System Activity Logs</h3>
                <p className="text-evofit-text-muted text-sm mt-2 max-w-sm">Platform-wide activity stream coming in the next update. You'll be able to see real-time workout uploads.</p>
                <div className="mt-6 px-4 py-1.5 rounded-full bg-evofit-purple-main/20 text-evofit-purple-light text-[10px] font-black uppercase tracking-widest border border-evofit-purple-main/30">
                  Coming Soon
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* User Search & Filters */}
            <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 md:items-center">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-evofit-text-muted" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search by username, name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-evofit-bg-secondary border border-evofit-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-evofit-text-primary focus:outline-none focus:ring-2 focus:ring-evofit-purple-main/20 focus:border-evofit-purple-main/40 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-evofit-text-muted uppercase tracking-wider ml-2">Total: {filteredUsers.length}</span>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-evofit-bg-secondary/50 border-b border-evofit-border">
                      <th className="px-6 py-4 text-[11px] font-black text-evofit-text-muted uppercase tracking-widest">User</th>
                      <th className="px-6 py-4 text-[11px] font-black text-evofit-text-muted uppercase tracking-widest">Stats</th>
                      <th className="px-6 py-4 text-[11px] font-black text-evofit-text-muted uppercase tracking-widest">Joined</th>
                      <th className="px-6 py-4 text-[11px] font-black text-evofit-text-muted uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[11px] font-black text-evofit-text-muted uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-evofit-border">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan="5" className="px-6 py-8"><div className="h-4 bg-evofit-border rounded w-full opacity-50" /></td>
                        </tr>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-evofit-text-muted text-sm">No users found matching your search.</td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-evofit-purple-main/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-evofit-purple-main to-evofit-purple-dark flex items-center justify-center text-xs font-black text-white shadow-sm">
                                {(u.fullName || u.username).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-evofit-text-primary m-0">{u.fullName || u.username}</p>
                                <p className="text-[11px] text-evofit-text-muted m-0">@{u.username} • {u.email}</p>
                              </div>
                              {u.isAdmin && (
                                <span className="px-2 py-0.5 rounded-full bg-evofit-purple-main/10 text-evofit-purple-light text-[9px] font-black border border-evofit-purple-main/20">ADMIN</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-evofit-text-primary">Lv.{u.level}</span>
                              <span className="text-[10px] text-evofit-text-muted">{u.xp.toLocaleString()} XP</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-evofit-text-secondary">{new Date(u.created_at).toLocaleDateString()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider ${u.is_active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                              {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleToggleStatus(u)}
                              disabled={u.id === user.id}
                              className={`p-2 rounded-lg transition-all ${u.id === user.id ? 'opacity-20 cursor-not-allowed' : 'hover:bg-evofit-bg-secondary text-evofit-text-muted hover:text-evofit-purple-light'}`}
                              title={u.is_active ? 'Deactivate User' : 'Activate User'}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                {u.is_active ? (
                                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
                                ) : (
                                  <path d="M12 2v10M18.36 6.64a9 9 0 1 1-12.73 0" />
                                )}
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-evofit-bg-card border border-evofit-border rounded-2xl p-5 hover:border-evofit-purple-main/30 transition-all duration-300 group shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-black text-evofit-text-muted uppercase tracking-widest m-0">{title}</p>
        <h3 className="text-2xl font-black text-evofit-text-primary m-0 mt-1.5">{value}</h3>
      </div>
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          {icon}
        </svg>
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <p className="text-[11px] font-bold text-evofit-text-muted m-0">{subtitle}</p>
    </div>
  </div>
);

export default AdminPanel;
