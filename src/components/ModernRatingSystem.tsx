'use client';

import { useState } from 'react';
import { Star, ThumbsUp, Sparkles, Check, Users } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { motion, AnimatePresence } from 'motion/react';

interface ModernRatingSystemProps {
  movieId: string | number;
  initialRating?: number;
  voteCount?: number;
}

export default function ModernRatingSystem({
  movieId,
  initialRating = 8.8,
  voteCount = 1420,
}: ModernRatingSystemProps) {
  const { getUserRating, setUserRating } = useFavorites();
  const userRating = getUserRating(movieId);

  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [justRated, setJustRated] = useState(false);

  // Normalize to 5-star display
  const activeUserRating = userRating !== undefined ? userRating : null;
  const currentRatingScore = userRating !== undefined ? (userRating * 2).toFixed(1) : initialRating.toFixed(1);

  // Simulated rating distribution
  const distribution = [
    { stars: 5, percent: 74 },
    { stars: 4, percent: 18 },
    { stars: 3, percent: 5 },
    { stars: 2, percent: 2 },
    { stars: 1, percent: 1 },
  ];

  const handleRate = (stars: number) => {
    setUserRating(movieId, stars);
    setJustRated(true);
    setTimeout(() => setJustRated(false), 3000);
  };

  return (
    <div className="rounded-3xl bg-zinc-900/70 border border-zinc-800 p-5 sm:p-7 backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-white">Audience & Critic Ratings</h3>
            <span className="bg-amber-400/20 text-amber-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-amber-400/30">
              Verified
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Based on {voteCount.toLocaleString()} Fiesta Flix community ratings
          </p>
        </div>

        {/* Big Overall Score */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-400/10">
            <Star className="w-7 h-7 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{currentRatingScore}</span>
              <span className="text-xs text-zinc-500 font-semibold">/10</span>
            </div>
            <p className="text-[11px] text-zinc-400">Average Rating</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interactive Rating Area */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/60 border border-zinc-850 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">
              {userRating !== undefined ? 'Your Rating' : 'Leave Your Rating'}
            </h4>
            <p className="text-xs text-zinc-400">
              {userRating !== undefined
                ? `You rated this film ${userRating} out of 5 stars (${userRating * 2}/10). Tap to update anytime!`
                : 'How was the movie and Kinyarwanda narration? Tap stars to rate.'}
            </p>
          </div>

          {/* Star Selection */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled =
                hoverStar !== null
                  ? star <= hoverStar
                  : userRating !== undefined
                  ? star <= userRating
                  : star <= Math.round(initialRating / 2);

              return (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.25 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(null)}
                  className="p-1 -m-1 focus:outline-none rounded-full cursor-pointer touch-manipulation"
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                        : 'text-zinc-700 hover:text-zinc-500'
                    }`}
                  />
                </motion.button>
              );
            })}

            <span className="ml-3 text-sm font-black text-amber-400">
              {hoverStar !== null
                ? `${hoverStar * 2}/10`
                : userRating !== undefined
                ? `${userRating * 2}/10 ★`
                : `${initialRating}/10`}
            </span>
          </div>

          <AnimatePresence>
            {justRated && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 self-start"
              >
                <Check className="w-4 h-4" />
                <span>Your rating was saved to your profile!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rating Distribution Breakdown */}
        <div className="space-y-2 py-1">
          <p className="text-xs font-bold text-zinc-300 mb-2">Rating Distribution</p>
          {distribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-2 text-xs">
              <span className="w-8 text-zinc-400 font-semibold">{item.stars} ★</span>
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                />
              </div>
              <span className="w-9 text-right text-zinc-400 text-[11px] font-medium">
                {item.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
