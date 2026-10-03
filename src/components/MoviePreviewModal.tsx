'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Play, 
  Download, 
  Send, 
  Star, 
  Clock, 
  Share2, 
  Check, 
  X, 
  ExternalLink,
  Volume2,
  HardDrive,
  Heart,
  Maximize2,
  RotateCw
} from 'lucide-react';
import type { Movie } from '@/lib/movieData';
import { useFavorites } from '@/contexts/FavoritesContext';
import RatingStars from '@/components/RatingStars';
import { motion, AnimatePresence } from 'motion/react';

interface MoviePreviewModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function MoviePreviewModal({ movie, onClose }: MoviePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = movie ? isFavorite(movie.id) : false;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (movie) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [movie, onClose]);

  // Reset play state when modal movie changes
  useEffect(() => {
    setIsPlayingPreview(false);
  }, [movie]);

  if (!movie) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/movies/${movie.id}` : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRequestFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      }
    }
  };

  const telegramChannel = movie.telegramChannelPost || `https://t.me/fiestaflix_movies/${movie.id}`;
  const telegramBot = movie.telegramBotLink || `https://t.me/FiestaFlixBot?start=movie_${movie.id}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
        {/* Click outside backdrop */}
        <div className="fixed inset-0 -z-10" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 max-h-[92vh] sm:max-h-none overflow-y-auto flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center backdrop-blur transition-colors border border-white/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Visual / Mobile-optimized Video Player */}
          <div className="relative w-full aspect-video sm:h-[380px] bg-zinc-900 overflow-hidden shrink-0">
            {isPlayingPreview && movie.directStreamUrl ? (
              <div className="relative w-full h-full bg-black">
                <video
                  ref={videoRef}
                  src={movie.directStreamUrl}
                  autoPlay
                  controls
                  playsInline
                  // @ts-ignore
                  webkit-playsinline="true"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={handleRequestFullscreen}
                  className="absolute bottom-16 right-4 sm:hidden bg-black/80 text-white p-2 rounded-lg text-xs flex items-center gap-1 backdrop-blur"
                >
                  <Maximize2 className="w-4 h-4" /> Fullscreen
                </button>
              </div>
            ) : (
              <>
                <Image
                  src={movie.backdrop || movie.image}
                  alt={movie.title}
                  fill
                  priority
                  referrerPolicy="no-referrer"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {/* Big Touch Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {movie.directStreamUrl ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsPlayingPreview(true)}
                      className="group relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/95 text-white hover:bg-primary transition-all shadow-2xl shadow-primary/50 touch-manipulation"
                    >
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
                      <span className="absolute -bottom-8 whitespace-nowrap text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-200 bg-black/75 px-3 py-1 rounded-full backdrop-blur border border-white/10">
                        Play On Phone
                      </span>
                    </motion.button>
                  ) : (
                    <Link
                      href={`/movies/${movie.id}`}
                      className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/95 text-white shadow-2xl shadow-primary/50 hover:scale-110 transition-all"
                    >
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
                    </Link>
                  )}
                </div>

                {/* Overlaid Badges */}
                <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-primary text-white uppercase tracking-wider">
                      {movie.quality || '1080p FHD'}
                    </span>
                    {movie.fileSize && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-zinc-800/80 text-zinc-300 backdrop-blur border border-zinc-700/60">
                        <HardDrive className="w-3 h-3 text-zinc-400" />
                        {movie.fileSize}
                      </span>
                    )}
                    {movie.narrator && (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Volume2 className="w-3 h-3" />
                        {movie.narrator}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Favorite Button in Video Overlay */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => toggleFavorite(movie)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur transition-all border ${
                        favorited
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-black/60 text-zinc-300 hover:text-white border-white/20'
                      }`}
                      aria-label="Favorite movie"
                    >
                      <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
                    </motion.button>

                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium bg-black/60 text-zinc-300 hover:text-white transition-colors backdrop-blur border border-zinc-700"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Share'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modal Body & Interactive Ratings / Actions */}
          <div className="p-5 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                  <span className="font-semibold text-zinc-200">{movie.year}</span>
                  <span>•</span>
                  <span className="text-primary font-bold uppercase">{movie.genre}</span>
                  {movie.duration && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {movie.duration}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  {movie.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/movies/${movie.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
                >
                  Full Page
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Interactive User Rating Section */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white mb-0.5">Rate this Movie</p>
                <p className="text-[11px] text-zinc-400">Tap stars to submit your review score</p>
              </div>
              <RatingStars movieId={movie.id} initialRating={movie.rating} />
            </div>

            <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm">
              {movie.description ||
                `Stream or download ${movie.title} with high-clarity Kinyarwanda narration. Available for high-speed download through Telegram or direct streaming.`}
            </p>

            {/* TELEGRAM STORAGE ACTIONS SECTION */}
            <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-zinc-900 to-zinc-900 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#229ED9] text-white flex items-center justify-center font-bold shadow-md shadow-[#229ED9]/40">
                    <Send className="w-4 h-4 -rotate-12 translate-x-px" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      Watch & Download in Telegram
                      <span className="text-[9px] uppercase font-extrabold bg-[#229ED9]/20 text-[#229ED9] px-2 py-0.5 rounded-full border border-[#229ED9]/30">
                        Zero Limits
                      </span>
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      High-speed background download directly in your mobile Telegram app
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <a
                  href={telegramChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#229ED9]/25 hover:scale-[1.02] touch-manipulation"
                >
                  <Download className="w-4 h-4" />
                  <span>Open in Telegram Channel</span>
                </a>

                <a
                  href={telegramBot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs sm:text-sm border border-zinc-700/80 transition-all hover:scale-[1.02] touch-manipulation"
                >
                  <Send className="w-4 h-4 text-[#229ED9]" />
                  <span>Send to Telegram Bot</span>
                </a>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => toggleFavorite(movie)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  favorited
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-current text-rose-500' : ''}`} />
                <span>{favorited ? 'In Your Favorites' : 'Add to Favorites'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  Close
                </button>
                <Link
                  href={`/movies/${movie.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-xs shadow-lg shadow-primary/30 transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Watch Full Screen
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
