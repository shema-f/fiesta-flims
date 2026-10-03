'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Send, Film, Sparkles, ShieldCheck, Flame, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[640px] lg:h-[85vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Cinematic High-Res Backdrop */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=85&w=2000&auto=format&fit=crop"
          alt="Fiesta Flix Cinema Stage"
          fill
          priority
          referrerPolicy="no-referrer"
          className="object-cover opacity-35 filter brightness-75 scale-105 transition-transform duration-1000"
        />
        {/* Cinematic gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/90" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-background/40 to-background" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-semibold backdrop-blur animate-fadeIn">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>Over 1,200+ Movies & Series with Kinyarwanda Narration</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
            Stream & Download Movies <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">
              Mu Kinyarwanda
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed">
            Experience Hollywood, Nollywood & Asian blockbusters with legendary voiceovers by{' '}
            <strong className="font-semibold text-white">Rocky Kimomo, Junior Giti, Savimbi, Sankara</strong> & more.
            Watch online or download instantly via Telegram.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/movies"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/95 hover:to-orange-500/95 text-white font-bold text-base shadow-xl shadow-primary/30 hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Browse Catalog</span>
            </Link>

            <a
              href="https://t.me/fiestaflix_movies"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white font-bold text-base shadow-xl shadow-[#229ED9]/25 hover:scale-105 transition-all border border-[#229ED9]/40"
            >
              <Send className="w-5 h-5 -rotate-12 translate-x-px" />
              <span>Join Telegram Channel</span>
            </a>
          </div>

          {/* Trust Highlights & Quality Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white">4K & 1080p</p>
                <p className="text-[10px] text-zinc-400">Crystal Clear HD</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur">
              <Send className="w-4 h-4 text-[#229ED9] shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white">Telegram Cloud</p>
                <p className="text-[10px] text-zinc-400">Unlimited Downloads</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur">
              <Film className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white">Agasobanuye</p>
                <p className="text-[10px] text-zinc-400">Authentic Voiceovers</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white">Fast & Free</p>
                <p className="text-[10px] text-zinc-400">No Buffering</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
