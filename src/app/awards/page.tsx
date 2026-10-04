'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trophy, Crown, Mic2, Laugh, Ghost, Sparkles, Clapperboard, Star } from 'lucide-react';

interface Category {
  id: string;
  title: string;
  icon: typeof Trophy;
  nominees: { name: string; meta: string }[];
}

const CATEGORIES: Category[] = [
  {
    id: 'best-umusobanuzi',
    title: 'Best Umusobanuzi',
    icon: Crown,
    nominees: [
      { name: 'Rocky', meta: 'Action & thriller' },
      { name: 'Sankara', meta: 'Blockbuster narration' },
      { name: 'Gaheza', meta: 'Drama & documentary' },
    ],
  },
  {
    id: 'best-action',
    title: 'Best Action Translation',
    icon: Sparkles,
    nominees: [
      { name: 'Cyber Warrior', meta: 'Sankara' },
      { name: 'Neon Nights', meta: 'Rocky' },
      { name: 'Intore: The Warriors', meta: 'Rocky' },
    ],
  },
  {
    id: 'best-comedy',
    title: 'Best Comedy Translation',
    icon: Laugh,
    nominees: [
      { name: 'The Last Laugh', meta: 'Junior Giti' },
      { name: 'Amakuru', meta: 'Yanga' },
      { name: 'Family Ties', meta: 'Dylan' },
    ],
  },
  {
    id: 'best-horror',
    title: 'Best Horror Translation',
    icon: Ghost,
    nominees: [
      { name: 'Ghost Protocol', meta: 'Savimbi' },
      { name: 'Umwijima', meta: 'Rocky' },
      { name: 'Midnight Shadows', meta: 'Junior Giti' },
    ],
  },
  {
    id: 'movie-of-the-year',
    title: 'Movie of the Year',
    icon: Trophy,
    nominees: [
      { name: 'Ocean\u2019s Heart', meta: '2025' },
      { name: 'Space Odyssey', meta: '2025' },
      { name: 'Karahanyuze', meta: '2024' },
    ],
  },
  {
    id: 'best-rwandan',
    title: 'Best Rwandan Film',
    icon: Clapperboard,
    nominees: [
      { name: 'Umurage: Legacy', meta: 'Rwanda Cinema' },
      { name: 'Nyampinga: The Queen', meta: 'Rwanda Cinema' },
      { name: 'The Kigali Files', meta: 'Fiesta Original' },
    ],
  },
  {
    id: 'new-interpreter',
    title: 'Best New Interpreter',
    icon: Mic2,
    nominees: [
      { name: 'Zacky', meta: 'Rising voice' },
      { name: 'Ryan', meta: 'Rising voice' },
      { name: 'Rumuri', meta: 'Rising voice' },
    ],
  },
  {
    id: 'peoples-choice',
    title: 'People\u2019s Choice',
    icon: Star,
    nominees: [
      { name: 'Rocky', meta: 'Fan favourite' },
      { name: 'Junior Giti', meta: 'Fan favourite' },
      { name: 'Sankara', meta: 'Fan favourite' },
    ],
  },
];

export default function AwardsPage() {
  const [votes, setVotes] = useState<Record<string, string>>({});

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-24">
        <section className="container-tight pb-12 pt-10 text-center">
          <span className="eyebrow">Annual</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            🏆 Agasobanuye <span className="text-primary">Awards</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Fiesta Flix does not just show the industry — it celebrates it. Vote for the voices and
            translations that defined the year.
          </p>
        </section>

        <section className="container-tight grid gap-6 sm:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="card-surface p-6">
              <div className="mb-4 flex items-center gap-2">
                <cat.icon className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wide">{cat.title}</h2>
              </div>
              <div className="space-y-2">
                {cat.nominees.map((n) => {
                  const selected = votes[cat.id] === n.name;
                  return (
                    <button
                      key={n.name}
                      onClick={() => setVotes((prev) => ({ ...prev, [cat.id]: n.name }))}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold">{n.name}</span>
                        <span className="block text-[11px] text-muted">{n.meta}</span>
                      </span>
                      <span
                        className={`text-[11px] font-bold ${selected ? 'text-primary' : 'text-muted'}`}
                      >
                        {selected ? 'Voted' : 'Vote'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
