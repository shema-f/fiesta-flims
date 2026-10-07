'use client';

import { useMemo, useState } from 'react';
import { BadgeCheck, MapPin, Star, Calendar, Languages as LangIcon, MessageSquare } from 'lucide-react';
import type { Movie } from '@/lib/movieData';
import type { Interpreter } from '@/lib/interpreters';
import { formatFollowers } from '@/lib/interpreters';
import MovieTile from '@/components/MovieTile';
import FollowButton from '@/components/interpreter/FollowButton';

interface InterpreterProfileProps {
  interpreter: Interpreter;
  movies: Movie[];
}

type Tab = 'movies' | 'latest' | 'top' | 'watched' | 'reviews';

const TABS: { id: Tab; label: string }[] = [
  { id: 'movies', label: 'Movies' },
  { id: 'latest', label: 'Latest' },
  { id: 'top', label: 'Top rated' },
  { id: 'watched', label: 'Most watched' },
  { id: 'reviews', label: 'Reviews' },
];

const REVIEWS = [
  { user: 'Aline M.', text: 'Nobody translates action the way this voice does. Instant watch.', stars: 5 },
  { user: 'Eric N.', text: 'The humour lands every single time — my whole family watches.', stars: 5 },
  { user: 'Diane U.', text: 'Audio quality and delivery are consistently excellent.', stars: 4 },
];

export default function InterpreterProfile({ interpreter, movies }: InterpreterProfileProps) {
  const [tab, setTab] = useState<Tab>('movies');

  const list = useMemo(() => {
    switch (tab) {
      case 'latest':
        return [...movies].sort((a, b) => b.year - a.year);
      case 'top':
        return [...movies].sort((a, b) => b.rating - a.rating);
      case 'watched':
        return [...movies].sort((a, b) => b.rating - a.rating || b.year - a.year);
      default:
        return movies;
    }
  }, [movies, tab]);

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="container-tight py-12">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-white/[0.08] bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={interpreter.image}
                alt={interpreter.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{interpreter.name}</h1>
                {interpreter.official && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-primary">
                    <BadgeCheck className="h-3.5 w-3.5" /> Official
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {interpreter.rating.toFixed(1)}
                </span>
                <span className="font-semibold text-primary">
                  {movies.length > 0 ? `${movies.length} movies in catalog` : `${interpreter.moviesCount}+ career dubs`}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-zinc-300">
                  Total Platform: {interpreter.totalPlatformMovies || 138} Movies ({interpreter.totalPlatformEpisodes || 616} Eps)
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {interpreter.city}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Since {interpreter.joinedYear}
                </span>
                <span className="inline-flex items-center gap-1">
                  <LangIcon className="h-3.5 w-3.5" /> {interpreter.languages.join(', ')}
                </span>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{interpreter.bio}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {interpreter.specialties.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <FollowButton slug={interpreter.slug} initialFollowers={interpreter.followers} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container-tight py-8">
        <div className="no-scrollbar mb-8 flex gap-1 overflow-x-auto border-b border-white/[0.06]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.id ? 'text-foreground' : 'text-muted hover:text-foreground'
              }`}
            >
              {t.label}
              {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>

        {tab === 'reviews' ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {REVIEWS.map((r) => (
              <div key={r.user} className="card-surface p-5">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{r.user}</span>
                  <span className="ml-auto text-xs text-amber-400">{'★'.repeat(r.stars)}</span>
                </div>
                <p className="text-sm text-muted">{r.text}</p>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">
            No titles catalogued for {interpreter.name} yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {list.map((movie) => (
              <MovieTile key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted">
          {formatFollowers(interpreter.followers)} people follow {interpreter.name} on Fiesta Flix.
        </p>
      </div>
    </div>
  );
}
