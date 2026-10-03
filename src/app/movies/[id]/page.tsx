'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogMovieCard from '@/components/CatalogMovieCard';
import { movieData } from '@/lib/movieData';
import type { ApiMovie } from '@/lib/apiTypes';
import { 
  Play, 
  Download, 
  Send, 
  Heart, 
  Share2, 
  Check, 
  Star, 
  Clock, 
  Volume2, 
  HardDrive, 
  X, 
  Film, 
  Eye, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';

type LoadStatus = 'loading' | 'ready' | 'error' | 'notfound';

interface VideoSource {
  label: string;
  url: string;
}

interface MovieView {
  title: string;
  year: number | null;
  image: string | null;
  backdrop: string | null;
  genre: string;
  rating: number | null;
  durationSeconds: number;
  durationString?: string;
  narrator: string;
  description: string;
  views: number | null;
  sources: VideoSource[];
  telegramChannelPost?: string;
  telegramBotLink?: string;
  fileSize?: string;
  quality?: string;
}

function formatDuration(seconds: number) {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${mins}m`;
}

function formatViews(views: number) {
  return views.toLocaleString();
}

function parseSources(fileUrl: string, resolutions: unknown): VideoSource[] {
  const sources: VideoSource[] = [];
  if (resolutions && typeof resolutions === 'object' && !Array.isArray(resolutions)) {
    for (const [label, url] of Object.entries(resolutions as Record<string, unknown>)) {
      if (typeof url === 'string' && url.length > 0) {
        sources.push({ label, url });
      }
    }
  }
  if (sources.length === 0 && fileUrl) {
    sources.push({ label: 'Default', url: fileUrl });
  }
  const rank = (label: string) => {
    const n = parseInt(label, 10);
    return Number.isNaN(n) ? -1 : n;
  };
  return sources.sort((a, b) => rank(b.label) - rank(a.label));
}

const DEFAULT_DESCRIPTION =
  'Experience this amazing movie with authentic Kinyarwanda narration. Stream in crystal clear HD quality or download for offline viewing via our high-speed Telegram storage.';

export default function MovieDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const staticId = parseInt(id, 10);
  const staticMovie = useMemo(
    () => (Number.isNaN(staticId) ? undefined : movieData.find((m) => m.id === staticId)),
    [staticId]
  );

  const [apiMovie, setApiMovie] = useState<ApiMovie | null>(null);
  const [related, setRelated] = useState<ApiMovie[]>([]);
  const [status, setStatus] = useState<LoadStatus>(staticMovie ? 'ready' : 'loading');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1240);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [watchSource, setWatchSource] = useState<VideoSource | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadMovie = useCallback(async () => {
    if (staticMovie) {
      setStatus('ready');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch(`/api/movies/${id}`);
      if (res.status === 404) {
        setStatus('notfound');
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        setApiMovie(json.data);
        setStatus('ready');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }, [id, staticMovie]);

  useEffect(() => {
    loadMovie();
  }, [loadMovie]);

  useEffect(() => {
    if (staticMovie) return;
    const fetchRelated = async () => {
      try {
        const res = await fetch('/api/movies?limit=5');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRelated(json.data.filter((m: ApiMovie) => m.id !== id));
        }
      } catch {
        // silently fallback
      }
    };
    fetchRelated();
  }, [id, staticMovie]);

  const view: MovieView = useMemo(() => {
    if (staticMovie) {
      const sampleSources: VideoSource[] = [
        { 
          label: staticMovie.quality || '1080p FHD', 
          url: staticMovie.directStreamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' 
        },
        { 
          label: '720p HD', 
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' 
        }
      ];

      return {
        title: staticMovie.title,
        year: staticMovie.year,
        image: staticMovie.image,
        backdrop: staticMovie.backdrop || staticMovie.image,
        genre: staticMovie.genre,
        rating: staticMovie.rating,
        durationSeconds: 125 * 60,
        durationString: staticMovie.duration || '2h 05m',
        narrator: staticMovie.narrator || 'Rocky Kimomo',
        description: staticMovie.description || DEFAULT_DESCRIPTION,
        views: 24500,
        sources: sampleSources,
        telegramChannelPost: staticMovie.telegramChannelPost || `https://t.me/fiestaflix_movies/${staticMovie.id}`,
        telegramBotLink: staticMovie.telegramBotLink || `https://t.me/FiestaFlixBot?start=movie_${staticMovie.id}`,
        fileSize: staticMovie.fileSize || '1.45 GB',
        quality: staticMovie.quality || '1080p FHD',
      };
    }

    if (apiMovie) {
      const parsed = parseSources(apiMovie.fileUrl, apiMovie.resolutions);
      return {
        title: apiMovie.title,
        year: apiMovie.releaseYear,
        image: apiMovie.thumbnailUrl,
        backdrop: apiMovie.thumbnailUrl,
        genre: apiMovie.genre,
        rating: 8.8,
        durationSeconds: apiMovie.duration,
        durationString: formatDuration(apiMovie.duration),
        narrator: apiMovie.narrator,
        description: apiMovie.description || DEFAULT_DESCRIPTION,
        views: apiMovie.views,
        sources: parsed.length > 0 ? parsed : [
          { label: '1080p HD', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
        ],
        telegramChannelPost: `https://t.me/fiestaflix_movies/${apiMovie.id}`,
        telegramBotLink: `https://t.me/FiestaFlixBot?start=movie_${apiMovie.id}`,
        fileSize: '1.2 GB',
        quality: '1080p FHD',
      };
    }

    return {
      title: 'Movie',
      year: 2025,
      image: null,
      backdrop: null,
      genre: 'Cinema',
      rating: 8.5,
      durationSeconds: 7200,
      narrator: 'Rocky Kimomo',
      description: DEFAULT_DESCRIPTION,
      views: 0,
      sources: [],
    };
  }, [staticMovie, apiMovie]);

  const downloadFileName = (source: VideoSource) => {
    const extension = source.url.match(/\.(mp4|webm|mkv|mov|m4v)(?=$|\?)/i)?.[0] || '.mp4';
    const base = view.title.replace(/[\\/:*?"<>|]+/g, '-');
    return source.label === 'Default'
      ? `${base}${extension}`
      : `${base}-${source.label}${extension}`;
  };

  const triggerDownload = (source: VideoSource) => {
    const anchor = document.createElement('a');
    anchor.href = source.url;
    anchor.download = downloadFileName(source);
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleWatch = () => {
    if (view.sources.length > 0) {
      setWatchSource(view.sources[0]);
      setIsPlayerOpen(true);
    }
  };

  const handleDownload = () => {
    if (view.sources.length === 1) {
      triggerDownload(view.sources[0]);
      return;
    }
    if (view.sources.length > 1) {
      setIsDownloadOpen((open) => !open);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-zinc-400 font-medium">Loading movie...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'error' || status === 'notfound' || (!staticMovie && !apiMovie)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-32">
          <div className="text-center max-w-md mx-auto px-6 space-y-4">
            <Film className="w-16 h-16 text-zinc-600 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Movie Not Found</h1>
            <p className="text-zinc-400 text-sm">
              We couldn&apos;t locate this title. Check out our other popular Rwandan releases below.
            </p>
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold"
            >
              Browse Catalog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        {/* Cinematic Backdrop Header */}
        <div className="relative min-h-[480px] lg:h-[550px] overflow-hidden flex items-end">
          <div className="absolute inset-0 z-0">
            {view.backdrop ? (
              <Image
                src={view.backdrop}
                alt={view.title}
                fill
                priority
                referrerPolicy="no-referrer"
                className="object-cover opacity-35 filter brightness-75 scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10 pb-8 sm:pb-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
              {/* Poster card with ambient glow */}
              <div className="relative w-48 sm:w-60 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/60 shrink-0 bg-zinc-900">
                {view.image ? (
                  <Image
                    src={view.image}
                    alt={view.title}
                    fill
                    priority
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
                )}
                {view.quality && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-black/80 backdrop-blur text-white border border-zinc-700">
                    {view.quality}
                  </span>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-200">{view.year}</span>
                  <span>•</span>
                  <span className="text-primary font-bold uppercase tracking-wider">{view.genre}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {view.durationString || formatDuration(view.durationSeconds)}
                  </span>
                  {view.rating !== null && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {view.rating}
                      </span>
                    </>
                  )}
                  {view.views !== null && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Eye className="w-3.5 h-3.5" />
                        {formatViews(view.views)} views
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                  {view.title}
                </h1>

                {/* Narrator Pill */}
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold backdrop-blur">
                    <Volume2 className="w-4 h-4" />
                    <span>Agasobanuye na: <strong className="text-emerald-300 font-bold">{view.narrator}</strong></span>
                  </div>
                </div>

                <p className="text-zinc-300 max-w-2xl text-sm sm:text-base leading-relaxed">
                  {view.description}
                </p>

                {/* Main Action CTAs */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <button
                    onClick={handleWatch}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold text-base shadow-xl shadow-primary/30 transition-all hover:scale-105"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Watch Online</span>
                  </button>

                  <div className="relative inline-flex">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-base border border-zinc-700 transition-all hover:scale-105"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download</span>
                    </button>

                    {isDownloadOpen && view.sources.length > 1 && (
                      <div className="absolute top-full mt-2 left-0 z-30 min-w-56 bg-zinc-900 border border-zinc-700 rounded-2xl p-2 shadow-2xl space-y-1">
                        <p className="px-3 py-1.5 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                          Select Quality
                        </p>
                        {view.sources.map((source) => (
                          <button
                            key={source.label}
                            onClick={() => {
                              triggerDownload(source);
                              setIsDownloadOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm font-semibold rounded-xl text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-between"
                          >
                            <span>{source.label}</span>
                            <Download className="w-4 h-4 text-primary" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLike}
                    className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all border ${
                      isLiked
                        ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30'
                        : 'bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likeCount.toLocaleString()}</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    <span className="text-xs font-semibold">{copied ? 'Copied' : 'Share'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TELEGRAM STORAGE & DIRECT DOWNLOAD SECTION */}
        <section className="container mx-auto px-4 sm:px-6 py-8">
          <div className="rounded-3xl bg-gradient-to-r from-sky-950/40 via-zinc-900/80 to-zinc-900 border border-sky-500/30 p-6 sm:p-8 backdrop-blur shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-md shadow-[#229ED9]/40">
                    <Send className="w-4 h-4 -rotate-12 translate-x-px" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Fast Telegram Cloud Storage
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30">
                    Free • Unlimited Speed
                  </span>
                </div>
                <p className="text-sm text-zinc-300 max-w-2xl">
                  Save data and enjoy blazing fast download speeds directly through our verified Telegram network. Choose an option below to access the full movie file without ad redirects or waiting timers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={view.telegramChannelPost}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white font-bold text-sm shadow-lg shadow-[#229ED9]/30 transition-all hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  <span>Download in Telegram Channel</span>
                </a>

                <a
                  href={view.telegramBotLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm border border-zinc-700 transition-colors"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Get via Telegram Bot</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Related Movies Section */}
        <section className="container mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-6">
            Recommended For You
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {staticMovie
              ? movieData
                  .filter((m) => m.id !== staticId)
                  .slice(0, 5)
                  .map((m) => (
                    <Link key={m.id} href={`/movies/${m.id}`} className="group block">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2.5 bg-zinc-800 border border-zinc-800 group-hover:border-primary/50 transition-all">
                        <Image
                          src={m.image}
                          alt={m.title}
                          fill
                          referrerPolicy="no-referrer"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {m.rating}
                        </div>
                      </div>
                      <h3 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">
                        {m.title}
                      </h3>
                      <p className="text-xs text-zinc-400">{m.year} • {m.genre}</p>
                    </Link>
                  ))
              : related.map((m) => (
                  <CatalogMovieCard key={m.id} movie={m} />
                ))}
          </div>
        </section>

        {/* Video Player Modal */}
        {isPlayerOpen && watchSource && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3 sm:p-6 backdrop-blur animate-fadeIn"
            onClick={() => setIsPlayerOpen(false)}
          >
            <div
              className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-800 gap-4">
                <div className="flex items-center gap-3 truncate">
                  <Play className="w-5 h-5 text-primary shrink-0" />
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {view.title} <span className="text-xs font-normal text-zinc-400">({watchSource.label})</span>
                  </h3>
                </div>
                <button
                  onClick={() => setIsPlayerOpen(false)}
                  className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Close video player"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video bg-black w-full">
                <video
                  key={watchSource.url}
                  src={watchSource.url}
                  poster={view.backdrop || view.image || undefined}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-4 sm:p-5 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-200">Quality:</span>
                  {view.sources.map((source) => (
                    <button
                      key={source.label}
                      onClick={() => setWatchSource(source)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        source.url === watchSource.url
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {source.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={view.telegramChannelPost}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Download file in Telegram instead</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
