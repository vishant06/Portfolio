import { createContext, useContext, useMemo, useState } from 'react';
import request from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('portfolio_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('portfolio_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password, loginAs = 'user') => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, loginAs })
    });
    localStorage.setItem('portfolio_token', data.token);
    localStorage.setItem('portfolio_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (form) => {
    const data = await request('/auth/signup', { method: 'POST', body: JSON.stringify(form) });
    localStorage.setItem('portfolio_token', data.token);
    localStorage.setItem('portfolio_user', JSON.stringify(data.user));
    setToken(data.token); setUser(data.user);
  };

  const completeOAuth = (oauthToken, oauthUser) => {
    localStorage.setItem('portfolio_token', oauthToken);
    localStorage.setItem('portfolio_user', JSON.stringify(oauthUser));
    setToken(oauthToken);
    setUser(oauthUser);
  };

  const logout = () => {
    localStorage.removeItem('portfolio_token');
    localStorage.removeItem('portfolio_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, isAuthenticated: Boolean(token), login, signup, completeOAuth, logout }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
