'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Newspaper, 
  Flame, 
  Sparkles, 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  ArrowRight, 
  Send, 
  TrendingUp, 
  Globe,
  Film,
  Bookmark,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { INITIAL_CINEMA_NEWS, CinemaNewsArticle } from '@/lib/cinemaNewsData';

const CATEGORIES = [
  { id: 'all', label: 'All News', icon: Globe },
  { id: 'breaking', label: '⚡ Breaking', icon: Flame },
  { id: 'Hollywood', label: 'Hollywood', icon: Film },
  { id: 'Rwanda Cinema', label: '🇷🇼 Rwanda Cinema', icon: Sparkles },
  { id: 'Agasobanuye', label: 'Agasobanuye', icon: Sparkles },
  { id: 'African Cinema', label: '🌍 African Cinema', icon: Globe },
  { id: 'Asian Cinema', label: '⛩️ Asian Cinema', icon: Film },
  { id: 'Sci-Fi & Tech', label: '🚀 Sci-Fi & Tech', icon: TrendingUp },
  { id: 'Festivals & Awards', label: '🏆 Festivals & Awards', icon: Bookmark },
];

export default function FiestaFlixNewsPage() {
  const [news, setNews] = useState<CinemaNewsArticle[]>(INITIAL_CINEMA_NEWS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Fetch updated news from API
  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news?limit=50');
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        setNews(data.articles);
      }
    } catch {
      // Fallback to initial
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Filtered stories
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // Category match
      if (selectedCategory === 'breaking' && !item.isBreaking) return false;
      if (
        selectedCategory !== 'all' &&
        selectedCategory !== 'breaking' &&
        item.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Region match
      if (selectedRegion !== 'all' && item.region.toLowerCase() !== selectedRegion.toLowerCase()) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesExcerpt = item.excerpt.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesExcerpt && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [news, selectedCategory, selectedRegion, searchQuery]);

  // Featured Lead Story
  const featuredStory = useMemo(() => {
    return news.find((n) => n.isFeatured) || news[0];
  }, [news]);

  // Handle Like
  const handleLike = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();

    const isLiked = likedArticles[slug];
    setLikedArticles((prev) => ({ ...prev, [slug]: !isLiked }));

    // Optimistically update count
    setNews((prev) =>
      prev.map((item) =>
        item.slug === slug ? { ...item, likes: item.likes + (isLiked ? -1 : 1) } : item
      )
    );

    try {
      await fetch(`/api/news/${slug}`, { method: 'PATCH' });
    } catch {
      // silent fail
    }
  };

  // Handle Share Link
  const handleShare = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();

    const url = typeof window !== 'undefined' ? `${window.location.origin}/news/${slug}` : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col selection:bg-primary selection:text-white">
      <Header />

      <main className="flex-1 pt-20 pb-20">
        {/* TOP BREAKING NEWS TICKER */}
        <div className="bg-gradient-to-r from-primary/20 via-orange-950/40 to-zinc-950 border-y border-primary/20 py-2.5 px-4 overflow-hidden">
          <div className="container mx-auto flex items-center gap-3">
            <span className="shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-rose-600/30 animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              Breaking
            </span>
            <div className="overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-8 text-xs font-semibold text-zinc-300">
              {news.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="group-hover:underline">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="relative px-4 sm:px-6 pt-8 pb-10 container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-extrabold uppercase tracking-wider mb-3">
                <Newspaper className="w-3.5 h-3.5" />
                FiestaFlix Official Cinema Journal
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                FiestaFlix <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-300 bg-clip-text text-transparent">News</span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                Clear, readable cinema scoops, Hollywood production updates, Rwandan Agasobanuye voice milestones, anime box office records, and digital cloud releases.
              </p>
            </div>

            {/* ACTION: JOIN TELEGRAM ALERTS */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://t.me/fiestaflix_movies"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-[#229ED9] hover:bg-[#1e8ec3] text-white font-black text-xs sm:text-sm shadow-xl shadow-[#229ED9]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Join News Telegram</span>
              </a>
            </div>
          </div>

          {/* FEATURED SPOTLIGHT STORY - CLEAN READABLE LAYOUT */}
          {featuredStory && (
            <div className="relative rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-950 group shadow-2xl shadow-black/80 mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Visual */}
                <div className="relative lg:col-span-7 h-72 sm:h-96 lg:h-[460px] overflow-hidden">
                  <img
                    src={featuredStory.image}
                    alt={featuredStory.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/40">
                      {featuredStory.category}
                    </span>
                    {featuredStory.isBreaking && (
                      <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-rose-600/40">
                        <Flame className="w-3.5 h-3.5" />
                        Breaking News
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-zinc-950">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
                      <span className="font-bold text-primary">{featuredStory.region}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {featuredStory.readTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {featuredStory.views.toLocaleString()} reads
                      </span>
                    </div>

                    <Link href={`/news/${featuredStory.slug}`}>
                      <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-primary transition-colors leading-snug mb-4">
                        {featuredStory.title}
                      </h2>
                    </Link>

                    <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                      {featuredStory.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {featuredStory.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-400 text-xs border border-zinc-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Clean Reading Action Bar */}
                  <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-zinc-300">
                        FiestaFlix News
                      </span>
                    </div>

                    <Link
                      href={`/news/${featuredStory.slug}`}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-orange-500 text-white text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
                    >
                      <span>Read Full Story</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEARCH & FILTERS BAR */}
          <div className="space-y-4 mb-8">
            {/* Search Input & Region Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search cinema news by title, narrator, actor, studio, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-primary rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="sm:col-span-4">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-primary rounded-2xl px-4 py-3 text-sm text-white focus:outline-none"
                >
                  <option value="all">🌍 All Regions & Territories</option>
                  <option value="Global">Global / Worldwide</option>
                  <option value="East Africa">East Africa / Rwanda</option>
                  <option value="North America">North America / Hollywood</option>
                  <option value="Asia">Asia / Anime & K-Cinema</option>
                  <option value="West Africa">West Africa / Nollywood</option>
                  <option value="Europe">Europe / Cannes & UK</option>
                  <option value="India / Bollywood">India / Bollywood</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
            <div className="flex items-center gap-2 overflow-x-auto touch-pan-x scrollbar-none py-1">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-1 ring-primary'
                        : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RESULTS COUNT */}
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-6">
            <div>
              Showing <span className="text-white font-bold">{filteredNews.length}</span> cinema articles
            </div>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedRegion('all');
                  setSearchQuery('');
                }}
                className="text-primary hover:underline font-bold"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* NEWS ARTICLES GRID - CLEAN, READABLE, NO WRITER NOISE */}
          {filteredNews.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-950 border border-zinc-800">
              <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No cinema news found</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Try adjusting your search query or category filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedRegion('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
              >
                Show All Stories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((article) => {
                const isLiked = likedArticles[article.slug];
                const isCopied = copiedSlug === article.slug;

                return (
                  <motion.article
                    key={article.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="group bg-zinc-950/80 border border-zinc-800/80 hover:border-primary/50 rounded-3xl overflow-hidden flex flex-col shadow-xl shadow-black/40 hover:shadow-primary/10 transition-all duration-300"
                  >
                    {/* Thumbnail */}
                    <Link href={`/news/${article.slug}`} className="relative h-52 overflow-hidden block">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase">
                          {article.category}
                        </span>
                        {article.isBreaking && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase flex items-center gap-1 shadow-md shadow-rose-600/40">
                            <Flame className="w-3 h-3" /> Breaking
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        {/* Share Button */}
                        <button
                          type="button"
                          onClick={(e) => handleShare(e, article.slug)}
                          title="Copy share link"
                          className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-300">
                        <span className="font-bold text-white drop-shadow-md">{article.region}</span>
                        <span className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md drop-shadow-md">
                          {article.readTime}
                        </span>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Publication Date */}
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-2">
                          <Calendar className="w-3 h-3 text-primary" />
                          <span>
                            {new Date(article.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Title */}
                        <Link href={`/news/${article.slug}`}>
                          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                        </Link>

                        {/* Excerpt */}
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3 mb-4 font-normal">
                          {article.excerpt}
                        </p>
                      </div>

                      {/* Footer Info - Clean Reading Focused */}
                      <div>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Clean Reading Bar */}
                        <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                          <Link
                            href={`/news/${article.slug}`}
                            className="text-xs font-bold text-primary hover:text-orange-400 transition-colors flex items-center gap-1"
                          >
                            <span>Read Story</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => handleLike(e, article.slug)}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                isLiked ? 'text-rose-500 font-bold' : 'text-zinc-400 hover:text-rose-400'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                              <span>{article.likes}</span>
                            </button>

                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                              <Eye className="w-3.5 h-3.5" />
                              <span>{article.views}</span>
                            </div>
                          </div>
                        </div>

                        {isCopied && (
                          <div className="mt-2 py-1 px-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] text-center font-bold">
                            Link copied to clipboard!
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          {/* TELEGRAM CLOUD ALERTS */}
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-primary/10 to-zinc-900 border border-primary/30 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-black uppercase tracking-wider">
                  FiestaFlix Telegram Channel
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Get Instant Movie Releases & News Drops
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                  Receive breaking cinema scoops, 4K download links, and Agasobanuye audio commentaries direct to your phone with zero ads.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://t.me/fiestaflix_movies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-2xl bg-[#229ED9] hover:bg-[#1e8ec3] text-white font-extrabold text-sm shadow-xl shadow-[#229ED9]/30 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Join FiestaFlix Telegram</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
