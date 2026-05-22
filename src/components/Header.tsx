'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.pageYOffset > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/#movies', label: 'Movies' },
    { href: '/rwandan-movies', label: '🇷🇼 Rwandan' },
    { href: '/#series', label: 'TV Shows' },
    { href: '/interpreters', label: 'Interpreters' },
    { href: '/community', label: 'Community' },
    { href: '/request-movie', label: '📋 Request' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl transition-all duration-300 ${
        scrolled ? 'shadow-2xl' : ''
      }`}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
    >
      <nav className="py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            Fiesta<span className="text-white">Flix</span>
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className="text-muted hover:text-white font-medium relative group"
                >
                  {item.label}
                  <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-orange-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-card rounded-full px-4 py-2 border border-white/10 focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/20 transition-all">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-sm w-48"
              />
              <button type="submit" className="text-muted hover:text-primary transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </form>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={user.avatar || 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=default%20user%20avatar%20portrait&image_size=square'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                  />
                  <span className="hidden md:block font-medium">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-card rounded-xl shadow-2xl border border-white/10 min-w-[200px] overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted">{user.email}</p>
                      {user.role === 'ADMIN' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-muted hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-5 py-2 text-white font-semibold rounded-full hover:text-primary transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/40 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isMobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-background/98 border-t border-white/10">
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              <form onSubmit={handleSearch} className="flex items-center bg-card rounded-lg px-4 py-3 border border-white/10 mb-2">
                <input
                  type="text"
                  placeholder="Search movies, interpreters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white flex-1"
                />
                <button type="submit" className="text-muted hover:text-primary transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </button>
              </form>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted hover:text-white font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
