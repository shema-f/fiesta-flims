import Link from 'next/link';
import { Play, Mic2, Sparkles, Download } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="container-tight pb-14 pt-28 text-center sm:pt-32">
        <span className="chip mx-auto">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          The home of Kinyarwanda cinema
        </span>

        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          Filime. Ijwi. <span className="text-primary">Umuco.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Movies, voices, culture. Stream Agasobanuye, follow the interpreters who define it, and
          discover Rwandan cinema — all in one place.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/movies" className="btn-primary">
            <Play className="h-4 w-4 fill-current" />
            Start watching
          </Link>
          <Link href="/interpreters" className="btn-ghost">
            <Mic2 className="h-4 w-4" />
            Explore interpreters
          </Link>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Play, label: 'Adaptive quality', note: '360p → 4K' },
            { icon: Download, label: 'Offline downloads', note: 'Wi-Fi friendly' },
            { icon: Mic2, label: '70+ interpreters', note: 'Follow your favourites' },
            { icon: Sparkles, label: 'Fiesta Originals', note: 'Stories only here' },
          ].map((f) => (
            <div key={f.label} className="card-surface px-4 py-4 text-left">
              <f.icon className="h-4 w-4 text-primary" />
              <p className="mt-2.5 text-xs font-semibold">{f.label}</p>
              <p className="text-[11px] text-muted">{f.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
