'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Play, Star, Clapperboard, Film } from 'lucide-react';
import type { Movie } from '@/lib/movieData';

/** How long each featured slide stays on screen. */
const SLIDE_MS = 7000;
const FALLBACK_POSTER = '/fallback-poster.png';

interface HeroProps {
  movies: Movie[];
}

/** Poster image with a local fallback so a dead CDN never leaves a hole. */
function Poster({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [current, setCurrent] = useState(src || FALLBACK_POSTER);

  useEffect(() => {
    setCurrent(src || FALLBACK_POSTER);
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setCurrent(FALLBACK_POSTER)}
      className={className}
    />
  );
}

function primaryGenre(movie: Movie): string {
  return (movie.genre || 'Drama').split(',')[0].trim();
}

function summary(movie: Movie): string {
  if (movie.description && movie.description.trim()) return movie.description;
  return `${movie.title} (${movie.year}) — ${primaryGenre(movie)}${
    movie.narrator ? `, narrated in Kinyarwanda by ${movie.narrator}` : ''
  }. Stream free on Fiesta Flix.`;
}

/**
 * Featured hero — a rotating showcase of the trending catalogue.
 *
 * Layout mirrors the reference design: badges + title + synopsis + CTAs on the
 * left, a stack of overlapping posters on the right, and a row of progress-bar
 * tabs underneath that double as slide navigation.
 */
export default function Hero({ movies }: HeroProps) {
  const slides = useMemo(
    () => (movies || []).filter((m) => m && m.title).slice(0, 5),
    [movies]
  );

  const [index, setIndex] = useState(0);
  const safeIndex = slides.length > 0 ? ((index % slides.length) + slides.length) % slides.length : 0;

  // Auto-rotate. Reset whenever the active slide changes so a manual click
  // restarts the countdown instead of firing the previous timer.
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setTimeout(() => setIndex((i) => i + 1), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [safeIndex, slides.length]);

  if (slides.length === 0) return null;

  const active = slides[safeIndex];
  const previous = slides[(safeIndex - 1 + slides.length) % slides.length];
  const next = slides[(safeIndex + 1) % slides.length];
  const showSides = slides.length > 1;
  const rating = Number(active.rating ?? 0);
  const typeLabel = active.contentType === 'series' ? 'Series' : 'Movie';

  const trailerHref = active.trailer && active.trailer.includes('youtu') ? active.trailer : null;

  return (
    <section className="relative overflow-hidden border-b border-white/[0.08]">
      {/* Ambient backdrop: the active title's artwork, heavily blurred and dimmed. */}
      <div className="absolute inset-0 -z-30 bg-background" />
      <div key={`bg-${active.id}`} className="absolute inset-0 -z-20 animate-fadeIn">
        <Poster
          src={active.backdrop || active.image}
          alt=""
          className="h-full w-full scale-110 object-cover opacity-30 blur-2xl"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/92 to-background/40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-background/75" />
      <div className="pointer-events-none absolute top-1/4 left-1/3 -z-10 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-primary/15 blur-[150px]" />

      <div className="container-tight relative z-10 grid gap-10 pb-6 pt-28 sm:pt-36 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-6 lg:pb-10">
        {/* ---------------------------------------------------------- Left */}
        <div key={`copy-${active.id}`} className="animate-fadeInUp">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-glow">
              Featured
            </span>
            <span className="rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-200 backdrop-blur">
              {primaryGenre(active)}
            </span>
            <span className="rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300 backdrop-blur">
              {typeLabel}
            </span>
          </div>

          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
            {active.title}
          </h1>

          <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 backdrop-blur">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-primary">
              <Star className="h-3.5 w-3.5 fill-current" />
            </span>
            <span className="text-xs font-black text-white">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
            <span className="h-3 w-px bg-white/15" />
            <span className="text-xs font-medium text-muted">
              {active.narrator ? `${active.narrator} voice` : 'Kinyarwanda narration'}
            </span>
          </div>

          <p className="mt-4 line-clamp-4 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            {summary(active)}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={`/movies/${active.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-glow transition-all hover:scale-105 hover:brightness-110"
            >
              <Play className="h-4 w-4 fill-current" />
              Watch Now
            </Link>

            {trailerHref ? (
              <a
                href={trailerHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10"
              >
                <Film className="h-4 w-4 text-primary" />
                Trailer
              </a>
            ) : (
              <Link
                href={`/movies/${active.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10"
              >
                <Clapperboard className="h-4 w-4 text-primary" />
                Trailer
              </Link>
            )}
          </div>
        </div>

        {/* --------------------------------------------------------- Right */}
        <div className="relative mx-auto w-full max-w-[440px] animate-fadeIn">
          {showSides && (
            <>
              <div className="absolute -left-4 top-16 z-0 w-[44%] -rotate-[10deg] overflow-hidden rounded-2xl border border-white/10 opacity-25 sm:-left-14">
                <Poster
                  src={previous.image}
                  alt={previous.title}
                  className="aspect-[2/3] w-full object-cover"
                />
              </div>
              <div className="absolute -right-4 top-16 z-0 w-[44%] rotate-[10deg] overflow-hidden rounded-2xl border border-white/10 opacity-35 sm:-right-14">
                <Poster
                  src={next.image}
                  alt={next.title}
                  className="aspect-[2/3] w-full object-cover"
                />
              </div>
            </>
          )}

          <div className="relative z-10 mx-auto w-[66%] overflow-hidden rounded-3xl border border-white/15 shadow-[0_40px_90px_-25px_rgba(0,0,0,0.95)] ring-1 ring-white/10">
            <Poster
              src={active.image}
              alt={active.title}
              className="aspect-[2/3] w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------- Progress-bar slide tabs */}
      <div className="container-tight relative z-10 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {slides.map((movie, i) => {
            const isActive = i === safeIndex;
            const isPast = i < safeIndex;
            return (
              <button
                key={movie.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${movie.title}`}
                aria-current={isActive}
                className="group text-left focus:outline-none"
              >
                <span className="block h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                  <span
                    className={`block h-full rounded-full transition-colors ${
                      isActive ? 'bg-primary' : isPast ? 'bg-primary/40' : 'bg-white/25'
                    }`}
                    style={isActive ? { animation: `heroProgress ${SLIDE_MS}ms linear forwards` } : undefined}
                  />
                </span>
                <span
                  className={`mt-2.5 block truncate text-xs font-semibold transition-colors ${
                    isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                >
                  {movie.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
