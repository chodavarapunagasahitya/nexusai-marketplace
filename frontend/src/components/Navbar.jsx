import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Layers, 
  Radar, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BackendStatusBadge from './BackendStatusBadge';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, demoLogin, notifications, unreadCount, markAllNotificationsRead } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRoleSwitch = async (role) => {
    await demoLogin(role);
    if (role === 'creator') navigate('/dashboard/creator');
    else if (role === 'admin') navigate('/admin');
    else navigate('/dashboard/client');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-navy-950/85 backdrop-blur-md border-b border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger & Brand Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar} 
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-purple-900/20 lg:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-400 flex items-center justify-center shadow-glow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                Nexus<span className="text-purple-400">AI</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-purple-300/70 font-semibold -mt-1">
                Creator Economy
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Universal Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="w-full relative">
            <Search className="w-4 h-4 text-purple-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search creators, skills (e.g. Runway, 3D, Ghostwriting)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-900/80 border border-purple-900/40 rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </form>
        </div>

        {/* Right: Role Switcher & User Profile Menu */}
        <div className="flex items-center gap-3">
          
          {/* Live Backend Connection Indicator */}
          <BackendStatusBadge />

          {/* Quick Demo Role Switcher Pill */}
          <div className="hidden sm:flex items-center bg-navy-900/90 border border-purple-900/50 rounded-full p-0.5 text-xs">
            <button
              onClick={() => handleRoleSwitch('client')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                user?.role === 'client' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Client
            </button>
            <button
              onClick={() => handleRoleSwitch('creator')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                user?.role === 'creator' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Creator
            </button>
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                user?.role === 'admin' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Quick Action: AI Studio */}
          <Link
            to="/studio"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI Studio
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-purple-900/20 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-navy-900 border border-purple-800/40 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-400" /> Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-purple-300 hover:text-purple-200"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-purple-900/20 max-h-72 overflow-y-auto mt-2">
                  {notifications.map(n => (
                    <div key={n.id} className="py-2.5 px-2 hover:bg-purple-950/40 rounded-lg transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs font-semibold ${n.read ? 'text-slate-300' : 'text-purple-300'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-full border border-purple-500/30 hover:border-purple-400 transition-all focus:outline-none"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-navy-900 border border-purple-800/40 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-purple-900/40">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {user.role} account
                    </span>
                  </div>

                  <div className="py-1 text-xs">
                    <Link
                      to={user.role === 'creator' ? '/dashboard/creator' : user.role === 'admin' ? '/admin' : '/dashboard/client'}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-purple-900/30"
                    >
                      <Layers className="w-4 h-4 text-purple-400" />
                      Dashboard
                    </Link>

                    {user.role === 'creator' && (
                      <Link
                        to="/creator/prof_creator_1"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-purple-900/30"
                      >
                        <User className="w-4 h-4 text-purple-400" />
                        My Public Profile
                      </Link>
                    )}

                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-purple-900/30"
                    >
                      <Settings className="w-4 h-4 text-purple-400" />
                      Settings & Preferences
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-purple-900/40">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-300 hover:text-rose-200 hover:bg-rose-950/30 text-xs"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold text-xs shadow-glow-sm hover:brightness-110"
            >
              Sign In
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}
