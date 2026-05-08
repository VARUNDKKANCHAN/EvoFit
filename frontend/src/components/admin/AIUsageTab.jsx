import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/admin';
import { useNotifications } from '../../context/NotificationContext';

export const AIUsageTab = ({ stats }) => {
  const { notify } = useNotifications();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [editingLimits, setEditingLimits] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchUsers = async (searchQuery) => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers({ search: searchQuery });
      setUsers(data);
    } catch (error) {
      notify('error', 'Fetch Error', 'Could not load users list.');
    } finally {
      setLoading(false);
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

  return (
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
            <div className="flex items-center gap-4">
              <div className="relative w-full md:w-64">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-evofit-text-muted" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-evofit-bg-secondary border border-evofit-border rounded-2xl py-2 pl-12 pr-4 text-sm text-evofit-text-primary focus:outline-none focus:ring-2 focus:ring-evofit-purple-main/20"
                />
              </div>
              <div className="bg-evofit-purple-main/10 border border-evofit-purple-main/20 px-4 py-2 rounded-2xl whitespace-nowrap">
                 <p className="text-[10px] font-black text-evofit-purple-light uppercase tracking-widest m-0 mb-1">Global Usage</p>
                 <p className="text-xl font-black text-evofit-text-primary m-0">{(stats?.total_rag_tokens || 0).toLocaleString()}</p>
              </div>
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
               {loading && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-evofit-text-muted text-xs">
                      Loading users...
                    </td>
                  </tr>
                )}
             </tbody>
           </table>
         </div>
      </div>
    </motion.div>
  );
};
