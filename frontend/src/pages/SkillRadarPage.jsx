import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Sparkles, 
  TrendingUp, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Info, 
  BookOpen, 
  Zap, 
  Clock,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SkillRadarPage() {
  const { user, token } = useAuth();
  const [radarData, setRadarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);

  useEffect(() => {
    fetchRadar();
  }, []);

  const fetchRadar = async () => {
    try {
      const res = await fetch('/api/skill-radar/prof_creator_1');
      const data = await res.json();
      if (data.success && data.data) {
        setRadarData(data.data);
      }
    } catch (err) {
      console.error('Error fetching skill radar:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Calibrating Creator Skill Opportunity Radar...</div>;
  }

  const { radarVectors = [], recommendedSkills = [], forecastedOpportunities = [], learningRoadmap = [], disclaimer } = radarData || {};

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
            <Radar className="w-3.5 h-3.5 text-violet-400" /> Unique Innovation #2
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Creator Skill Evolution & Opportunity Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Marketplace intelligence that scans real-time client search volume, identifies high-earning skill gaps in your portfolio, and charts a personalized 4-week learning roadmap.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-navy-900/90 border border-purple-900/40 text-xs text-slate-300 space-y-1 self-start md:self-auto">
          <span className="text-slate-400 block text-[11px]">Analyzed Portfolio Profile:</span>
          <strong className="text-white font-bold">{radarData?.creatorName || 'Elena Vance'}</strong>
          <span className="text-purple-300 block text-[11px]">{radarData?.creatorTitle || 'AI Video Director'}</span>
        </div>
      </div>

      {/* Prominent Forecast Disclosure Notice */}
      <div className="p-4 rounded-2xl bg-navy-900/80 border border-purple-800/40 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <strong className="text-purple-200">Marketplace Opportunity Forecast Notice:</strong> {disclaimer || "All projected earnings, demand levels, and brief opportunities represent algorithmic estimates based on historical marketplace transaction data. They are designed for strategic development guidance and do not constitute guaranteed client contracts."}
        </div>
      </div>

      {/* Grid: 6-Vector Competency Comparison + Emerging Skills Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (6 cols): 6-Vector Competency vs Demand Matrix */}
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-purple-900/40 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-purple-900/30">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Competency vs Marketplace Demand Matrix
              </h3>
              <p className="text-xs text-slate-400">Current skill proficiency vs buyer search pressure</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-purple-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Current Skill
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Market Demand
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {radarVectors.map((vec, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{vec.subject}</span>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="text-purple-300">{vec.current}%</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-emerald-400">{vec.marketDemand}%</span>
                    <span className={`font-bold ml-1 ${vec.delta.startsWith('+') ? 'text-violet-300' : 'text-slate-500'}`}>
                      ({vec.delta})
                    </span>
                  </div>
                </div>

                {/* Double Bar Overlay */}
                <div className="w-full bg-navy-950 h-3 rounded-full overflow-hidden relative p-0.5 border border-purple-900/30">
                  <div
                    style={{ width: `${vec.marketDemand}%` }}
                    className="absolute top-0.5 bottom-0.5 left-0.5 bg-emerald-500/30 rounded-full"
                  />
                  <div
                    style={{ width: `${vec.current}%` }}
                    className="relative h-full bg-gradient-to-r from-purple-600 to-violet-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/20 text-xs text-purple-200">
            💡 <strong>Highest Strategic Gap:</strong> Enterprise Content Strategy (+22% buyer demand surge over current skill level).
          </div>
        </div>

        {/* Right Column (6 cols): Recommended Emerging Content Skills */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Emerging Skills to Acquire
            </h3>
            <span className="text-xs text-purple-300">Surging Buyer Search Vectors</span>
          </div>

          <div className="space-y-3">
            {recommendedSkills.map((sk, idx) => (
              <div
                key={idx}
                className="glass-card p-5 rounded-2xl border border-purple-900/30 space-y-2 hover:border-purple-400/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-white">{sk.skill}</h4>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 self-start sm:self-auto">
                    {sk.demandLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{sk.description}</p>

                <div className="pt-2 border-t border-purple-900/20 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Difficulty: <strong className="text-slate-200">{sk.difficulty}</strong></span>
                  <span className="text-emerald-400 font-semibold">{sk.estimatedEarningBoost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Forecasted Project Opportunities (Marketplace Estimates) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 space-y-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-purple-400" /> Marketplace Demand Simulation
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Forecasted Project Opportunities Matching Emerging Skills
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real active client search patterns that could convert into immediate contracts upon skill verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {forecastedOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="glass-card p-5 rounded-2xl border border-purple-900/40 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
                    {opp.category}
                  </span>
                  <span className="font-bold text-amber-400">★ {opp.relevanceScore}% Match</span>
                </div>

                <h3 className="text-xs font-bold text-white leading-snug">{opp.title}</h3>
                <p className="text-[11px] text-slate-400">Target Niche: <strong className="text-slate-200">{opp.clientNiche}</strong></p>

                <div className="p-2 rounded-lg bg-navy-950/70 border border-purple-900/30 text-[11px] text-slate-300">
                  <span className="text-purple-400 font-semibold block text-[10px]">Key Required Skill:</span>
                  {opp.requiredSkillKey}
                </div>
              </div>

              <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Est. Budget Range</span>
                  <strong className="text-xs text-emerald-400 font-bold">{opp.estimatedBudgetRange}</strong>
                </div>
                <span className="text-[10px] text-slate-400 font-mono italic">Estimate</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized 4-Week Learning Roadmap */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" /> Personalized 4-Week Skill Sprint Roadmap
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Structured milestone action items to reach production-grade mastery and unlock higher package tiers.
            </p>
          </div>

          {/* Week Tabs */}
          <div className="flex rounded-2xl bg-navy-900 p-1 border border-purple-900/40 text-xs">
            {[1, 2, 3, 4].map((w) => (
              <button
                key={w}
                onClick={() => setActiveWeek(w)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeWeek === w
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Week {w}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Week Milestone Card */}
        {learningRoadmap.filter(item => item.week === activeWeek).map((roadmapItem) => (
          <div
            key={roadmapItem.week}
            className="p-6 rounded-2xl bg-navy-950/70 border border-purple-500/30 space-y-4 animate-in fade-in"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-900/30">
              <div>
                <span className="text-xs uppercase font-extrabold text-purple-400">
                  Week {roadmapItem.week} Focus
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{roadmapItem.milestone}</h3>
              </div>
              <span className="text-xs text-purple-300 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Est. {roadmapItem.estimatedHours} Hours Effort
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-300">Core Objective:</span>
              <p className="text-xs text-purple-200">{roadmapItem.objective}</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Action Items Checklist:</span>
              <div className="space-y-2">
                {roadmapItem.actionItems.map((action, aIdx) => (
                  <div
                    key={aIdx}
                    className="p-3 rounded-xl bg-navy-900/60 border border-purple-900/30 flex items-center gap-3 text-xs text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
