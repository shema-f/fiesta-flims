import Link from 'next/link';
import { Play, Mic2, Sparkles, Download, Tv, Film, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.08] min-h-[580px] sm:min-h-[640px] flex items-center justify-center">
      {/* High-fidelity Cinematic Background Picture with Ambient Glow */}
      <div 
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat scale-105 transform motion-safe:animate-pulse duration-[10000ms]"
        style={{
          backgroundImage: `url('/hero-cinema.jpg')`,
        }}
      />

      {/* Layered cinematic dark vignettes and gradient masks tailored for the blue cinema auditorium */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-black/80 to-black/60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/95 via-transparent to-background/95" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -z-10 h-[350px] w-[700px] rounded-full bg-primary/15 blur-[120px]" />

      <div className="container-tight pb-16 pt-28 sm:pt-36 text-center relative z-10">
        {/* Top Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-primary/30 backdrop-blur-md shadow-lg shadow-primary/10 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-zinc-200">
            🇷🇼 #1 Rwandan Cinema Platform • 4K Ultra HD & Cloud Downloads
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="mx-auto max-w-4xl text-3xl font-black leading-[1.08] tracking-tight sm:text-6xl text-white">
          Best Agasobanuye Movies{' '}
          <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-300 bg-clip-text text-transparent block sm:inline mt-1 sm:mt-0">
            Download & Stream
          </span>{' '}
          in 4K
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-5 max-w-2xl text-xs sm:text-base leading-relaxed text-zinc-300 font-medium">
          Experience world blockbusters, Bollywood dramas, and Rwandan original cinema translated into authentic Kinyarwanda by Rwanda&apos;s greatest voice masters — Rocky Kimomo, Junior Giti, Sankara, and rising interpreters.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/movies"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-primary/30 hover:scale-105 flex items-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Stream in 4K Now</span>
          </Link>

          <Link
            href="/movies?download=true"
            className="px-5 py-3 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm border border-zinc-700/80 transition-all hover:border-zinc-500 flex items-center gap-2 shadow-lg backdrop-blur-md"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Download Movies Offline</span>
          </Link>

          <Link
            href="/interpreters"
            className="px-4 py-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-semibold text-xs sm:text-sm border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <Mic2 className="h-4 w-4 text-primary" />
            <span>Top Interpreters</span>
          </Link>
        </div>

        {/* 4 Core Features Cards */}
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Tv, label: 'Adaptive 4K UHD', note: '2160p HDR or Data Saver' },
            { icon: Download, label: 'Direct & Telegram', note: 'Superfast cloud files' },
            { icon: Mic2, label: '70+ Voice Masters', note: 'Rocky, Giti, Sankara & more' },
            { icon: Film, label: 'Rwanda Cinema', note: '100% authentic Kinyarwanda' },
          ].map((f) => (
            <div
              key={f.label}
              className="p-3.5 rounded-2xl bg-zinc-950/75 border border-white/[0.08] backdrop-blur-md text-left transition-all hover:border-primary/40 hover:bg-zinc-900/80 group"
            >
              <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 w-fit group-hover:border-primary/30 transition-colors">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2.5 text-xs font-bold text-white group-hover:text-primary transition-colors">
                {f.label}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{f.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
