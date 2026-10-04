'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import {
  Search,
  ChevronDown,
  X,
  Menu,
  Sparkles,
  Send,
  MessageCircle,
  Trophy,
  Users,
  Film,
  Heart,
  Shield,
  LogOut,
  Clapperboard,
  HelpCircle,
  Play,
  ArrowRight,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import NotificationToast from '@/components/NotificationToast';
import AppLogo from '@/components/AppLogo';

interface SearchResultPreview {
  movies: Array<{ id: string; title: string; releaseYear: number; narrator?: string; poster?: string }>;
  interpreters: Array<{ id: number; slug: string; name: string; image: string; followers: number }>;
}

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultPreview | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const favCount = favorites.length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchResults(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when search bar opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Live Instant Search with debounce
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data) {
            setSearchResults({
              movies: (json.data.movies || []).slice(0, 4),
              interpreters: (json.data.interpreters || []).slice(0, 3),
            });
          }
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchResults(null);
      setSearchOpen(false);
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Primary core links — includes Home and shows active page indicator
  const primaryLinks = [
    { href: '/', label: 'Home' },
    { href: '/movies', label: 'Movies' },
    { href: '/rwandan-movies', label: 'Rwanda Cinema' },
    { href: '/interpreters', label: 'Interpreters' },
    { href: '/favorites', label: 'My List', badge: favCount },
  ];

  // Secondary items in the "More" dropdown
  const secondaryLinks = [
    { href: '/help', label: 'Help, FAQ & 4K Guide', icon: HelpCircle, desc: 'How to stream in 4K, download, & tips' },
    { href: '/awards', label: 'Awards & Honors', icon: Trophy, desc: 'Top voted voice actors & films' },
    { href: '/community', label: 'Community', icon: Users, desc: 'Discussions & movie requests' },
    { href: '/plus', label: 'Fiesta Plus', icon: Sparkles, desc: 'Ad-free 4K streaming & fast downloads' },
    {
      href: 'https://t.me/fiestaflix_movies',
      label: 'Telegram Channel',
      icon: Send,
      desc: 'Instant updates & cloud files',
      external: true,
    },
    {
      href: 'https://wa.me/250780000000',
      label: 'WhatsApp Support',
      icon: MessageCircle,
      desc: 'Talk with our concierge team',
      external: true,
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-zinc-950/85 backdrop-blur-xl border-b border-white/[0.08] shadow-xl'
          : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent border-b border-transparent'
      }`}
    >
      <NotificationToast />

      <div className="container mx-auto px-4 sm:px-6">
        <nav className="h-16 flex items-center justify-between gap-4">
          {/* LEFT: BRAND LOGO */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 group transition-transform hover:opacity-95"
            >
              <AppLogo size={30} glow className="transition-transform group-hover:scale-105" />
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Fiesta<span className="text-primary">Flix</span>
              </span>
            </Link>

            {/* DESKTOP CORE NAV LINKS WITH PROMINENT ACTIVE PAGE INDICATOR */}
            <ul className="hidden md:flex items-center gap-1 lg:gap-1.5">
              {primaryLinks.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`px-3 py-1.5 rounded-full text-xs tracking-wide transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-primary/20 text-white font-extrabold border border-primary/40 shadow-[0_0_14px_rgba(249,115,22,0.35)] ring-1 ring-primary/20'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.05] font-medium'
                      }`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="w-4 h-4 rounded-full bg-primary/20 text-primary border border-primary/40 text-[9px] font-bold flex items-center justify-center leading-none">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}

              {/* CLEAN "MORE" DROPDOWN */}
              <li className="relative" ref={moreRef}>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1 ${
                    isMoreOpen
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                  aria-expanded={isMoreOpen}
                >
                  <span>More</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isMoreOpen ? 'rotate-180 text-white' : 'text-zinc-500'
                    }`}
                  />
                </button>

                {isMoreOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-zinc-950/95 border border-zinc-800/90 shadow-2xl p-2 z-50 backdrop-blur-2xl animate-scaleUp">
                    <div className="space-y-1">
                      {secondaryLinks.map((sub) => {
                        const Icon = sub.icon;
                        const isSubActive = pathname === sub.href;

                        const content = (
                          <div className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors group cursor-pointer ${isSubActive ? 'bg-primary/10 border border-primary/30' : 'hover:bg-white/[0.06]'}`}>
                            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                {sub.label}
                              </p>
                              <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">
                                {sub.desc}
                              </p>
                            </div>
                          </div>
                        );

                        if (sub.external) {
                          return (
                            <a
                              key={sub.label}
                              href={sub.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsMoreOpen(false)}
                            >
                              {content}
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            onClick={() => setIsMoreOpen(false)}
                          >
                            {content}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>

              {user?.role === 'ADMIN' && (
                <li>
                  <Link
                    href="/admin"
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1 ${
                      pathname === '/admin'
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-zinc-400 hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    <span>Admin</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* RIGHT: MINIMAL ACTIONS & ENHANCED SEARCH */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* SLEEK SEARCH WITH INSTANT LIVE RESULTS */}
            <div className="relative flex items-center" ref={searchContainerRef}>
              {searchOpen ? (
                <div className="relative">
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center bg-zinc-900/95 border border-primary/40 rounded-full pl-3.5 pr-2 py-1.5 shadow-xl transition-all animate-fadeIn"
                  >
                    <Search className="w-3.5 h-3.5 text-primary shrink-0 mr-2" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search movie, narrator, genre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-white text-xs w-48 sm:w-64 placeholder:text-zinc-500"
                    />
                    {isSearching && (
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-primary border-t-transparent animate-spin mr-1.5" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults(null);
                      }}
                      className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-1"
                      aria-label="Close search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* INSTANT LIVE SEARCH PREVIEW DROPDOWN */}
                  {searchResults && (searchResults.movies.length > 0 || searchResults.interpreters.length > 0) && (
                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl p-2.5 z-50 backdrop-blur-2xl animate-scaleUp">
                      {/* Matching Interpreters */}
                      {searchResults.interpreters.length > 0 && (
                        <div className="mb-2 pb-2 border-b border-zinc-800/80">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1.5">
                            Interpreters
                          </p>
                          <div className="space-y-1">
                            {searchResults.interpreters.map((int) => (
                              <Link
                                key={int.id}
                                href={`/interpreters/${int.slug}`}
                                onClick={() => {
                                  setSearchResults(null);
                                  setSearchOpen(false);
                                }}
                                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.08] transition-colors"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={int.image}
                                  alt={int.name}
                                  className="w-7 h-7 rounded-full object-cover border border-zinc-700"
                                />
                                <div className="truncate">
                                  <p className="text-xs font-bold text-white truncate">{int.name}</p>
                                  <p className="text-[10px] text-primary">{int.followers.toLocaleString()} followers</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Movies */}
                      {searchResults.movies.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1">
                            Movies & Series
                          </p>
                          {searchResults.movies.map((m) => (
                            <Link
                              key={m.id}
                              href={`/movies/${m.id}`}
                              onClick={() => {
                                setSearchResults(null);
                                setSearchOpen(false);
                              }}
                              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/[0.08] transition-colors group"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Play className="w-3 h-3 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                                  {m.title}
                                </span>
                              </div>
                              {m.narrator && (
                                <span className="text-[10px] text-zinc-400 shrink-0 ml-2 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                                  {m.narrator}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* View All CTA */}
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => {
                          setSearchResults(null);
                          setSearchOpen(false);
                        }}
                        className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between px-2 text-xs font-bold text-primary hover:text-orange-400 transition-colors"
                      >
                        <span>See all results for &quot;{searchQuery}&quot;</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  aria-label="Search"
                  title="Search movies and narrators"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* NOTIFICATION BELL */}
            <NotificationBell />

            {/* USER PROFILE OR AUTH */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-white/[0.08] transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-1 ring-white/10">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-950/95 border border-zinc-800/90 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-2xl animate-scaleUp">
                    <div className="p-2.5 border-b border-zinc-800/80">
                      <p className="font-semibold text-white text-xs truncate">{user.name}</p>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">{user.email}</p>
                      {user.role === 'ADMIN' && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-primary/15 text-primary text-[10px] font-bold rounded-full border border-primary/20">
                          <Shield className="w-2.5 h-2.5" /> Admin
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5 pt-1">
                      <Link
                        href="/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        <span>My List</span>
                      </Link>

                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5 text-primary" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors mt-0.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-all shadow-sm"
              >
                Sign In
              </Link>
            )}

            {/* MOBILE HAMBURGER BUTTON */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/[0.08] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* MOBILE SHEET / DRAWER WITH ACTIVE PAGE HIGHLIGHT */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-950/95 border-b border-zinc-800/80 px-5 py-4 backdrop-blur-2xl animate-fadeIn space-y-4">
          {/* Mobile search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
          >
            <Search className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search movies, narrators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-zinc-500"
            />
          </form>

          {/* Core destinations */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-2 pb-1">
              Explore
            </p>
            {primaryLinks.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-primary/20 text-white font-bold border border-primary/30'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Secondary links */}
          <div className="space-y-1 pt-2 border-t border-zinc-800/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-2 pb-1">
              Community & Support
            </p>
            {secondaryLinks.map((sub) => {
              const Icon = sub.icon;
              return (
                <a
                  key={sub.label}
                  href={sub.href}
                  target={sub.external ? '_blank' : '_self'}
                  rel={sub.external ? 'noopener noreferrer' : ''}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{sub.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
