import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Check, Sparkles, Heart, Zap, ShieldCheck, Play, ArrowRight } from 'lucide-react';

const ALL_FEATURES_FREE = [
  '100% Free 4K & 1080p Ultra HD streaming',
  'Unlimited offline Telegram cloud downloads',
  'Authentic Agasobanuye voice tracks (Rocky Kimomo, Junior Giti, Sankara)',
  'Exclusive Rwandan cinema & TV series',
  'Full search, narrator profiles, & recommendations',
  'Zero mandatory subscription fees — ever',
];

export default function PlusPage() {
  return (
    <div className="min-h-screen bg-black text-foreground">
      <Header />

      <main className="pt-24 pb-24">
        <section className="container mx-auto px-4 sm:px-6 max-w-4xl pb-12 pt-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-extrabold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Free Forever • Ku Buntu • No Subscriptions</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            FiestaFlix is <span className="bg-gradient-to-r from-emerald-400 via-primary to-amber-300 bg-clip-text text-transparent">100% Free</span> For Everyone!
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-zinc-300 leading-relaxed font-medium">
            We believe Agasobanuye cinema belongs to everyone. There are no VIP tiers, no paid memberships, and no paywalls. All movies, 4K streams, and offline downloads are completely free at <strong>0 RWF</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/movies"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-primary/30 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Watching Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/support"
              className="px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-sm border border-zinc-800 transition-all flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-current" />
              <span>Optional Community Support</span>
            </Link>
          </div>
        </section>

        {/* Feature Unlocked Card */}
        <section className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-8 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Everything Unlocked</span>
                <h2 className="text-2xl font-black text-white mt-1">Free Access For All Fans</h2>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400">0 RWF</span>
                <p className="text-xs text-zinc-500">Forever</p>
              </div>
            </div>

            <ul className="grid sm:grid-cols-2 gap-3.5 pt-2">
              {ALL_FEATURES_FREE.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 mt-6">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Heart className="w-4 h-4 fill-current text-rose-500" />
                <span>Want to help keep our servers running?</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Hosting 4K video files and cloud bandwidth costs money every month. 
                Supporting us is <strong>100% voluntary</strong>. If you love FiestaFlix, you can optionally contribute via MTN MoMo or Airtel Money.
              </p>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline pt-1"
              >
                <span>Go to Support Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
