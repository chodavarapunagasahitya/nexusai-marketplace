import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  DollarSign, 
  Star, 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Search,
  CreditCard,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export default function ClientDashboard() {
  const { user, token } = useAuth();
  const { formatPrice } = useCurrency();
  const [projects, setProjects] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Smart Match form
  const [matchBrief, setMatchBrief] = useState('');
  const [matching, setMatching] = useState(false);
  const [matchResults, setMatchResults] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, creatRes] = await Promise.all([
          fetch('/api/projects', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }),
          fetch('/api/creators')
        ]);
        const projData = await projRes.json();
        const creatData = await creatRes.json();

        if (projData.success) setProjects(projData.projects);
        if (creatData.success) setCreators(creatData.creators.slice(0, 3));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleQuickMatch = async (e) => {
    e.preventDefault();
    if (!matchBrief.trim()) return;
    setMatching(true);
    try {
      const res = await fetch('/api/ai/match-creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: matchBrief, budget: 1000 })
      });
      const data = await res.json();
      if (data.success) {
        setMatchResults(data.recommendations.slice(0, 2));
      }
    } catch (err) {
      console.error('Matching error:', err);
    } finally {
      setMatching(false);
    }
  };

  const activeProjects = projects.filter(p => p.status !== 'Completed');
  const completedProjects = projects.filter(p => p.status === 'Completed');
  const totalSpent = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  const getStatusBadge = (status) => {
    const map = {
      'Payment Pending': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'Awaiting Creator': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Requested': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Accepted': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'In Progress': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Under Review': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'Completed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'Declined': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return map[status] || 'bg-slate-700 text-slate-300';
  };

  const handlePayEscrow = async (projectId, budget, creatorName) => {
    if (!window.confirm(`Fund escrow with ${formatPrice(budget)} to send your proposal to ${creatorName}?`)) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.map(p => p.id === projectId ? data.project : p));
        alert(data.message);
      } else {
        alert(data.message || 'Payment failed.');
      }
    } catch (err) {
      console.error('Pay escrow error:', err);
      alert('Something went wrong. Please try again.');
    }
  };


  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Client Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hello, {user?.name || 'Sarah Chen'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage your AI content creator sprints, generate instant copy in the studio, and verify deliverable authenticity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/marketplace"
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white purple-glow-btn flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Discover & Hire Creators
          </Link>
          <Link
            to="/studio"
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-purple-200 bg-navy-900/90 border border-purple-500/30 hover:border-purple-400 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-purple-400" /> Open AI Studio
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Sprints</span>
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{activeProjects.length}</div>
          <span className="text-[11px] text-purple-300/80 mt-1 block">In progress or review</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Invested</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatPrice(totalSpent)}</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Across {projects.length} milestones</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Completed Projects</span>
            <CheckCircle2 className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">{completedProjects.length}</div>
          <span className="text-[11px] text-violet-300 mt-1 block">100% Escrow Released</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Authenticity Score</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">96.8%</div>
          <span className="text-[11px] text-amber-300 mt-1 block">Verified Original</span>
        </div>
      </div>

      {/* AI Smart Creator Matchmaker Quick Widget */}
      <div className="glass-card p-6 rounded-2xl border border-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h2 className="text-base font-bold text-white">Smart AI Matchmaker</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Algorithmic Recommendation
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Describe what you need produced and our AI matching engine will calculate the top matched creators based on niche, skills, budget, and track record.
        </p>

        <form onSubmit={handleQuickMatch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Need a 45-second high energy vertical video with Runway Gen-3 and AI voice for our SaaS launch..."
            value={matchBrief}
            onChange={(e) => setMatchBrief(e.target.value)}
            className="flex-1 bg-navy-950/90 border border-purple-900/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={matching}
            className="px-5 py-2.5 rounded-xl purple-glow-btn text-white font-bold text-xs flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {matching ? 'Matching...' : 'Find Matches'} <Sparkles className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Display Match Results if generated */}
        {matchResults && (
          <div className="mt-4 pt-4 border-t border-purple-900/30 grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchResults.map(({ creator, matchScore, matchReasons }) => (
              <div key={creator.id} className="p-4 rounded-xl bg-navy-950/70 border border-purple-800/40 flex items-start gap-3">
                <img src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/40" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{creator.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {matchScore}% Match
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-300 truncate">{creator.title}</p>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-400">
                    {matchReasons.slice(0, 2).map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{r}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{formatPrice(creator.startingPrice)} starting</span>
                    <Link
                      to={`/creator/${creator.id}`}
                      className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1"
                    >
                      Propose Project <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Projects Table & Pending Actions */}
      <div className="glass-panel rounded-2xl border border-purple-900/40 overflow-hidden">
        <div className="p-5 border-b border-purple-900/30 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Project Sprints & Deliverables</h2>
            <p className="text-xs text-slate-400">Track deadlines, milestones, and pending actions in real time.</p>
          </div>
          <Link to="/projects" className="text-xs font-semibold text-purple-300 hover:text-purple-200">
            View All ({projects.length})
          </Link>
        </div>

        <div className="divide-y divide-purple-900/20 overflow-x-auto">
          {projects.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No active projects yet. Browse the marketplace to hire your first creator!
            </div>
          ) : (
            projects.map(proj => (
              <div key={proj.id} className="p-4 sm:p-5 hover:bg-purple-950/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(proj.status)}`}>
                      {proj.status}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate">{proj.title}</h3>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">{proj.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Creator: <strong className="text-purple-300">{proj.creatorName}</strong></span>
                    <span>Budget: <strong className="text-white">{formatPrice(proj.budget)}</strong></span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400" /> Deadline: {proj.deadline}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  {proj.status === 'Payment Pending' ? (
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[11px] text-rose-300/80 italic text-right">⚠️ Escrow not funded — creator hasn't started yet</span>
                      <Link
                        to={`/checkout/${proj.id}`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-orange-950/60"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Pay Money / Escrow — {formatPrice(proj.budget)}
                      </Link>
                    </div>
                  ) : (
                    <>
                      <span className="text-[11px] text-purple-300/80 italic max-w-xs text-right hidden sm:block truncate">
                        {proj.pendingAction}
                      </span>
                      <Link
                        to={`/projects/${proj.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                      >
                        Manage & Collaborate <ArrowRight className="w-3 h-3" />
                      </Link>
                    </>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommended Creators Carousel Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Recommended AI Creators</h2>
            <p className="text-xs text-slate-400">Creators matching your recent project niches</p>
          </div>
          <Link to="/marketplace" className="text-xs font-semibold text-purple-300 hover:text-purple-200">
            Browse All Creators →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creators.map(c => (
            <div key={c.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{c.name}</h3>
                    <p className="text-xs text-purple-300 truncate">{c.title}</p>
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> {c.rating} ({c.reviewsCount})
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{c.bio}</p>
              </div>

              <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between">
                <span className="text-xs font-bold text-white">{formatPrice(c.startingPrice)} <span className="text-slate-400 font-normal">starts</span></span>
                <Link
                  to={`/creator/${c.id}`}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
