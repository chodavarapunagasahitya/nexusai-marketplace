import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  Share2,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Send,
  X,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export default function CreatorProfilePage() {
  const { id } = useParams();
  const { user, token, toggleFavorite } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const navigate = useNavigate();

  const [creator, setCreator] = useState(null);
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio', 'packages', 'reviews', 'about'
  const [loading, setLoading] = useState(true);

  // Proposal Modal State
  const [showHireModal, setShowHireModal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalBudget, setProposalBudget] = useState(650);
  const [proposalDeadline, setProposalDeadline] = useState('2026-11-15');
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState(false);

  // Portfolio Item Lightbox Modal
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/creators/${id}`);
        const data = await res.json();
        if (data.success && data.creator) {
          setCreator(data.creator);
        } else {
          // Fallback fetch first creator
          const listRes = await fetch('/api/creators');
          const listData = await listRes.json();
          if (listData.success && listData.creators.length > 0) {
            setCreator(listData.creators[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching creator:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    if (!proposalTitle.trim() || !token) return;
    setSubmittingProposal(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: proposalTitle,
          description: proposalDescription,
          creatorId: creator.userId || creator.id || id,
          creatorName: creator.name,
          category: creator.category,
          budget: Number(proposalBudget),
          deadline: proposalDeadline,
          deliverables: ['Phase 1: Creative Concept & Script', 'Phase 2: Production & Voice Synthesis', 'Phase 3: Color Grading & Final Assets']
        })
      });
      const data = await res.json();
      if (data.success) {
        setProposalSuccess(true);
        setTimeout(() => {
          setShowHireModal(false);
          navigate(`/projects/${data.project.id || data.project._id}`);
        }, 1200);
      }
    } catch (err) {
      console.error('Error submitting proposal:', err);
    } finally {
      setSubmittingProposal(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading creator profile & portfolio...
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Creator not found. <Link to="/marketplace" className="text-purple-300">Return to marketplace</Link>
      </div>
    );
  }

  const isFav = (user?.favorites || []).includes(creator.id || creator._id || creator.userId);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Cover Banner & Profile Header */}
      <div className="glass-panel rounded-3xl border border-purple-900/40 overflow-hidden">
        
        {/* Cover Photo */}
        <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-navy-900">
          <img
            src={creator.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200'}
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-navy-950 shadow-2xl relative z-10"
              />
              <div className="space-y-1.5 pb-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{creator.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Verified AI Pro
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-purple-300 font-medium">{creator.title}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {creator.rating} ({creator.reviewsCount || 48} reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-purple-400" /> {creator.location || 'San Francisco, CA'}
                  </span>
                  <span>•</span>
                  <span className={`font-bold ${creator.availability === 'Available' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    ● {creator.availability}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-end gap-3 pb-2">
              <button
                onClick={() => toggleFavorite(creator.id || creator._id || creator.userId)}
                className="p-3 rounded-2xl bg-navy-900 border border-purple-900/40 text-slate-300 hover:text-white transition-transform hover:scale-105"
                title="Favorite"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
              </button>

              <button
                onClick={() => setShowHireModal(true)}
                className="px-6 py-3 rounded-2xl purple-glow-btn text-white font-bold text-xs flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Propose Collaboration
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 pt-6 border-t border-purple-900/30 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-navy-900/50 border border-purple-900/20">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Starting Project Rate</span>
              <strong className="text-lg font-black text-white">{formatPrice(creator.startingPrice)}</strong>
            </div>
            <div className="p-3 rounded-xl bg-navy-900/50 border border-purple-900/20">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hourly Rate</span>
              <strong className="text-lg font-black text-white">{formatPrice(creator.hourlyRate)}/hr</strong>
            </div>
            <div className="p-3 rounded-xl bg-navy-900/50 border border-purple-900/20">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivered Projects</span>
              <strong className="text-lg font-black text-white">{creator.completedProjects || 52}+</strong>
            </div>
            <div className="p-3 rounded-xl bg-navy-900/50 border border-purple-900/20">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Repeat Hire Rate</span>
              <strong className="text-lg font-black text-emerald-400">{creator.analytics?.clientRetentionRate || 94}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-purple-900/40 gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'portfolio'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Featured Portfolio ({creator.portfolio?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'packages'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Service Packages ({creator.packages?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'reviews'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Client Reviews ({creator.reviews?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'about'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          About & Skills
        </button>
      </div>

      {/* TAB 1: Portfolio Showcase */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(creator.portfolio || []).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPortfolioItem(item)}
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer border border-purple-900/30 hover:border-purple-400/50 flex flex-col justify-between"
              >
                <div className="h-48 w-full relative overflow-hidden bg-navy-950">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-[10px] font-bold text-purple-300 border border-purple-500/30">
                    {item.category}
                  </div>
                </div>

                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between text-xs text-purple-200 font-semibold">
                    <span>⚡ {item.metrics}</span>
                    <span className="text-[11px] text-slate-500">{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Service Packages */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(creator.packages || []).map((pkg, idx) => (
            <div
              key={idx}
              className={`glass-card p-6 rounded-3xl flex flex-col justify-between border ${
                idx === 1 ? 'border-purple-500/60 shadow-glow-sm relative' : 'border-purple-900/40'
              }`}
            >
              {idx === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Most Popular Sprint
                </span>
              )}

              <div>
                <h3 className="text-base font-extrabold text-white mb-1">{pkg.name}</h3>
                <div className="text-3xl font-black text-white mt-3 mb-4">
                  {formatPrice(pkg.price)} <span className="text-xs text-slate-400 font-normal">per deliverable</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 pb-4 mb-4 border-b border-purple-900/30">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" /> {pkg.deliveryDays} Days Turnaround
                  </span>
                  <span>•</span>
                  <span>{pkg.revisions} Revisions Included</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  {(pkg.features || []).map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setProposalBudget(pkg.price);
                  setProposalTitle(`${pkg.name} Package Sprint`);
                  setShowHireModal(true);
                }}
                className={`w-full mt-6 py-3 rounded-xl font-bold text-xs transition-all ${
                  idx === 1
                    ? 'purple-glow-btn text-white'
                    : 'bg-navy-900 hover:bg-purple-900/30 border border-purple-500/30 text-purple-200'
                }`}
              >
                Select Package (${pkg.price})
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Client Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 max-w-3xl">
          {(creator.reviews || []).map((rev) => (
            <div key={rev.id} className="glass-card p-5 rounded-2xl border border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={rev.clientAvatar} alt={rev.clientName} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{rev.clientName}</h4>
                    <span className="text-[11px] text-purple-300/80">{rev.projectTitle}</span>
                  </div>
                </div>
                <div className="flex items-center text-amber-400">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{rev.comment}"
              </p>
              <div className="text-[10px] text-slate-500">{rev.date}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: About & Skills */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-6 rounded-2xl border border-purple-900/40 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Creator Bio & Philosophy</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {creator.bio}
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-purple-900/40 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Verified Skill Badges</h3>
            <div className="flex flex-wrap gap-2">
              {(creator.skills || []).map((sk, idx) => (
                <span key={idx} className="px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-semibold">
                  ✓ {sk}
                </span>
              ))}
            </div>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider pt-4">Fluent Languages</h3>
            <div className="flex gap-2">
              {(creator.languages || ['English']).map((lang, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-navy-900 border border-purple-900/40 text-xs text-slate-300">
                  🌐 {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Proposal / Collaboration Modal */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-purple-500/40 relative shadow-2xl animate-in fade-in">
            <button
              onClick={() => setShowHireModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-black text-white">Send Proposal to {creator.name}</h3>
              <p className="text-xs text-purple-300">Funds remain in secure escrow until deliverables are approved.</p>
            </div>

            {proposalSuccess ? (
              <div className="p-6 text-center space-y-2 text-emerald-400">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <h4 className="font-bold text-sm">Proposal Dispatched!</h4>
                <p className="text-xs text-slate-300">Opening project room...</p>
              </div>
            ) : (
              <form onSubmit={handleHireSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Explainer Reel Series"
                    value={proposalTitle}
                    onChange={(e) => setProposalTitle(e.target.value)}
                    className="w-full bg-navy-950 border border-purple-900/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Project Brief & Details</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe target goals, creative references, and format..."
                    value={proposalDescription}
                    onChange={(e) => setProposalDescription(e.target.value)}
                    className="w-full bg-navy-950 border border-purple-900/40 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Budget ($USD)</label>
                    <input
                      type="number"
                      required
                      value={proposalBudget}
                      onChange={(e) => setProposalBudget(e.target.value)}
                      className="w-full bg-navy-950 border border-purple-900/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Target Deadline</label>
                    <input
                      type="date"
                      required
                      value={proposalDeadline}
                      onChange={(e) => setProposalDeadline(e.target.value)}
                      className="w-full bg-navy-950 border border-purple-900/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingProposal}
                  className="w-full py-3.5 rounded-xl purple-glow-btn text-white font-bold text-xs flex items-center justify-center gap-2 mt-4"
                >
                  {submittingProposal ? 'Creating Proposal...' : `Send Proposal ($${proposalBudget})`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Lightbox Modal */}
      {selectedPortfolioItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-purple-500/40 overflow-hidden relative">
            <button
              onClick={() => setSelectedPortfolioItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={selectedPortfolioItem.imageUrl}
              alt={selectedPortfolioItem.title}
              className="w-full h-72 object-cover"
            />

            <div className="p-6 space-y-3">
              <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/30">
                {selectedPortfolioItem.category}
              </span>
              <h3 className="text-xl font-bold text-white">{selectedPortfolioItem.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedPortfolioItem.description}</p>
              <div className="pt-2 text-xs font-semibold text-purple-300">
                Performance: {selectedPortfolioItem.metrics}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
