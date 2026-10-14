'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Megaphone,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Bell,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import type { AppNotification } from '@/lib/notificationService';

const TYPE_OPTIONS: Array<{ value: AppNotification['type']; label: string }> = [
  { value: 'ANNOUNCEMENT', label: '📣 Announcement' },
  { value: 'NEW_MOVIE', label: '🎬 New Movie' },
  { value: 'COMMUNITY', label: '👥 Community' },
  { value: 'SYSTEM', label: '⚙️ System / Maintenance' },
];

function formatWhen(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Admin tool that composes a site-wide broadcast: a Notification row with
 * `userId = null`, which the bell shows to every visitor — signed in or not.
 * The send path is the existing admin-only POST /api/notifications; the list
 * below it reads back what was already sent (?scope=broadcasts).
 */
export default function AdminBroadcastPanel() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AppNotification['type']>('ANNOUNCEMENT');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const [broadcasts, setBroadcasts] = useState<AppNotification[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const fetchBroadcasts = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/notifications?scope=broadcasts', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.notifications)) {
        setBroadcasts(json.data.notifications);
      } else if (res.status === 401 || res.status === 403) {
        setBroadcasts([]);
        setFeedback({ kind: 'error', text: 'Admin session required to view sent broadcasts.' });
      }
    } catch {
      setFeedback({ kind: 'error', text: 'Could not load sent broadcasts.' });
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    if (!trimmedTitle || !trimmedMessage) {
      setFeedback({ kind: 'error', text: 'A title and a message are both required.' });
      return;
    }

    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          message: trimmedMessage,
          type,
          link: link.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.success) {
        setFeedback({
          kind: 'success',
          text: 'Broadcast sent — it is now in every visitor\'s bell.',
        });
        setTitle('');
        setMessage('');
        setLink('');
        fetchBroadcasts();
      } else {
        setFeedback({
          kind: 'error',
          text:
            json?.error ||
            (res.status === 401 || res.status === 403
              ? 'Admin session required to send a broadcast.'
              : 'Failed to send the broadcast. Please try again.'),
        });
      }
    } catch {
      setFeedback({ kind: 'error', text: 'Network error — the broadcast was not sent.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Site-wide Broadcasts
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Announce everything from a new film to a maintenance window. Broadcasts land in the
            bell of every visitor — signed in or not.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBroadcasts}
          disabled={loadingList}
          className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-2 w-fit shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            feedback.kind === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COMPOSER */}
        <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80">
          <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            Compose Broadcast
          </h3>

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label htmlFor="bc-title" className="text-zinc-300 font-bold">
                Title *
              </label>
              <input
                id="bc-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🎬 10 new Rwandan films just landed"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="bc-message" className="text-zinc-300 font-bold">
                Message *
              </label>
              <textarea
                id="bc-message"
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Stream them in Full HD or download at full speed — no account needed."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="bc-type" className="text-zinc-300 font-bold">
                  Type
                </label>
                <select
                  id="bc-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as AppNotification['type'])}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="bc-link" className="text-zinc-300 font-bold">
                  Link (optional)
                </label>
                <input
                  id="bc-link"
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/rwandan-movies, /plus, /movies/…"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Broadcasts are shared by everyone, so they render as informational and never inflate
              the unread badge. Reports and alerts for admins stay on the admin accounts only.
            </p>

            <div className="pt-3 border-t border-zinc-900 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white font-black text-xs shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100 flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Megaphone className="w-3.5 h-3.5" />
                )}
                <span>{sending ? 'Sending…' : 'Send to Everyone'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* LIVE PREVIEW */}
        <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 self-start">
          <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Bell Preview
          </h3>

          <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
            <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center gap-2">
              <span className="font-bold text-white text-sm">Notifications</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400">
                Caught up
              </span>
            </div>

            <div className="p-3.5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="text-xs font-bold truncate text-zinc-300">
                    {title.trim() || 'Your title shows up here'}
                  </h4>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {message.trim() || 'Your message shows up here for every visitor to read.'}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1 text-[10px]">
                  <span className="text-zinc-500 font-medium">Just now</span>
                  {link.trim() && (
                    <span className="text-primary font-bold flex items-center gap-1">
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-zinc-500">
            {TYPE_OPTIONS.find((o) => o.value === type)?.label} ·{' '}
            {link.trim() ? 'taps through to your link' : 'no link — informational only'}
          </p>
        </div>
      </div>

      {/* SENT BROADCASTS */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80">
        <h3 className="font-bold text-base text-white mb-4">Recently Sent</h3>

        {loadingList && broadcasts.length === 0 ? (
          <div className="py-10 text-center text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-xs">Loading broadcasts…</p>
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="py-10 text-center text-zinc-500">
            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-30 stroke-1" />
            <p className="text-xs font-semibold text-zinc-400">No broadcasts sent yet</p>
            <p className="text-[11px] text-zinc-600 mt-1">
              New movie uploads appear here automatically once they go out.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                      {b.type}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">{b.title}</h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {b.message}
                  </p>
                  {b.link && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-primary font-bold">
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate max-w-[240px]">{b.link}</span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 font-medium shrink-0">
                  {formatWhen(b.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
