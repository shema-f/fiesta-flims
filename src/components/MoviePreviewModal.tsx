'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Play, 
  Download, 
  Send, 
  Star, 
  Clock, 
  Film, 
  Sparkles, 
  Share2, 
  Check, 
  X, 
  ExternalLink,
  Volume2,
  HardDrive
} from 'lucide-react';
import type { Movie } from '@/lib/movieData';

interface MoviePreviewModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function MoviePreviewModal({ movie, onClose }: MoviePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

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

  if (!movie) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/movies/${movie.id}` : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const telegramChannel = movie.telegramChannelPost || `https://t.me/fiestaflix_movies/${movie.id}`;
  const telegramBot = movie.telegramBotLink || `https://t.me/FiestaFlixBot?start=movie_${movie.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center backdrop-blur transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Visual / Preview Video Player */}
        <div className="relative w-full aspect-video sm:h-[380px] bg-zinc-900 overflow-hidden">
          {isPlayingPreview && movie.directStreamUrl ? (
            <video
              src={movie.directStreamUrl}
              autoPlay
              controls
              playsInline
              className="w-full h-full object-cover"
            />
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
              
              {/* Overlay Play Action */}
              <div className="absolute inset-0 flex items-center justify-center">
                {movie.directStreamUrl ? (
                  <button
                    onClick={() => setIsPlayingPreview(true)}
                    className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-primary/90 text-white hover:bg-primary hover:scale-110 transition-all shadow-xl shadow-primary/40"
                  >
                    <Play className="w-8 h-8 fill-current translate-x-0.5 group-hover:scale-110 transition-transform" />
                    <span className="absolute -bottom-8 whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-zinc-300 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur">
                      Play Web Preview
                    </span>
                  </button>
                ) : (
                  <Link
                    href={`/movies/${movie.id}`}
                    className="group flex items-center justify-center w-20 h-20 rounded-full bg-primary/90 text-white hover:bg-primary hover:scale-110 transition-all shadow-xl shadow-primary/40"
                  >
                    <Play className="w-8 h-8 fill-current translate-x-0.5" />
                  </Link>
                )}
              </div>

              {/* Quality & Narrator Badges Over Video */}
              <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white uppercase tracking-wider">
                    {movie.quality || '1080p FHD'}
                  </span>
                  {movie.fileSize && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-300 backdrop-blur">
                      <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
                      {movie.fileSize}
                    </span>
                  )}
                  {movie.narrator && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Volume2 className="w-3.5 h-3.5" />
                      Agasobanuye: {movie.narrator}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 hover:bg-zinc-800 text-zinc-300 transition-colors backdrop-blur border border-zinc-700/50"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    {copied ? 'Link Copied' : 'Share'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Body & Telegram Storage Actions */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 text-sm text-zinc-400 mb-1.5">
                <span className="font-semibold text-zinc-200">{movie.year}</span>
                <span>•</span>
                <span className="text-primary font-medium">{movie.genre}</span>
                {movie.duration && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {movie.duration}
                    </span>
                  </>
                )}
                <span className="flex items-center gap-1 text-amber-400 font-semibold ml-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {movie.rating}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {movie.title}
              </h2>
            </div>

            <Link
              href={`/movies/${movie.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors self-start shrink-0"
            >
              Full Details
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
            {movie.description ||
              `Stream or download ${movie.title} with high-clarity Kinyarwanda narration. Available for high-speed download through Telegram or direct streaming.`}
          </p>

          {/* TELEGRAM STORAGE ACTIONS SECTION */}
          <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-950/30 via-zinc-900/60 to-zinc-900 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#229ED9] text-white flex items-center justify-center font-bold shadow-md shadow-[#229ED9]/40">
                  <Send className="w-4 h-4 -rotate-12 translate-x-px" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Telegram Storage & Fast Download
                    <span className="text-[10px] uppercase font-extrabold bg-[#229ED9]/20 text-[#229ED9] px-2 py-0.5 rounded-full border border-[#229ED9]/30">
                      Unlimited Speed
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Store and stream movies effortlessly with no download limits or buffering
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href={telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white font-semibold text-sm transition-all shadow-lg shadow-[#229ED9]/25 hover:shadow-[#229ED9]/40"
              >
                <Download className="w-4 h-4" />
                <span>Open in Telegram Channel</span>
              </a>

              <a
                href={telegramBot}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-sm border border-zinc-700/60 transition-all hover:border-zinc-500"
              >
                <Send className="w-4 h-4 text-[#229ED9]" />
                <span>Send to My Telegram Bot</span>
              </a>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
              <span>💡 Files up to 4GB supported directly in Telegram</span>
              <span className="text-zinc-500">Fast resume & offline playback</span>
            </div>
          </div>

          {/* Primary Watch Action */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <Link
              href={`/movies/${movie.id}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold text-sm shadow-lg shadow-primary/30 transition-all hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch Full Movie
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
