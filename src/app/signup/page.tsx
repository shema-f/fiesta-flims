'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name!');
      return;
    }

    setSuccess(true);
    
    setTimeout(async () => {
      await signup(name, email, password);
      router.push('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-24 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-muted">Join Fiesta Flix and start watching amazing movies!</p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-white/10">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#22c55e" stroke="none">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Welcome Aboard!</h2>
                  <p className="text-muted">Your account has been created successfully!</p>
                  <p className="text-muted mt-2">Redirecting you to homepage...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

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
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                    <p className="text-xs text-muted mt-1">At least 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              )}

              {!success && (
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-4 text-muted text-sm">or continue with</span>
                  </div>
                </div>
              )}

              {!success && (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setName('Movie Fan');
                      setEmail('fan@fiestaflix.com');
                      setPassword('password123');
                      setConfirmPassword('password123');
                    }}
                    className="w-full py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Quick Demo Signup
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign In
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
