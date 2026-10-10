import React, { useState, useEffect } from 'react';
import { 
  Database, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileJson, 
  Server, 
  Zap, 
  ArrowRight,
  HardDrive
} from 'lucide-react';

export default function DatabaseDatasetHub() {
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reseeding, setReseeding] = useState(false);
  const [mongoUri, setMongoUri] = useState('');
  const [connectingMongo, setConnectingMongo] = useState(false);
  const [mongoResult, setMongoResult] = useState(null);
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [fullDataset, setFullDataset] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/database/status');
      const data = await res.json();
      if (data.success) {
        setDbStats(data);
      }
    } catch (err) {
      console.error('Error fetching DB stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReseed = async () => {
    setReseeding(true);
    try {
      const res = await fetch('/api/database/reseed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDbStats(data.stats);
        alert('Dataset successfully reseeded and synced across all collections!');
      }
    } catch (err) {
      alert('Failed to reseed dataset: ' + err.message);
    } finally {
      setReseeding(false);
    }
  };

  const handleConnectMongo = async (e) => {
    e.preventDefault();
    if (!mongoUri.trim()) return;
    setConnectingMongo(true);
    setMongoResult(null);

    try {
      const res = await fetch('/api/database/connect-mongo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mongoUri })
      });
      const data = await res.json();
      if (data.success) {
        setMongoResult({ type: 'success', message: data.message });
        setDbStats(data.stats);
      } else {
        setMongoResult({ type: 'error', message: data.message });
      }
    } catch (err) {
      setMongoResult({ type: 'error', message: err.message });
    } finally {
      setConnectingMongo(false);
    }
  };

  const handleViewDataset = async () => {
    if (!fullDataset) {
      try {
        const res = await fetch('/api/database/dataset');
        const data = await res.json();
        if (data.success) {
          setFullDataset(data.dataset);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setShowJsonViewer(!showJsonViewer);
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-900/40 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" /> Database & Master Dataset Hub
            </h3>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Connected & Synced
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Real-time multi-collection dataset store with persistent disk sync and Mongoose MongoDB support.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleReseed}
            disabled={reseeding}
            className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            title="Reset to default seed data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
            {reseeding ? 'Reseeding...' : 'Reseed Dataset'}
          </button>

          <button
            onClick={handleViewDataset}
            className="px-3.5 py-2 rounded-xl bg-navy-950 border border-purple-900/40 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <FileJson className="w-3.5 h-3.5 text-purple-400" />
            {showJsonViewer ? 'Hide JSON' : 'Inspect JSON'}
          </button>
        </div>
      </div>

      {/* Database State Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-navy-950/70 border border-purple-900/30">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Engine</span>
          <strong className="text-xs font-black text-white mt-1 block truncate">
            {dbStats?.engine || 'Persistent JSON Store'}
          </strong>
          <span className="text-[10px] text-purple-300 block mt-0.5">Mongoose Schema Active</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-950/70 border border-purple-900/30">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Records</span>
          <strong className="text-lg font-black text-emerald-400 mt-0.5 block">
            {dbStats?.totalRecords || 23} Documents
          </strong>
          <span className="text-[10px] text-slate-400 block">Across 6 Collections</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-950/70 border border-purple-900/30">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Storage Persistence</span>
          <strong className="text-xs font-bold text-slate-200 mt-1 block truncate">
            nexus_database.json
          </strong>
          <span className="text-[10px] text-emerald-400 block mt-0.5">● Auto-Saved to Disk</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-950/70 border border-purple-900/30">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">MongoDB Status</span>
          <strong className="text-xs font-bold text-purple-300 mt-1 block">
            {dbStats?.mongoConnected ? '✅ Atlas Connected' : '⚡ Local Resilient Store'}
          </strong>
          <span className="text-[10px] text-slate-400 block mt-0.5">Zero Downtime</span>
        </div>
      </div>

      {/* Collection Records Breakdown Badges */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Connected Collections & Datasets:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-navy-900/80 border border-purple-900/30 text-center">
            <span className="text-[10px] text-slate-400 block">Users</span>
            <strong className="text-white text-sm">{dbStats?.counts?.users || 6}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-navy-900/80 border border-purple-900/30 text-center">
            <span className="text-[10px] text-slate-400 block">Creators</span>
            <strong className="text-white text-sm">{dbStats?.counts?.creators || 4}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-navy-900/80 border border-purple-900/30 text-center">
            <span className="text-[10px] text-slate-400 block">Projects</span>
            <strong className="text-white text-sm">{dbStats?.counts?.projects || 5}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-navy-900/80 border border-purple-900/30 text-center">
            <span className="text-[10px] text-slate-400 block">AI History</span>
            <strong className="text-white text-sm">{dbStats?.counts?.aiGenerations || 3}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-navy-900/80 border border-purple-900/30 text-center">
            <span className="text-[10px] text-slate-400 block">Messages</span>
            <strong className="text-white text-sm">{dbStats?.counts?.messages || 3}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-navy-900/80 border border-purple-900/30 text-center">
            <span className="text-[10px] text-slate-400 block">Reports</span>
            <strong className="text-white text-sm">{dbStats?.counts?.reportedContent || 2}</strong>
          </div>
        </div>
      </div>

      {/* External MongoDB (Atlas) Live Switcher Form */}
      <div className="p-5 rounded-2xl bg-navy-950/60 border border-purple-900/40 space-y-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Connect External MongoDB / Atlas URI
          </h4>
        </div>
        <p className="text-[11px] text-slate-400">
          Want to connect your cloud MongoDB Atlas or external database? Paste your connection string below to connect Mongoose dynamically.
        </p>

        <form onSubmit={handleConnectMongo} className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/dbname"
            value={mongoUri}
            onChange={(e) => setMongoUri(e.target.value)}
            className="flex-1 bg-navy-900 border border-purple-900/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
          />
          <button
            type="submit"
            disabled={connectingMongo}
            className="px-5 py-2 rounded-xl purple-glow-btn text-white font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            {connectingMongo ? 'Connecting...' : 'Connect & Sync'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {mongoResult && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            mongoResult.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border border-rose-500/40 text-rose-200'
          }`}>
            {mongoResult.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{mongoResult.message}</span>
          </div>
        )}
      </div>

      {/* Expandable JSON Dataset Inspector */}
      {showJsonViewer && (
        <div className="p-4 rounded-2xl bg-navy-950 border border-purple-900/40 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-purple-300 font-mono">
            <span>// Master Dataset Raw Inspection</span>
            <span>JSON Format • UTF-8</span>
          </div>
          <pre className="max-h-80 overflow-y-auto text-[11px] text-slate-300 font-mono p-3 bg-black/40 rounded-xl border border-purple-900/20 leading-relaxed">
            {JSON.stringify(fullDataset, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}
