import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi } from '../../api/admin';
import { useNotifications } from '../../context/NotificationContext';

export const SystemTab = React.memo(({ stats, systemStatus, statusHistory }) => {
  const { notify } = useNotifications();
  const [isFlushing, setIsFlushing] = useState(false);

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

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
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
                       <p className="text-[9px] font-bold text-evofit-text-muted m-0">DAU / MAU</p>
                       <p className="text-lg font-black text-evofit-text-primary m-0">{stats?.dau || 0} / {stats?.mau || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-evofit-bg-secondary/50 border border-evofit-border">
                       <p className="text-[9px] font-bold text-evofit-text-muted m-0">Total Sessions</p>
                       <p className="text-lg font-black text-evofit-text-primary m-0">{stats?.total_sessions || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-evofit-bg-secondary/50 border border-evofit-border">
                       <p className="text-[9px] font-bold text-evofit-text-muted m-0">API 500 Errors</p>
                       <p className={`text-lg font-black m-0 ${(stats?.total_500_errors || 0) > 0 ? 'text-red-500' : 'text-evofit-text-primary'}`}>{stats?.total_500_errors || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-evofit-bg-secondary/50 border border-evofit-border">
                       <p className="text-[9px] font-bold text-evofit-text-muted m-0">Failed Logins</p>
                       <p className={`text-lg font-black m-0 ${(stats?.failed_logins || 0) > 10 ? 'text-yellow-500' : 'text-evofit-text-primary'}`}>{stats?.failed_logins || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-evofit-bg-secondary/50 border border-evofit-border">
                       <p className="text-[9px] font-bold text-evofit-text-muted m-0">Avg ML Confidence</p>
                       <p className="text-lg font-black text-evofit-text-primary m-0">{stats?.avg_form_score ? stats.avg_form_score.toFixed(1) : 0}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-evofit-bg-secondary/50 border border-evofit-border">
                       <p className="text-[9px] font-bold text-evofit-text-muted m-0">Database Size</p>
                       <p className="text-lg font-black text-evofit-text-primary m-0">{stats?.db_size_mb || 0} MB</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

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
