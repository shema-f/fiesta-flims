'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * First-party time-on-site tracking (admin behavior report).
 *
 * Generates one session id per browser (persisted in localStorage) and posts
 * a heartbeat to /api/track/session every ~30s while the tab is visible,
 * accumulating `activeSeconds` server-side. Signed-in users get their account
 * attached server-side on the first heartbeat after sign-in; guests stay
 * anonymous but fully counted, which is exactly what the admin panel shows
 * as "guests vs users".
 *
 * The same session id is attached to download beacons, so a guest's
 * downloads remain attributable to this visit. Every call is best-effort and
 * silent — analytics must never break the app.
 */

const SESSION_KEY = 'fiesta_visitor_session_v1';
const HEARTBEAT_MS = 30_000;
const PING_MS = 20_000; // heartbeat cadence while visible

function getOrCreateSessionId(): string | null {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing;
    const generated =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? `vs-${crypto.randomUUID()}`
        : `vs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(SESSION_KEY, generated);
    return generated;
  } catch {
    return null; // private mode / storage disabled — skip tracking entirely
  }
}

/** Read the session id for other trackers (e.g. the download beacon). */
export function getVisitorSessionId(): string | null {
  return getOrCreateSessionId();
}

export default function SessionTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  // Visible seconds accumulated locally since the last successful heartbeat.
  const pendingSecondsRef = useRef(0);
  // Path changes since the last heartbeat (SPA navigations count as views).
  const pendingPagesRef = useRef(0);
  const lastTickRef = useRef<number>(Date.now());
  const lastSentPathRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
    if (!sessionIdRef.current) return;

    const send = (final = false) => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;
      const activeSeconds = Math.min(Math.round(pendingSecondsRef.current), 120);
      const pages = pendingPagesRef.current;
      if (!final && activeSeconds === 0 && pages === 0) return;

      const payload = JSON.stringify({
        sessionId,
        activeSeconds: final ? Math.min(activeSeconds, 30) : activeSeconds,
        pages,
      });

      let sent = false;
      try {
        // sendBeacon survives the page unloading (tab close / navigation);
        // fetch(keepalive) is the fallback where it is unavailable.
        if (final && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
          sent = navigator.sendBeacon('/api/track/session', payload);
        }
        if (!sent) {
          void fetch('/api/track/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: final,
          }).catch(() => {});
          sent = true;
        }
      } catch {
        return;
      }
      // Only reset counters once the heartbeat left the browser.
      if (sent) {
        pendingSecondsRef.current = 0;
        pendingPagesRef.current = 0;
        lastTickRef.current = Date.now();
      }
    };

    // Tick: credit visible seconds in slices so a backgrounded tab never
    // accrues time (the interval keeps running, but hidden ticks add nothing).
    const tick = () => {
      const now = Date.now();
      const elapsed = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      if (document.visibilityState === 'visible') {
        pendingSecondsRef.current += Math.min(elapsed, PING_MS / 1000);
      }
    };

    const interval = window.setInterval(() => {
      tick();
      send();
    }, HEARTBEAT_MS);

    // Page transitions: count the new path immediately so the server's
    // pageViews total reflects real navigation, not just timed heartbeats.
    if (lastSentPathRef.current !== pathname) {
      lastSentPathRef.current = pathname;
      pendingPagesRef.current += 1;
      send(); // first visit flushes right away so the session appears instantly
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Tab hidden — flush what we have and stop counting until return.
        tick();
        send();
        lastTickRef.current = Date.now();
      } else {
        lastTickRef.current = Date.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    const onPageHide = () => send(true);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  // Route change → new page view (the effect above only runs once).
  useEffect(() => {
    if (lastSentPathRef.current === null) {
      lastSentPathRef.current = pathname;
      return;
    }
    if (lastSentPathRef.current !== pathname) {
      lastSentPathRef.current = pathname;
      pendingPagesRef.current += 1;
    }
  }, [pathname]);

  return null;
}
