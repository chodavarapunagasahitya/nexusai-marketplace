import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Radar, 
  Zap, 
  Users, 
  Star, 
  TrendingUp, 
  CheckCircle2, 
  Play, 
  Video, 
  PenTool, 
  Box, 
  Share2,
  ChevronRight,
  Headphones,
  Layout
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('video');
  const [featuredCreators, setFeaturedCreators] = useState([]);

  useEffect(() => {
    fetch('/api/creators')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.creators && data.creators.length > 0) {
          setFeaturedCreators(data.creators.slice(0, 6));
        }
      })
      .catch(err => console.error('Failed to load live creators:', err));
  }, []);

  const handleQuickDemo = async (role) => {
    await demoLogin(role);
    if (role === 'creator') navigate('/dashboard/creator');
    else if (role === 'admin') navigate('/admin');
    else navigate('/dashboard/client');
  };

  const categories = [
    { id: 'video', name: 'AI Video & Motion', icon: Video, count: 'Video Directors' },
    { id: 'copy', name: 'Prompt Copywriters', icon: PenTool, count: 'Prompt Architects' },
    { id: '3d', name: 'Generative 3D Art', icon: Box, count: '3D Synthographers' },
    { id: 'social', name: 'Executive Ghostwriters', icon: Share2, count: 'Growth Strategists' },
    { id: 'audio', name: 'Voice & Sound Design', icon: Headphones, count: 'Sonic Engineers' },
    { id: 'design', name: 'Design Systems & UI', icon: Layout, count: 'Spline 3D Architects' }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-purple-600/15 blur-[120px] pointer-events-none rounded-full" />

        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6 shadow-glow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Next-Gen Creator Economy Powered by Intelligent AI</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
          Hire Vetted <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent">AI Creators</span> or Generate High-Impact Content in Seconds.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          The unified platform connecting ambitious brands, founders, and students with top-tier AI video directors, copywriters, and 3D artists. Featuring built-in originality verification and smart creator matching.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/marketplace"
            className="px-7 py-3.5 rounded-xl font-bold text-sm text-white purple-glow-btn flex items-center gap-2"
          >
            Explore Creator Marketplace <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/studio"
            className="px-7 py-3.5 rounded-xl font-bold text-sm text-purple-200 bg-navy-900/80 hover:bg-navy-800 border border-purple-500/30 hover:border-purple-400 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-400" /> Launch AI Studio
          </Link>
        </div>

        {/* Quick Demo Switcher Bar */}
        <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-3 p-2 rounded-2xl bg-navy-900/60 border border-purple-900/40 text-xs text-slate-300">
          <span className="font-semibold text-purple-300 px-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Instant Demo Sign-In:
          </span>
          <button
            onClick={() => handleQuickDemo('client')}
            className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 font-medium transition-all"
          >
            Demo Client (Sarah Chen)
          </button>
          <button
            onClick={() => handleQuickDemo('creator')}
            className="px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600 text-violet-200 hover:text-white border border-violet-500/40 font-medium transition-all"
          >
            Demo Creator (Elena Vance)
          </button>
          <button
            onClick={() => handleQuickDemo('admin')}
            className="px-3 py-1.5 rounded-lg bg-fuchsia-600/30 hover:bg-fuchsia-600 text-fuchsia-200 hover:text-white border border-fuchsia-500/40 font-medium transition-all"
          >
            Demo Admin (Alex Rivera)
          </button>
        </div>

        {/* Live Marketplace Statistics Counter */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="glass-card p-5 rounded-2xl text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">1,250+</div>
            <div className="text-xs text-purple-300/80 mt-1 font-medium">Vetted AI Creators</div>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">14.8K+</div>
            <div className="text-xs text-purple-300/80 mt-1 font-medium">AI Deliverables Produced</div>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">4.96 ★</div>
            <div className="text-xs text-purple-300/80 mt-1 font-medium">Average Review Rating</div>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">$128K+</div>
            <div className="text-xs text-purple-300/80 mt-1 font-medium">Paid Out to Creators</div>
          </div>
        </div>
      </section>

      {/* Two Unique Platform Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Exclusive Innovations</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Why NexusAI is Built Different
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3">
            Two pioneering technologies that ensure authenticity for clients and high-earning career growth for creators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Feature 1 Card: AI Authenticity Assistant */}
          <div className="glass-card p-8 rounded-3xl border border-purple-500/20 hover:border-purple-400/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center mb-6 text-purple-300 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              Unique Feature 1
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-3 mb-2">
              AI Content Authenticity & Originality Assistant
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Never worry about generic robotic clichés. Our deep analyzer inspects text for internal database similarity, repetitive syntax, and unverified claims, providing distinctive rewrites and an explainable originality score.
            </p>
            <div className="p-4 rounded-xl bg-navy-900/80 border border-purple-900/50 mb-6 text-xs text-slate-300 space-y-2 font-mono">
              <div className="flex justify-between text-purple-300">
                <span>Originality Index:</span>
                <span className="font-bold text-emerald-400">96% (Authoritative)</span>
              </div>
              <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[96%]" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans italic">
                Verified against platform corpus and cliché heuristics.
              </p>
            </div>
            <Link
              to="/authenticity"
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-300 hover:text-purple-200"
            >
              Test Authenticity Assistant <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Feature 2 Card: Creator Skill Evolution Radar */}
          <div className="glass-card p-8 rounded-3xl border border-violet-500/20 hover:border-violet-400/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center mb-6 text-violet-300 group-hover:scale-110 transition-transform">
              <Radar className="w-6 h-6 text-violet-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
              Unique Feature 2
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-3 mb-2">
              Creator Skill Evolution & Opportunity Radar
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              AI doesn't just match creators — it levels them up. The Radar continuously scans buyer search trends, identifies emerging high-demand skills (e.g. Runway Gen-3 velocity tokens, Spline 3D), and delivers a 4-week learning roadmap.
            </p>
            <div className="p-4 rounded-xl bg-navy-900/80 border border-purple-900/50 mb-6 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-purple-200">Surging Marketplace Demand:</span>
                <span className="text-violet-400 font-mono">+140% YoY</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Matched Brief: "B2B SaaS Motion Series" • Est. $1,800 - $3,200
              </p>
            </div>
            <Link
              to="/skill-radar"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-violet-200"
            >
              Explore Skill Opportunity Radar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Featured Creators Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Top Rated Talent</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Featured AI Creators</h2>
            <p className="text-sm text-slate-400 mt-1">Vetted by portfolio quality, production speed, and client reviews.</p>
          </div>
          <Link
            to="/marketplace"
            className="text-sm font-semibold text-purple-300 hover:text-purple-200 flex items-center gap-1.5"
          >
            View all 1,250+ creators <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCreators.map(creator => (
            <div key={creator._id || creator.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-500/40"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base">{creator.name}</h3>
                    <p className="text-xs text-purple-300 font-medium line-clamp-1">{creator.title || creator.role}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="flex items-center text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" /> {creator.rating || 5.0}
                      </span>
                      <span>({creator.reviewsCount || (creator.reviews ? creator.reviews.length : 0)} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-navy-950/60 border border-purple-900/30 text-xs text-purple-200 font-medium mb-4 flex items-center justify-between">
                  <span>📍 {creator.location || 'Global'}</span>
                  <span className="text-emerald-400">● {creator.availability || 'Available'}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {(creator.skills || []).slice(0, 4).map((skill, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-slate-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-purple-900/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Starts at</span>
                  <span className="text-base font-extrabold text-white">${creator.startingPrice || 250}</span>
                </div>
                <Link
                  to={`/creator/${creator._id || creator.id}`}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-glow-sm"
                >
                  View Portfolio
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-purple-800/30">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Streamlined Workflow</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">How NexusAI Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 font-extrabold flex items-center justify-center text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Smart Match or Generate</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Describe your project brief to receive ranked creator matches with match scores, or use the AI Studio to generate instant content drafts.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 font-extrabold flex items-center justify-center text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Escrow & Milestone Sprints</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Fund milestone deliverables securely. Track project status through Requested, Accepted, In Progress, Under Review, and Completed.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 font-extrabold flex items-center justify-center text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Authenticity Pass & Launch</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Verify deliverable distinctiveness using the Authenticity Assistant. Approve final assets and release payment seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-purple-900/40 via-violet-900/30 to-purple-950 border border-purple-500/30 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Accelerate Your Content Production?
            </h2>
            <p className="text-sm sm:text-base text-purple-200">
              Join thousands of brands, creators, and founders leveraging next-generation AI workflows.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/marketplace"
                className="px-8 py-3.5 rounded-xl font-bold text-sm text-white purple-glow-btn"
              >
                Find a Creator Now
              </Link>
              <Link
                to="/auth"
                className="px-8 py-3.5 rounded-xl font-bold text-sm text-purple-300 bg-navy-900/80 border border-purple-500/30 hover:border-purple-400"
              >
                Join as Creator
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
