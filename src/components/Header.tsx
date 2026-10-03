'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Search, Send, Menu, X, User as UserIcon, LogOut, Shield } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const favCount = favorites.length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
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
    { href: '/movies', label: 'Movies' },
    { href: '/favorites', label: 'Favorites', badge: favCount },
    { href: '/rwandan-movies', label: '🇷🇼 Rwandan' },
    { href: '/#series', label: 'Series' },
    { href: '/interpreters', label: 'Interpreters' },
    { href: '/community', label: 'Community' },
    { href: '/request-movie', label: 'Request' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent border-b border-white/5'
      }`}
    >
      <nav className="py-3.5">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent tracking-tight">
              Fiesta<span className="text-white">Flix</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
              HD
            </span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-zinc-300 hover:text-white text-sm font-semibold transition-colors relative group py-1 flex items-center gap-1.5"
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-orange-400 transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex items-center bg-zinc-900/80 rounded-full px-3.5 py-1.5 border border-zinc-700/80 focus-within:border-primary transition-all"
            >
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-xs w-36 lg:w-44 placeholder:text-zinc-500"
              />
              <button type="submit" className="text-zinc-400 hover:text-primary transition-colors" aria-label="Search">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Telegram Channel Button */}
            <a
              href="https://t.me/fiestaflix_movies"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 text-xs font-bold transition-all"
            >
              <Send className="w-3.5 h-3.5 -rotate-12" />
              <span>Telegram</span>
            </a>

            {/* User Menu or Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-scaleUp">
                    <div className="p-3 border-b border-zinc-800">
                      <p className="font-bold text-white text-sm truncate">{user.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                      {user.role === 'ADMIN' && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </div>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
                      >
                        <Shield className="w-4 h-4 text-primary" /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/30 transition-all"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-300 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-6 py-4 space-y-3 animate-fadeIn">
            <form onSubmit={handleSearch} className="flex items-center bg-zinc-900 rounded-xl px-3 py-2 border border-zinc-700">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-zinc-500"
              />
              <button type="submit" aria-label="Search">
                <Search className="w-4 h-4 text-zinc-400" />
              </button>
            </form>

            <ul className="space-y-2 pt-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-sm font-semibold text-zinc-300 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://t.me/fiestaflix_movies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-sm font-semibold text-[#229ED9]"
                >
                  <Send className="w-4 h-4" />
                  <span>Join Telegram Channel</span>
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
