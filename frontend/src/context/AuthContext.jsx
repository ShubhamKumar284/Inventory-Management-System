import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setUser(parsed);
      } catch (err) {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { 
      email: email ? email.trim().toLowerCase() : '', 
      password 
    });
    const userData = res.data.data;
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { 
      name: name ? name.trim() : '', 
      email: email ? email.trim().toLowerCase() : '', 
      password 
    });
    const userData = res.data.data;
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  const googleLogin = async (credential) => {
    const res = await api.post('/auth/google', { credential });
    const userData = res.data.data;
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { 
      email: email ? email.trim().toLowerCase() : '' 
    });
    return res.data;
  };

  const resetPassword = async (email, resetCode, newPassword) => {
    const res = await api.post('/auth/reset-password', {
      email: email ? email.trim().toLowerCase() : '',
      resetCode: resetCode ? resetCode.trim() : '',
      newPassword
    });
    return res.data;
  };

  const updateUserProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    const updatedData = res.data.data;
    const merged = { ...user, ...updatedData };
    localStorage.setItem('userInfo', JSON.stringify(merged));
    setUser(merged);
    return res.data;
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      const freshData = res.data.data;
      if (freshData) {
        const merged = { ...user, ...freshData };
        localStorage.setItem('userInfo', JSON.stringify(merged));
        setUser(merged);
      }
    } catch (err) {
      console.warn('Could not fetch fresh user profile', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      googleLogin, 
      forgotPassword, 
      resetPassword, 
      updateUserProfile,
      fetchCurrentUser,
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
