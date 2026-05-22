'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'FAN';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginDemo: (role: 'ADMIN' | 'FAN') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  const user: User | null = session?.user
    ? {
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        role: (session.user.role as 'ADMIN' | 'FAN') || 'FAN',
        avatar: session.user.image || undefined,
      }
    : null;

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    return !result?.error;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) return false;

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      return !result?.error;
    } catch {
      return false;
    }
  };

  const loginDemo = (role: 'ADMIN' | 'FAN') => {
    if (role === 'ADMIN') {
      signIn('credentials', {
        email: 'admin@fiestaflix.com',
        password: 'admin123',
        redirect: false,
      });
    } else {
      signIn('credentials', {
        email: 'fan@fiestaflix.com',
        password: 'fan123',
        redirect: false,
      });
    }
  };

  const logout = () => {
    signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
