/**
 * Google Analytics 4 (gtag.js) helpers.
 *
 * The measurement ID is env-driven so a property swap never touches component
 * code: set NEXT_PUBLIC_GA_MEASUREMENT_ID in Vercel, otherwise the verified
 * production ID below is used. All calls are browser-only and fail silently
 * (ad blockers, SSR, bot protection) — analytics must never break the app.
 */

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-3R25V151MV';

type GtagArgs = [command: string, ...rest: unknown[]];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

/** Queue a gtag command. Safe to call anywhere, any time. */
export function gtag(...args: GtagArgs): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // gtag.js defines the real function once it loads; before that, queueing
  // raw arguments on dataLayer is exactly what the official snippet does.
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
  } else {
    window.dataLayer.push(args);
  }
}

/** Behavior events we care about for the admin report. */
export type BehaviorEvent =
  | 'search'
  | 'select_content'
  | 'play_movie'
  | 'watch_trailer'
  | 'download'
  | 'add_to_favorites'
  | 'remove_from_favorites'
  | 'sign_up'
  | 'login'
  | 'movie_request'
  | 'share';

export function trackEvent(
  name: BehaviorEvent,
  params?: Record<string, string | number | boolean>
): void {
  gtag('event', name, { send_to: GA_MEASUREMENT_ID, ...params });
}

/** Fire a virtual page_view (SPA route change — App Router never reloads). */
export function trackPageView(path: string, title?: string): void {
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : path,
    page_title: title,
  });
}
