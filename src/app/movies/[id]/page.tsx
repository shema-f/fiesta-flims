'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import CatalogMovieCard from '@/components/CatalogMovieCard';
import RatingStars from '@/components/RatingStars';
import TelegramDownloadHub from '@/components/TelegramDownloadHub';
import ModernRatingSystem from '@/components/ModernRatingSystem';
import { useFavorites } from '@/contexts/FavoritesContext';
import { movieData, findMovieOrSeries, type Movie, type Episode } from '@/lib/movieData';
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
  Tv,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import FiestaVideoPlayer from '@/components/video/FiestaVideoPlayer';
import type { SubtitleTrack } from '@/components/video/SubtitleSelector';
import { estimateSizeLabel, DATA_SAVER_TIP } from '@/lib/dataSizes';
import SupportModal from '@/components/SupportModal';

type LoadStatus = 'loading' | 'ready' | 'error' | 'notfound';

interface VideoSource {
  label: string;
  url: string;
}

interface MovieView {
  id: number | string;
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
  contentType?: 'movie' | 'series';
  seasonsCount?: number;
  episodesCount?: number;
  episodes?: Episode[];
  trailer?: string | null;
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
      if (['episodes', 'seasonsCount', 'episodesCount'].includes(label)) continue;
      if (typeof url === 'string' && url.length > 0) {
        sources.push({ label, url });
      }
    }
  }
  if (sources.length === 0 && fileUrl) {
    sources.push({ label: '1080p FHD', url: fileUrl });
  }
  const rank = (label: string) => {
    const n = parseInt(label, 10);
    return Number.isNaN(n) ? -1 : n;
  };
  return sources.sort((a, b) => rank(b.label) - rank(a.label));
}

const DEFAULT_DESCRIPTION =
  'Experience this amazing title with authentic Kinyarwanda narration. Stream in crystal clear HD quality or download for offline viewing via our high-speed Telegram storage.';

export default function MovieDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const staticId = parseInt(id, 10);
  const staticMovie = useMemo(
    () => (Number.isNaN(staticId) ? undefined : findMovieOrSeries(staticId)),
    [staticId]
  );

  const { isFavorite, toggleFavorite } = useFavorites();
  const isMovieFavorited = staticMovie ? isFavorite(staticMovie.id) : isFavorite(id);

  const [apiMovie, setApiMovie] = useState<ApiMovie | null>(null);
  const [related, setRelated] = useState<ApiMovie[]>([]);
  const [status, setStatus] = useState<LoadStatus>(staticMovie ? 'ready' : 'loading');
  const [likeCount, setLikeCount] = useState(1240);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [watchSource, setWatchSource] = useState<VideoSource | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playbackSrc, setPlaybackSrc] = useState<string | null>(null);
  const [resumeSeconds, setResumeSeconds] = useState(0);
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [preparingPlayback, setPreparingPlayback] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [activeSeason, setActiveSeason] = useState(1);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isSeriesDownloadModalOpen, setIsSeriesDownloadModalOpen] = useState(false);
  const [allCopied, setAllCopied] = useState(false);

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
        id: staticMovie.id,
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
        contentType: staticMovie.contentType || (staticMovie.duration?.includes('Eps') ? 'series' : 'movie'),
        seasonsCount: staticMovie.seasonsCount || (staticMovie.duration?.includes('Eps') ? 1 : undefined),
        episodesCount: staticMovie.episodesCount || (staticMovie.episodes ? staticMovie.episodes.length : (staticMovie.duration?.includes('Eps') ? 8 : undefined)),
        episodes: staticMovie.episodes || [],
      };
    }

    if (apiMovie) {
      const anyApi = apiMovie as any;
      const isApiSeries =
        anyApi.contentType === 'series' ||
        anyApi.type === 'Series' ||
        anyApi.durationString?.includes('Eps') ||
        (Array.isArray(anyApi.episodes) && anyApi.episodes.length > 0);
      const parsed = parseSources(apiMovie.fileUrl ?? '', apiMovie.resolutions);
      const rawImg = anyApi.image || anyApi.poster || apiMovie.thumbnailUrl;
      const rawBdr = anyApi.backdrop || anyApi.image || apiMovie.thumbnailUrl;
      const isBad = (u?: string | null) =>
        !u ||
        u.includes('rebelRidgePoster500') ||
        u.includes('polygamist2026Poster500') ||
        u.includes('myCountryNewAgePoster500') ||
        u.includes('vikingsValhallaS3Poster500') ||
        u.includes('fcXdJUSDiDiFupuDuNxBYvdEsTX') ||
        u.includes('MV5BMjA5OTc3NjExNV5BMl5BanBnXkFtZTgwNTcyNDc5MDI') ||
        u.includes('MV5BMzBhNmZiYmQtNGY1Ny00OWVmLTk3NDgtMWZkZmEzNjFmY2YxXkEyXkFqcGc') ||
        u.includes('MV5BNDExMjg0MWYtZTdmNy00MmQzLTk0NmEtY2Y0YmExMWI4YTVmXkEyXkFqcGc') ||
        u.includes('MV5BN2E1ZWI4YzEtMGEwNi00YmY0LThlMjEtMTM3N2NkZTk5Y2FkXkEyXkFqcGc') ||
        u.includes('MV5BMTQ4NTcyODc5MF5BMl5BanBnXkFtZTcwMjU2NzM2Nw');

      const safeImg = isBad(rawImg) ? 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop' : rawImg;
      const safeBdr = isBad(rawBdr) ? safeImg : rawBdr;

      return {
        id: apiMovie.id,
        title: apiMovie.title,
        year: apiMovie.releaseYear,
        image: safeImg,
        backdrop: safeBdr,
        trailer: anyApi.trailer || anyApi.trailerUrl || null,
        genre: apiMovie.genre,
        rating: 8.8,
        durationSeconds: apiMovie.duration,
        durationString: anyApi.durationString || formatDuration(apiMovie.duration),
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
        contentType: isApiSeries ? 'series' : 'movie',
        seasonsCount: anyApi.seasonsCount || (isApiSeries ? 1 : undefined),
        episodesCount: anyApi.episodesCount || (anyApi.episodes ? anyApi.episodes.length : (isApiSeries ? 8 : undefined)),
        episodes: anyApi.episodes || [],
      };
    }

    return {
      id: 0,
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
    if (!source || !source.url) return;
    const url = source.url;

    // Route MediaFire URLs through /api/download to bypass MediaFire landing page and trigger direct binary download
    const downloadEndpoint = url.includes('mediafire.com')
      ? `/api/download?url=${encodeURIComponent(url)}`
      : url;

    const anchor = document.createElement('a');
    anchor.href = downloadEndpoint;
    anchor.download = downloadFileName(source);
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleWatch = async () => {
    if (view.sources.length === 0) return;
    setPreparingPlayback(true);

    let url = view.sources[0].url;
    let resume = 0;
    let subs: SubtitleTrack[] = [];

    // Resolve the delivery URL through the provider-agnostic API (spec §22).
    try {
      const playRes = await fetch(`/api/movies/${id}/play`);
      if (playRes.ok) {
        const playJson = await playRes.json();
        const resolvedUrl = playJson?.data?.url;
        if (typeof resolvedUrl === 'string' && /^https?:\/\//i.test(resolvedUrl)) {
          url = resolvedUrl;
        }
      }
    } catch {
      // Fall back to the legacy source already in the catalog.
    }

    // Subtitles + continue-watching resume are best-effort.
    try {
      const [subsRes, historyRes] = await Promise.all([
        fetch(`/api/movies/${id}/subtitles`),
        fetch('/api/watch-history'),
      ]);
      if (subsRes.ok) {
        const subsJson = await subsRes.json();
        subs = (subsJson?.data?.subtitles ?? []) as SubtitleTrack[];
      }
      if (historyRes.ok) {
        const historyJson = await historyRes.json();
        const entry = (historyJson?.data ?? []).find(
          (h: { movieId: string; positionSeconds: number; completed: boolean }) =>
            String(h.movieId) === String(id) && !h.completed
        );
        if (entry?.positionSeconds) resume = entry.positionSeconds;
      }
    } catch {
      // Non-critical — playback still works without resume or subtitles.
    }

    setSubtitleTracks(subs);
    setResumeSeconds(resume);
    setPlaybackSrc(url);
    setWatchSource(view.sources[0]);
    setPreparingPlayback(false);
    setIsPlayerOpen(true);
  };

  // Persist progress sparingly (the player already throttles to ~5s).
  const handleProgress = useCallback(
    (positionSeconds: number, durationSeconds: number) => {
      if (!durationSeconds) return;
      void fetch('/api/watch-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: String(id),
          positionSeconds: Math.round(positionSeconds),
          durationSeconds: Math.round(durationSeconds),
          completed: positionSeconds / durationSeconds > 0.95,
        }),
      }).catch(() => {});
    },
    [id]
  );

  const handlePlayEpisode = (ep: Episode) => {
    setSelectedEpisode(ep);
    const src =
      ep.directStreamUrl ||
      (ep.youtubeId ? `https://www.youtube.com/watch?v=${ep.youtubeId}` : view.sources[0]?.url);
    const epSource: VideoSource = { label: ep.quality || '1080p FHD', url: src };
    setWatchSource(epSource);
    setPlaybackSrc(src);
    setResumeSeconds(0);
    setIsPlayerOpen(true);
  };

  const handleDownload = () => {
    // If it's a series with episodes, open the dedicated episodes download list modal
    if (view.episodes && view.episodes.length > 0) {
      setIsSeriesDownloadModalOpen(true);
      return;
    }

    if (view.sources.length === 1) {
      triggerDownload(view.sources[0]);
      return;
    }
    if (view.sources.length > 1) {
      setIsDownloadOpen((open) => !open);
      return;
    }
    if (apiMovie?.fileUrl) {
      triggerDownload({ label: '1080p FHD', url: apiMovie.fileUrl });
    }
  };

  const handleFavoriteToggle = () => {
    if (staticMovie) {
      toggleFavorite(staticMovie);
    } else if (apiMovie) {
      const mockAsMovie: Movie = {
        id: Number(apiMovie.id) || Date.now(),
        title: apiMovie.title,
        year: apiMovie.releaseYear || 2025,
        genre: apiMovie.genre,
        rating: 8.8,
        image: apiMovie.thumbnailUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900',
        narrator: apiMovie.narrator,
      };
      toggleFavorite(mockAsMovie);
    }
    setLikeCount((prev) => (isMovieFavorited ? prev - 1 : prev + 1));
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
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
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
                  {view.contentType === 'series' ? (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/50 text-purple-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-950/40">
                      <Tv className="w-3.5 h-3.5 text-purple-400" />
                      TV Series • Season {view.seasonsCount || 1} ({view.episodesCount || view.episodes?.length || 8} Episodes)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-black uppercase tracking-wider flex items-center gap-1">
                      <Film className="w-3.5 h-3.5" />
                      Feature Film
                    </span>
                  )}
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

                {/* Rating Stars Interactive Widget */}
                <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
                  <div className="bg-zinc-900/80 px-4 py-2 rounded-2xl border border-zinc-800">
                    <RatingStars movieId={view.id} initialRating={view.rating || 8.5} />
                  </div>
                </div>

                {/* Main Action CTAs */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleWatch}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold text-base shadow-xl shadow-primary/30 transition-all touch-manipulation"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Watch Online</span>
                  </motion.button>

                  <div className="relative inline-flex">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-base border border-zinc-700 transition-all hover:scale-105 touch-manipulation shadow-lg"
                    >
                      <Download className="w-5 h-5 text-primary" />
                      <span>
                        {view.episodes && view.episodes.length > 0
                          ? `Download Episodes (${view.episodes.length})`
                          : 'Download'}
                      </span>
                    </button>

                    {isDownloadOpen && view.sources.length > 1 && (
                      <div className="absolute top-full mt-2 left-0 z-30 min-w-56 bg-zinc-900 border border-zinc-700 rounded-2xl p-2 shadow-2xl space-y-1">
                        <p className="px-3 py-1.5 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                          Select quality to download
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
                            <span className="flex flex-col">
                              <span>{source.label}</span>
                              <span className="text-[11px] font-normal text-zinc-500">
                                ~{estimateSizeLabel(source.label, view.durationSeconds)}
                              </span>
                            </span>
                            <Download className="w-4 h-4 text-primary" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {view.trailer && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const trUrl = view.trailer!;
                        setPlaybackSrc(trUrl);
                        setWatchSource({ label: 'Trailer', url: trUrl });
                        setResumeSeconds(0);
                        setIsPlayerOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 font-bold text-sm border border-amber-500/30 transition-all hover:scale-105 touch-manipulation shadow-lg shadow-amber-950/20"
                    >
                      <Film className="w-4 h-4 text-amber-400" />
                      <span>Watch Trailer</span>
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFavoriteToggle}
                    className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all border touch-manipulation ${
                      isMovieFavorited
                        ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30'
                        : 'bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isMovieFavorited ? 'fill-current' : ''}`} />
                    <span>{isMovieFavorited ? 'Saved in Watchlist' : 'Add to Favorites'}</span>
                  </motion.button>

                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    <span className="text-xs font-semibold">{copied ? 'Copied' : 'Share'}</span>
                  </button>

                  {/* OPTIONAL SUPPORT BUTTON */}
                  <button
                    onClick={() => setIsSupportModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500/20 via-primary/20 to-amber-500/20 hover:from-rose-500/30 hover:to-amber-500/30 text-rose-300 hover:text-white font-bold text-sm border border-rose-500/40 transition-all hover:scale-105 touch-manipulation shadow-md"
                    title="FiestaFlix is 100% Free! Support server costs optionally"
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-current animate-pulse" />
                    <span>Support (Optional)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 100% FREE & OPTIONAL SUPPORT BANNER */}
        <div className="container mx-auto px-4 sm:px-6 my-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                  <span>100% Free Cinema (Ku Buntu)</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                    No Subscription
                  </span>
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Enjoying &ldquo;{view.title}&rdquo;? All 4K streams and downloads are free forever. If you want to help keep our cloud servers fast, you can optionally support us via MTN MoMo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsSupportModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Support Optionally</span>
              </button>
              <Link
                href="/support"
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs border border-zinc-700 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* SERIES SEASONS & EPISODES EXPLORER */}
        {view.contentType === 'series' && view.episodes && view.episodes.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 my-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-purple-500/30 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-black text-purple-400 uppercase tracking-wider mb-1">
                    <Tv className="w-4 h-4" />
                    Episodic Releases
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Seasons & Episodes ({view.episodes.length} Available)
                  </h3>
                </div>

                {view.seasonsCount && view.seasonsCount > 1 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-400 font-semibold mr-1">Season:</span>
                    {Array.from({ length: view.seasonsCount }, (_, i) => i + 1).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setActiveSeason(s)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activeSeason === s
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Season {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Episodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {view.episodes
                  .filter((ep) => !view.seasonsCount || view.seasonsCount <= 1 || ep.seasonNumber === activeSeason)
                  .map((ep) => {
                    const isPlayingThis = selectedEpisode?.id === ep.id;
                    const mediaLink = ep.directStreamUrl || ep.videoUrl || ep.downloadUrl;
                    return (
                      <div
                        key={ep.id}
                        onClick={() => handlePlayEpisode(ep)}
                        className={`group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isPlayingThis
                            ? 'bg-purple-950/40 border-purple-500 shadow-xl shadow-purple-500/20'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-purple-500/40 hover:bg-zinc-900'
                        }`}
                      >
                        <div>
                          <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-950">
                            <img
                              src={ep.thumbnail || view.image || ''}
                              alt={ep.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur text-[10px] font-black uppercase text-purple-300 border border-purple-500/30">
                              EP {ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : ep.episodeNumber}
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur text-[10px] font-semibold text-zinc-300">
                              {ep.duration || '45m'}
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                                <Play className="w-4 h-4 fill-white translate-x-0.5" />
                              </span>
                            </div>
                          </div>

                          <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors line-clamp-1 mb-1">
                            {ep.title}
                          </h4>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                            {ep.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                            <Volume2 className="w-3 h-3" />
                            {ep.narrator || view.narrator}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {mediaLink && (
                              <a
                                href={mediaLink.includes('mediafire.com') ? `/api/download?url=${encodeURIComponent(mediaLink)}` : mediaLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-[11px] font-bold transition-colors flex items-center gap-1 border border-zinc-700"
                                title="Direct download video file"
                              >
                                <Download className="w-3 h-3 text-primary" />
                                <span>Download</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayEpisode(ep);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-primary hover:bg-orange-500 text-white text-[11px] font-black transition-colors flex items-center gap-1 shadow"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Play</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* SPONSORED VIDEO PLAYER BANNER */}
        <div className="container mx-auto px-4 sm:px-6">
          <AdBanner placement="VIDEO_PLAYER_BANNER" dismissible />
        </div>

        {/* PROMINENT TELEGRAM DOWNLOAD HUB */}
        <div className="container mx-auto px-4 sm:px-6">
          <TelegramDownloadHub
            movieId={view.id}
            movieTitle={view.title}
            quality={view.quality}
            fileSize={view.fileSize}
            channelPostUrl={view.telegramChannelPost}
            botLink={view.telegramBotLink}
          />
        </div>

        {/* MODERN AUDIENCE RATING SYSTEM */}
        <div className="container mx-auto px-4 sm:px-6 my-6">
          <ModernRatingSystem
            movieId={view.id}
            initialRating={view.rating || 8.8}
            voteCount={1420}
          />
        </div>

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

        {/* Video Player Modal (Optimized for Mobile and Desktop) */}
        {isPlayerOpen && watchSource && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-6 backdrop-blur animate-fadeIn"
            onClick={() => setIsPlayerOpen(false)}
          >
            <div
              className="bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3.5 sm:p-5 flex items-center justify-between border-b border-zinc-800 gap-4">
                <div className="flex items-center gap-2 sm:gap-3 truncate">
                  <Play className="w-5 h-5 text-primary shrink-0" />
                  <h3 className="text-sm sm:text-lg font-bold text-white truncate">
                    {selectedEpisode ? (
                      <>
                        <span className="text-primary">{selectedEpisode.title}</span> — {view.title}
                      </>
                    ) : (
                      view.title
                    )}{' '}
                    <span className="text-xs font-normal text-zinc-400">({watchSource.label})</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlayerOpen(false)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Close video player"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative aspect-video bg-black w-full">
                {preparingPlayback && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
                    <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  </div>
                )}
                {playbackSrc && (
                  <FiestaVideoPlayer
                    src={playbackSrc}
                    poster={view.backdrop || view.image || undefined}
                    subtitles={subtitleTracks}
                    startPositionSeconds={resumeSeconds}
                    onProgress={handleProgress}
                  />
                )}
              </div>

              <div className="p-3 sm:p-5 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-200">Quality:</span>
                  {view.sources.map((source) => (
                    <button
                      key={source.label}
                      onClick={() => {
                        setWatchSource(source);
                        setPlaybackSrc(source.url);
                        setResumeSeconds(0);
                      }}
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
                  {view.sources.length > 1 && (
                    <button
                      type="button"
                      title={DATA_SAVER_TIP}
                      onClick={() => {
                        const lowest = view.sources[view.sources.length - 1];
                        setWatchSource(lowest);
                        setPlaybackSrc(lowest.url);
                        setResumeSeconds(0);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      Data Saver
                    </button>
                  )}
                  <a
                    href={view.telegramChannelPost}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Watch in Telegram app</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SERIES EPISODES DOWNLOAD MODAL */}
      {isSeriesDownloadModalOpen && view.episodes && view.episodes.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsSeriesDownloadModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[88vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-start justify-between gap-4 bg-zinc-900/60">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-black text-white">
                    Download {view.title} Episodes
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Select an episode to download directly ({view.episodes.length} episodes available)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSeriesDownloadModalOpen(false)}
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controls Bar */}
            <div className="p-3 sm:px-6 bg-zinc-900/40 border-b border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {view.seasonsCount && view.seasonsCount > 1 ? (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-bold text-zinc-400 mr-1">Season:</span>
                  {Array.from({ length: view.seasonsCount }, (_, i) => i + 1).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setActiveSeason(s)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        activeSeason === s
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Season {s}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <span>✓</span> High-Speed MediaFire Direct Links
                </span>
              )}

              {/* Copy all links button */}
              <button
                type="button"
                onClick={() => {
                  const links = view.episodes!
                    .map((ep) => `${ep.title}: ${ep.downloadUrl || ep.videoUrl || ep.directStreamUrl}`)
                    .join('\n');
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(links);
                    setAllCopied(true);
                    setTimeout(() => setAllCopied(false), 2500);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-zinc-700 shrink-0"
              >
                {allCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-primary" />}
                <span>{allCopied ? 'All Links Copied!' : 'Copy All Links'}</span>
              </button>
            </div>

            {/* Scrollable Episodes List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-2.5 divide-y divide-zinc-800/50">
              {view.episodes
                .filter((ep) => !view.seasonsCount || view.seasonsCount <= 1 || ep.seasonNumber === activeSeason)
                .map((ep) => {
                  const mediaLink = ep.downloadUrl || ep.videoUrl || ep.directStreamUrl;
                  return (
                    <div
                      key={ep.id}
                      className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-zinc-900/60 transition-colors border border-transparent hover:border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-black text-xs flex items-center justify-center shrink-0">
                          {ep.episodeNumber < 10 ? `E0${ep.episodeNumber}` : `E${ep.episodeNumber}`}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-snug">
                            {ep.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span>Season {ep.seasonNumber}</span>
                            <span>•</span>
                            <span>{ep.duration || '45m'}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-medium">Agasobanuye: {ep.narrator || view.narrator}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSeriesDownloadModalOpen(false);
                            handlePlayEpisode(ep);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1.5 border border-zinc-700"
                        >
                          <Play className="w-3.5 h-3.5 text-primary" />
                          <span>Stream</span>
                        </button>

                        {mediaLink && (
                          <a
                            href={mediaLink.includes('mediafire.com') ? `/api/download?url=${encodeURIComponent(mediaLink)}` : mediaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 hover:scale-105"
                            title="Direct download file immediately"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Direct Download</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* OPTIONAL SUPPORT MODAL */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      <Footer />
    </div>
  );
}
