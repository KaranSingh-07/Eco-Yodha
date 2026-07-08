import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar: string;
  level: number;
  xp?: number;
  school?: string;
  grade?: string;
  section?: string;
  classroomCode?: string;
  classrooms?: string[];
  currentStreak?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.error('Session verification failed, logging out:', err);
      sessionStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    sessionStorage.setItem('token', res.token);
    const profile = await api.get('/auth/me');
    setUser(profile);
    return profile;
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    if (res.requiresVerification) {
      return res;
    }
    sessionStorage.setItem('token', res.token);
    const profile = await api.get('/auth/me');
    setUser(profile);
    return profile;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
