import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-navy-950 border-t border-purple-900/30 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-purple-900/20">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-violet-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base">NexusAI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The premier AI-powered creator marketplace uniting visionary clients with elite creators for short-form video, synthetic voice, 3D art, and technical thought-leadership.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">Marketplace</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/marketplace?category=Video" className="hover:text-purple-300">Video & Motion Directors</Link></li>
              <li><Link to="/marketplace?category=Copywriting" className="hover:text-purple-300">AI Copywriters & Prompters</Link></li>
              <li><Link to="/marketplace?category=Visual" className="hover:text-purple-300">3D & Midjourney Visual Artists</Link></li>
              <li><Link to="/marketplace?category=Social" className="hover:text-purple-300">Executive Ghostwriters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">AI Intelligence</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/studio" className="hover:text-purple-300">AI Content Studio</Link></li>
              <li><Link to="/authenticity" className="hover:text-purple-300">Content Authenticity Assistant</Link></li>
              <li><Link to="/skill-radar" className="hover:text-purple-300">Creator Skill Evolution Radar</Link></li>
              <li><Link to="/projects" className="hover:text-purple-300">Escrow & Milestone Workflows</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">Platform Guarantee</h4>
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                <Shield className="w-3.5 h-3.5" /> Authenticity Verified
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Every deliverable verified for originality with milestone escrow protection.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 NexusAI Creator Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/settings" className="hover:text-purple-300">Privacy & Terms</Link>
            <Link to="/admin" className="hover:text-purple-300">Admin Governance</Link>
            <Link to="/analytics" className="hover:text-purple-300">Platform Analytics</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
