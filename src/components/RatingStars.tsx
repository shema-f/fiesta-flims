'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFavorites } from '@/contexts/FavoritesContext';

interface RatingStarsProps {
  movieId: string | number;
  initialRating?: number;
  maxStars?: number;
  showFeedback?: boolean;
}

export default function RatingStars({
  movieId,
  initialRating = 8.5,
  maxStars = 5,
  showFeedback = true,
}: RatingStarsProps) {
  const { getUserRating, setUserRating } = useFavorites();
  const userRating = getUserRating(movieId);

  // Convert a 10-point scale to a 5-star scale if needed
  const normalizedInitial = Math.round(initialRating / 2);
  const currentRating = userRating !== undefined ? userRating : normalizedInitial;

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [justRated, setJustRated] = useState(false);

  const handleRate = (value: number) => {
    setUserRating(movieId, value);
    setJustRated(true);
    setTimeout(() => setJustRated(false), 2400);
  };

  const activeRating = hoverRating !== null ? hoverRating : currentRating;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const starValue = idx + 1;
          const isFilled = starValue <= activeRating;

          return (
            <motion.button
              key={starValue}
              type="button"
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleRate(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(null)}
              className="p-1 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-full cursor-pointer touch-manipulation"
              aria-label={`Rate ${starValue} of ${maxStars} stars`}
            >
              <Star
                className={`w-5 h-5 transition-colors duration-200 ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              />
            </motion.button>
          );
        })}

        <span className="ml-2 text-xs font-bold text-zinc-300">
          {userRating !== undefined ? `${userRating * 2}/10` : `${initialRating}/10`}
        </span>
      </div>

      <AnimatePresence>
        {justRated && showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 self-start"
          >
            <span>🎉 Thank you for rating!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
