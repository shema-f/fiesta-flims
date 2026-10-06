'use client';

import { useState, useMemo } from 'react';
import {
  Heart,
  Crown,
  Sparkles,
  Zap,
  ShieldCheck,
  Search,
  Filter,
  Flame,
  Award,
  Star,
  Users,
  Coffee,
  MessageSquare,
  ThumbsUp,
  Globe2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type SupporterTier = 'all' | 'champion' | 'patron' | 'booster' | 'hero';

export interface Supporter {
  id: string;
  name: string;
  location?: string;
  amount: number;
  currency: string;
  method: 'MTN MoMo' | 'Airtel Money' | 'Buy Me a Coffee' | 'Card / PayPal';
  message?: string;
  date: string;
  timestamp?: number;
  tier: 'champion' | 'patron' | 'booster' | 'hero';
  badgeTitle: string;
  avatarSeed?: string;
  verified?: boolean;
  likesCount?: number;
}

export const MOCK_SUPPORTERS: Supporter[] = [
  {
    id: 'sup-1',
    name: 'Jean-Paul Nsengiyumva',
    location: 'Kigali, Kicukiro',
    amount: 15000,
    currency: 'RWF',
    method: 'MTN MoMo',
    message: 'Agasobanuye is Rwanda’s cinema treasure. Watching in 4K without buffering on my smart TV is unmatched. Happy to fund the cloud servers!',
    date: 'Just now',
    tier: 'champion',
    badgeTitle: '👑 Executive Producer',
    verified: true,
    likesCount: 24,
  },
  {
    id: 'sup-2',
    name: 'Claudine Uwamahoro',
    location: 'Musanze',
    amount: 10000,
    currency: 'RWF',
    method: 'MTN MoMo',
    message: 'Junior Giti and Rocky Kimomo classics preserved forever. Keep up the clean interface and zero intrusive ads!',
    date: '35 mins ago',
    tier: 'champion',
    badgeTitle: '👑 Founding Patron',
    verified: true,
    likesCount: 19,
  },
  {
    id: 'sup-3',
    name: 'Patrick Kalisa',
    location: 'Montreal, Canada',
    amount: 25000,
    currency: 'RWF',
    method: 'Buy Me a Coffee',
    message: 'Streaming from Montreal, Quebec. FiestaFlix makes me feel right back at home in Nyamirambo on movie night. Murakoze cyane!',
    date: '2 hours ago',
    tier: 'champion',
    badgeTitle: '🌍 Diaspora Champion',
    verified: true,
    likesCount: 42,
  },
  {
    id: 'sup-4',
    name: 'Aimable Mugisha',
    location: 'Kigali, Remera',
    amount: 5000,
    currency: 'RWF',
    method: 'Airtel Money',
    message: 'Fast downloads straight to Telegram. You guys revolutionized how Rwandans enjoy movies.',
    date: '4 hours ago',
    tier: 'patron',
    badgeTitle: '🚀 Cloud Patron',
    verified: true,
    likesCount: 15,
  },
  {
    id: 'sup-5',
    name: 'Aline Umutoni',
    location: 'Huye',
    amount: 5000,
    currency: 'RWF',
    method: 'MTN MoMo',
    message: 'Supporting monthly so our university dorm can keep having weekend movie marathons!',
    date: 'Yesterday',
    tier: 'patron',
    badgeTitle: '🚀 Cloud Patron',
    verified: true,
    likesCount: 11,
  },
  {
    id: 'sup-6',
    name: 'Olivier Tuyishime',
    location: 'Kigali, Nyarugenge',
    amount: 3000,
    currency: 'RWF',
    method: 'MTN MoMo',
    message: 'Great sound design and clean translations. Long live Rwandan cinema!',
    date: 'Yesterday',
    tier: 'booster',
    badgeTitle: '⚡ 4K Server Booster',
    verified: false,
    likesCount: 8,
  },
  {
    id: 'sup-7',
    name: 'Diane & Eric K.',
    location: 'Rubavu',
    amount: 5000,
    currency: 'RWF',
    method: 'MTN MoMo',
    message: 'We cancelled paid streaming apps. FiestaFlix has everything we love and it stays free for everyone.',
    date: '2 days ago',
    tier: 'patron',
    badgeTitle: '🚀 Cloud Patron',
    verified: true,
    likesCount: 16,
  },
  {
    id: 'sup-8',
    name: 'Kevin Munyaneza',
    location: 'Brussels, Belgium',
    amount: 12000,
    currency: 'RWF',
    method: 'Card / PayPal',
    message: 'Proud of Rwandan tech excellence. The UI is smoother than international platforms.',
    date: '2 days ago',
    tier: 'champion',
    badgeTitle: '🌍 Diaspora Champion',
    verified: true,
    likesCount: 29,
  },
  {
    id: 'sup-9',
    name: 'Innocent Gasana',
    location: 'Gisenyi',
    amount: 2000,
    currency: 'RWF',
    method: 'Airtel Money',
    message: 'Sending a small token of gratitude. Keep the action and thriller section growing!',
    date: '3 days ago',
    tier: 'booster',
    badgeTitle: '⚡ 4K Server Booster',
    verified: false,
    likesCount: 7,
  },
  {
    id: 'sup-10',
    name: 'Sonia Mukakarisa',
    location: 'Kigali, Kimironko',
    amount: 1000,
    currency: 'RWF',
    method: 'MTN MoMo',
    message: 'Cup of coffee on me for the developers. Loving the subtitle toggles and fast search.',
    date: '4 days ago',
    tier: 'hero',
    badgeTitle: '❤️ Cinema Hero',
    verified: false,
    likesCount: 9,
  },
  {
    id: 'sup-11',
    name: 'Kigali Cine Club Fans',
    location: 'Kigali',
    amount: 20000,
    currency: 'RWF',
    method: 'MTN MoMo',
    message: 'Group contribution from our Friday night movie crew. Ku buntu bw’ukuri!',
    date: '5 days ago',
    tier: 'champion',
    badgeTitle: '👑 VIP Cinema Guild',
    verified: true,
    likesCount: 38,
  },
  {
    id: 'sup-12',
    name: 'Anonymous Movie Buff',
    location: 'Rwanda',
    amount: 1000,
    currency: 'RWF',
    method: 'MTN MoMo',
    message: 'Popcorn & tea contribution. Keep Agasobanuye accessible to all Rwandan kids!',
    date: '6 days ago',
    tier: 'hero',
    badgeTitle: '❤️ Cinema Hero',
    verified: false,
    likesCount: 12,
  },
];

interface SupporterWallProps {
  onOpenSupportModal?: (amount?: number) => void;
  additionalSupporters?: Supporter[];
}

export default function SupporterWall({
  onOpenSupportModal,
  additionalSupporters = [],
}: SupporterWallProps) {
  const [selectedTier, setSelectedTier] = useState<SupporterTier>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  // Combine real localStorage / passed supporters with mock supporters
  const allSupporters = useMemo(() => {
    return [...additionalSupporters, ...MOCK_SUPPORTERS];
  }, [additionalSupporters]);

  // Filtered supporters based on active tab and search
  const filteredSupporters = useMemo(() => {
    return allSupporters.filter((item) => {
      const matchesTier = selectedTier === 'all' || item.tier === selectedTier;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.badgeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [allSupporters, selectedTier, searchQuery]);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getTierStyles = (tier: Supporter['tier']) => {
    switch (tier) {
      case 'champion':
        return {
          pill: 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10',
          border: 'hover:border-amber-500/60 border-zinc-800/90',
          avatarBg: 'from-amber-500 to-orange-600 text-black',
          glow: 'from-amber-500/10 via-orange-500/5 to-transparent',
          accent: 'text-amber-400',
        };
      case 'patron':
        return {
          pill: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-purple-500/10',
          border: 'hover:border-purple-500/60 border-zinc-800/90',
          avatarBg: 'from-purple-500 to-indigo-600 text-white',
          glow: 'from-purple-500/10 via-indigo-500/5 to-transparent',
          accent: 'text-purple-400',
        };
      case 'booster':
        return {
          pill: 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sky-500/10',
          border: 'hover:border-sky-500/60 border-zinc-800/90',
          avatarBg: 'from-sky-500 to-blue-600 text-white',
          glow: 'from-sky-500/10 via-blue-500/5 to-transparent',
          accent: 'text-sky-400',
        };
      case 'hero':
      default:
        return {
          pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10',
          border: 'hover:border-emerald-500/60 border-zinc-800/90',
          avatarBg: 'from-emerald-500 to-teal-600 text-white',
          glow: 'from-emerald-500/10 via-teal-500/5 to-transparent',
          accent: 'text-emerald-400',
        };
    }
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 max-w-6xl mt-16 space-y-8" id="supporter-wall">
      {/* SECTION HEADER WITH STATS */}
      <div className="rounded-3xl bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-black border border-zinc-800 p-6 sm:p-10 relative overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/15 via-primary/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800/80">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Official Wall of Fame • Agasobanuye Guardians</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Community Supporter Wall
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-medium">
              Every voluntary contributor who helps cover our 4K streaming servers, Kigali CDN caching, and 10TB+ video storage. Your generosity keeps FiestaFlix <strong>100% free (Ku Buntu)</strong> for all film lovers!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenSupportModal?.(2000)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-primary/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current animate-pulse text-white" />
              <span>Add Your Name to the Wall</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Total Supporters</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">240+</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Community heroes & fans</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Patrons & Producers</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">68</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Top-tier cloud sponsors</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <Globe2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Global Reach</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-sky-400 mt-1">14 Countries</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Rwanda, Canada, Belgium...</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Access For All</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">100% Free</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Zero paywalls or ads</p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tier Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedTier('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTier === 'all'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <span>All Supporters</span>
            <span className="text-[10px] opacity-75 font-mono">({allSupporters.length})</span>
          </button>

          <button
            onClick={() => setSelectedTier('champion')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTier === 'champion'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Champions</span>
          </button>

          <button
            onClick={() => setSelectedTier('patron')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTier === 'patron'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Patrons</span>
          </button>

          <button
            onClick={() => setSelectedTier('booster')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTier === 'booster'
                ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Zap className="w-3 h-3 text-sky-400" />
            <span>Boosters</span>
          </button>

          <button
            onClick={() => setSelectedTier('hero')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTier === 'hero'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Heart className="w-3 h-3 text-emerald-400 fill-current" />
            <span>Heroes</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search contributor or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* SUPPORTERS CARDS GRID */}
      {filteredSupporters.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950/60 rounded-3xl border border-zinc-900 space-y-3">
          <Search className="w-8 h-8 text-zinc-600 mx-auto" />
          <h4 className="text-base font-bold text-white">No supporters found for this filter</h4>
          <p className="text-xs text-zinc-500">Try adjusting your search terms or view all supporters.</p>
          <button
            onClick={() => {
              setSelectedTier('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-primary border border-zinc-800 transition-colors inline-block mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredSupporters.map((supporter) => {
              const styles = getTierStyles(supporter.tier);
              const isLiked = likedIds[supporter.id];
              const displayLikes = (supporter.likesCount || 0) + (isLiked ? 1 : 0);

              return (
                <motion.div
                  key={supporter.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`group rounded-3xl bg-zinc-950/90 border ${styles.border} p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all duration-300 relative overflow-hidden backdrop-blur-sm hover:-translate-y-1 hover:shadow-2xl`}
                >
                  {/* Subtle tier top accent gradient */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.glow} pointer-events-none`}
                  />

                  <div className="space-y-4">
                    {/* Header: Avatar, Name, Location, and Amount */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar initials with glowing ring */}
                        <div
                          className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${styles.avatarBg} font-black text-sm flex items-center justify-center shadow-lg border border-white/10 shrink-0 uppercase tracking-tighter`}
                        >
                          {supporter.name
                            .split(' ')
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join('')}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-white group-hover:text-primary transition-colors">
                              {supporter.name}
                            </h4>
                            {supporter.verified && (
                              <span
                                title="Verified community contributor"
                                className="inline-flex text-emerald-400"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 fill-emerald-500/20" />
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5 font-medium">
                            {supporter.location && (
                              <span>{supporter.location}</span>
                            )}
                            {supporter.location && <span>•</span>}
                            <span>{supporter.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contribution Amount Badge */}
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0 font-mono shadow-sm">
                        +{supporter.amount.toLocaleString()} {supporter.currency}
                      </span>
                    </div>

                    {/* Badge Title Pill */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border shadow-sm ${styles.pill}`}
                      >
                        {supporter.badgeTitle}
                      </span>
                    </div>

                    {/* Personal Message / Note */}
                    {supporter.message && (
                      <p className="text-xs sm:text-[13px] text-zinc-300/90 italic leading-relaxed pt-1 font-medium bg-zinc-900/40 p-3 rounded-2xl border border-zinc-900">
                        &ldquo;{supporter.message}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Card Footer: Payment method & interactive like/clap button */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-900 text-[11px] text-zinc-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>via {supporter.method}</span>
                    </span>

                    <button
                      onClick={() => toggleLike(supporter.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all ${
                        isLiked
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                      title="Send appreciation to this supporter"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                          isLiked ? 'fill-current text-rose-500 scale-110' : ''
                        }`}
                      />
                      <span className="font-bold text-[10px]">{displayLikes}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* FOOTER CALLOUT BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-primary/30 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Want to see your name & badge on this wall?</span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Any voluntary contribution via MTN MoMo (USSD *182*8*1*1145124#) or international card adds your personalized badge and message to our Wall of Fame!
          </p>
        </div>

        <button
          onClick={() => onOpenSupportModal?.(2000)}
          className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs sm:text-sm shadow-lg shadow-primary/30 transition-all hover:scale-105 shrink-0 flex items-center justify-center gap-2"
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Support & Join the Wall</span>
        </button>
      </div>
    </section>
  );
}
