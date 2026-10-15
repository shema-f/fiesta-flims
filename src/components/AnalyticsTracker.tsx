'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/**
 * Keeps Google Analytics page_views correct under client-side navigation.
 *
 * The root layout's gtag config sends the initial page_view; the App Router
 * then swaps pages without reloading, which would silently drop every
 * subsequent page. This component re-fires `gtag('config', …)` on each route
 * change, skipping only the very first render so the initial page is never
 * counted twice.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const query = searchParams?.toString();
    trackPageView(query ? `${pathname}?${query}` : pathname, document.title);
  }, [pathname, searchParams]);

  return null;
}
