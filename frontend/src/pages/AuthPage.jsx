import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, Shield, Briefcase, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false); // Default to Create Account for new users
  const [role, setRole] = useState('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoHelpers, setShowDemoHelpers] = useState(false);

  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const u = await login(email, password);
        redirectUser(u.role);
      } else {
        const u = await register({ name, email, password, role });
        redirectUser(u.role);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (targetRole) => {
    setError('');
    setLoading(true);
    try {
      const u = await demoLogin(targetRole);
      redirectUser(u.role);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (userRole) => {
    if (userRole === 'creator') navigate('/dashboard/creator');
    else if (userRole === 'admin') navigate('/admin');
    else navigate('/dashboard/client');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-violet-400 items-center justify-center shadow-glow-sm mx-auto mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isLogin ? 'Sign In to Your Account' : 'Create Your Real Account'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {isLogin ? 'Enter your registered email and password' : 'Register as a Content Creator or Client to get started'}
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-purple-900/40">
          
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-navy-900 p-1 mb-6 border border-purple-900/40">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isLogin ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isLogin ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selector (Sign Up only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Select Your Platform Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      role === 'client'
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-navy-900/60 border-purple-900/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" /> Client / Brand
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('creator')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      role === 'creator'
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-navy-900/60 border-purple-900/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Content Creator
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-navy-900/90 border border-purple-900/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-navy-900/90 border border-purple-900/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-navy-900/90 border border-purple-900/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl purple-glow-btn text-white font-bold text-xs shadow-glow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  {isLogin ? 'Sign In to Workspace' : 'Create My Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Optional Fast-Fill Helper for Quick Evaluation */}
        <div className="pt-2 text-center">
          {!showDemoHelpers ? (
            <button
              type="button"
              onClick={() => setShowDemoHelpers(true)}
              className="text-[11px] text-slate-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1.5"
            >
              <Zap className="w-3 h-3 text-amber-400" /> Need quick test credentials? Click to reveal pre-seeded roles
            </button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-navy-900/60 border border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-semibold text-purple-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Pre-Seeded Evaluation Roles:
                </span>
                <button
                  type="button"
                  onClick={() => setShowDemoHelpers(false)}
                  className="text-slate-400 hover:text-white text-[10px]"
                >
                  ✕ Hide
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('client')}
                  className="py-1.5 px-2 rounded-lg bg-navy-950 hover:bg-purple-900/40 border border-purple-500/20 text-[11px] font-medium text-slate-300 hover:text-white"
                >
                  Client (Sarah)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('creator')}
                  className="py-1.5 px-2 rounded-lg bg-navy-950 hover:bg-purple-900/40 border border-purple-500/20 text-[11px] font-medium text-slate-300 hover:text-white"
                >
                  Creator (Elena)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('admin')}
                  className="py-1.5 px-2 rounded-lg bg-navy-950 hover:bg-purple-900/40 border border-purple-500/20 text-[11px] font-medium text-slate-300 hover:text-white"
                >
                  Admin (Alex)
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
