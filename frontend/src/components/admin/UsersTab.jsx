import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/admin';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const UsersTab = () => {
  const { user } = useAuth();
  const { notify } = useNotifications();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
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

  return (
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
                placeholder="Search users on server..."
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
                {users.map(u => (
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
                {loading && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-evofit-text-muted text-xs">
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
