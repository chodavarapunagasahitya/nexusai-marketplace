import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexus_token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'New Collaboration Request',
      message: 'TechFlow sent a proposal for "AI Explainer Video Series"',
      time: '15m ago',
      read: false,
      type: 'project'
    },
    {
      id: 'notif_2',
      title: 'Originality Check Complete',
      message: 'Your recent draft passed authenticity verification with 94% score.',
      time: '2h ago',
      read: false,
      type: 'ai'
    },
    {
      id: 'notif_3',
      title: 'Milestone Approved',
      message: 'Article 1: Agentic Orchestration Patterns approved by client.',
      time: '1d ago',
      read: true,
      type: 'payment'
    }
  ]);

  // Fetch current user if token exists, or auto-login demo user for immediate instant access
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('nexus_token');
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Token validation failed, logging in as default demo client');
        }
      }

      // Auto-login as demo client so app is immediately interactive!
      try {
        const res = await fetch('/api/auth/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'client' })
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setToken(data.token);
          localStorage.setItem('nexus_token', data.token);
        }
      } catch (e) {
        console.error('Failed to init demo user', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed');

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('nexus_token', data.token);
    return data.user;
  };

  const register = async (userData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Registration failed');

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('nexus_token', data.token);
    return data.user;
  };

  const demoLogin = async (role) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Demo login failed');

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('nexus_token', data.token);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexus_token');
  };

  const toggleFavorite = async (creatorId) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/creators/favorite/${creatorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUser(prev => ({
          ...prev,
          favorites: data.favorites
        }));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        toggleFavorite,
        notifications,
        markAllNotificationsRead,
        unreadCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
