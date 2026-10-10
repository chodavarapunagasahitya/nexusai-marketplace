import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Bookmark, 
  RefreshCw, 
  ShieldCheck, 
  Trash2, 
  Check, 
  Sliders, 
  FileText, 
  History, 
  Clock, 
  Send,
  Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AIStudioPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Generation Controls
  const [contentType, setContentType] = useState('Social Media Caption');
  const [tone, setTone] = useState('Professional');
  const [targetAudience, setTargetAudience] = useState('Tech Founders & Creators');
  const [language, setLanguage] = useState('English');
  const [keywords, setKeywords] = useState('AI workflows, automation, scalability');
  const [prompt, setPrompt] = useState('Announcing a major AI creator platform that pairs brands with vetted video and 3D talent.');

  // Output State
  const [loading, setLoading] = useState(false);
  const [outputTitle, setOutputTitle] = useState('');
  const [outputContent, setOutputContent] = useState('');
  const [variations, setVariations] = useState([]);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('nexus_ai_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [engineUsed, setEngineUsed] = useState('');
  const [isLiveAI, setIsLiveAI] = useState(false);

  // History State
  const [historyList, setHistoryList] = useState([]);
  const [activeHistoryTab, setActiveHistoryTab] = useState(false);

  const contentTypes = [
    'Social Media Caption',
    'Blog Post',
    'Marketing Copy',
    'Video Script',
    'Product Description'
  ];

  const toneOptions = [
    'Professional',
    'Conversational',
    'Bold & Provocative',
    'Inspiring',
    'Humorous',
    'Urgent & Direct'
  ];

  const languageOptions = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Mandarin'];

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/ai/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistoryList(data.history);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setSavedSuccess(false);

    try {
      const activeKey = apiKey || localStorage.getItem('nexus_ai_key') || '';
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-key': activeKey,
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          contentType,
          tone,
          targetAudience,
          language,
          keywords: keywords.split(',').map(k => k.trim()),
          prompt,
          apiKey: activeKey
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setOutputTitle(data.data.title);
        setOutputContent(data.data.generatedContent);
        setVariations(data.data.variations || []);
        setEngineUsed(data.data.engine || 'Nexus AI Multi-Modal Engine');
        setIsLiveAI(Boolean(data.data.liveAI));
      }
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputContent) return;
    navigator.clipboard.writeText(outputContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToHistory = async () => {
    if (!outputContent || !token) return;
    try {
      const res = await fetch('/api/ai/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: outputTitle || `${contentType} Creation`,
          contentType,
          tone,
          targetAudience,
          language,
          keywords: keywords.split(',').map(k => k.trim()),
          prompt,
          generatedContent: outputContent
        })
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        fetchHistory();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/ai/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistoryList(prev => prev.filter(h => h.id !== id && h._id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setOutputTitle(item.title);
    setOutputContent(item.generatedContent);
    setContentType(item.contentType);
    setTone(item.tone || 'Professional');
    setTargetAudience(item.targetAudience || 'General');
    setPrompt(item.prompt);
    setActiveHistoryTab(false);
  };

  const handleRunAuthenticityCheck = () => {
    if (!outputContent) return;
    sessionStorage.setItem('nexus_authenticity_input', outputContent);
    navigate('/authenticity');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Studio Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Generation Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Generative Multi-Modal Creator Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
            Craft high-converting copy, viral short-form scripts, technical articles, and product copy with specialized tone constraints and instant originality checks.
          </p>
        </div>

        <button
          onClick={() => setActiveHistoryTab(!activeHistoryTab)}
          className="px-4 py-2.5 rounded-xl bg-navy-900/90 border border-purple-500/30 hover:border-purple-400 text-purple-200 text-xs font-bold flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <History className="w-4 h-4 text-purple-400" />
          <span>Generation History ({historyList.length})</span>
        </button>
      </div>

      {/* Real AI Engine Status & Key Integration Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shrink-0 ${apiKey ? 'bg-emerald-400 shadow-glow-sm animate-pulse' : 'bg-purple-400'}`} />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{apiKey ? '🟢 Live Cloud AI Engine Connected' : '⚡ AI Production Studio Active'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 font-mono">
                {apiKey ? (apiKey.startsWith('AIzaSy') ? 'Google Gemini 1.5 Flash' : 'OpenAI GPT-4o-mini') : 'Nexus Neural Engine'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {apiKey 
                ? 'Your personal AI key is securely stored in this browser session. Prompts run directly on live LLM APIs.' 
                : 'Supports Google Gemini 1.5 Flash & OpenAI GPT-4o-mini. Connect a key anytime or use built-in neural generation.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowKeyModal(!showKeyModal)}
          className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/60 border border-purple-600/40 text-purple-200 transition-all shrink-0"
        >
          {apiKey ? '⚙️ Edit AI Key' : '🔑 Connect Real AI Key'}
        </button>
      </div>

      {/* Expandable Key Input Modal */}
      {showKeyModal && (
        <div className="p-4 rounded-2xl bg-navy-900/90 border border-purple-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Connect Your Google Gemini or OpenAI API Key</span>
            <button onClick={() => setShowKeyModal(false)} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              placeholder="Google Gemini (AIzaSy...) or OpenAI (sk-...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 bg-navy-950 border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  localStorage.setItem('nexus_ai_key', apiKey);
                  setShowKeyModal(false);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold text-white shadow-sm"
              >
                Save Key
              </button>
              {apiKey && (
                <button
                  onClick={() => {
                    setApiKey('');
                    localStorage.removeItem('nexus_ai_key');
                  }}
                  className="px-3 py-2 bg-navy-950 hover:bg-rose-950/60 border border-rose-800/40 rounded-xl text-xs font-bold text-rose-300"
                >
                  Clear Key
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            Keys remain strictly in your browser local storage and are passed encrypted for generation requests.
          </p>
        </div>
      )}

      {/* Main Studio Grid: Controls on Left, Editor Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Generator Parameters */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card p-6 rounded-2xl border border-purple-900/40 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" /> Generation Settings
            </h2>

            {/* Content Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deliverable Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {contentTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Voice & Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {toneOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Gen-Z consumers, B2B CTOs, Indie Hackers"
                className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Language & Keywords in 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {languageOptions.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Key Focus Words</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="AI, Runway, 3D"
                  className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Prompt Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Creative Brief / Prompt Directive</label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the content goal, core hook, key takeaways, and call-to-action..."
                className="w-full bg-navy-950/90 border border-purple-900/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 rounded-xl purple-glow-btn text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Content...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" /> Generate {contentType}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Output Editor & History */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Output Container */}
          <div className="glass-card rounded-2xl border border-purple-900/40 overflow-hidden flex flex-col h-[560px]">
            
            {/* Top Output Toolbar */}
            <div className="p-4 border-b border-purple-900/30 flex items-center justify-between gap-2 bg-navy-900/40">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  value={outputTitle || 'Ready to Generate'}
                  onChange={(e) => setOutputTitle(e.target.value)}
                  placeholder="Draft Title"
                  className="bg-transparent border-none text-xs sm:text-sm font-bold text-white focus:outline-none truncate max-w-[200px] sm:max-w-xs"
                />
                {engineUsed && (
                  <span className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                    isLiveAI 
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                      : 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                  }`}>
                    {engineUsed}
                  </span>
                )}
              </div>

              {outputContent && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-navy-950 border border-purple-900/40 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleSaveToHistory}
                    className="p-1.5 rounded-lg bg-navy-950 border border-purple-900/40 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                    title="Save to database history"
                  >
                    {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleRunAuthenticityCheck}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                    title="Analyze Originality & Authenticity"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verify Authenticity
                  </button>
                </div>
              )}
            </div>

            {/* Editable Content Area */}
            <div className="flex-1 p-5 overflow-y-auto">
              {outputContent ? (
                <textarea
                  value={outputContent}
                  onChange={(e) => setOutputContent(e.target.value)}
                  className="w-full h-full bg-transparent border-none text-slate-200 text-xs sm:text-sm leading-relaxed resize-none focus:outline-none font-sans"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-900/30 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">AI Studio Ready</h3>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    Adjust your directive parameters on the left and click Generate to produce content. You can directly edit the results in this pane.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="px-4 py-2.5 border-t border-purple-900/30 bg-navy-950/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Word count: {outputContent ? outputContent.split(/\s+/).filter(Boolean).length : 0} words</span>
              {savedSuccess && <span className="text-emerald-400 font-semibold">✓ Saved to Platform History</span>}
              <button onClick={handleGenerate} className="text-purple-300 hover:text-white flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
            </div>
          </div>

          {/* Variations Drawer if available */}
          {variations.length > 0 && (
            <div className="p-4 rounded-xl bg-navy-900/70 border border-purple-900/30 space-y-2">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                Hook Variations & Alternate Angles:
              </span>
              <div className="space-y-2">
                {variations.map((v, i) => (
                  <div
                    key={i}
                    onClick={() => setOutputContent(v)}
                    className="p-2.5 rounded-lg bg-navy-950/60 border border-purple-900/20 text-xs text-slate-300 hover:border-purple-400/50 cursor-pointer transition-all"
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Slide-out or Dropdown Studio History Drawer */}
      {activeHistoryTab && (
        <div className="glass-panel p-6 rounded-2xl border border-purple-800/40 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" /> Saved Generation History
            </h3>
            <button
              onClick={() => setActiveHistoryTab(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historyList.map(h => (
              <div
                key={h.id || h._id}
                className="p-4 rounded-xl bg-navy-950/80 border border-purple-900/30 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {h.contentType}
                    </span>
                    <button
                      onClick={() => handleDeleteHistory(h.id || h._id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{h.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-3 mt-1 leading-relaxed">
                    {h.generatedContent}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-purple-900/20 text-[10px] text-slate-500">
                  <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleSelectHistoryItem(h)}
                    className="text-xs font-bold text-purple-300 hover:text-white"
                  >
                    Load into Editor →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
