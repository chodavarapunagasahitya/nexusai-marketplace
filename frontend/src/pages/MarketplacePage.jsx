import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  Heart,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Bookmark,
  Briefcase,
  TrendingUp,
  ExternalLink,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export default function MarketplacePage() {
  const { user, toggleFavorite } = useAuth();
  const { formatPrice, currency, isLive: isCurrencyLive } = useCurrency();
  const [searchParams] = useSearchParams();

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [maxBudget, setMaxBudget] = useState(5000);
  const [minRating, setMinRating] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [language, setLanguage] = useState('All');

  // Tabs: 'all', 'favorites', 'smart-match'
  const [activeTab, setActiveTab] = useState('all');

  // Creators Data
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveTrends, setLiveTrends] = useState([]);
  const [showTrends, setShowTrends] = useState(true);

  // Smart Match Engine State
  const [matchBrief, setMatchBrief] = useState('');
  const [matchCategory, setMatchCategory] = useState('Video & Motion');
  const [matchBudget, setMatchBudget] = useState(1200);
  const [matchResults, setMatchResults] = useState([]);
  const [matching, setMatching] = useState(false);

  const categories = [
    'All',
    'Video & Motion',
    'Copywriting & Content',
    'Visual & 3D Art',
    'Social Media',
    'Audio & Voice',
    'Design & UI/UX'
  ];

  useEffect(() => {
    fetchCreators();
  }, [category, maxBudget, minRating, availability, language]);

  useEffect(() => {
    fetchLiveTrends();
  }, []);

  const fetchLiveTrends = async () => {
    try {
      const res = await fetch('/api/live-data/trends');
      const data = await res.json();
      if (data.success && data.articles) {
        setLiveTrends(data.articles);
      }
    } catch (e) {
      console.warn('Could not fetch live trends:', e);
    }
  };

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      if (maxBudget) params.append('maxBudget', maxBudget);
      if (minRating !== 'All') params.append('minRating', minRating);
      if (availability !== 'All') params.append('availability', availability);
      if (language !== 'All') params.append('language', language);

      const res = await fetch(`/api/creators?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCreators(data.creators);
      }
    } catch (err) {
      console.error('Error fetching creators:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCreators();
  };

  const handleRunSmartMatch = async (e) => {
    e.preventDefault();
    setMatching(true);
    try {
      const res = await fetch('/api/ai/match-creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: matchBrief,
          category: matchCategory,
          budget: Number(matchBudget)
        })
      });
      const data = await res.json();
      if (data.success) {
        setMatchResults(data.recommendations);
      }
    } catch (err) {
      console.error('Matching error:', err);
    } finally {
      setMatching(false);
    }
  };

  const displayedCreators = activeTab === 'favorites'
    ? creators.filter(c => (user?.favorites || []).includes(c.id || c._id || c.userId))
    : creators;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Discovery & Hiring
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Content Creator Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
            Browse domain-certified AI creators, filter by price, rating, and availability, or use Smart AI Matching to find your ideal creative partner.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-navy-900/90 border border-purple-900/40 rounded-2xl p-1 text-xs self-start md:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Creators
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'favorites' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            Favorites ({user?.favorites?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('smart-match')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'smart-match' ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-glow-sm' : 'text-purple-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Smart AI Match
          </button>
        </div>
      </div>

      {/* Real-World Live Data Banner: Live AI Industry Trends */}
      {liveTrends.length > 0 && showTrends && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 via-navy-900/90 to-amber-950/30 border border-orange-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Real-World AI Industry Trends & Research (Live External Feed)
              </span>
            </div>
            <button
              onClick={() => setShowTrends(false)}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {liveTrends.slice(0, 3).map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-navy-950/70 border border-orange-900/30 hover:border-orange-500/50 hover:bg-navy-900/80 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="text-orange-300 font-semibold">{article.readablePublishDate || 'Latest'}</span>
                    <span className="flex items-center gap-1 group-hover:text-orange-400">
                      Read <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-purple-900/20 text-[10px] text-slate-400">
                  {article.author?.avatar && (
                    <img src={article.author.avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                  )}
                  <span className="truncate">{article.author?.name || 'AI Researcher'}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Mode A: Standard Discovery & Filter Grid */}
      {activeTab !== 'smart-match' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Filter Sidebar */}
          <div className="lg:col-span-3 space-y-5">
            <div className="glass-card p-5 rounded-2xl border border-purple-900/40 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-purple-900/30">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-purple-400" /> Filter Creators
                </h3>
                <button
                  onClick={() => {
                    setCategory('All');
                    setSearch('');
                    setMaxBudget(1000);
                    setMinRating('All');
                    setAvailability('All');
                    setLanguage('All');
                  }}
                  className="text-[11px] text-purple-300 hover:text-purple-200"
                >
                  Reset
                </button>
              </div>

              {/* Search input */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Keyword or skill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </form>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Specialization Niche</label>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        category === cat
                          ? 'bg-purple-600/30 text-white font-bold border border-purple-500/40'
                          : 'text-slate-400 hover:text-white hover:bg-purple-950/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Starting Budget</span>
                  <span className="text-purple-300 font-mono">${maxBudget}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="All">Any Rating</option>
                  <option value="4.8">4.8 & Above ★</option>
                  <option value="4.9">4.9 & Above ★ (Elite)</option>
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Availability Status</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available Now</option>
                  <option value="Busy">Busy (Limited Openings)</option>
                  <option value="Booked">Booked</option>
                </select>
              </div>

            </div>
          </div>

          {/* Creators Cards Grid */}
          <div className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Showing {displayedCreators.length} verified creators</span>
              <span>Sorted by Rating & Activity</span>
            </div>

            {loading ? (
              <div className="glass-card p-12 text-center text-xs text-slate-400">
                Loading marketplace talent...
              </div>
            ) : displayedCreators.length === 0 ? (
              <div className="glass-card p-12 text-center space-y-3 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 mx-auto">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">No Creators Matched</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your budget or category filters to expand your search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedCreators.map(creator => {
                  const isFav = (user?.favorites || []).includes(creator.id || creator._id || creator.userId);
                  return (
                    <div
                      key={creator.id || creator._id}
                      className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-purple-900/30 hover:border-purple-400/40 relative group"
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={creator.avatar}
                              alt={creator.name}
                              className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-500/40"
                            />
                            <div>
                              <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                                {creator.name}
                              </h3>
                              <p className="text-xs text-purple-300/90 font-medium">{creator.title}</p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                                <span className="flex items-center text-amber-400 font-bold">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" /> {creator.rating}
                                </span>
                                <span>({creator.reviewsCount || 24} reviews)</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleFavorite(creator.id || creator._id || creator.userId)}
                            className="p-2 rounded-xl bg-navy-950/70 border border-purple-900/30 hover:scale-110 transition-transform"
                            title={isFav ? 'Remove favorite' : 'Add to favorites'}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                          </button>
                        </div>

                        {/* Status & Location Pill */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            creator.availability === 'Available'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            ● {creator.availability}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-purple-400" /> {creator.location || 'Remote'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                          {creator.bio}
                        </p>

                        {/* Skills pills */}
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {(creator.skills || []).slice(0, 4).map((s, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/50 border border-purple-800/30 text-purple-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Pricing & CTA */}
                      <div className="pt-4 border-t border-purple-900/30 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Starting Package</span>
                          <div className="text-base font-black text-white">
                            {formatPrice(creator.startingPrice)} <span className="text-xs font-normal text-slate-400">/ project</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/creator/${creator.id || creator._id}`}
                            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-glow-sm"
                          >
                            View Portfolio
                          </Link>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Mode B: Smart AI Creator Matching Engine */
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" /> Core Feature C
              </span>
              <h2 className="text-2xl font-black text-white">Smart AI Creator Matchmaker</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Provide your requirements and our semantic engine will calculate creator match scores, explain exactly why each creator fits your project, and evaluate their past client reviews.
              </p>
            </div>

            <form onSubmit={handleRunSmartMatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Scope & Requirements</label>
                <textarea
                  rows={4}
                  required
                  value={matchBrief}
                  onChange={(e) => setMatchBrief(e.target.value)}
                  placeholder="Describe your goals: e.g. We are building an AI video campaign for a developer tool. Looking for a creator skilled in Runway Gen-3, vertical storytelling, and ElevenLabs audio synchronization with a fast turnaround."
                  className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deliverable Domain</label>
                  <select
                    value={matchCategory}
                    onChange={(e) => setMatchCategory(e.target.value)}
                    className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Budget ($USD)</label>
                  <input
                    type="number"
                    value={matchBudget}
                    onChange={(e) => setMatchBudget(e.target.value)}
                    className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={matching}
                className="w-full py-3.5 rounded-xl purple-glow-btn text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                {matching ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" /> Computing Creator Compatibility...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" /> Match Creators Algorithmically
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Results Grid */}
          {matchResults.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Top Compatible Creators
              </h3>

              <div className="space-y-4">
                {matchResults.map(({ creator, matchScore, matchReasons, matchedSkills }, idx) => (
                  <div
                    key={creator.id || idx}
                    className="glass-card p-6 rounded-2xl border border-purple-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-500/40 shrink-0"
                      />
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <h4 className="text-base font-bold text-white">{creator.name}</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {matchScore}% Compatibility
                          </span>
                        </div>
                        <p className="text-xs text-purple-300">{creator.title}</p>
                        
                        {/* Explanation Why this Creator Matches */}
                        <div className="pt-2 space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
                            Why this creator matches:
                          </span>
                          <ul className="space-y-1">
                            {matchReasons.map((reason, rIdx) => (
                              <li key={rIdx} className="text-xs text-slate-300 flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-purple-900/30">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block text-right">Starts at</span>
                        <div className="text-lg font-black text-white text-right">{formatPrice(creator.startingPrice)}</div>
                      </div>
                      <Link
                        to={`/creator/${creator.id}`}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-sm flex items-center gap-1.5"
                      >
                        Hire Creator <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
