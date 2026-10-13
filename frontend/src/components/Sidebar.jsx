import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  ShieldCheck,
  Radar,
  Briefcase,
  MessageSquare,
  BarChart3,
  ShieldAlert,
  Settings,
  X,
  UserCheck,
  Flame,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const role = user?.role;

  const coreWorkspaceItems = [
    ...(role === 'client' || role === 'admin'
      ? [{ name: 'Client Dashboard', to: '/dashboard/client', icon: LayoutDashboard, badge: 'Active' }]
      : []),
    ...(role === 'creator' || role === 'admin'
      ? [{ name: 'Creator Dashboard', to: '/dashboard/creator', icon: UserCheck, badge: 'Active' }]
      : []),
    {
      name: 'Creator Marketplace',
      to: '/marketplace',
      icon: Compass,
      badge: '4.9★'
    }
  ];

  const navItems = [
    {
      group: 'Core Workspaces',
      items: coreWorkspaceItems
    },
    {
      group: 'AI Studios & Intelligence',
      items: [
        {
          name: 'AI Content Studio',
          to: '/studio',
          icon: Sparkles,
          glow: true
        },
        {
          name: 'Authenticity Assistant',
          to: '/authenticity',
          icon: ShieldCheck,
          badge: 'Feature 1'
        },
        {
          name: 'Skill Evolution Radar',
          to: '/skill-radar',
          icon: Radar,
          badge: 'Feature 2'
        }
      ]
    },
    {
      group: 'Operations & Insights',
      items: [
        {
          name: 'Projects & Contracts',
          to: '/projects',
          icon: Briefcase
        },
        {
          name: 'Messages & Hub',
          to: '/messages',
          icon: MessageSquare
        },
        {
          name: 'Performance Analytics',
          to: '/analytics',
          icon: BarChart3
        },
        {
          name: 'Admin Governance',
          to: '/admin',
          icon: ShieldAlert,
          badge: 'Admin'
        },
        {
          name: 'Platform Settings',
          to: '/settings',
          icon: Settings
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-50 w-64 bg-navy-950/95 border-r border-purple-900/30 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden mb-2 pb-2 border-b border-purple-900/40">
            <span className="text-xs uppercase tracking-wider text-purple-300 font-bold">Platform Menu</span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-purple-300/60">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600/30 to-violet-600/10 text-white border border-purple-500/40 shadow-glow-sm'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-purple-950/40'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${item.glow ? 'text-purple-400' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          item.badge === 'Active'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : item.badge.includes('Feature')
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                            : 'bg-navy-800 text-slate-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom AI Quota Card */}
        <div className="p-4 border-t border-purple-900/30 bg-navy-900/40">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-900/30 to-navy-900 border border-purple-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> AI Generation Turbo
              </span>
              <span className="text-[10px] text-purple-300/80 font-mono">Unlimited Tier</span>
            </div>
            <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-violet-400 h-full w-[85%]" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Multi-modal synthesis & originality checks active.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
