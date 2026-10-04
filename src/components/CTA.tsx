'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Play, Download, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background ambient lighting matching the cat's red & blue cosmic energy */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 bg-orange-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.12] bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 shadow-2xl shadow-black/80">
          {/* Subtle grid and flare overlay */}
          <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-6 sm:p-10 lg:p-12 relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cosmic 4K Streaming • 100% Free</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
                Ready to Get Started with{' '}
                <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-300 bg-clip-text text-transparent">
                  FiestaFlix?
                </span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                Stream the best Hollywood blockbusters, Bollywood dramas, and Rwandan cinema narrated by Rocky Kimomo, Junior Giti, and top voice masters. Watch in 4K Ultra HD or download ad-free offline.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-zinc-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Ultra-Fast 4K Playback</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Unlimited Cloud Downloads</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>No Subscription Required</span>
                </span>
              </div>

              {/* Call to action buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/movies"
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-primary/30 transition-all hover:scale-105 flex items-center gap-2 group"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/interpreters"
                  className="px-6 py-3.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-sm border border-zinc-700 transition-all flex items-center gap-2 shadow-lg"
                >
                  <span>Explore Interpreters</span>
                </Link>
              </div>
            </div>

            {/* Right: The User's Uploaded Hero Mascot Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-md">
                {/* Glow ring in cosmic blue & orange */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 opacity-75 blur-xl group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

                <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
                  <Image
                    src="/get-started-cat.jpg"
                    alt="FiestaFlix Cosmic Movie Mascot"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                    priority
                  />

                  {/* Glassmorphic floating badge */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-extrabold text-white">Cosmic Cinema Quality</p>
                      <p className="text-[11px] text-zinc-400">Stream in 4K or Download Offline</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 font-black text-[10px] uppercase">
                      4K UHD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
