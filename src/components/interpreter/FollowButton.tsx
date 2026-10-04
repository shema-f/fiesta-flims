'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, BellRing, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatFollowers } from '@/lib/interpreters';

interface FollowButtonProps {
  slug: string;
  initialFollowers: number;
}

export default function FollowButton({ slug, initialFollowers }: FollowButtonProps) {
  const { user } = useAuth();
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/interpreter-follow?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!active || !json?.success) return;
        setFollowers(json.data.followers);
        setFollowing(json.data.following);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [slug]);

  const toggle = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    try {
      const res = await fetch('/api/interpreter-follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const json = await res.json();
        setFollowing(json.data.following);
        setFollowers(json.data.followers);
      }
    } finally {
      setBusy(false);
    }
  }, [slug, user]);

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <button
          onClick={toggle}
          disabled={busy}
          className={following ? 'btn-ghost' : 'btn-primary'}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : following ? (
            <Check className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {following ? 'Following' : 'Follow'}
        </button>
      ) : (
        <Link href="/login" className="btn-primary">
          <BellRing className="h-4 w-4" />
          Follow
        </Link>
      )}
      <span className="text-xs text-muted">
        <strong className="text-foreground">{formatFollowers(followers)}</strong> followers
      </span>
    </div>
  );
}
