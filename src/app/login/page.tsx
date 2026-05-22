'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password);
    if (success) {
      router.push('/');
    } else {
      setError('Invalid credentials. Try demo login below!');
    }
  };

  const handleDemoLogin = (role: 'ADMIN' | 'FAN') => {
    loginDemo(role);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-24 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
              <p className="text-muted">Sign in to continue to Fiesta Flix</p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-white/10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Password</label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-4 text-muted text-sm">or continue with</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDemoLogin('ADMIN')}
                  className="w-full py-3 bg-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Demo Admin Login
                </button>

                <button
                  onClick={() => handleDemoLogin('FAN')}
                  className="w-full py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Demo Fan Login
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-muted text-sm">
                  Demo credentials:{' '}
                  <span className="text-white">admin@fiestaflix.com / admin123</span>
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
