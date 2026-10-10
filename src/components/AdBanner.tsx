'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, X, ChevronRight, Volume2 } from 'lucide-react';
import { AdPlacement, SiteAd, INITIAL_ADS } from '@/lib/adsData';

interface AdBannerProps {
  placement: AdPlacement;
  className?: string;
  dismissible?: boolean;
  variant?: 'auto' | 'compact' | 'billboard' | 'card';
}

export default function AdBanner({
  placement,
  className = '',
  dismissible = true,
  variant = 'auto',
}: AdBannerProps) {
  // Initialize with matching local ad immediately to prevent Cumulative Layout Shift (CLS)
  const [ad, setAd] = useState<SiteAd | null>(() => {
    return INITIAL_ADS.find((a) => a.isActive && a.placement === placement) || null;
  });
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Live fetch from API to get any fresh active campaigns
    let isCancelled = false;
    fetch(`/api/ads?placement=${placement}`)
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) return;
        if (data.success && Array.isArray(data.ads) && data.ads.length > 0) {
          const randomAd = data.ads[Math.floor(Math.random() * data.ads.length)];
          setAd(randomAd);
          // Track impression
          fetch(`/api/ads/${randomAd.id}/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'impression' }),
          }).catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [placement]);

  if (isDismissed) return null;

  // Track click handler
  const handleClick = () => {
    if (!ad) return;
    fetch(`/api/ads/${ad.id}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'click' }),
    }).catch(() => {});
  };

  // If no ad at all, reserve responsive minimum space or collapse cleanly
  if (!ad) {
    if (!isMounted) {
      // Reserved layout skeleton to prevent layout shift during hydration
      if (placement === 'HEADER_BANNER') {
        return <div className="w-full h-10 bg-surface/50 border-b border-white/[0.06]" />;
      }
      return (
        <div className="w-full h-32 sm:h-36 rounded-2xl bg-surface/40 border border-white/[0.06] animate-pulse my-2" />
      );
    }
    return null;
  }

  // 1. HEADER BANNER (Top responsive strip)
  if (placement === 'HEADER_BANNER' || variant === 'compact') {
    return (
      <aside
        aria-label="Announcement banner"
        className={`relative w-full max-w-full overflow-hidden border-b border-primary/20 bg-gradient-to-r from-primary/20 via-surface/90 to-primary/15 backdrop-blur-md transition-all ${className}`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2.5 px-3 py-2 text-xs sm:px-6 sm:py-2.5">
          <a
            href={ad.targetUrl}
            onClick={handleClick}
            target={ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="group flex min-w-0 flex-1 items-center gap-2 overflow-hidden hover:opacity-95"
          >
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm sm:text-[10px]">
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {ad.badgeText || 'SPONSOR'}
            </span>
            <span className="truncate text-xs font-bold text-white transition-colors group-hover:text-primary sm:text-xs">
              {ad.headline}
            </span>
            <span className="hidden truncate text-xs text-zinc-300 md:inline">
              — {ad.description}
            </span>
          </a>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <a
              href={ad.targetUrl}
              onClick={handleClick}
              target={ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="inline-flex min-h-[32px] items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-black text-white shadow-sm transition-all hover:brightness-110 active:scale-95 sm:px-3.5 sm:text-xs"
            >
              <span>{ad.ctaText}</span>
              <ChevronRight className="h-3 w-3" />
            </a>

            {dismissible && (
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                title="Dismiss banner"
                aria-label="Dismiss banner"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // 2. IN-FEED NATIVE CARD (Designed to seamlessly blend with movie rails and card grids)
  if (placement === 'NEWS_IN_FEED' || variant === 'card') {
    return (
      <div
        className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card/90 p-4 shadow-lg backdrop-blur transition-all hover:border-primary/40 sm:p-6 ${className}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface sm:h-16 sm:w-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.imageUrl}
                alt={ad.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary sm:text-[10px]">
                  {ad.badgeText || 'SPONSORED'}
                </span>
                <span className="text-[11px] text-muted">FiestaFlix Partner</span>
              </div>
              <h4 className="text-sm font-bold text-foreground sm:text-base line-clamp-1">
                {ad.headline}
              </h4>
              <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                {ad.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
            <a
              href={ad.targetUrl}
              onClick={handleClick}
              target={ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto text-xs py-2 px-4 shadow-sm"
            >
              <span>{ad.ctaText}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {dismissible && (
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
                title="Dismiss ad"
                aria-label="Dismiss ad"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. RESPONSIVE BILLBOARD / INTERSTITIAL (Full-width cinematic hero ad slot)
  return (
    <div
      className={`group relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950 shadow-xl transition-all hover:border-primary/30 sm:rounded-3xl ${className}`}
    >
      {/* Background artwork with dark gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.imageUrl}
          alt={ad.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-20 filter blur-[1px] transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-zinc-950/70 sm:bg-gradient-to-r sm:from-zinc-950 sm:via-zinc-950/95 sm:to-black/80" />
      </div>

      <div className="relative z-10 flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
        <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/40 bg-primary/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary sm:text-[10px]">
              {ad.badgeText || 'FEATURED SPONSOR'}
            </span>
            <span className="text-[10px] font-medium text-zinc-400 sm:text-[11px]">
              FiestaFlix Cinema Partner
            </span>
          </div>

          <h3 className="text-base font-extrabold leading-snug text-white sm:text-xl md:text-2xl">
            {ad.headline}
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-300 sm:line-clamp-3 sm:text-sm">
            {ad.description}
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 pt-1 sm:w-auto sm:flex-row sm:items-center sm:gap-3 sm:pt-0">
          <a
            href={ad.targetUrl}
            onClick={handleClick}
            target={ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 px-5 py-2.5 text-center text-xs font-black text-white shadow-lg shadow-primary/25 transition-all hover:brightness-110 active:scale-98 sm:min-h-[48px] sm:flex-initial sm:rounded-2xl sm:px-6 sm:text-sm"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>

          {dismissible && (
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white sm:h-11 sm:w-11 sm:self-auto sm:rounded-2xl"
              title="Close advertisement"
              aria-label="Close advertisement"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
