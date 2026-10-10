'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { firebaseAuth, googleAuthProvider, signInWithPopup, initFirebaseAnalytics } from '@/lib/firebase';

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
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const isLoading = status === 'loading';

  useEffect(() => {
    initFirebaseAnalytics().catch(() => {});
    // Check localStorage for persisted Firebase user session if next-auth is not active
    const saved = localStorage.getItem('fiestaflix_firebase_user');
    if (saved) {
      try {
        setFirebaseUser(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const sessionUser: User | null = session?.user
    ? {
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        role: (session.user.role as 'ADMIN' | 'FAN') || 'FAN',
        avatar: session.user.image || undefined,
      }
    : null;

  const user = sessionUser || firebaseUser;

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

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
      const fbUser = result.user;

      if (!fbUser || !fbUser.email) return false;

      const idToken = await fbUser.getIdToken();

      // Mint a real NextAuth session from the verified ID token so server-side
      // guards (middleware, requireAdmin) recognise this user.
      const session = await signIn('firebase', { idToken, redirect: false });
      if (session?.error) {
        console.error('[Auth] Google session could not be established:', session.error);
        return false;
      }

      // Persist/refresh the row. The server verifies the token itself and
      // decides the role — we never infer it from the email address.
      const syncRes = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = syncRes.ok ? await syncRes.json() : {};
      const synchronizedUser: User = data.user || {
        id: fbUser.uid,
        name: fbUser.displayName || 'Google Fan',
        email: fbUser.email,
        role: 'FAN',
        avatar: fbUser.photoURL || undefined,
      };

      setFirebaseUser(synchronizedUser);
      localStorage.setItem('fiestaflix_firebase_user', JSON.stringify(synchronizedUser));
      return true;
    } catch (err: any) {
      console.error('[Firebase Auth] Google login error:', err);
      return false;
    }
  };

  const logout = () => {
    setFirebaseUser(null);
    localStorage.removeItem('fiestaflix_firebase_user');
    signOut({ redirect: false });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, loginWithGoogle, logout }}>
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
