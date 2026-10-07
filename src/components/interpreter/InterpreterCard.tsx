import Link from 'next/link';
import { Star, BadgeCheck } from 'lucide-react';
import type { Interpreter } from '@/lib/interpreters';
import { formatFollowers } from '@/lib/interpreters';

export default function InterpreterCard({ interpreter }: { interpreter: Interpreter }) {
  return (
    <Link
      href={`/interpreters/${interpreter.slug}`}
      className="card-surface group flex items-center gap-4 p-4 transition-all hover:border-primary/30 hover:bg-surface"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={interpreter.image}
          alt={interpreter.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-sm font-bold">{interpreter.name}</h3>
          {interpreter.official && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />}
        </div>
        <p className="mt-1 truncate text-xs text-muted">{interpreter.tags.join(' · ')}</p>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1 text-amber-400">
            <Star className="h-3 w-3 fill-amber-400" />
            {interpreter.rating.toFixed(1)}
          </span>
          <span className="font-semibold text-zinc-300">
            {formatFollowers(interpreter.followers)} followers
          </span>
          {interpreter.catalogMoviesCount > 0 ? (
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {interpreter.catalogMoviesCount} in catalog
            </span>
          ) : (
            <span className="text-[10px] text-zinc-500">{interpreter.moviesCount}+ dubs</span>
          )}
        </div>
      </div>
    </Link>
  );
}
