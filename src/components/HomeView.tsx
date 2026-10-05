import Link from 'next/link';
import { ArrowRight, Download, Wifi, Clapperboard } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import CTA from '@/components/CTA';
import HomeFaqSection from '@/components/HomeFaqSection';
import HomeNewsSection from '@/components/HomeNewsSection';
import AdBanner from '@/components/AdBanner';
import MovieRail from '@/components/MovieRail';
import TrendingShowcase from '@/components/TrendingShowcase';
import type { Movie } from '@/lib/movieData';
import { topInterpreters, formatFollowers } from '@/lib/interpreters';

interface HomeViewProps {
  trendingMovies: Movie[];
  popularMovies: Movie[];
  tvShows: Movie[];
}

export default function HomeView({ trendingMovies, popularMovies, tvShows }: HomeViewProps) {
  const interpreters = topInterpreters(10);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-20 md:pb-0">
      <Header />
      <div className="pt-16">
        <AdBanner placement="HEADER_BANNER" dismissible />
      </div>

      <main className="flex-1">
        <Hero />

        {trendingMovies.length > 0 && <TrendingShowcase movies={trendingMovies} />}

        <MovieRail
          title="🔥 Trending now"
          subtitle="Agasobanuye everyone is watching"
          movies={trendingMovies}
          href="/movies"
        />

        {/* Top interpreters — the star of the platform */}
        <section className="container-tight py-6">
          <div className="section-title">
            <div>
              <h2 className="text-lg font-bold tracking-tight">👑 Top interpreters</h2>
              <p className="mt-0.5 text-xs text-muted">Follow the voices behind Agasobanuye</p>
            </div>
            <Link
              href="/interpreters"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-foreground"
            >
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {interpreters.map((i) => (
              <Link
                key={i.id}
                href={`/interpreters/${i.slug}`}
                className="card-surface w-40 shrink-0 p-4 text-center transition-all hover:border-primary/30 sm:w-44"
              >
                <div className="mx-auto h-20 w-20 overflow-hidden rounded-2xl bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={i.image}
                    alt={i.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-3 truncate text-sm font-bold">{i.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted">{i.tags.join(' · ')}</p>
                <p className="mt-1.5 text-[11px] font-semibold text-primary">
                  {formatFollowers(i.followers)} followers
                </p>
              </Link>
            ))}
          </div>
        </section>

        <MovieRail
          title="🎬 All-time popular"
          subtitle="Timeless Rwandan favourites"
          movies={popularMovies}
          href="/movies"
        />

        {/* Rwanda Cinema */}
        <section className="container-tight py-6">
          <Link
            href="/rwandan-movies"
            className="card-surface group flex flex-col items-start gap-6 overflow-hidden p-8 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="max-w-xl">
              <span className="eyebrow">🇷🇼 Rwanda Cinema</span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Films that are uniquely ours
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Foreign titles are everywhere — Rwandan cinema is where our identity lives. Movies,
                short films, documentaries, classics and Fiesta Flix Originals.
              </p>
            </div>
            <span className="btn-ghost shrink-0 group-hover:border-primary/40">
              <Clapperboard className="h-4 w-4" />
              Explore Rwanda Cinema
            </span>
          </Link>
        </section>

        {/* Sponsored Interstitial Ad Banner */}
        <section className="container-tight py-4">
          <AdBanner placement="HOME_INTERSTITIAL" dismissible />
        </section>

        <MovieRail title="📺 Series" subtitle="Binge the full season" movies={tvShows} href="/movies" />

        {/* Offline / Data saver strip */}
        <section className="container-tight py-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-surface flex items-start gap-4 p-6">
              <Download className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-bold">Downloads are first-class</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Pick a quality, see the exact size, and save for offline viewing — built for how
                  Rwanda actually watches.
                </p>
              </div>
            </div>
            <div className="card-surface flex items-start gap-4 p-6">
              <Wifi className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-bold">Data Saver</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Slow connection? Drop to 480p in one tap and use roughly a quarter of the data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Cinema News & Blogs Section */}
        <HomeNewsSection />

        {/* Frequently Asked Questions Section */}
        <HomeFaqSection />

        <CTA />
      </main>

      <Footer />
    </div>
  );
}
