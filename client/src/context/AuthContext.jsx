import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('staffsync_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('staffsync_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on boot
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('staffsync_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('staffsync_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('staffsync_token', receivedToken);
      localStorage.setItem('staffsync_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('staffsync_token');
    localStorage.removeItem('staffsync_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('staffsync_user', JSON.stringify(updated));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isHr: user?.role === 'hr',
    isManager: user?.role === 'manager',
    isEmployee: user?.role === 'employee',
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
