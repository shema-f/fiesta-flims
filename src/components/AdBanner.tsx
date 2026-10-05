'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, X, ChevronRight } from 'lucide-react';
import { AdPlacement, SiteAd, INITIAL_ADS } from '@/lib/adsData';

interface AdBannerProps {
  placement: AdPlacement;
  className?: string;
  dismissible?: boolean;
}

export default function AdBanner({ placement, className = '', dismissible = false }: AdBannerProps) {
  const [ad, setAd] = useState<SiteAd | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Initial match from initial ads
    const localMatch = INITIAL_ADS.find((a) => a.isActive && a.placement === placement);
    if (localMatch) {
      setAd(localMatch);
    }

    // Live fetch from API
    fetch(`/api/ads?placement=${placement}`)
      .then((res) => res.json())
      .then((data) => {
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
  }, [placement]);

  if (!ad || isDismissed) return null;

  const handleClick = () => {
    fetch(`/api/ads/${ad.id}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'click' }),
    }).catch(() => {});
  };

  // Header banner layout (compact top ticker/strip)
  if (placement === 'HEADER_BANNER') {
    return (
      <div className={`relative bg-gradient-to-r from-primary/25 via-orange-950/60 to-primary/20 border-b border-primary/30 py-2 px-4 text-xs ${className}`}>
        <div className="container mx-auto flex items-center justify-between gap-3">
          <a
            href={ad.targetUrl}
            onClick={handleClick}
            target={ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex-1 flex flex-wrap items-center gap-2 hover:opacity-95 transition-opacity"
          >
            <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              {ad.badgeText}
            </span>
            <span className="font-bold text-white truncate">{ad.headline}</span>
            <span className="hidden md:inline text-zinc-300 truncate">— {ad.description}</span>
          </a>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={ad.targetUrl}
              onClick={handleClick}
              target={ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full bg-primary hover:bg-orange-500 text-white text-[11px] font-black transition-colors flex items-center gap-1 shadow-sm"
            >
              <span>{ad.ctaText}</span>
              <ChevronRight className="w-3 h-3" />
            </a>
            {dismissible && (
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="text-zinc-400 hover:text-white p-0.5"
                title="Dismiss announcement"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Interstitial & Feed Banner
  return (
    <div className={`relative my-8 rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-xl group ${className}`}>
      {/* Background with image and dark gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover opacity-25 filter blur-[1px] group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-black/60" />
      </div>

      <div className="relative z-10 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-black uppercase tracking-wider">
              {ad.badgeText}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">FiestaFlix Partner</span>
          </div>

          <h3 className="text-base sm:text-xl font-black text-white leading-snug">
            {ad.headline}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            {ad.description}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={ad.targetUrl}
            onClick={handleClick}
            target={ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {dismissible && (
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
