import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  FileText, 
  Lightbulb, 
  Info,
  Copy,
  Check
} from 'lucide-react';

export default function AuthenticityAssistantPage() {
  const [inputText, setInputText] = useState(
    sessionStorage.getItem('nexus_authenticity_input') ||
    `In today's fast-paced digital world, it is important to remember that generative models will delve into uncharted territories and seamlessly integrate with your production stack. Studies show 85% of brands are actively adopting AI workflows. This is a true testament to the game-changer technology.`
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [copiedRewrite, setCopiedRewrite] = useState(false);

  useEffect(() => {
    // Run initial analysis on mount
    handleAnalyze();
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/authenticity/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error('Authenticity analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyRewrite = () => {
    if (!report?.distinctiveRewrite) return;
    navigator.clipboard.writeText(report.distinctiveRewrite);
    setCopiedRewrite(true);
    setTimeout(() => setCopiedRewrite(false), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 stroke-emerald-400';
    if (score >= 70) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Unique Innovation #1
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            AI Content Authenticity & Originality Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Scan your content for repetitive syntax, formulaic generic AI clichés, and missing empirical citations. Receive actionable recommendations to make your voice distinctly authoritative.
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="px-6 py-3 rounded-2xl purple-glow-btn text-white font-bold text-xs flex items-center gap-2 shrink-0 self-start md:self-auto disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Patterns...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-300" /> Run Originality Scan
            </>
          )}
        </button>
      </div>

      {/* Prominent Ethical Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-navy-900/80 border border-purple-800/40 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <strong className="text-purple-200">Ethical Heuristic Disclosure:</strong> {report?.disclaimer || "AI authenticity analysis provides heuristic similarity, repetition, and stylistic distinctiveness indicators based on platform database patterns. This assessment does not claim to definitively prove human authorship or detect all AI-generated content."}
        </div>
      </div>

      {/* Main Analysis Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (6 cols): Text Input & Highlighted Sections */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" /> Content Inspection Canvas
              </h3>
              <span className="text-xs text-slate-400">
                {inputText.split(/\s+/).filter(Boolean).length} Words
              </span>
            </div>

            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste draft copy, script, or blog post here for authenticity analysis..."
              className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
            />

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setInputText(`The creative production sprint has permanently shifted. In 2026, teams that test five validated motion variants in 48 hours outperform those waiting six weeks for traditional agencies. Our internal benchmarks at TechFlow observed a 4x jump in click-through retention.`)}
                className="text-[11px] text-purple-300 hover:text-white"
              >
                Insert Authoritative Sample →
              </button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all"
              >
                Update Scan
              </button>
            </div>
          </div>

          {/* Flagged Heuristic Concerns */}
          {report && (
            <div className="glass-card p-6 rounded-2xl border border-purple-900/40 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Flagged Sections & Cliché Patterns ({report.flaggedSections?.length || 0})
              </h3>

              {report.flaggedSections?.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  No common generic formulaic patterns detected. High stylistic distinctiveness!
                </div>
              ) : (
                <div className="space-y-3">
                  {report.flaggedSections.map((flag) => (
                    <div
                      key={flag.id}
                      className="p-3.5 rounded-xl bg-navy-950/80 border border-purple-900/30 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          "{flag.text}"
                        </span>
                        <span className="text-[10px] uppercase font-bold text-purple-400">{flag.issueType}</span>
                      </div>
                      <p className="text-slate-300">{flag.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Citation Alerts */}
          {report && report.citationAlerts?.length > 0 && (
            <div className="glass-card p-6 rounded-2xl border border-purple-900/40 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Uncited Factual Claims ({report.citationAlerts.length})
              </h3>
              {report.citationAlerts.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 text-xs space-y-1">
                  <strong className="text-purple-200 block">"...{c.claim}..."</strong>
                  <p className="text-slate-400 text-[11px]">{c.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (6 cols): Scores Gauge, Recommendations & Distinctive Rewrite */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Originality Score Card */}
          {report && (
            <div className="glass-card p-6 rounded-2xl border border-purple-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400">Calculated Originality Index</span>
                  <div className={`text-4xl font-black mt-1 ${getScoreColor(report.originalityScore)}`}>
                    {report.originalityScore}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-slate-400">Distinctiveness</span>
                  <div className="text-sm font-bold text-purple-300 mt-1">{report.distinctivenessIndex}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-navy-950 h-3 rounded-full overflow-hidden p-0.5 border border-purple-900/40">
                <div
                  style={{ width: `${report.originalityScore}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    report.originalityScore >= 85
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : report.originalityScore >= 70
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-rose-500 to-red-400'
                  }`}
                />
              </div>

              {/* Sub-Metrics Breakdown */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-navy-950 border border-purple-900/30">
                  <span className="text-[10px] text-slate-400 block">Generic Clichés</span>
                  <strong className="text-white text-sm">{report.metrics?.genericClichés || 0}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-navy-950 border border-purple-900/30">
                  <span className="text-[10px] text-slate-400 block">Repetitive Patterns</span>
                  <strong className="text-white text-sm">{report.metrics?.repetitivePatterns || 0}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-navy-950 border border-purple-900/30">
                  <span className="text-[10px] text-slate-400 block">Citation Alerts</span>
                  <strong className="text-white text-sm">{report.metrics?.citationAlertsCount || 0}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Actionable Suggestions for Distinctiveness */}
          {report && (
            <div className="glass-card p-6 rounded-2xl border border-purple-900/40 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Ways to Elevate Distinctiveness
              </h3>
              <div className="space-y-3">
                {report.suggestions?.map((sug, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-navy-950/70 border border-purple-900/30 space-y-1 text-xs">
                    <h4 className="font-bold text-purple-200">{sug.title}</h4>
                    <p className="text-slate-400 leading-relaxed">{sug.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Distinctive Rewrite Generator */}
          {report && report.distinctiveRewrite && (
            <div className="glass-card p-6 rounded-2xl border border-purple-500/30 space-y-3 relative">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Distinctive Rewrite Suggestion
                </h3>
                <button
                  onClick={handleCopyRewrite}
                  className="p-1.5 rounded-lg bg-navy-950 border border-purple-900/40 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                  title="Copy rewrite"
                >
                  {copiedRewrite ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-navy-950/90 border border-purple-900/40 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                {report.distinctiveRewrite}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
