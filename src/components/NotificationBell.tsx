'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Film, CheckCheck, ExternalLink } from 'lucide-react';
import type { AppNotification } from '@/lib/notificationService';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(0);

  /** Android/Chrome can only show a tray notification once permission is granted.
   *  Ask on the first interaction with the bell — never on page load. */
  const requestNotificationPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  };

  /** Raise a new notification in the OS tray when the tab is backgrounded —
   *  the in-app list is invisible in that state on a phone. */
  const showSystemNotification = (n: AppNotification) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted' || !document.hidden || !n) return;
    navigator.serviceWorker?.ready
      .then((reg) =>
        reg.showNotification(n.title, {
          body: n.message,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          data: { url: n.link || '/' },
          tag: n.id,
        })
      )
      .catch(() => {});
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        const list: AppNotification[] = json.data.notifications || [];
        const unread = json.data.unreadCount || 0;
        setNotifications(list);
        setUnreadCount(unread);
        // Something new while the app is backgrounded → also raise it in the tray.
        if (unread > prevUnreadRef.current) showSystemNotification(list[0]);
        prevUnreadRef.current = unread;
      }
    } catch {
      // Quietly ignore network failures in background fetch
    }
  }, []);

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
  }, [fetchNotifications]);

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
        onClick={() => {
          requestNotificationPermission();
          setIsOpen(!isOpen);
        }}
        className="relative p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-full transition-all duration-200"
        aria-label="Notifications"
        aria-expanded={isOpen}
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
        <>
          {/* Mobile: dim the page behind the bottom sheet */}
          <button
            aria-label="Close notifications"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
          />

          {/* Mobile (<sm): full-width bottom sheet anchored above the bottom
              nav. Desktop (sm+): dropdown pinned under the bell. */}
          <div className="fixed left-2 right-2 bottom-20 z-50 max-h-[70vh] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden animate-slideIn sm:absolute sm:left-auto sm:right-0 sm:bottom-auto sm:top-full sm:mt-2 sm:max-h-none sm:w-80 lg:w-96 sm:rounded-2xl sm:animate-scaleUp">
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

            {/* Notifications List */}
            <div className="max-h-[55vh] sm:max-h-80 overflow-y-auto divide-y divide-zinc-800/50 overscroll-contain">
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
                    onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  >
                    {/* Thumbnail / Icon */}
                    {notif.thumbnailUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
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
                              if (!notif.isRead) handleMarkAsRead(notif.id);
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
        </>
      )}
    </div>
  );
}
