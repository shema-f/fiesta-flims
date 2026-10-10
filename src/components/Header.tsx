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
  Shield,
  LogOut,
  Heart,
  ExternalLink,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import NotificationToast from '@/components/NotificationToast';
import AppLogo from '@/components/AppLogo';
import SupportModal from '@/components/SupportModal';

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
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const favCount = favorites.length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
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
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const json = await res.json();
          setSearchResults({
            movies: (json.data?.movies || []).slice(0, 5),
            interpreters: (json.data?.interpreters || []).slice(0, 3),
          });
        }
      } catch {
        // Search network fallback
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchResults(null);
    }
  };

  // Minimal primary navigation links
  const primaryLinks = [
    { href: '/', label: 'Home' },
    { href: '/movies', label: 'Movies' },
    { href: '/movies?type=series', label: 'Series' },
    { href: '/interpreters', label: 'Interpreters' },
    { href: '/favorites', label: 'My List', badge: favCount },
  ];

  // Secondary items in clean "More" dropdown
  const secondaryLinks = [
    { href: '/rwandan-movies', label: 'Rwanda Cinema' },
    { href: '/news', label: 'FiestaFlix News' },
    { href: '/support', label: 'Support FiestaFlix (Free)' },
    { href: '/request-movie', label: 'Request a Movie' },
    { href: '/help', label: 'Help & 4K Guide' },
    { href: '/community', label: 'Community' },
    { href: 'https://t.me/fiestaflix_movies', label: 'Telegram Channel', external: true },
    { href: 'https://wa.me/250780000000', label: 'WhatsApp Support', external: true },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-zinc-950/90 backdrop-blur-md border-b border-white/[0.06] shadow-lg'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent border-b border-transparent'
      }`}
    >
      <NotificationToast />

      <div className="container mx-auto px-4 sm:px-6">
        <nav className="h-16 flex items-center justify-between gap-4">
          {/* LEFT: BRAND LOGO & MINIMAL NAV */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-transform hover:opacity-90"
            >
              <AppLogo size={28} glow className="transition-transform group-hover:scale-105" />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Fiesta<span className="text-primary">Flix</span>
              </span>
            </Link>

            {/* MINIMAL DESKTOP NAV LINKS */}
            <ul className="hidden md:flex items-center gap-1">
              {primaryLinks.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}

              {/* MINIMAL "MORE" DROPDOWN */}
              <li className="relative" ref={moreRef}>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors flex items-center gap-1 ${
                    isMoreOpen
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  aria-expanded={isMoreOpen}
                >
                  <span>More</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isMoreOpen ? 'rotate-180 text-white' : 'text-zinc-400'
                    }`}
                  />
                </button>

                {isMoreOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-fadeIn">
                    <div className="space-y-0.5">
                      {secondaryLinks.map((sub) => {
                        const isSubActive = pathname === sub.href;

                        if (sub.external) {
                          return (
                            <a
                              key={sub.label}
                              href={sub.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsMoreOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                            >
                              <span>{sub.label}</span>
                              <ExternalLink className="w-3 h-3 text-zinc-500" />
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            onClick={() => setIsMoreOpen(false)}
                            className={`flex items-center px-3 py-2 rounded-xl text-xs transition-colors ${
                              isSubActive
                                ? 'bg-primary/15 text-primary font-bold'
                                : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                            }`}
                          >
                            <span>{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>

              {/* ADMIN STUDIO LINK */}
              {user?.role === 'ADMIN' && (
                <li>
                  <Link
                    href="/admin"
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 ${
                      pathname === '/admin'
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-zinc-400 hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span>Admin</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* RIGHT: MINIMAL ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* MINIMAL SEARCH */}
            <div className="relative flex items-center" ref={searchContainerRef}>
              {searchOpen ? (
                <div className="relative">
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center bg-zinc-900 border border-zinc-700 rounded-full pl-3 pr-1.5 py-1 shadow-lg transition-all"
                  >
                    <Search className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search title, voice, genre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-white text-xs w-44 sm:w-56 placeholder:text-zinc-500"
                    />
                    {isSearching && (
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-primary border-t-transparent animate-spin mr-1" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults(null);
                      }}
                      className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors ml-1"
                      aria-label="Close search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* INSTANT LIVE SEARCH DROPDOWN */}
                  {searchResults && (searchResults.movies.length > 0 || searchResults.interpreters.length > 0) && (
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl p-3 z-50 backdrop-blur-xl">
                      {searchResults.movies.length > 0 && (
                        <div className="mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 mb-1">
                            Movies & Series
                          </p>
                          <div className="space-y-1">
                            {searchResults.movies.map((m) => (
                              <Link
                                key={m.id}
                                href={`/movies/${m.id}`}
                                onClick={() => {
                                  setSearchOpen(false);
                                  setSearchResults(null);
                                }}
                                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
                              >
                                {m.poster && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={m.poster}
                                    alt={m.title}
                                    className="w-8 h-10 object-cover rounded-md bg-zinc-900 shrink-0"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                                  <p className="text-[10px] text-zinc-400 truncate">
                                    {m.releaseYear} • {m.narrator || 'Rocky Kimomo'}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.interpreters.length > 0 && (
                        <div className="pt-2 border-t border-zinc-900">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 mb-1">
                            Interpreters
                          </p>
                          <div className="space-y-1">
                            {searchResults.interpreters.map((i) => (
                              <Link
                                key={i.id}
                                href={`/interpreters/${i.slug}`}
                                onClick={() => {
                                  setSearchOpen(false);
                                  setSearchResults(null);
                                }}
                                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={i.image}
                                  alt={i.name}
                                  className="w-7 h-7 object-cover rounded-full bg-zinc-900 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-white truncate">{i.name}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchResults(null);
                        }}
                        className="block text-center text-xs font-bold text-primary hover:underline pt-2 mt-1 border-t border-zinc-900"
                      >
                        View all results →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/[0.06] transition-colors"
                  aria-label="Open search"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* MINIMAL NOTIFICATION BELL */}
            <NotificationBell />

            {/* OPTIONAL SUPPORT MODAL TRIGGER */}
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="p-2 text-zinc-400 hover:text-rose-400 rounded-full hover:bg-white/[0.06] transition-colors hidden sm:flex items-center justify-center"
              title="Support FiestaFlix (Optional)"
            >
              <Heart className="w-4 h-4" />
            </button>

            {/* USER PROFILE OR LOGIN */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-white/[0.06] transition-colors"
                >
                  <span className="text-xs font-medium text-zinc-300 hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-1.5 z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-zinc-800 text-xs">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                    </div>

                    <div className="space-y-0.5 pt-1 text-xs">
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-primary font-semibold hover:bg-primary/10 transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Admin Studio</span>
                        </Link>
                      )}
                      <Link
                        href="/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <span>My List</span>
                        {favCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                            {favCount}
                          </span>
                        )}
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
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
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors shadow-xs"
              >
                Sign In
              </Link>
            )}

            {/* MOBILE HAMBURGER BUTTON */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* MINIMAL MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-950/98 border-b border-zinc-800 px-5 py-4 backdrop-blur-2xl animate-fadeIn space-y-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-3.5 py-2 text-xs"
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

          <div className="space-y-0.5 text-xs font-medium">
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
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white font-bold'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-primary font-bold hover:bg-primary/10 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Studio</span>
              </Link>
            )}
          </div>

          <div className="space-y-0.5 pt-2 border-t border-zinc-800/80 text-xs text-zinc-400">
            {secondaryLinks.map((sub) => (
              <a
                key={sub.label}
                href={sub.href}
                target={sub.external ? '_blank' : '_self'}
                rel={sub.external ? 'noopener noreferrer' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <span>{sub.label}</span>
                {sub.external && <ExternalLink className="w-3 h-3 text-zinc-600" />}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* GLOBAL SUPPORT MODAL */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </header>
  );
}
