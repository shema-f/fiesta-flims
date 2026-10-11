'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MovieCommentsProps {
  movieId: string | number;
  movieTitle?: string;
}

interface CommentItem {
  id: string;
  content: string;
  author: string;
  isGuest: boolean;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Movie discussion thread.
 *
 * Replaces the old Telegram download block. Signed-in users comment as
 * themselves; guests can still comment by leaving a display name, so nobody is
 * forced to create an account just to say something.
 */
export default function MovieComments({ movieId, movieTitle }: MovieCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetId = String(movieId);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/comments?targetId=${encodeURIComponent(targetId)}&targetType=movie`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setComments(json.data);
    } catch {
      // Leave the thread empty rather than breaking the page.
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) {
      setError('Write something first.');
      return;
    }
    if (!user && !name.trim()) {
      setError('Please enter your name so people know who wrote it.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, targetType: 'movie', content, name: name.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setComments((prev) => [json.data, ...prev]);
        setText('');
        setError(null);
      } else {
        setError(json.error || 'Could not post your comment. Please try again.');
      }
    } catch {
      setError('Network error — your comment was not posted.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 my-8" id="comments">
      <div className="p-5 sm:p-7 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">Comments</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              {movieTitle ? ` on “${movieTitle}”` : ''} — signed in or not, everyone can join in.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mb-8">
          {!user && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="Your name"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
            />
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder={
              user
                ? 'Share your thoughts about this movie...'
                : 'Write a comment as a guest — no account needed...'
            }
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none resize-y"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-zinc-500">
              {user ? (
                <>
                  Commenting as <strong className="text-zinc-300">{user.name || user.email}</strong>
                </>
              ) : (
                <>
                  Posting as a guest.{' '}
                  <Link href="/login" className="text-primary hover:underline font-semibold">
                    Sign in
                  </Link>{' '}
                  to use your account everywhere.
                </>
              )}
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white text-xs font-black shadow-lg shadow-primary/25 disabled:opacity-60 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Post Comment</span>
            </button>
          </div>
          {error && (
            <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-8 gap-3 text-zinc-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            No comments yet — be the first to say something.
          </div>
        ) : (
          <ul className="space-y-4">
            {comments.map((c) => (
              <li
                key={c.id}
                className="flex gap-3 p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  {(c.author || '?').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{c.author}</span>
                    {c.isGuest && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-bold uppercase">
                        Guest
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-500">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed break-words whitespace-pre-wrap mt-1">
                    {c.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
