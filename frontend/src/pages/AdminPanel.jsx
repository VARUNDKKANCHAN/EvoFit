import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { adminApi } from '../api/admin';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { SystemTab } from '../components/admin/SystemTab';
import { UsersTab } from '../components/admin/UsersTab';
import { AIUsageTab } from '../components/admin/AIUsageTab';

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const { notify } = useNotifications();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('system');
  const [systemStatus, setSystemStatus] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const pollingRef = useRef(null);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchStats();
      startPolling();
    }
    return () => stopPolling();
  }, [user]);

  const startPolling = () => {
    if (pollingRef.current) return;
    fetchSystemStatus();
    pollingRef.current = setInterval(fetchSystemStatus, 5000);
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

  const fetchStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (error) {
      notify('error', 'Fetch Error', 'Could not load administrative stats.');
    }
  };

  const handleManualRefresh = () => {
    fetchStats();
    fetchSystemStatus();
    notify('info', 'Refreshing', 'System data is being re-synced...');
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
        {activeTab === 'system' && <SystemTab stats={stats} systemStatus={systemStatus} statusHistory={statusHistory} />}
        {activeTab === 'ai usage' && <AIUsageTab stats={stats} />}
        {activeTab === 'users' && <UsersTab />}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
