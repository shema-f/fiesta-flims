import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';

const FREE = ['Unlimited streaming', 'Full search & discovery', 'Interpreter profiles', 'Reviews & community'];
const PLUS = [
  '1080p & 4K streaming',
  'Offline downloads',
  'Ad-free experience',
  'Early access to new releases',
  'Multiple audio & subtitle tracks',
  'Exclusive Rwandan content',
];

const PASSES = [
  { name: '1-Day Pass', price: '500', note: 'Great for a weekend binge' },
  { name: '7-Day Pass', price: '2,000', note: 'For the week-long marathon' },
  { name: 'Monthly', price: '5,000', note: 'Best value, cancel anytime' },
];

export default function PlusPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-24">
        <section className="container-tight pb-12 pt-10 text-center">
          <span className="eyebrow">Membership</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Fiesta Flix <span className="text-primary">Plus</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Watching is free, forever. Plus is for people who want the best quality, offline
            downloads and no interruptions.
          </p>
        </section>

        <section className="container-tight grid gap-6 lg:grid-cols-2">
          <div className="card-surface p-8">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-muted" />
              <h2 className="text-xl font-bold">Free</h2>
            </div>
            <p className="mt-1 text-xs text-muted">Everything you need to start watching.</p>
            <p className="mt-6 text-3xl font-bold">
              RWF 0 <span className="text-sm font-normal text-muted">/ forever</span>
            </p>
            <ul className="mt-6 space-y-3">
              {FREE.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted">
                  <Check className="h-4 w-4 text-emerald-400" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/movies" className="btn-ghost mt-8 w-full">
              Start watching
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-b from-primary/10 to-transparent p-8 shadow-glow">
            <span className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Most popular
            </span>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Plus</h2>
            </div>
            <p className="mt-1 text-xs text-muted">For the true Agasobanuye fan.</p>
            <p className="mt-6 text-3xl font-bold">
              RWF 5,000 <span className="text-sm font-normal text-muted">/ month</span>
            </p>
            <ul className="mt-6 space-y-3">
              {PLUS.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground/90">
                  <Sparkles className="h-4 w-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn-primary mt-8 w-full">
              Get Plus
            </Link>
          </div>
        </section>

        <section className="container-tight mt-12">
          <h2 className="mb-5 text-lg font-bold">Or grab a pass</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {PASSES.map((p) => (
              <div key={p.name} className="card-surface p-6">
                <h3 className="text-sm font-bold">{p.name}</h3>
                <p className="mt-3 text-2xl font-bold">
                  RWF {p.price}
                </p>
                <p className="mt-1 text-xs text-muted">{p.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted">
            Pay with MTN Mobile Money or Airtel Money. No card required.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
