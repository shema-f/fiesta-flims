'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Play, Download, Star, Film, Clapperboard } from 'lucide-react';

interface RwandaTitle {
  id: number;
  title: string;
  year: number;
  genre: string;
  rating: number;
  narrator: string;
  type: 'Movie' | 'Series' | 'Short Film' | 'Documentary' | 'Classic';
  image: string;
  description: string;
  minutes: number;
  original?: boolean;
}

const titles: RwandaTitle[] = [
  { id: 101, title: 'Karahanyuze: The Beginning', year: 2024, genre: 'Drama', rating: 9.2, narrator: 'Rocky', type: 'Movie', minutes: 125, description: 'A powerful story of Rwandan culture and tradition.', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop' },
  { id: 102, title: 'Urukundo: Love Story', year: 2023, genre: 'Romance', rating: 8.8, narrator: 'Junior Giti', type: 'Movie', minutes: 115, description: 'A beautiful love story set in the heart of Rwanda.', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=900&auto=format&fit=crop' },
  { id: 103, title: 'Umurage: Legacy', year: 2024, genre: 'Action', rating: 9.0, narrator: 'Sankara', type: 'Movie', minutes: 135, description: 'An epic tale of Rwandan history and heritage.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=900&auto=format&fit=crop' },
  { id: 104, title: 'Ibanga: The Secret', year: 2023, genre: 'Thriller', rating: 8.7, narrator: 'Gaheza', type: 'Series', minutes: 110, description: 'A gripping mystery set in contemporary Rwanda.', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop' },
  { id: 105, title: 'Amakuru: News from Home', year: 2024, genre: 'Comedy', rating: 8.5, narrator: 'Yanga', type: 'Movie', minutes: 105, description: 'A heartwarming comedy about Rwandan family life.', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=900&auto=format&fit=crop' },
  { id: 106, title: 'Intore: The Warriors', year: 2023, genre: 'Adventure', rating: 9.1, narrator: 'Rocky', type: 'Series', minutes: 140, description: 'Epic story of Rwandan warriors and their courage.', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=900&auto=format&fit=crop' },
  { id: 107, title: 'Nyampinga: The Queen', year: 2024, genre: 'Drama', rating: 8.9, narrator: 'B The Great', type: 'Movie', minutes: 130, description: 'The inspiring story of Rwandan royalty.', image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=900&auto=format&fit=crop' },
  { id: 108, title: 'Icyumba: The Hut', year: 2023, genre: 'Drama', rating: 8.6, narrator: 'Savimbi', type: 'Classic', minutes: 118, description: 'A beautiful portrayal of traditional Rwandan life.', image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=900&auto=format&fit=crop' },
  { id: 109, title: 'Umwijima: The Dark', year: 2025, genre: 'Thriller', rating: 8.4, narrator: 'Rocky', type: 'Short Film', minutes: 28, description: 'A Fiesta Flix Original short about a night in Kigali.', image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=900&auto=format&fit=crop', original: true },
  { id: 110, title: 'The Kigali Files', year: 2025, genre: 'Crime', rating: 8.8, narrator: 'Sankara', type: 'Short Film', minutes: 22, description: 'A Fiesta Flix Original crime short set downtown.', image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=900&auto=format&fit=crop', original: true },
  { id: 111, title: 'Gorillas of Virunga', year: 2024, genre: 'Documentary', rating: 9.0, narrator: 'Gaheza', type: 'Documentary', minutes: 90, description: 'Mountain gorillas of the Virunga volcanoes.', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=900&auto=format&fit=crop' },
  { id: 112, title: 'Love in Nyamirambo', year: 2025, genre: 'Romance', rating: 8.3, narrator: 'Junior Giti', type: 'Short Film', minutes: 35, description: 'A Fiesta Flix Original romance in Nyamirambo.', image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=900&auto=format&fit=crop', original: true },
];

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Movie', label: 'Movies' },
  { id: 'Series', label: 'Series' },
  { id: 'Short Film', label: 'Short Films' },
  { id: 'Documentary', label: 'Documentaries' },
  { id: 'Classic', label: 'Classics' },
  { id: 'originals', label: 'Fiesta Originals' },
];

export default function RwandaCinemaPage() {
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    if (category === 'all') return titles;
    if (category === 'originals') return titles.filter((t) => t.original);
    return titles.filter((t) => t.type === category);
  }, [category]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-24">
        <section className="container-tight pb-10 pt-8">
          <span className="eyebrow">🇷🇼 Rwanda Cinema</span>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            The home of <span className="text-primary">Rwandan film</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Foreign films are available everywhere — Rwandan cinema is where our identity lives.
            Movies, short films, documentaries, classics and Fiesta Flix Originals, all in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={
                  category === c.id
                    ? 'btn-primary px-4 py-2 text-xs'
                    : 'chip px-4 py-2 text-xs'
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        <section className="container-tight">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((title) => (
              <div key={title.id} className="group">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.06] bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={title.image}
                    alt={title.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                  <span className="absolute left-2.5 top-2.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur">
                    {title.type}
                  </span>
                  {title.original && (
                    <span className="absolute right-2.5 top-2.5 rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide shadow-glow">
                      Original
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="flex items-center gap-2 text-[11px] text-white/80">
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {title.rating}
                      </span>
                      <span>·</span>
                      <span>{title.minutes} min</span>
                    </div>
                    <div className="mt-2 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Link
                        href={`/movies/${title.id}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-bold text-white"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" /> Watch
                      </Link>
                      <Link
                        href={`/movies/${title.id}`}
                        className="flex items-center justify-center rounded-lg border border-white/20 bg-black/40 px-2.5 py-2 text-white backdrop-blur"
                        aria-label="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
                <h3 className="mt-2.5 truncate text-sm font-semibold group-hover:text-primary">
                  {title.title}
                </h3>
                <p className="mt-0.5 truncate text-[11px] text-muted">
                  {title.year} · {title.genre} · {title.narrator}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-tight mt-16">
          <div className="card-surface grid gap-6 p-8 sm:grid-cols-3">
            {[
              { icon: Clapperboard, title: 'Fiesta Originals', text: 'Produce your own shorts and series — a catalogue no competitor can copy.' },
              { icon: Film, title: 'Partner studios', text: 'Give interpreters and studios an official creator page with followers.' },
              { icon: Star, title: 'Agasobanuye Awards', text: 'An annual celebration of the voices that shape Rwandan cinema.' },
            ].map((f) => (
              <div key={f.title}>
                <f.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-sm font-bold">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
