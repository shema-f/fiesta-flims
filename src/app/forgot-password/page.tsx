'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-24 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
              <p className="text-muted">
                {isSubmitted 
                  ? "Check your email for a password reset link!"
                  : "No worries! We'll send you a reset link."
                }
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-white/10">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#22c55e">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Email Sent!</h2>
                  <p className="text-muted mb-6">
                    We've sent a password reset link to <span className="text-white font-semibold">{email}</span>
                  </p>
                  <p className="text-sm text-muted mb-8">
                    Please check your inbox and spam folder. The link expires in 1 hour.
                  </p>
                  <div className="space-y-3">
                    <Link
                      href="/login" className="block w-full py-3 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-center">
                      Back to Login
                    </Link>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail('');
                      }}
                      className="block w-full py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
                    >
                      Resend Email
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                    <p className="text-xs text-muted mt-2">
                      Enter the email address you used to sign up.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted">
              Remember your password?{' '}
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
