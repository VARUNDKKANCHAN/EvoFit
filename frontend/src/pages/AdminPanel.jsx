import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../api/admin';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const { notify } = useNotifications();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('system'); // Default to System now
  const [systemStatus, setSystemStatus] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [isFlushing, setIsFlushing] = useState(false);
  const [editingLimits, setEditingLimits] = useState({});

  const pollingRef = useRef(null);

  // Initialize data
  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
      startPolling();
    }
    return () => stopPolling();
  }, [user]);

  const startPolling = () => {
    if (pollingRef.current) return;
    fetchSystemStatus(); // Initial call
    pollingRef.current = setInterval(fetchSystemStatus, 5000); // Every 5 seconds
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const data = await adminApi.getSystemStatus();
      setSystemStatus(data);
      
      // Update history for charts (keep last 20 points)
      setStatusHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          cpu: data.cpu_usage_percent,
          mem: data.memory_usage_mb,
          latency: data.latency_ms
        };
        const updated = [...prev, newPoint];
        return updated.slice(-20);
      });
    } catch (error) {
      console.error('Diagnostic poll failed:', error);
    }
  };

  // Helper for retrying failed API calls
  const withRetry = async (fn, maxRetries = 2) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        // Wait 1s before retry
        if (i < maxRetries - 1) await new Promise(r => setTimeout(r, 1000));
      }
    }
    throw lastError;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await withRetry(() => Promise.all([
        adminApi.getStats(),
        adminApi.getUsers()
      ]));
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      const detail = error.response?.data?.detail || error.message || 'Unknown network error';
      notify('error', 'Fetch Error', `Could not load administrative data: ${detail}`);
    } finally {
      setLoading(false);
    }
  };


  const handleManualRefresh = () => {
    fetchData();
    fetchSystemStatus();
    notify('info', 'Refreshing', 'System data is being re-synced...');
  };

  const handleFlushCache = async () => {
    try {
      setIsFlushing(true);
      await adminApi.flushCache();
      notify('success', 'Cache Flushed', 'System temporary data and memory buffers cleared.');
    } catch (error) {
      notify('error', 'Action Failed', 'Could not flush system cache.');
    } finally {
      setTimeout(() => setIsFlushing(false), 1000);
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

  const handleUpdateLimit = async (userId) => {
    try {
      const newLimit = parseInt(editingLimits[userId], 10);
      if (isNaN(newLimit) || newLimit < 0) {
         notify('error', 'Invalid Input', 'Please enter a valid positive number for the token limit.');
         return;
      }
      const response = await adminApi.updateUserTokenLimit(userId, newLimit);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, rag_token_limit: response.rag_token_limit } : u
      ));
      
      // Clear editing state for this user
      setEditingLimits(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      
      notify('success', 'Limit Updated', `AI token limit successfully updated to ${newLimit.toLocaleString()}.`);
    } catch (error) {
      notify('error', 'Update Failed', error.response?.data?.detail || 'Could not update token limit.');
    }
  };


  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  if (authLoading) return null;
  if (!user?.isAdmin) return <Navigate to="/dashboard" />;

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-fade-in bg-evofit-bg-primary min-h-screen">
      
      {/* ── Header & Control Tabs ────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-evofit-purple-main flex items-center justify-center text-white shadow-lg shadow-evofit-purple-main/20">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-evofit-text-primary m-0 tracking-tight">System Command Center</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-evofit-text-muted text-[11px] font-black uppercase tracking-widest m-0">Live Monitoring Active • {formatUptime(systemStatus?.uptime_seconds)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleManualRefresh}
            className="p-3 rounded-2xl bg-evofit-bg-secondary border border-evofit-border text-evofit-text-muted hover:text-evofit-purple-light transition-all hover:border-evofit-purple-main/30"
            title="Refresh All Data"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <div className="flex items-center gap-2 bg-evofit-bg-secondary/50 backdrop-blur-md p-1.5 rounded-2xl border border-evofit-border">
            {['system', 'ai usage', 'users'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-evofit-purple-main text-white shadow-xl shadow-evofit-purple-main/20' : 'text-evofit-text-muted hover:text-evofit-text-primary'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── SYSTEM VIEW ───────────────────────────────── */}
        {activeTab === 'system' && (
          <motion.div 
            key="system"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-6"
          >
            {/* Top Grid: Real-time Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <HealthCard 
                title="Database" 
                status={systemStatus?.database} 
                icon={<path d="M12 22c4.97 0 9-1.79 9-4s-4.03-4-9-4-9 1.79-9 4 4.03 4 9 4zM12 14c4.97 0 9-1.79 9-4s-4.03-4-9-4-9 1.79-9 4 4.03 4 9 4zM12 6c4.97 0 9-1.79 9-4s-4.03-4-9-4-9 1.79-9 4 4.03 4 9 4z"/>}
              />
              <HealthCard 
                title="ML Engine" 
                status={systemStatus?.ml_engine} 
                icon={<><circle cx="12" cy="12" r="3"/><path d="M12 5V3M12 21v-2M5 12H3m18 0h-2M7.05 7.05 5.64 5.64m12.72 12.72-1.41-1.41M7.05 16.95l-1.41 1.41m12.72-12.72-1.41 1.41"/></>}
              />
              <HealthCard 
                title="API Latency" 
                value={`${systemStatus?.latency_ms || 0} ms`}
                status={systemStatus?.latency_ms < 100 ? 'operational' : 'warning'}
                icon={<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>}
              />
              <div className="bg-evofit-bg-card border border-evofit-border rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10">
                  <h4 className="text-[10px] font-black text-evofit-text-muted uppercase tracking-widest m-0 mb-4">System Actions</h4>
                  <button 
                    onClick={handleFlushCache}
                    disabled={isFlushing}
                    className={`w-full py-3 rounded-xl border border-evofit-purple-main/20 text-xs font-black uppercase tracking-widest transition-all ${isFlushing ? 'bg-evofit-purple-main text-white' : 'bg-evofit-purple-main/5 text-evofit-purple-light hover:bg-evofit-purple-main/10'}`}
                  >
                    {isFlushing ? 'Flushing...' : 'Flush System Cache'}
                  </button>
                </div>
              </div>
            </div>

            {/* Charts & Detailed Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Resource Charts */}
              <div className="lg:col-span-2 bg-evofit-bg-card border border-evofit-border rounded-3xl p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-evofit-text-primary m-0">Platform Resource Dynamics</h3>
                    <p className="text-evofit-text-muted text-xs m-0 mt-1">Real-time CPU and Memory utilization trends.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-evofit-purple-main" /><span className="text-[10px] font-bold text-evofit-text-muted uppercase">CPU</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[10px] font-bold text-evofit-text-muted uppercase">MEM</span></div>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={statusHistory}>
                      <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--purple-main)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--purple-main)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="time" hide />
                      <YAxis hide domain={[0, 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="cpu" stroke="var(--purple-main)" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={3} />
                      <Area type="monotone" dataKey="mem" stroke="#3B82F6" fillOpacity={1} fill="url(#colorMem)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Disk & Uptime Summary */}
              <div className="bg-evofit-bg-card border border-evofit-border rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-evofit-text-primary m-0">Storage & Runtime</h3>
                  <div className="mt-8 space-y-8">
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest text-evofit-text-muted">
                        <span>Disk Capacity</span>
                        <span className="text-evofit-text-primary">{systemStatus?.disk_usage_percent}%</span>
                      </div>
                      <div className="h-3 bg-evofit-bg-secondary rounded-full overflow-hidden border border-evofit-border">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${systemStatus?.disk_usage_percent || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-evofit-bg-secondary border border-evofit-border">
                      <p className="text-[10px] font-black text-evofit-text-muted uppercase tracking-widest m-0 mb-2">Total System Uptime</p>
                      <p className="text-2xl font-black text-evofit-purple-light m-0 font-mono tracking-tighter">
                        {formatUptime(systemStatus?.uptime_seconds)}
                      </p>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-evofit-text-muted uppercase tracking-widest m-0">Platform Statistics</p>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-xl bg-evofit-bg-secondary/50 border border-evofit-border">
                             <p className="text-[9px] font-bold text-evofit-text-muted m-0">Active Users</p>
                             <p className="text-lg font-black text-evofit-text-primary m-0">{stats?.active_users || 0}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-evofit-bg-secondary/50 border border-evofit-border">
                             <p className="text-[9px] font-bold text-evofit-text-muted m-0">Total Sessions</p>
                             <p className="text-lg font-black text-evofit-text-primary m-0">{stats?.total_sessions || 0}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-evofit-bg-secondary/50 border border-evofit-border col-span-2">
                             <p className="text-[9px] font-bold text-evofit-text-muted m-0">Global AI Token Usage (Groq)</p>
                             <p className="text-lg font-black text-evofit-purple-light m-0">{(stats?.total_rag_tokens || 0).toLocaleString()}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}


        {/* ── AI USAGE VIEW ───────────────────────────────── */}
        {activeTab === 'ai usage' && (
          <motion.div 
            key="ai usage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-evofit-bg-card border border-evofit-border rounded-3xl p-8">
               <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-evofit-text-primary m-0">AI Usage & Quota Management</h3>
                    <p className="text-evofit-text-muted text-xs mt-1">Monitor Groq LLM token consumption and enforce limits per user.</p>
                  </div>
                  <div className="bg-evofit-purple-main/10 border border-evofit-purple-main/20 px-4 py-3 rounded-2xl">
                     <p className="text-[10px] font-black text-evofit-purple-light uppercase tracking-widest m-0 mb-1">Global AI Token Usage</p>
                     <p className="text-xl font-black text-evofit-text-primary m-0">{(stats?.total_rag_tokens || 0).toLocaleString()}</p>
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="text-[11px] font-black text-evofit-text-muted uppercase tracking-widest border-b border-evofit-border">
                        <th className="pb-4 px-2">User Profile</th>
                        <th className="pb-4 px-2">Token Consumption</th>
                        <th className="pb-4 px-2 w-1/3">Limit Progress</th>
                        <th className="pb-4 px-2 text-right">Edit Quota Limit</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-evofit-border">
                     {users.map(u => {
                       const consumed = u.rag_tokens_total || 0;
                       const limit = u.rag_token_limit || 50000;
                       const pct = Math.min(100, (consumed / limit) * 100);
                       const isNearLimit = pct > 85;
                       const isEditing = editingLimits[u.id] !== undefined;
                       
                       return (
                         <tr key={u.id} className="group">
                           <td className="py-5 px-2">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-evofit-bg-secondary flex items-center justify-center font-black text-evofit-text-primary border border-evofit-border">
                                    {u.username.charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-evofit-text-primary m-0">@{u.username}</p>
                                    <p className="text-[10px] text-evofit-text-muted m-0">{u.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-5 px-2">
                              <p className="text-xs font-black text-evofit-text-primary m-0">{consumed.toLocaleString()} <span className="text-[9px] text-evofit-text-muted uppercase">tokens</span></p>
                           </td>
                           <td className="py-5 px-2 pr-8">
                              <div className="space-y-1.5">
                                 <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-evofit-text-muted">
                                    <span>{pct.toFixed(1)}% Used</span>
                                    <span className={isNearLimit ? 'text-red-500' : 'text-evofit-purple-light'}>{limit.toLocaleString()} MAX</span>
                                 </div>
                                 <div className="h-2 bg-evofit-bg-secondary rounded-full overflow-hidden border border-evofit-border">
                                   <div 
                                     className={`h-full ${isNearLimit ? 'bg-red-500' : 'bg-evofit-purple-main'}`}
                                     style={{ width: `${pct}%` }}
                                   />
                                 </div>
                              </div>
                           </td>
                           <td className="py-5 px-2 text-right">
                             {isEditing ? (
                               <div className="flex items-center justify-end gap-2">
                                 <input 
                                   type="number"
                                   min="0"
                                   value={editingLimits[u.id]}
                                   onChange={(e) => setEditingLimits({...editingLimits, [u.id]: e.target.value})}
                                   className="w-24 bg-evofit-bg-secondary border border-evofit-border rounded-lg px-2 py-1 text-xs text-evofit-text-primary focus:outline-none"
                                 />
                                 <button 
                                   onClick={() => handleUpdateLimit(u.id)}
                                   className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                                 >
                                   <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                   </svg>
                                 </button>
                                 <button 
                                   onClick={() => {
                                     const next = {...editingLimits};
                                     delete next[u.id];
                                     setEditingLimits(next);
                                   }}
                                   className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                 >
                                   <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                   </svg>
                                 </button>
                               </div>
                             ) : (
                               <button 
                                 onClick={() => setEditingLimits({...editingLimits, [u.id]: limit})}
                                 className="px-4 py-2 rounded-xl bg-evofit-bg-secondary border border-evofit-border text-[10px] font-black uppercase tracking-widest text-evofit-text-muted hover:text-evofit-purple-light hover:border-evofit-purple-main/30 transition-all"
                               >
                                 Edit Limit
                               </button>
                             )}
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
            </div>
          </motion.div>
        )}

        {/* ── USERS VIEW ───────────────────────────────── */}
        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-evofit-bg-card border border-evofit-border rounded-3xl p-8">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-evofit-text-primary m-0">Account Deactivation Control</h3>
                    <p className="text-evofit-text-muted text-xs mt-1">Manage platform access and security for all user accounts.</p>
                  </div>
                  <div className="relative w-full md:w-80">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-evofit-text-muted" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-evofit-bg-secondary border border-evofit-border rounded-2xl py-3 pl-12 pr-4 text-sm text-evofit-text-primary focus:outline-none focus:ring-4 focus:ring-evofit-purple-main/10 transition-all"
                    />
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[11px] font-black text-evofit-text-muted uppercase tracking-widest border-b border-evofit-border">
                         <th className="pb-4 px-2">Profile</th>
                         <th className="pb-4 px-2">Account Level</th>
                         <th className="pb-4 px-2">AI Tokens</th>
                         <th className="pb-4 px-2">Access Status</th>
                         <th className="pb-4 px-2 text-right">Emergency Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-evofit-border">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className={`group ${!u.is_active ? 'bg-red-500/[0.02]' : ''}`}>
                           <td className="py-5 px-2">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-2xl bg-evofit-bg-secondary flex items-center justify-center font-black text-evofit-text-primary border border-evofit-border group-hover:border-evofit-purple-main/30 transition-all">
                                    {u.username.charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-evofit-text-primary m-0">@{u.username}</p>
                                    <p className="text-[10px] text-evofit-text-muted m-0">{u.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-5 px-2">
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-xs font-black text-evofit-text-primary">LVL {u.level}</span>
                                 <span className="text-[10px] text-evofit-text-muted">{u.xp.toLocaleString()} XP</span>
                              </div>
                           </td>
                           <td className="py-5 px-2">
                              <span className="text-xs font-bold text-evofit-text-primary">{(u.rag_tokens_total || 0).toLocaleString()}</span>
                           </td>
                           <td className="py-5 px-2">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${u.is_active ? 'bg-green-500/5 text-green-500 border-green-500/20' : 'bg-red-500/5 text-red-500 border-red-500/20'}`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                 <span className="text-[10px] font-black uppercase tracking-wider">{u.is_active ? 'AUTHORIZED' : 'DEACTIVATED'}</span>
                              </div>
                           </td>
                           <td className="py-5 px-2 text-right">
                              <button 
                                onClick={() => handleToggleStatus(u)}
                                disabled={u.id === user.id}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${u.id === user.id ? 'opacity-20 cursor-not-allowed' : (u.is_active ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/10' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white shadow-lg shadow-green-500/10')}`}
                              >
                                {u.is_active ? 'Deactivate Account' : 'Reactivate Account'}
                              </button>
                           </td>
                        </tr>
                      ))}
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

const HealthCard = ({ title, status, value, icon }) => {
  const isOperational = status === 'operational';
  const isError = status?.startsWith('error');
  
  return (
    <div className="bg-evofit-bg-card border border-evofit-border rounded-3xl p-6 group transition-all duration-300 hover:border-evofit-purple-main/30 relative overflow-hidden shadow-sm">
      <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 -mr-12 -mt-12 transition-colors duration-500 ${isOperational ? 'bg-green-500' : (isError ? 'bg-red-500' : 'bg-evofit-purple-main')}`} />
      
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-evofit-bg-secondary text-evofit-text-muted group-hover:text-evofit-purple-light transition-all">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              {icon}
            </svg>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${isOperational ? 'bg-green-500/10 text-green-500 border-green-500/20' : (isError ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-evofit-bg-secondary text-evofit-text-muted border-evofit-border')}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOperational ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : (isError ? 'bg-red-500 animate-pulse' : 'bg-evofit-text-muted')}`} />
            <span className="text-[9px] font-black uppercase tracking-wider">{isOperational ? 'ONLINE' : (isError ? 'ERROR' : 'SYNCING')}</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-[10px] font-black text-evofit-text-muted uppercase tracking-widest m-0">{title}</h4>
          <h3 className="text-xl font-black text-evofit-text-primary m-0 mt-1 tracking-tight">
            {value || (isOperational ? 'Optimal' : (isError ? 'Service Down' : 'Fetching...'))}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
