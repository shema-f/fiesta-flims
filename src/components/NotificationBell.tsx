'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Film, CheckCheck, Sparkles, Send, ExternalLink } from 'lucide-react';
import type { AppNotification } from '@/lib/notificationService';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setNotifications(json.data.notifications || []);
        setUnreadCount(json.data.unreadCount || 0);
      }
    } catch {
      // Quietly ignore network failures in background fetch
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    const handleCustomUpload = (e: CustomEvent<AppNotification>) => {
      if (e.detail) {
        setNotifications((prev) => [e.detail, ...prev]);
        setUnreadCount((c) => c + 1);
      }
    };

    window.addEventListener('fiesta-movie-uploaded' as any, handleCustomUpload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('fiesta-movie-uploaded' as any, handleCustomUpload);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
    } catch {
      // Ignore
    }
  };

  // Demo helper: allows testing notification sending directly
  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    const movieTitles = [
      'Gladiator of Kigali',
      'Cyber Rwanda 2099',
      'The Last Warrior of Huye',
      'Midnight Express: Nyabugogo',
      'Sankara: The Untouchable',
    ];
    const narrators = ['Junior Giti', 'Rocky Kimomo', 'Sankara', 'Yanga'];
    const randomTitle = movieTitles[Math.floor(Math.random() * movieTitles.length)];
    const randomNarrator = narrators[Math.floor(Math.random() * narrators.length)];

    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: randomTitle,
          releaseYear: 2025,
          genre: 'Action',
          narrator: randomNarrator,
          rating: 8.8,
          thumbnailUrl: '/fallback-poster.png',
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.notification) {
        // Broadcast custom event for immediate UI toast
        window.dispatchEvent(
          new CustomEvent('fiesta-movie-uploaded', { detail: json.data.notification })
        );
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to trigger test movie notification:', err);
    } finally {
      setIsSendingTest(false);
    }
  };

  function formatTimeAgo(isoString: string) {
    const ms = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-full transition-all duration-200"
        aria-label="Notifications"
        title="New movie notifications"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg shadow-rose-500/50 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scaleUp">
          {/* Header */}
          <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Notifications</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/20 text-primary border border-primary/30">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400">
                  Caught up
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-zinc-400 hover:text-primary transition-colors flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Quick upload notification test bar */}
          <div className="px-3.5 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-medium flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Simulate new upload:</span>
            </span>
            <button
              onClick={handleSendTestNotification}
              disabled={isSendingTest}
              className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-[10px] shadow-sm transition-all disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>{isSendingTest ? 'Sending…' : 'Trigger Notification'}</span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 stroke-1" />
                <p className="text-xs font-medium">No notifications yet</p>
                <p className="text-[11px] text-zinc-600 mt-1">
                  You will be notified when new movies are uploaded.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors relative flex items-start gap-3 hover:bg-zinc-900/60 ${
                    !notif.isRead ? 'bg-zinc-900/40' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notif.id)}
                >
                  {/* Thumbnail / Icon */}
                  {notif.thumbnailUrl ? (
                    <img
                      src={notif.thumbnailUrl}
                      alt={notif.movieTitle || 'Movie'}
                      className="w-10 h-14 object-cover rounded-lg shrink-0 border border-white/10"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0">
                      <Film className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-xs font-bold truncate ${
                          !notif.isRead ? 'text-white' : 'text-zinc-300'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 text-[10px]">
                      <span className="text-zinc-500 font-medium">
                        {formatTimeAgo(notif.createdAt)}
                      </span>

                      {notif.link && (
                        <Link
                          href={notif.link}
                          onClick={() => {
                            setIsOpen(false);
                            handleMarkAsRead(notif.id);
                          }}
                          className="text-primary hover:text-orange-400 font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>Watch</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-zinc-800 bg-zinc-900/40 text-center">
            <Link
              href="/movies"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Browse All Movies →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
