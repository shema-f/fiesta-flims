'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import CommentSortDropdown, { CommentSortOption } from '@/components/CommentSortDropdown';
import { 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  ArrowLeft, 
  Flame, 
  Send, 
  MessageCircle, 
  Check, 
  MessageSquare,
  Globe,
  Film,
  Newspaper,
  Type
} from 'lucide-react';
import { CinemaNewsArticle, getCinemaNewsBySlug } from '@/lib/cinemaNewsData';

/**
 * Format markdown text with subheadings (###), quotes (>), and bullet points
 */
function renderArticleBody(content: string, fontSizeClass: string) {
  const paragraphs = content.split('\n\n');

  return paragraphs.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Subheading H3
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-xl sm:text-2xl font-black text-white mt-10 mb-4 tracking-tight border-b border-zinc-900 pb-2">
          {trimmed.replace('### ', '')}
        </h3>
      );
    }

    // Subheading H4
    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={idx} className="text-lg sm:text-xl font-extrabold text-primary mt-8 mb-3">
          {trimmed.replace('#### ', '')}
        </h4>
      );
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote
          key={idx}
          className="my-8 p-5 sm:p-6 rounded-2xl bg-zinc-900/90 border-l-4 border-primary text-zinc-100 italic text-base sm:text-lg leading-relaxed shadow-lg shadow-black/40"
        >
          {trimmed.replace(/^> \s*/gm, '')}
        </blockquote>
      );
    }

    // Bullet points
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').filter((l) => l.trim().length > 0);
      return (
        <ul key={idx} className="my-6 space-y-3 list-none pl-1">
          {items.map((item, itemIdx) => (
            <li key={itemIdx} className={`flex items-start gap-3 text-zinc-200 ${fontSizeClass} leading-relaxed`}>
              <span className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
              <span>{item.replace(/^[•-]\s*/, '')}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Normal paragraph with basic bold parsing
    const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={idx} className={`my-5 text-zinc-300 ${fontSizeClass} leading-relaxed font-normal`}>
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-extrabold text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <em key={pIdx} className="text-zinc-200 italic">
                {part.slice(1, -1)}
              </em>
            );
          }
          return part;
        })}
      </p>
    );
  });
}

export default function FiestaFlixNewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<CinemaNewsArticle | null>(null);
  const [related, setRelated] = useState<CinemaNewsArticle[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  const [comments, setComments] = useState<
    Array<{
      id: string;
      name: string;
      text: string;
      time: string;
      createdAt: number;
      likes: number;
      isLiked?: boolean;
    }>
  >([
    {
      id: 'c1',
      name: 'Eric Mugisha',
      text: 'Agasobanuye is truly reaching world-class standards! Can not wait for the upcoming releases.',
      time: '2 hours ago',
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      likes: 14,
      isLiked: false,
    },
    {
      id: 'c2',
      name: 'Sandrine K.',
      text: 'Rocky Kimomo and Junior Giti deserve all the global recognition. Great coverage FiestaFlix!',
      time: '4 hours ago',
      createdAt: Date.now() - 4 * 60 * 60 * 1000,
      likes: 27,
      isLiked: false,
    },
    {
      id: 'c3',
      name: 'Fabrice N.',
      text: 'The sound design and voice acting quality in Rwandan translated cinema is top tier now.',
      time: '6 hours ago',
      createdAt: Date.now() - 6 * 60 * 60 * 1000,
      likes: 9,
      isLiked: false,
    },
  ]);
  const [sortOption, setSortOption] = useState<CommentSortOption>('Newest');
  const [newComment, setNewComment] = useState('');
  const [commenterName, setCommenterName] = useState('');

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const currentProgress = (totalScroll / windowHeight) * 100;
        setScrollProgress(Number(currentProgress.toFixed(1)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;

    // Load initial from local data
    const local = getCinemaNewsBySlug(slug);
    if (local) {
      setArticle(local);
      setLikeCount(local.likes);
    }

    // Fetch live from API
    fetch(`/api/news/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.article) {
          setArticle(data.article);
          setLikeCount(data.article.likes);
          if (Array.isArray(data.related)) {
            setRelated(data.related);
          }
        }
      })
      .catch(() => {});
  }, [slug]);

  // Handle Like
  const handleLike = async () => {
    if (!article) return;
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount((prev) => prev + (newLikedState ? 1 : -1));

    try {
      await fetch(`/api/news/${slug}`, { method: 'PATCH' });
    } catch {
      // silent fail
    }
  };

  // Handle Share
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (!article || typeof window === 'undefined') return;
    const text = `Read this story on FiestaFlix News: "${article.title}" ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareTelegram = () => {
    if (!article || typeof window === 'undefined') return;
    const text = `${article.title}\n\nRead more on FiestaFlix News:`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const createdTime = Date.now();
    setComments((prev) => [
      {
        id: `c-${createdTime}`,
        name: commenterName.trim() || 'Cinema Fan',
        text: newComment.trim(),
        time: 'Just now',
        createdAt: createdTime,
        likes: 0,
        isLiked: false,
      },
      ...prev,
    ]);
    setNewComment('');
  };

  const handleToggleCommentLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const nextLiked = !c.isLiked;
          return {
            ...c,
            isLiked: nextLiked,
            likes: nextLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
          };
        }
        return c;
      })
    );
  };

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.85]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 24]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);

  const sortedComments = useMemo(() => {
    const list = [...comments];
    if (sortOption === 'Newest') {
      return list.sort((a, b) => b.createdAt - a.createdAt);
    }
    if (sortOption === 'Oldest') {
      return list.sort((a, b) => a.createdAt - b.createdAt);
    }
    if (sortOption === 'Most Liked') {
      return list.sort((a, b) => {
        if (b.likes !== a.likes) {
          return b.likes - a.likes;
        }
        return b.createdAt - a.createdAt;
      });
    }
    return list;
  }, [comments, sortOption]);

  const fontSizeClass =
    fontSize === 'xlarge'
      ? 'text-lg sm:text-xl'
      : fontSize === 'large'
      ? 'text-base sm:text-lg'
      : 'text-sm sm:text-base';

  if (!article) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <Film className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <h2 className="text-xl font-bold">Loading FiestaFlix News Story...</h2>
          <p className="text-sm text-zinc-500 mt-2">Fetching clean readable story.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col selection:bg-primary selection:text-white">
      {/* READING PROGRESS BAR AT VERY TOP */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-orange-400 to-amber-300 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <Header />

      <main className="flex-1 pt-20 pb-24">
        {/* BREADCRUMBS & BACK LINK */}
        <div className="container mx-auto px-4 sm:px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/news" className="hover:text-primary transition-colors flex items-center gap-1 font-bold">
              FiestaFlix News
            </Link>
            <span>/</span>
            <span className="text-zinc-300 truncate max-w-xs sm:max-w-md">{article.title}</span>
          </div>
        </div>

        {/* ARTICLE HERO SECTION */}
        <article className="container mx-auto px-4 sm:px-6 max-w-3xl">
          {/* Back button */}
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white mb-6 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to FiestaFlix News</span>
          </Link>

          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/30">
              {article.category}
            </span>
            {article.isBreaking && (
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-rose-600/30">
                <Flame className="w-3.5 h-3.5" />
                Breaking News
              </span>
            )}
            <span className="text-xs font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full flex items-center gap-1">
              <Globe className="w-3 h-3 text-primary" />
              {article.region}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-6">
            {article.title}
          </h1>

          {/* Official FiestaFlix News Source, Date & Reader Tools Bar */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  <span>FiestaFlix News</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[11px] text-zinc-400">Official Cinema Desk</div>
              </div>
            </div>

            {/* Reading Details & Text Size Adjuster */}
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>{article.readTime}</span>
              </div>

              {/* Text Size Control */}
              <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-zinc-800">
                <Type className="w-3.5 h-3.5 text-zinc-400 mr-1" />
                <button
                  type="button"
                  onClick={() => setFontSize('normal')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                    fontSize === 'normal' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Normal Text Size"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                    fontSize === 'large' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Large Text Size"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2 py-0.5 rounded text-sm font-bold transition-colors ${
                    fontSize === 'xlarge' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Extra Large Text Size"
                >
                  A++
                </button>
              </div>
            </div>
          </div>

          {/* Featured Visual */}
          <div className="relative w-full h-72 sm:h-96 md:h-[460px] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl mb-8">
            <img
              src={article.backdrop || article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs text-zinc-300">
              <span className="font-semibold text-white drop-shadow">FiestaFlix Cinema Coverage</span>
              <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">4K Cinema Feed</span>
            </div>
          </div>

          {/* Excerpt Hook */}
          <div className="p-6 rounded-2xl bg-zinc-950/80 border-l-4 border-primary border-zinc-800 text-base sm:text-lg font-medium text-zinc-200 italic leading-relaxed mb-8">
            {article.excerpt}
          </div>

          {/* SPONSORED MID-ARTICLE BANNER */}
          <AdBanner placement="ARTICLE_IN_BODY" dismissible />

          {/* Main Body - Highly Legible & Readable */}
          <div className="prose prose-invert max-w-none text-zinc-300 border-b border-zinc-800/80 pb-10">
            {renderArticleBody(article.content, fontSizeClass)}
          </div>

          {/* Tags */}
          <div className="pt-6 pb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-2">Topics:</span>
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/news?search=${encodeURIComponent(tag)}`}
                className="text-xs px-3 py-1 rounded-xl bg-zinc-900 hover:bg-primary/20 hover:text-primary text-zinc-300 border border-zinc-800 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* SHARE & INTERACTION TOOLBAR */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4 my-8">
            {/* Like */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLike}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isLiked
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                <span>{likeCount} Applaud / Likes</span>
              </button>
            </div>

            {/* Social Sharing */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 hidden sm:inline">Share:</span>
              
              <button
                type="button"
                onClick={handleShareWhatsApp}
                title="Share to WhatsApp"
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleShareTelegram}
                title="Share to Telegram"
                className="px-3 py-2 rounded-xl bg-[#229ED9] hover:bg-[#1e8ec3] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Telegram</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy Story Link"
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* READER REACTIONS & COMMENTS */}
          <section className="mt-12 p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-900">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    Reader Reactions ({comments.length})
                  </h3>
                  <span className="text-[11px] text-zinc-500">Live community discussion & reviews</span>
                </div>
              </div>

              {/* DROPDOWN TO SORT READER COMMENTS */}
              <div className="flex items-center gap-2">
                <CommentSortDropdown value={sortOption} onChange={setSortOption} />
              </div>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Jean-Luc)"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Share your thoughts on this cinema news..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-orange-500 text-white text-xs font-black transition-colors shrink-0 shadow-sm"
                >
                  Post Reaction
                </button>
              </div>
            </form>

            {/* Current Sort Status Bar */}
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-4 px-1">
              <span>
                Showing <strong className="text-zinc-300">{sortedComments.length}</strong> reactions
              </span>
              <span className="text-[11px] text-zinc-400">
                Sorted by <span className="font-bold text-primary">{sortOption}</span>
              </span>
            </div>

            {/* Comment List */}
            {sortedComments.length === 0 ? (
              <div className="text-center py-8 rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800 text-zinc-500 text-xs">
                No reactions yet. Be the first to share your reaction to this story!
              </div>
            ) : (
              <div className="space-y-3.5">
                {sortedComments.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary/30 to-orange-500/20 text-primary border border-primary/30 flex items-center justify-center text-xs font-black">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block leading-tight">{c.name}</span>
                            <span className="text-[10px] text-zinc-500">{c.time}</span>
                          </div>
                        </div>

                        {/* Comment Like / Upvote Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleCommentLike(c.id)}
                          aria-label={`Like comment by ${c.name}, currently ${c.likes} likes`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            c.isLiked
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                              : 'bg-zinc-800/70 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${c.isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                          <span className="text-[11px] font-bold">{c.likes}</span>
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-9">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* RELATED FIESTAFLIX NEWS */}
          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="text-xl sm:text-2xl font-black text-white mb-6">
                More FiestaFlix News
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/news/${rel.slug}`}
                    className="group p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-primary/50 transition-all flex gap-4 items-center"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black text-primary uppercase">
                        {rel.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug mt-1">
                        {rel.title}
                      </h4>
                      <span className="text-[11px] text-zinc-500 mt-1 block">
                        {rel.readTime} • {rel.region}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
