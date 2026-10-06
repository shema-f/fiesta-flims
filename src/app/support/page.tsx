'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SupportModal, {
  MOMO_USSD,
  MOMO_MERCHANT,
  MOMO_PHONE,
  AIRTEL_PHONE,
  type SupporterEntry,
} from '@/components/SupportModal';
import SupporterWall, { type Supporter } from '@/components/SupporterWall';
import {
  Heart,
  Coffee,
  Sparkles,
  ShieldCheck,
  Zap,
  Phone,
  Copy,
  Check,
  Crown,
  Award,
  Flame,
  ExternalLink,
  Users,
  Server,
  Cloud,
  CheckCircle2,
  HelpCircle,
  Play,
  Film,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

const FAQS = [
  {
    q: 'Is FiestaFlix really 100% free to use?',
    a: 'Yes, absolutely! Every single movie, TV series, 4K Ultra HD stream, and Telegram download is 100% free (Ku Buntu). You will never be asked for a mandatory subscription, credit card, or paywall fee.',
  },
  {
    q: 'Why do you ask for optional support?',
    a: 'High-speed cloud servers, 10+ Terabytes of Backblaze video storage, and 4K CDN bandwidth cost real money every month. Optional contributions from our community help cover these hosting expenses so the site stays lightning-fast and free for everyone.',
  },
  {
    q: 'Will I get locked out if I do not donate?',
    a: 'Never! Supporting is 100% voluntary. Whether you contribute 500 RWF or 0 RWF, you get the exact same full access to all movies and features.',
  },
  {
    q: 'How do I support using MTN Mobile Money in Rwanda?',
    a: `Simply dial the direct MoMo Pay code ${MOMO_USSD} (Merchant Code: ${MOMO_MERCHANT}) on your MTN line, or send to ${MOMO_PHONE}. Enter any amount you wish to contribute and authorize with your PIN.`,
  },
  {
    q: 'Can I support from outside Rwanda?',
    a: 'Yes! International supporters can use our Buy Me a Coffee page or credit card/PayPal to send coffee cups or server sponsorship from anywhere in the diaspora.',
  },
];

export default function SupportPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDefaultAmount, setSelectedDefaultAmount] = useState<number>(2000);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customSupporters, setCustomSupporters] = useState<Supporter[]>([]);

  // Load any local supporters submitted via the modal
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fiesta_supporters');
      if (stored) {
        const localList: SupporterEntry[] = JSON.parse(stored);
        const mapped: Supporter[] = localList.map((entry) => ({
          id: entry.id,
          name: entry.name,
          location: 'Rwanda',
          amount: entry.amount,
          currency: entry.currency,
          method: (entry.method as any) || 'MTN MoMo',
          message: entry.message,
          date: entry.date || 'Just now',
          tier:
            entry.amount >= 10000
              ? 'champion'
              : entry.amount >= 5000
              ? 'patron'
              : entry.amount >= 2000
              ? 'booster'
              : 'hero',
          badgeTitle:
            entry.badge ||
            (entry.amount >= 10000
              ? '👑 Cinema Champion'
              : entry.amount >= 5000
              ? '🚀 Cloud Patron'
              : entry.amount >= 2000
              ? '⚡ 4K Server Booster'
              : '❤️ Cinema Hero'),
          verified: true,
          likesCount: 1,
        }));
        setCustomSupporters(mapped);
      }
    } catch {
      // ignore
    }
  }, [modalOpen]);

  const handleCopy = (text: string, key: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const openSupportWithAmount = (amount?: number) => {
    if (typeof amount === 'number') {
      setSelectedDefaultAmount(amount);
    }
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary selection:text-white">
      <Header />

      <main className="pt-24 pb-24">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-16 border-b border-zinc-900">
          {/* Cosmic ambient glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-primary/15 via-orange-500/10 to-amber-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />

          <div className="container mx-auto px-4 sm:px-6 max-w-5xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-extrabold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free Forever • Ku Buntu • No Paywalls</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
              FiestaFlix is Free.{' '}
              <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-300 bg-clip-text text-transparent">
                Support Optionally
              </span>{' '}
              If You Wish!
            </h1>

            <p className="mx-auto max-w-3xl text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed font-medium">
              We believe cinema and the rich Rwandan heritage of <strong>Agasobanuye</strong> should be accessible to every Rwandan, whether in Kigali, in the provinces, or across the diaspora. 
              Everything on FiestaFlix is <strong>100% free to stream in 4K and download</strong>.
            </p>

            <p className="mx-auto max-w-2xl text-xs sm:text-sm text-zinc-400 leading-relaxed">
              If you appreciate having fast, ad-free streaming and want to help us keep our high-speed cloud servers running, you can optionally send a voluntary contribution below.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => openSupportWithAmount(2000)}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-primary/30 transition-all hover:scale-105 flex items-center gap-2"
              >
                <Heart className="w-4 h-4 fill-current text-white animate-pulse" />
                <span>Support Optionally with MoMo</span>
              </button>

              <Link
                href="/movies"
                className="px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-sm border border-zinc-800 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current text-primary" />
                <span>Start Watching (100% Free)</span>
              </Link>
            </div>
          </div>
        </section>

        {/* MONTHLY SERVER GOAL TRACKER */}
        <section className="container mx-auto px-4 sm:px-6 max-w-5xl -mt-6 relative z-10">
          <div className="rounded-3xl bg-zinc-950/90 border border-zinc-800 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Monthly Cloud & CDN Server Goal
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Community-funded server bandwidth for high-speed 4K streaming & fast downloads.
                </p>
              </div>

              <div className="text-right sm:text-right shrink-0">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  348,500 <span className="text-xs font-semibold text-zinc-400">/ 500,000 RWF</span>
                </span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  70% Funded • 146 Supporters This Month
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-900 rounded-full h-3.5 overflow-hidden p-0.5 border border-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="bg-gradient-to-r from-amber-500 via-primary to-emerald-400 h-full rounded-full shadow-[0_0_12px_rgba(249,115,22,0.6)]"
              />
            </div>

            {/* Three Pillar Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast 4K CDN Bandwidth</h4>
                  <p className="text-xs text-zinc-400 mt-1">Zero buffering playback with local Kigali caching.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cloud Storage (10TB+)</h4>
                  <p className="text-xs text-zinc-400 mt-1">Safe archival of thousands of translated blockbusters.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Free Access</h4>
                  <p className="text-xs text-zinc-400 mt-1">Guarantees no user is ever locked out by a paywall.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SUPPORT PAYMENT METHODS GRID */}
        <section className="container mx-auto px-4 sm:px-6 max-w-5xl mt-14 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Support Options
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Choose Your Preferred Support Method
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Any amount you give — whether 500 RWF for a cup of coffee or a larger gift — is deeply appreciated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MTN Mobile Money Card */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center text-sm shadow-lg shadow-amber-500/30">
                    MoMo
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">MTN Mobile Money</h3>
                    <p className="text-xs text-amber-400 font-semibold">Rwanda Direct Merchant</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold uppercase">
                  Most Popular
                </span>
              </div>

              {/* USSD Box */}
              <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Quick Dial USSD Code:</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Merchant: {MOMO_MERCHANT}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-wider">
                    {MOMO_USSD}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${encodeURIComponent(MOMO_USSD)}`}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/30"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Dial</span>
                    </a>
                    <button
                      onClick={() => handleCopy(MOMO_USSD, 'momo-ussd')}
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-colors flex items-center gap-1"
                    >
                      {copiedKey === 'momo-ussd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'momo-ussd' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Alternative Number */}
              <div className="flex items-center justify-between text-xs text-zinc-300 pt-1 border-t border-zinc-800">
                <span>Or direct send: <strong className="text-white font-mono">{MOMO_PHONE}</strong></span>
                <button
                  onClick={() => handleCopy(MOMO_PHONE, 'momo-phone-card')}
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'momo-phone-card' ? 'Copied!' : 'Copy Number'}
                </button>
              </div>

              <button
                onClick={() => openSupportWithAmount(2000)}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Support via MTN MoMo</span>
              </button>
            </div>

            {/* Airtel Money Card */}
            <div className="rounded-3xl bg-gradient-to-br from-rose-950/40 via-zinc-900 to-zinc-950 border border-rose-500/30 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-black flex items-center justify-center text-sm shadow-lg shadow-rose-600/30">
                    Air
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Airtel Money</h3>
                    <p className="text-xs text-rose-400 font-semibold">Rwanda Instant Transfer</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold uppercase">
                  Fast & Zero Fee
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Airtel Money Number:</span>
                  <span className="text-[10px] text-zinc-500">Dial *182# and send to:</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono tracking-wider">
                    {AIRTEL_PHONE}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${encodeURIComponent(AIRTEL_PHONE)}`}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                    <button
                      onClick={() => handleCopy(AIRTEL_PHONE, 'airtel-phone-card')}
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-colors flex items-center gap-1"
                    >
                      {copiedKey === 'airtel-phone-card' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'airtel-phone-card' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-zinc-400 pt-1 border-t border-zinc-800 leading-relaxed">
                Recipient name displays as <strong>FiestaFlix Support</strong>. Zero transaction deductions.
              </div>

              <button
                onClick={() => {
                  setSelectedDefaultAmount(2000);
                  setModalOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm shadow-xl shadow-rose-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Support via Airtel Money</span>
              </button>
            </div>
          </div>

          {/* Buy Me a Coffee & International Supporter Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-[#FFDD00] text-black text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">
                ☕
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">
                  Outside Rwanda? Buy Us a Coffee Online
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-lg">
                  Supporters in the US, Europe, Canada, and worldwide can use Google Pay, Apple Pay, PayPal, or card.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="https://buymeacoffee.com/fiestaflix"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-[#FFDD00] hover:bg-[#ffea40] text-black font-black text-sm transition-all shadow-lg shadow-yellow-500/20 hover:scale-105 flex items-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                <span>Buy a Coffee on buymeacoffee</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => openSupportWithAmount(5000)}
                className="px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-zinc-700 transition-colors"
              >
                Card / PayPal Details
              </button>
            </div>
          </div>
        </section>

        {/* QUICK OPTIONAL TIERS */}
        <section className="container mx-auto px-4 sm:px-6 max-w-5xl mt-16 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Voluntary Support Tiers
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Every Franc Makes an Impact
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              Select any tier to open the instant contribution modal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => openSupportWithAmount(500)}
              className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-amber-400/50 transition-all cursor-pointer group hover:scale-[1.02] shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">☕</span>
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    500 RWF
                  </span>
                </div>
                <h4 className="text-base font-black text-white mt-3 group-hover:text-amber-300 transition-colors">
                  A Cup of Coffee
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Powers high-speed streaming bandwidth for 50 viewer sessions.
                </p>
              </div>
              <button className="mt-4 w-full py-2 rounded-xl bg-zinc-900 group-hover:bg-amber-500 group-hover:text-black font-bold text-xs text-zinc-300 transition-colors">
                Support 500 RWF
              </button>
            </div>

            <div
              onClick={() => openSupportWithAmount(2000)}
              className="p-5 rounded-3xl bg-zinc-950 border border-primary/40 hover:border-primary transition-all cursor-pointer group hover:scale-[1.02] shadow-lg shadow-primary/10 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">⚡</span>
                  <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/30">
                    2,000 RWF
                  </span>
                </div>
                <h4 className="text-base font-black text-white mt-3 group-hover:text-primary transition-colors">
                  Server Booster
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Keeps 4K Ultra HD playback crisp and maintains fast Kigali cache servers.
                </p>
              </div>
              <button className="mt-4 w-full py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 transition-all">
                Support 2,000 RWF
              </button>
            </div>

            <div
              onClick={() => openSupportWithAmount(5000)}
              className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-purple-400/50 transition-all cursor-pointer group hover:scale-[1.02] shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🚀</span>
                  <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    5,000 RWF
                  </span>
                </div>
                <h4 className="text-base font-black text-white mt-3 group-hover:text-purple-300 transition-colors">
                  Cloud Patron
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Sponsors the cloud storage and ingest costs for 20 new movie releases.
                </p>
              </div>
              <button className="mt-4 w-full py-2 rounded-xl bg-zinc-900 group-hover:bg-purple-600 group-hover:text-white font-bold text-xs text-zinc-300 transition-colors">
                Support 5,000 RWF
              </button>
            </div>

            <div
              onClick={() => openSupportWithAmount(10000)}
              className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-emerald-400/50 transition-all cursor-pointer group hover:scale-[1.02] shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">👑</span>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    10,000 RWF
                  </span>
                </div>
                <h4 className="text-base font-black text-white mt-3 group-hover:text-emerald-300 transition-colors">
                  Cinema Champion
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Helps remaster classic Agasobanuye audio and archives rare Rwandan translations.
                </p>
              </div>
              <button className="mt-4 w-full py-2 rounded-xl bg-zinc-900 group-hover:bg-emerald-500 group-hover:text-black font-bold text-xs text-zinc-300 transition-colors">
                Support 10,000 RWF
              </button>
            </div>
          </div>
        </section>

        {/* RECENT SUPPORTERS WALL COMPONENT */}
        <SupporterWall
          onOpenSupportModal={openSupportWithAmount}
          additionalSupporters={customSupporters}
        />

        {/* FAQS SECTION */}
        <section className="container mx-auto px-4 sm:px-6 max-w-4xl mt-16 space-y-6">
          <div className="text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-primary mx-auto" />
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Clear answers about our free access policy and optional community support.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2"
              >
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* Support Modal Component */}
      <SupportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultAmount={selectedDefaultAmount}
      />
    </div>
  );
}
