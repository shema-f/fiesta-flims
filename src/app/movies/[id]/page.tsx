'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogMovieCard from '@/components/CatalogMovieCard';
import { movieData } from '@/lib/movieData';
import type { ApiMovie } from '@/lib/apiTypes';

type LoadStatus = 'loading' | 'ready' | 'error' | 'notfound';

interface VideoSource {
  label: string;
  url: string;
}

interface MovieView {
  title: string;
  year: number | null;
  image: string | null;
  genre: string;
  rating: number | null;
  durationSeconds: number;
  narrator: string;
  description: string;
  views: number | null;
  sources: VideoSource[];
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

/**
 * Flatten the Prisma `resolutions` JSON ({ "720p": "url", ... }) into a
 * list of playable sources, falling back to `fileUrl` when empty.
 * Sorted highest quality first.
 */
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
  'Experience this amazing movie with fantastic Kinyarwanda narration. Stream in HD quality or download for offline viewing.';

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
  const [likeCount, setLikeCount] = useState(1234);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [watchSource, setWatchSource] = useState<VideoSource | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

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
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch movie');
      }
      setApiMovie(json.data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [id, staticMovie]);

  useEffect(() => {
    loadMovie();
  }, [loadMovie]);

  // For database-backed movies, fetch a few other titles for the "More Movies" row.
  useEffect(() => {
    if (status !== 'ready' || staticMovie || !apiMovie) return;
    let cancelled = false;
    fetch('/api/movies', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.success && Array.isArray(json.data)) {
          setRelated(
            json.data
              .filter((m: ApiMovie) => m.id !== apiMovie.id)
              .slice(0, 5)
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status, staticMovie, apiMovie]);

  // Close the player with Escape.
  useEffect(() => {
    if (!isPlayerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPlayerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlayerOpen]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted">Loading movie...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center py-20">
            <div className="text-6xl mb-4">📡</div>
            <h1 className="text-2xl font-bold mb-2">Couldn&apos;t load this movie</h1>
            <p className="text-muted mb-6">
              Something went wrong while fetching movie details.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={loadMovie}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-bold hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                Retry
              </button>
              <Link href="/movies" className="text-primary hover:underline font-medium">
                Browse all movies
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'notfound' || (!staticMovie && !apiMovie)) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-3xl font-bold mb-4">Movie not found</h1>
            <Link href="/movies" className="text-primary hover:underline">
              Browse all movies
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const view: MovieView = staticMovie
    ? {
        title: staticMovie.title,
        year: staticMovie.year,
        image: staticMovie.image,
        genre: staticMovie.genre,
        rating: staticMovie.rating,
        durationSeconds: 125 * 60,
        narrator: staticMovie.narrator || 'Rocky Kimomo',
        description: DEFAULT_DESCRIPTION,
        views: null,
        sources: [],
      }
    : {
        title: apiMovie!.title,
        year: apiMovie!.releaseYear,
        image: apiMovie!.thumbnailUrl,
        genre: apiMovie!.genre,
        rating: null,
        durationSeconds: apiMovie!.duration,
        narrator: apiMovie!.narrator,
        description: apiMovie!.description || DEFAULT_DESCRIPTION,
        views: apiMovie!.views,
        sources: parseSources(apiMovie!.fileUrl, apiMovie!.resolutions),
      };

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
    if (view.sources.length === 0) {
      alert(`Streaming "${view.title}" is not available yet.`);
      return;
    }
    setWatchSource(view.sources[0]);
    setIsPlayerOpen(true);
  };

  const handleDownload = () => {
    if (view.sources.length === 0) {
      alert(`Downloading "${view.title}" is not available yet.\n\nNote: In production, this would download the video with Fiesta Flix watermark.`);
      return;
    }
    if (view.sources.length === 1) {
      triggerDownload(view.sources[0]);
      return;
    }
    setIsDownloadOpen((open) => !open);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-16">
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="relative w-full h-[400px] md:h-[500px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={
                  view.image
                    ? {
                        backgroundImage: `url(${view.image})`,
                        filter: 'blur(20px) brightness(0.3)',
                      }
                    : {
                        background:
                          'linear-gradient(135deg, #1e293b 0%, #020617 100%)',
                      }
                }
              />
            </div>
          </div>

          <div className="container mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                <div className="relative w-64 mx-auto md:mx-0 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-950">
                  {view.image ? (
                    <img
                      src={view.image}
                      alt={view.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-white/20">
                      🎬
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{view.title}</h1>

                <div className="flex flex-wrap items-center gap-4 mb-6 text-muted">
                  <span className="text-lg">{view.year ?? '—'}</span>
                  <span>•</span>
                  <span className="text-lg">{view.genre}</span>
                  <span>•</span>
                  <span className="text-lg">{formatDuration(view.durationSeconds)}</span>
                  {view.rating !== null && (
                    <span className="flex items-center gap-1">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffe66d">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="font-bold text-white">{view.rating}</span>
                    </span>
                  )}
                  {view.views !== null && (
                    <span className="flex items-center gap-1 text-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                      {formatViews(view.views)} views
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-muted text-lg mb-2">Narrated by:</p>
                  <Link
                    href="/interpreters"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full text-primary font-semibold hover:bg-card/80 transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {view.narrator}
                  </Link>
                </div>

                <p className="text-lg text-muted mb-8 max-w-2xl">{view.description}</p>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleWatch}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-bold text-lg shadow-lg shadow-primary/40 hover:-translate-y-1 hover:shadow-xl transition-all"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Watch Now
                  </button>

                  <div className="relative inline-flex">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 text-white font-bold text-lg border border-white/20 hover:bg-white/20 hover:-translate-y-1 transition-all"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download
                    </button>

                    {isDownloadOpen && view.sources.length > 1 && (
                      <>
                        <button
                          aria-label="Close download menu"
                          className="fixed inset-0 z-10 cursor-default"
                          onClick={() => setIsDownloadOpen(false)}
                        />
                        <div className="absolute bottom-full mb-2 left-0 z-20 min-w-52 bg-card border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                          <p className="px-4 py-2 text-xs text-muted border-b border-white/10">
                            Choose quality
                          </p>
                          {view.sources.map((source) => (
                            <a
                              key={source.label}
                              href={source.url}
                              download={downloadFileName(source)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsDownloadOpen(false)}
                              className="block px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors"
                            >
                              {source.label === 'Default' ? 'Original' : source.label}
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleLike}
                    className={`inline-flex items-center gap-2 px-6 py-4 rounded-full font-bold text-lg transition-all ${
                      isLiked
                        ? 'bg-primary text-white'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {likeCount.toLocaleString()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold mb-8">More Movies</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {staticMovie
                ? movieData
                    .filter((m) => m.id !== staticId)
                    .slice(0, 5)
                    .map((m) => (
                      <Link key={m.id} href={`/movies/${m.id}`} className="group">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3">
                          <img
                            src={m.image}
                            alt={m.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <h3 className="font-semibold truncate">{m.title}</h3>
                        <p className="text-sm text-muted">{m.year} • {m.genre}</p>
                      </Link>
                    ))
                : related.map((m) => (
                    <CatalogMovieCard key={m.id} movie={m} />
                  ))}
            </div>
          </div>
        </section>
        {isPlayerOpen && watchSource && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsPlayerOpen(false)}
          >
            <div
              className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 gap-4">
                  <h2 className="text-xl font-bold truncate">{view.title}</h2>
                  <button
                    onClick={() => setIsPlayerOpen(false)}
                    aria-label="Close player"
                    className="w-10 h-10 flex-shrink-0 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-xl"
                  >
                    ×
                  </button>
                </div>

                <video
                  key={watchSource.url}
                  src={watchSource.url}
                  poster={view.image ?? undefined}
                  controls
                  autoPlay
                  playsInline
                  className="w-full aspect-video rounded-xl bg-black"
                />

                {view.sources.length > 1 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {view.sources.map((source) => (
                      <button
                        key={source.label}
                        onClick={() => setWatchSource(source)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                          source.url === watchSource.url
                            ? 'bg-gradient-to-r from-primary to-orange-400 text-white'
                            : 'bg-white/10 text-muted hover:bg-white/20 hover:text-foreground'
                        }`}
                      >
                        {source.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
