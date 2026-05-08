import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/admin';
import { useNotifications } from '../../context/NotificationContext';

export const AuditLogTab = React.memo(() => {
  const { notify } = useNotifications();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAuditLogs({ limit: 50 });
      setLogs(data);
    } catch (error) {
      notify('error', 'Fetch Error', 'Could not load security audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('DEACTIVATE')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (action.includes('ACTIVATE')) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (action.includes('TOKEN')) return 'text-evofit-purple-light bg-evofit-purple-main/10 border-evofit-purple-main/20';
    return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  };

  return (
    <motion.div 
      key="security"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-evofit-bg-card border border-evofit-border rounded-3xl p-8">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div>
              <h3 className="text-lg font-bold text-evofit-text-primary m-0">Security Audit Log</h3>
              <p className="text-evofit-text-muted text-xs mt-1">Immutable chronological record of all administrative actions and security events.</p>
            </div>
            <button 
              onClick={fetchLogs}
              className="px-4 py-2 rounded-xl bg-evofit-bg-secondary border border-evofit-border text-[10px] font-black uppercase tracking-widest text-evofit-text-muted hover:text-evofit-text-primary transition-all flex items-center gap-2"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Log
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-black text-evofit-text-muted uppercase tracking-widest border-b border-evofit-border">
                   <th className="pb-4 px-2">Timestamp</th>
                   <th className="pb-4 px-2">Admin Account</th>
                   <th className="pb-4 px-2">Action Type</th>
                   <th className="pb-4 px-2">Security Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-evofit-border">
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-evofit-text-muted text-xs font-bold">
                      No audit events recorded yet.
                    </td>
                  </tr>
                )}
                {logs.map(log => (
                  <tr key={log.id} className="group hover:bg-evofit-bg-secondary/20 transition-all">
                     <td className="py-4 px-2">
                        <span className="text-xs font-mono text-evofit-text-muted">
                           {new Date(log.timestamp).toLocaleString()}
                        </span>
                     </td>
                     <td className="py-4 px-2">
                        <span className="text-sm font-bold text-evofit-text-primary">
                           @{log.admin_username}
                        </span>
                     </td>
                     <td className="py-4 px-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                           {log.action.replace('_', ' ')}
                        </span>
                     </td>
                     <td className="py-4 px-2">
                        <span className="text-xs text-evofit-text-muted">
                           {log.details}
                        </span>
                     </td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-evofit-text-muted text-xs">
                      Loading audit logs...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
      </div>
    </motion.div>
  );
});
