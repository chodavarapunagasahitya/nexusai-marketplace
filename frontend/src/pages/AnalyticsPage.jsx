import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  CheckCircle2, 
  Star, 
  Sparkles, 
  Lightbulb, 
  ArrowUpRight, 
  Layers 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsPage() {
  const { user, token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [viewMode, setViewMode] = useState('creator'); // 'creator' | 'platform'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creaRes, platRes] = await Promise.all([
          fetch('/api/analytics/creator/prof_creator_1'),
          fetch('/api/analytics/platform')
        ]);
        const creaData = await creaRes.json();
        const platData = await platRes.json();

        if (creaData.success) setAnalytics(creaData.analytics);
        if (platData.success) setPlatformStats(platData.platform);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading performance analytics...</div>;
  }

  const monthlyData = analytics?.monthlyEarnings || [
    { month: 'Oct', amount: 5200 },
    { month: 'Nov', amount: 6800 },
    { month: 'Dec', amount: 8400 },
    { month: 'Jan', amount: 9600 },
    { month: 'Feb', amount: 11200 },
    { month: 'Mar', amount: 12850 }
  ];

  const maxMonth = Math.max(...monthlyData.map(m => m.amount));

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Performance & Growth Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {viewMode === 'creator' ? 'Creator Analytics & Yield' : 'Platform Macro Metrics'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
            Measure conversion rates, monthly revenue progression, deliverable velocity, and receive actionable AI recommendations.
          </p>
        </div>

        <div className="flex rounded-2xl bg-navy-900 p-1 border border-purple-900/40 text-xs self-start md:self-auto">
          <button
            onClick={() => setViewMode('creator')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              viewMode === 'creator' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Creator View
          </button>
          <button
            onClick={() => setViewMode('platform')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              viewMode === 'platform' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Marketplace Macro View
          </button>
        </div>
      </div>

      {viewMode === 'creator' ? (
        /* Creator View */
        <div className="space-y-8">
          
          {/* 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Cumulative Earnings</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">${analytics?.totalEarnings?.toLocaleString()}</div>
              <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +16.2% QoQ
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Profile Impressions</span>
                <Eye className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">{analytics?.profileViews}</div>
              <span className="text-[11px] text-purple-300 mt-1 block">8.4% Engagement Rate</span>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Project Completion</span>
                <CheckCircle2 className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-black text-white">{analytics?.completionRate}</div>
              <span className="text-[11px] text-violet-300 mt-1 block">Zero cancelled sprints</span>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Average Client Rating</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{analytics?.rating} ★</div>
              <span className="text-[11px] text-amber-300 mt-1 block">48 Verified reviews</span>
            </div>
          </div>

          {/* Charts Row: Monthly Performance Chart + Project Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Monthly Earnings Bar Chart (8 cols) */}
            <div className="lg:col-span-8 glass-card p-6 rounded-3xl border border-purple-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Monthly Revenue Trajectory ($USD)
                  </h3>
                  <p className="text-xs text-slate-400">Past 6 months payout volume</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Surging (+147% YTD)
                </span>
              </div>

              {/* Bar visualization */}
              <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {monthlyData.map((item, idx) => {
                  const heightPercent = Math.round((item.amount / maxMonth) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[11px] font-bold text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${(item.amount / 1000).toFixed(1)}k
                      </span>
                      <div className="w-full bg-navy-950 rounded-xl overflow-hidden h-48 flex items-end p-1">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-purple-700 via-purple-500 to-violet-400 rounded-lg group-hover:brightness-125 transition-all shadow-glow-sm"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project Status Distribution (4 cols) */}
            <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-purple-900/40 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Deliverable Status Breakdown
                </h3>
                <p className="text-xs text-slate-400">Current active workload split</p>
              </div>

              <div className="space-y-3 py-2">
                {(analytics?.projectStatusDistribution || []).map((st, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{st.status}</span>
                      <span className="font-bold text-white">{st.count} Projects</span>
                    </div>
                    <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(12, st.count * 8))}%`,
                          backgroundColor: st.color
                        }}
                        className="h-full rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/30 text-xs text-slate-300">
                ⚡ 98.5% on-time milestone delivery record.
              </div>
            </div>

          </div>

          {/* Personalized Recommendations Section */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Personalized AI Recommendations for Growth
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Generated by analyzing your client ratings, conversion rates, and current marketplace brief searches.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {(analytics?.recommendations || []).map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-navy-950/70 border border-purple-900/40 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {rec.category}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-400">{rec.impact}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-2">{rec.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {rec.description}
                    </p>
                  </div>
                  <button className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1 self-start">
                    Apply Strategy →
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Platform Macro View */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl text-center space-y-1">
            <span className="text-xs text-slate-400 uppercase font-bold">Gross Marketplace Volume</span>
            <div className="text-3xl font-black text-white">
              ${platformStats?.grossMarketplaceVolume?.toLocaleString() || '128,400'}
            </div>
            <span className="text-xs text-emerald-400">+34% this month</span>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center space-y-1">
            <span className="text-xs text-slate-400 uppercase font-bold">Total AI Generations</span>
            <div className="text-3xl font-black text-white">
              {platformStats?.aiGenerationsCount?.toLocaleString() || '14,280'}
            </div>
            <span className="text-xs text-purple-300">Across 5 content types</span>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center space-y-1">
            <span className="text-xs text-slate-400 uppercase font-bold">Completed Sprints</span>
            <div className="text-3xl font-black text-white">
              {platformStats?.totalProjects || '185'}
            </div>
            <span className="text-xs text-violet-300">4.94 ★ Platform Rating</span>
          </div>
        </div>
      )}

    </div>
  );
}
