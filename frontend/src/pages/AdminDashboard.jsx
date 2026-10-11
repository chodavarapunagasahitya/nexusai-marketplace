import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Briefcase, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  Ban, 
  AlertTriangle, 
  Eye, 
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import DatabaseDatasetHub from '../components/DatabaseDatasetHub';

export default function AdminDashboard() {
  const { user, token, demoLogin } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'reports' | 'activity'
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    if (!token) return;
    try {
      const [stRes, usRes, repRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/reports', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const stData = await stRes.json();
      const usData = await usRes.json();
      const repData = await repRes.json();

      if (stData.success) setStats(stData.stats);
      if (usData.success) setUsersList(usData.users);
      if (repData.success) setReports(repData.reports);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleModerateReport = async (reportId, newStatus, actionTaken) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, actionTaken })
      });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.map(r => (r.id === reportId || r._id === reportId) ? data.report : r));
      }
    } catch (err) {
      console.error('Error updating report:', err);
    }
  };

  // If currently not logged in as Admin, show banner with quick switch button
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Platform Governance & Moderation
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
            Oversee creator identity verifications, review reported copyright/spam flags, and monitor platform health.
          </p>
        </div>

        {!isAdmin && (
          <div className="p-3 rounded-2xl bg-fuchsia-950/40 border border-fuchsia-500/40 text-xs text-fuchsia-200 flex items-center gap-3 self-start md:self-auto">
            <span>Logged in as {user?.role || 'Guest'}</span>
            <button
              onClick={() => demoLogin('admin')}
              className="px-3 py-1.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs"
            >
              Switch to Admin Demo
            </button>
          </div>
        )}
      </div>

      {/* Admin KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Registered Users</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.totalUsers || usersList.length || 6}</div>
          <span className="text-[11px] text-purple-300 mt-1 block">
            {stats?.totalCreators || 4} Creators • {stats?.totalClients || 1} Clients
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Pending Moderation Reports</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {reports.filter(r => r.status === 'pending').length}
          </div>
          <span className="text-[11px] text-amber-300 mt-1 block">Requires manual review</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Marketplace Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {formatPrice(stats?.platformGrossVolume || 133000)}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Escrow and completed contracts</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Daily AI Studio Runs</span>
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.aiRunsToday || 412}</div>
          <span className="text-[11px] text-violet-300 mt-1 block">100% Operational Uptime</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex rounded-2xl bg-navy-900 p-1 border border-purple-900/40 text-xs w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'users' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          User Account Directory ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'reports' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Reported Content Queue ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'database' ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-glow-sm' : 'text-purple-300 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1" />
          Database & Dataset Hub
        </button>
      </div>

      {activeTab === 'users' ? (
        /* Users Directory Table */
        <div className="glass-card rounded-2xl border border-purple-900/40 overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Registered Accounts</h3>
              <p className="text-xs text-slate-400">View user permissions and toggle suspension status.</p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name/email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-navy-950 border border-purple-900/40 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto divide-y divide-purple-900/20">
            {usersList
              .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(u => (
                <div key={u.id || u._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-purple-500/30" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{u.name}</h4>
                      <span className="text-[11px] text-slate-400">{u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      u.role === 'creator'
                        ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                        : u.role === 'admin'
                        ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}>
                      {u.role}
                    </span>

                    <span className={`text-[10px] font-bold ${
                      u.status === 'active' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      ● {u.status || 'active'}
                    </span>

                    <button
                      onClick={() => handleToggleUserStatus(u.id || u._id, u.status || 'active')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        u.status === 'suspended'
                          ? 'bg-emerald-600/30 hover:bg-emerald-600 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {u.status === 'suspended' ? 'Reactivate' : 'Suspend Account'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : activeTab === 'reports' ? (
        /* Reported Content Moderation Table */
        <div className="glass-card rounded-2xl border border-purple-900/40 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Reported Content Moderation</h3>
            <p className="text-xs text-slate-400">Review reported copyright claims, inappropriate content, and spam accounts.</p>
          </div>

          <div className="space-y-4 pt-2">
            {reports.map(rep => (
              <div key={rep.id || rep._id} className="p-4 rounded-xl bg-navy-950/70 border border-purple-900/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {rep.reason}
                    </span>
                    <h4 className="text-xs font-bold text-white">{rep.targetTitle}</h4>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    rep.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    Status: {rep.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {rep.details}
                </p>

                <div className="pt-2 border-t border-purple-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                  <span>Reported by: <strong>{rep.reporterEmail}</strong></span>
                  
                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleModerateReport(rep.id || rep._id, 'dismissed', 'dismissed_no_violation')}
                        className="px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-700 text-slate-300 hover:text-white text-xs"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        onClick={() => handleModerateReport(rep.id || rep._id, 'resolved', 'content_removed')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                      >
                        Enforce Action & Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DatabaseDatasetHub />
      )}

    </div>
  );
}
