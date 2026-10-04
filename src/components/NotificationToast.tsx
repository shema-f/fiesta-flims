'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Film, X, Sparkles, ArrowRight } from 'lucide-react';
import type { AppNotification } from '@/lib/notificationService';

export default function NotificationToast() {
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);

  useEffect(() => {
    // Check for new notifications periodically
    const checkForNewUploads = async () => {
      try {
        const res = await fetch('/api/notifications', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data?.notifications?.length > 0) {
          const latest: AppNotification = json.data.notifications[0];
          // If this is a new movie upload and we haven't toasted it in this session yet
          const seenKey = `fiesta_toast_seen_${latest.id}`;
          const alreadySeen = typeof window !== 'undefined' && sessionStorage.getItem(seenKey);

          if (!alreadySeen && latest.type === 'NEW_MOVIE') {
            setActiveToast(latest);
            setLastSeenId(latest.id);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(seenKey, 'true');
            }
          }
        }
      } catch {
        // Ignore network errors in polling
      }
    };

    // Initial check after 2 seconds
    const initialTimer = setTimeout(checkForNewUploads, 2000);
    // Poll every 15 seconds
    const interval = setInterval(checkForNewUploads, 15000);

    // Also listen to custom event triggered immediately when admin uploads a movie
    const handleMovieUploadedEvent = (e: CustomEvent<AppNotification>) => {
      if (e.detail) {
        setActiveToast(e.detail);
        setLastSeenId(e.detail.id);
      }
    };

    window.addEventListener('fiesta-movie-uploaded' as any, handleMovieUploadedEvent);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('fiesta-movie-uploaded' as any, handleMovieUploadedEvent);
    };
  }, [lastSeenId]);

  // Auto-dismiss toast after 8 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[60] max-w-sm w-full animate-slideIn">
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-primary/40 rounded-2xl p-4 shadow-2xl shadow-primary/20 backdrop-blur-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            {activeToast.thumbnailUrl ? (
              <img
                src={activeToast.thumbnailUrl}
                alt={activeToast.movieTitle || 'Movie'}
                className="w-12 h-16 object-cover rounded-lg shadow-md shrink-0 border border-white/10"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/30">
                <Film className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  <Sparkles className="w-3 h-3" /> New Movie Uploaded
                </span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">
                {activeToast.title}
              </h4>
              <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                {activeToast.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveToast(null)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button */}
        {activeToast.link && (
          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-end">
            <Link
              href={activeToast.link}
              onClick={() => setActiveToast(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 px-3.5 py-1.5 rounded-full shadow-md shadow-primary/30 transition-all hover:scale-105"
            >
              <span>Watch Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
