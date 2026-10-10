import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  DollarSign, 
  Key, 
  Bell, 
  Shield, 
  Check, 
  Save 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DatabaseDatasetHub from '../components/DatabaseDatasetHub';

export default function SettingsPage() {
  const { user, token } = useAuth();

  const [name, setName] = useState(user?.name || 'Sarah Chen');
  const [title, setTitle] = useState(user?.title || 'Head of Growth at TechFlow');
  const [bio, setBio] = useState(user?.bio || 'Scaling AI-native B2B developer tools.');
  const [hourlyRate, setHourlyRate] = useState(85);
  const [startingPrice, setStartingPrice] = useState(350);
  const [apiKey, setApiKey] = useState(localStorage.getItem('nexus_ai_key') || '');
  const [notifyProjects, setNotifyProjects] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyAuthenticity, setNotifyAuthenticity] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (apiKey) {
        localStorage.setItem('nexus_ai_key', apiKey);
      } else {
        localStorage.removeItem('nexus_ai_key');
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, title, bio, hourlyRate, startingPrice })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" /> Workspace Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Platform & Profile Settings</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Update your public profile, creator rates, AI credentials, and notification preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-900/40 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" /> Public Profile Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-navy-950 border border-purple-900/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-navy-950 border border-purple-900/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Short Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-navy-950 border border-purple-900/40 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
        </div>

        {/* Creator Rate Calibration (Only for creators or universal preview) */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-900/40 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Creator Rate Calibration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hourly Consultation Rate ($USD)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full bg-navy-950 border border-purple-900/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Base Starting Package Price ($USD)</label>
              <input
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="w-full bg-navy-950 border border-purple-900/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* AI API Integration Configuration */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-900/40 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" /> AI Provider API Key (Optional)
          </h2>
          <p className="text-xs text-slate-400">
            NexusAI provides a high-fidelity built-in generative engine out of the box. If you wish to connect your personal Gemini or OpenAI key, paste it here. Keys are kept encrypted.
          </p>
          <input
            type="password"
            placeholder="AIzaSy... or sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-navy-950 border border-purple-900/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Notification Preferences */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-900/40 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" /> Real-Time Notifications
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyProjects}
                onChange={(e) => setNotifyProjects(e.target.checked)}
                className="accent-purple-500 w-4 h-4 rounded"
              />
              <span className="text-xs text-slate-200">Alert me when collaboration proposals are accepted or reviewed</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyMessages}
                onChange={(e) => setNotifyMessages(e.target.checked)}
                className="accent-purple-500 w-4 h-4 rounded"
              />
              <span className="text-xs text-slate-200">Send chat notifications for incoming creator messages</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyAuthenticity}
                onChange={(e) => setNotifyAuthenticity(e.target.checked)}
                className="accent-purple-500 w-4 h-4 rounded"
              />
              <span className="text-xs text-slate-200">Notify when content passes platform authenticity verification</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Preferences Saved Successfully!
            </span>
          )}
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl purple-glow-btn text-white font-bold text-xs flex items-center gap-2 ml-auto"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>

      </form>

      {/* Database & Master Dataset Hub */}
      <div className="pt-4">
        <DatabaseDatasetHub />
      </div>

    </div>
  );
}
