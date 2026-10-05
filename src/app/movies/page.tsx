'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogMovieCard from '@/components/CatalogMovieCard';
import type { ApiMovie } from '@/lib/apiTypes';
import {
  Search,
  SlidersHorizontal,
  Star,
  Flame,
  Clock,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Volume2,
  Calendar,
  X,
  Tv,
  Film,
} from 'lucide-react';

type LoadStatus = 'loading' | 'ready' | 'error';
type SortOption = 'rating' | 'popularity' | 'latest' | 'year' | 'title';
type SortDirection = 'desc' | 'asc';

const PAGE_SIZE = 24;

const RATING_FILTER_OPTIONS = [
  { label: 'All Ratings', value: 0 },
  { label: '⭐ 8.5+ Masterpieces', value: 8.5 },
  { label: '⭐ 8.0+ Highly Rated', value: 8.0 },
  { label: '⭐ 7.0+ Recommended', value: 7.0 },
];

const POPULAR_NARRATORS = [
  'All',
  'Rocky Kimomo',
  'Junior Giti',
  'Sankara',
  'Yanga',
  'Gasongo',
  'Prince',
];

export default function MoviesPage() {
  const [movies, setMovies] = useState<ApiMovie[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [contentType, setContentType] = useState<'all' | 'movie' | 'series'>('all');
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeNarrator, setActiveNarrator] = useState('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState('All');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const t = sp.get('type')?.toLowerCase();
      if (t === 'series') setContentType('series');
      else if (t === 'movie') setContentType('movie');
    }
  }, []);

  // Fetch movies from API with full server-side sort and filter params
  const loadMovies = useCallback(
    async (page = 1, currentSort = sortBy, currentOrder = sortDirection) => {
      const isFirstPage = page === 1;
      if (isFirstPage) setStatus('loading');
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          sortBy: currentSort,
          order: currentOrder,
        });

        if (contentType !== 'all') params.set('type', contentType);
        if (activeGenre !== 'All') params.set('genre', activeGenre);
        if (activeNarrator !== 'All') params.set('narrator', activeNarrator);
        if (minRating > 0) params.set('minRating', String(minRating));
        if (selectedYear !== 'All') params.set('year', selectedYear);
        if (query.trim()) params.set('q', query.trim());

        const res = await fetch(`/api/movies?${params.toString()}`, {
          cache: 'no-store',
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to fetch movies');
        }
        const batch: ApiMovie[] = json.data ?? [];
        setMovies((prev) => (isFirstPage ? batch : [...prev, ...batch]));

        const countHeader = res.headers.get('X-Total-Count');
        if (countHeader !== null) {
          setTotal(parseInt(countHeader, 10) || 0);
        } else {
          setTotal((prev) => (isFirstPage ? batch.length : prev + batch.length));
        }
        setStatus('ready');
      } catch {
        if (isFirstPage) setStatus('error');
      } finally {
        setLoadingMore(false);
      }
    },
    [contentType, activeGenre, activeNarrator, minRating, selectedYear, query, sortBy, sortDirection]
  );

  // Re-fetch whenever filters or sort criteria change
  useEffect(() => {
    loadMovies(1, sortBy, sortDirection);
  }, [loadMovies, sortBy, sortDirection]);

  // Handle live search debounce or search submit
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMovies(1, sortBy, sortDirection);
    }, 350);
    return () => clearTimeout(timer);
  }, [query, loadMovies, sortBy, sortDirection]);

  // Dynamic genres based on current dataset + defaults
  const genres = useMemo(() => {
    const defaultGenres = [
      'All',
      'Action',
      'Sci-Fi',
      'Thriller',
      'Drama',
      'Rwandan',
      'Romance',
      'Adventure',
      'Comedy',
    ];
    const extracted = movies.map((m) => m.genre).filter(Boolean);
    return Array.from(new Set([...defaultGenres, ...extracted]));
  }, [movies]);

  // Dynamic available release years
  const availableYears = useMemo(() => {
    const years = movies
      .map((m) => m.releaseYear)
      .filter((y): y is number => typeof y === 'number' && y > 1900);
    const unique = Array.from(new Set([2025, 2024, 2023, 2022, ...years])).sort((a, b) => b - a);
    return ['All', ...unique.map(String)];
  }, [movies]);

  // Client-side refined sorting and filtering
  const displayedMovies = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = movies.filter((movie) => {
      const matchesGenre = activeGenre === 'All' || movie.genre?.toLowerCase() === activeGenre.toLowerCase();
      const matchesNarrator =
        activeNarrator === 'All' ||
        (movie.narrator && movie.narrator.toLowerCase().includes(activeNarrator.toLowerCase()));
      const matchesRating = minRating === 0 || (movie.rating && movie.rating >= minRating);
      const matchesYear = selectedYear === 'All' || String(movie.releaseYear) === selectedYear;
      const matchesQuery =
        term === '' ||
        movie.title.toLowerCase().includes(term) ||
        (movie.genre && movie.genre.toLowerCase().includes(term)) ||
        (movie.narrator && movie.narrator.toLowerCase().includes(term)) ||
        (movie.releaseYear?.toString() ?? '').includes(term);

      return matchesGenre && matchesNarrator && matchesRating && matchesYear && matchesQuery;
    });

    // Ensure client sorting aligns with current controls
    result.sort((a, b) => {
      if (sortBy === 'rating') {
        const rA = a.rating ?? 0;
        const rB = b.rating ?? 0;
        return sortDirection === 'asc' ? rA - rB : rB - rA;
      }
      if (sortBy === 'popularity') {
        const pA = a.views ?? a.viewCount ?? 0;
        const pB = b.views ?? b.viewCount ?? 0;
        return sortDirection === 'asc' ? pA - pB : pB - pA;
      }
      if (sortBy === 'year') {
        const yA = a.releaseYear ?? 0;
        const yB = b.releaseYear ?? 0;
        return sortDirection === 'asc' ? yA - yB : yB - yA;
      }
      if (sortBy === 'title') {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      // 'latest'
      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      return sortDirection === 'asc' ? tA - tB : tB - tA;
    });

    return result;
  }, [movies, activeGenre, activeNarrator, minRating, selectedYear, query, sortBy, sortDirection]);

  const hasActiveFilters =
    activeGenre !== 'All' ||
    activeNarrator !== 'All' ||
    minRating > 0 ||
    selectedYear !== 'All' ||
    query.trim() !== '' ||
    sortBy !== 'popularity' ||
    sortDirection !== 'desc';

  const resetAllFilters = () => {
    setActiveGenre('All');
    setActiveNarrator('All');
    setMinRating(0);
    setSelectedYear('All');
    setQuery('');
    setSortBy('popularity');
    setSortDirection('desc');
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'rating':
        return 'Rating';
      case 'popularity':
        return 'Popularity';
      case 'latest':
        return 'Newest';
      case 'year':
        return 'Release Year';
      case 'title':
        return 'Title (A-Z)';
      default:
        return 'Popularity';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header Title & Intro */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Complete Catalog</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                All Movies & Shows
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base mt-1">
                Stream Rwandan, African, and international cinema with authentic Kinyarwanda narration.
              </p>
            </div>

            {/* Quick status pill */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                Sorted by: <span className="text-primary font-bold">{getSortLabel(sortBy)}</span>{' '}
                ({sortDirection === 'desc' ? 'High to Low' : 'Low to High'})
              </span>
            </div>
          </div>

          {/* MAIN FILTER & SORT TOOLBAR */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 mb-8 backdrop-blur-xl shadow-xl space-y-4">
            {/* Content Type Filter: All vs Movies vs Series */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
              <div className="inline-flex p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setContentType('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    contentType === 'all'
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All Content
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('movie')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    contentType === 'movie'
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>🎬 Movies Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('series')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    contentType === 'series'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/50'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>📺 TV Series Only</span>
                </button>
              </div>

              <div className="text-xs text-zinc-400">
                Showing <span className="font-bold text-white">{total}</span> {contentType === 'series' ? 'TV Series' : contentType === 'movie' ? 'Movies' : 'Titles'}
              </div>
            </div>

            {/* Row 1: Search, Quick Sort, Sort Dropdown & Toggle */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies, narrators, years..."
                  className="w-full pl-10 pr-9 py-2.5 bg-zinc-900/90 border border-zinc-700/70 rounded-xl text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Sort Toggle Buttons */}
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-bold text-zinc-400 hidden sm:inline-block">Sort:</span>

                {/* Popularity Quick Toggle */}
                <button
                  onClick={() => {
                    if (sortBy === 'popularity') {
                      setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                    } else {
                      setSortBy('popularity');
                      setSortDirection('desc');
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    sortBy === 'popularity'
                      ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-md shadow-primary/30'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Popularity</span>
                  {sortBy === 'popularity' && (
                    <span className="text-[10px] opacity-80">
                      {sortDirection === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </button>

                {/* Rating Quick Toggle */}
                <button
                  onClick={() => {
                    if (sortBy === 'rating') {
                      setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                    } else {
                      setSortBy('rating');
                      setSortDirection('desc');
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    sortBy === 'rating'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Rating</span>
                  {sortBy === 'rating' && (
                    <span className="text-[10px] opacity-80">
                      {sortDirection === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </button>

                {/* Newest Quick Toggle */}
                <button
                  onClick={() => {
                    if (sortBy === 'latest') {
                      setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                    } else {
                      setSortBy('latest');
                      setSortDirection('desc');
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    sortBy === 'latest'
                      ? 'bg-zinc-800 text-white border border-zinc-600 shadow-md'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Newest</span>
                </button>

                {/* Direction Switcher */}
                <button
                  onClick={() => setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'))}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  title={`Order: ${sortDirection === 'desc' ? 'Highest first' : 'Lowest first'}`}
                  aria-label="Toggle sort order"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>

                {/* Advanced Filters Expand Button */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    showAdvancedFilters
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {(minRating > 0 || activeNarrator !== 'All' || selectedYear !== 'All') && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* Row 2: Genre Pills */}
            <div className="pt-2 border-t border-zinc-800/60">
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                <span className="text-xs font-bold text-zinc-400 shrink-0 mr-1">Genre:</span>
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setActiveGenre(genre)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                      activeGenre === genre
                        ? 'bg-gradient-to-r from-primary to-orange-400 text-white shadow-md shadow-primary/20'
                        : 'bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Advanced Filter Drawer (Rating, Narrator, Year, Reset) */}
            {showAdvancedFilters && (
              <div className="pt-3 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
                {/* Min Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Minimum Rating</span>
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {RATING_FILTER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Narrator Selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-emerald-400" />
                    <span>Interpreter / Voice</span>
                  </label>
                  <select
                    value={activeNarrator}
                    onChange={(e) => setActiveNarrator(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {POPULAR_NARRATORS.map((n) => (
                      <option key={n} value={n}>
                        {n === 'All' ? 'All Interpreters' : n}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Release Year Selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-400" />
                    <span>Release Year</span>
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr === 'All' ? 'All Years' : yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Detailed Sort Order Selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-primary" />
                    <span>Sort Mode</span>
                  </label>
                  <select
                    value={`${sortBy}_${sortDirection}`}
                    onChange={(e) => {
                      const [s, d] = e.target.value.split('_') as [SortOption, SortDirection];
                      setSortBy(s);
                      setSortDirection(d);
                    }}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="popularity_desc">🔥 Most Popular (Highest Views)</option>
                    <option value="popularity_asc">📉 Least Popular (Lowest Views)</option>
                    <option value="rating_desc">⭐ Rating: Highest to Lowest (10 → 1)</option>
                    <option value="rating_asc">⭐ Rating: Lowest to Highest (1 → 10)</option>
                    <option value="latest_desc">🕒 Newest Uploads First</option>
                    <option value="year_desc">📅 Release Year: Newest First</option>
                    <option value="year_asc">📅 Release Year: Oldest First</option>
                    <option value="title_asc">🔤 Title: A to Z</option>
                    <option value="title_desc">🔤 Title: Z to A</option>
                  </select>
                </div>
              </div>
            )}

            {/* Active Filters Summary & Reset Bar */}
            {hasActiveFilters && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-zinc-400">Active filters:</span>
                  {sortBy && (
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center gap-1">
                      Sort: {getSortLabel(sortBy)} ({sortDirection === 'desc' ? 'High' : 'Low'})
                    </span>
                  )}
                  {activeGenre !== 'All' && (
                    <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
                      Genre: {activeGenre}
                      <button onClick={() => setActiveGenre('All')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {minRating > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      Rating: ≥ {minRating}
                      <button onClick={() => setMinRating(0)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {activeNarrator !== 'All' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      Voice: {activeNarrator}
                      <button onClick={() => setActiveNarrator('All')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedYear !== 'All' && (
                    <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                      Year: {selectedYear}
                      <button onClick={() => setSelectedYear('All')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-bold ml-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              </div>
            )}
          </div>

          {/* LOADING STATE */}
          {status === 'loading' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="w-full aspect-[2/3] bg-white/10" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {status === 'error' && (
            <div className="text-center py-20 bg-zinc-950/60 rounded-3xl border border-zinc-800 p-8 max-w-lg mx-auto">
              <div className="text-6xl mb-4">📡</div>
              <h2 className="text-2xl font-bold mb-2">Couldn&apos;t load movies</h2>
              <p className="text-muted mb-6">
                We couldn&apos;t reach the movie catalog. Please try again.
              </p>
              <button
                onClick={() => loadMovies(1, sortBy, sortDirection)}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-bold hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* READY STATE */}
          {status === 'ready' && (
            <>
              {displayedMovies.length === 0 ? (
                <div className="text-center py-20 bg-zinc-950/40 rounded-3xl border border-zinc-800/80 p-8 max-w-lg mx-auto">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-2xl font-bold mb-2">No Matching Movies Found</h2>
                  <p className="text-muted mb-6 text-sm">
                    No titles found with your active filters. Try lowering the minimum rating or clearing filters.
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white text-xs font-bold hover:shadow-lg transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Results Count Banner */}
                  <div className="flex items-center justify-between mb-6 text-xs text-zinc-400">
                    <p>
                      Showing <span className="font-bold text-white">{displayedMovies.length}</span>{' '}
                      title{displayedMovies.length !== 1 ? 's' : ''} sorted by{' '}
                      <span className="font-bold text-primary">{getSortLabel(sortBy)}</span>{' '}
                      ({sortDirection === 'desc' ? 'High to Low' : 'Low to High'})
                    </p>
                  </div>

                  {/* Movie Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
                    {displayedMovies.map((movie) => (
                      <CatalogMovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {movies.length < total && (
                    <div className="flex justify-center mt-12">
                      <button
                        onClick={() =>
                          loadMovies(
                            Math.floor(movies.length / PAGE_SIZE) + 1,
                            sortBy,
                            sortDirection
                          )
                        }
                        disabled={loadingMore}
                        className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-bold hover:-translate-y-1 hover:shadow-xl transition-all disabled:opacity-60 disabled:hover:translate-y-0 text-sm"
                      >
                        {loadingMore
                          ? 'Loading more movies…'
                          : `Load More Movies (${total - movies.length} remaining)`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
