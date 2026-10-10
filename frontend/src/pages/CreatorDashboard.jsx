import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Eye,
  Star,
  CheckCircle2,
  Clock,
  Briefcase,
  Radar,
  ArrowRight,
  Sparkles,
  FileText,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CreatorDashboard() {
  const { user, token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const creatorTarget = (user && user.role === 'creator' && (user.id || user._id)) ? (user.id || user._id) : 'prof_creator_1';
        const [projRes, anaRes] = await Promise.all([
          fetch('/api/projects', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }),
          fetch(`/api/analytics/creator/${creatorTarget}`)
        ]);
        const projData = await projRes.json();
        const anaData = await anaRes.json();

        if (projData.success) setProjects(projData.projects);
        if (anaData.success) setAnalytics(anaData.analytics);
      } catch (err) {
        console.error('Error fetching creator dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [token]);

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.map(p => p.id === projectId ? data.project : p));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'Requested': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Accepted': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'In Progress': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Under Review': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'Completed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    };
    return map[status] || 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Creator Top Welcome */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Creator Operating System
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Creator Studio: {user?.name || 'Elena Vance'} 🎨
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Monitor client project briefs, manage review cycles, view earnings, and unlock high-demand skill opportunities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/skill-radar"
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:brightness-110 flex items-center gap-1.5 shadow-glow-sm"
          >
            <Radar className="w-4 h-4 text-violet-200" /> Skill Opportunity Radar
          </Link>
          <Link
            to="/creator/prof_creator_1"
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-purple-200 bg-navy-900/90 border border-purple-500/30 hover:border-purple-400 flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> View Public Profile
          </Link>
        </div>
      </div>

      {/* Creator KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${analytics ? analytics.totalEarnings.toLocaleString() : '12,850'}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">+18.4% vs last month</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Profile Impressions</span>
            <Eye className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics ? analytics.profileViews.toLocaleString() : '3,840'}
          </div>
          <span className="text-[11px] text-purple-300 mt-1 block">94% client retention</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">98.5%</div>
          <span className="text-[11px] text-violet-300 mt-1 block">52 projects delivered</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Client Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">4.96 ★</div>
          <span className="text-[11px] text-amber-300 mt-1 block">48 Verified 5-star reviews</span>
        </div>
      </div>

      {/* Project Proposals & Pipeline Section */}
      <div className="glass-panel rounded-2xl border border-purple-900/40 overflow-hidden">
        <div className="p-5 border-b border-purple-900/30 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Client Project Pipeline & Review Queue</h2>
            <p className="text-xs text-slate-400">Accept briefs, upload production assets, and submit for client review.</p>
          </div>
          <span className="text-xs font-mono text-purple-300">
            {projects.length} Total Engagements
          </span>
        </div>

        <div className="divide-y divide-purple-900/20">
          {projects.map(proj => (
            <div key={proj.id} className="p-5 hover:bg-purple-950/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(proj.status)}`}>
                    {proj.status}
                  </span>
                  <h3 className="text-sm font-bold text-white truncate">{proj.title}</h3>
                </div>

                <p className="text-xs text-slate-400 line-clamp-1">{proj.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>Client: <strong className="text-purple-300">{proj.clientName}</strong></span>
                  <span>Budget: <strong className="text-emerald-400">${proj.budget}</strong></span>
                  <span>Deadline: <strong className="text-white">{proj.deadline}</strong></span>
                  <span>Deliverables: <strong>{proj.deliverables?.filter(d => d.completed).length || 0}/{proj.deliverables?.length || 0} completed</strong></span>
                </div>
              </div>

              {/* Action Buttons for Creator */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {proj.status === 'Requested' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(proj.id, 'Accepted')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                    >
                      Accept Proposal (${proj.budget})
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(proj.id, 'Declined')}
                      className="px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-700 text-slate-400 hover:text-white text-xs font-medium"
                    >
                      Decline
                    </button>
                  </>
                )}

                {proj.status === 'Accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(proj.id, 'In Progress')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
                  >
                    Start Production Sprints
                  </button>
                )}

                {proj.status === 'In Progress' && (
                  <button
                    onClick={() => handleUpdateStatus(proj.id, 'Under Review')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
                  >
                    Submit for Client Review
                  </button>
                )}

                <Link
                  to={`/projects/${proj.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-navy-900/90 hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center gap-1"
                >
                  Project Room <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Skill Radar Forecast Teaser (Unique Feature 2) */}
      <div className="glass-card p-6 rounded-2xl border border-violet-500/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Radar className="w-4 h-4 text-violet-400" />
              <h3 className="text-base font-bold text-white">Skill Evolution & Opportunity Radar</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">
                Feature 2 Deep Dive
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Based on your Video & Motion portfolio, here is the highest projected opportunity for this quarter.
            </p>
          </div>
          <Link
            to="/skill-radar"
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
          >
            Full Radar Roadmap <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-4 rounded-xl bg-navy-950/70 border border-purple-900/40 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Emerging Skill to Learn:</span>
            <strong className="text-white text-sm">Runway Gen-3 Camera Constraints</strong>
            <span className="text-violet-400 block mt-0.5 text-[11px]">+140% Client Search Surge</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Matched Brief Opportunity:</span>
            <strong className="text-purple-200">B2B SaaS Motion Campaign</strong>
            <span className="text-emerald-400 block mt-0.5 text-[11px]">Est. Budget: $1,800 - $3,200</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Forecast Disclosure:</span>
            <p className="text-[10px] text-slate-400 italic">
              Algorithmic marketplace estimate for career development.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
