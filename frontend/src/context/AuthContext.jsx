import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexus_token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from live backend
  const fetchNotifications = async (authToken) => {
    const activeToken = authToken || token || localStorage.getItem('nexus_token');
    if (!activeToken) {
      setNotifications([]);
      return;
    }
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn('Error fetching live notifications:', err);
    }
  };

  // Reliable background polling for live notifications (every 4 seconds)
  useEffect(() => {
    if (!token) return;
    fetchNotifications(token);
    const interval = setInterval(() => {
      fetchNotifications(token);
    }, 4000);
    return () => clearInterval(interval);
  }, [token]);

  // Fetch current user if valid token exists in storage
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
            fetchNotifications(storedToken);
          } else {
            // Invalid/expired token: clear storage
            localStorage.removeItem('nexus_token');
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          console.warn('Token validation failed:', err);
          localStorage.removeItem('nexus_token');
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
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

  const forgotPassword = async (email) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to request password reset');
    return data;
  };

  const resetPassword = async (email, code, newPassword) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to reset password');
    return data;
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

  const markNotificationRead = async (id) => {
    setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n));
    if (token) {
      try {
        await fetch(`/api/notifications/${id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.warn('Failed to mark notification read on backend:', e);
      }
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (token) {
      try {
        await fetch('/api/notifications/read-all', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.warn('Failed to mark all notifications read on backend:', e);
      }
    }
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
        forgotPassword,
        resetPassword,
        logout,
        toggleFavorite,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
