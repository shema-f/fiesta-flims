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
      <div className={`relative w-full max-w-full overflow-hidden bg-gradient-to-r from-primary/25 via-orange-950/60 to-primary/20 border-b border-primary/30 py-2 px-3 sm:px-4 text-xs ${className}`}>
        <div className="container mx-auto flex items-center justify-between gap-2 sm:gap-3 min-w-0">
          <a
            href={ad.targetUrl}
            onClick={handleClick}
            target={ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex-1 flex items-center gap-2 hover:opacity-95 transition-opacity min-w-0 overflow-hidden"
          >
            <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm shrink-0">
              <Sparkles className="w-3 h-3" />
              {ad.badgeText}
            </span>
            <span className="font-bold text-white truncate text-[11px] sm:text-xs min-w-0">{ad.headline}</span>
            <span className="hidden lg:inline text-zinc-300 truncate text-xs">— {ad.description}</span>
          </a>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <a
              href={ad.targetUrl}
              onClick={handleClick}
              target={ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="px-2.5 sm:px-3 py-1 rounded-full bg-primary hover:bg-orange-500 text-white text-[10px] sm:text-[11px] font-black transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap"
            >
              <span>{ad.ctaText}</span>
              <ChevronRight className="w-3 h-3" />
            </a>
            {dismissible && (
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
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
    <div className={`relative w-full max-w-full my-6 sm:my-8 rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-xl group ${className}`}>
      {/* Background with image and dark gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover opacity-25 filter blur-[1px] group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/95 to-black/75" />
      </div>

      <div className="relative z-10 p-4 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 min-w-0">
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0">
              {ad.badgeText}
            </span>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">FiestaFlix Partner</span>
          </div>

          <h3 className="text-sm sm:text-xl font-black text-white leading-snug break-words">
            {ad.headline}
          </h3>

          <p className="text-[11px] sm:text-sm text-zinc-300 leading-relaxed font-normal break-words line-clamp-2 sm:line-clamp-none">
            {ad.description}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          <a
            href={ad.targetUrl}
            onClick={handleClick}
            target={ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all whitespace-nowrap"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </a>

          {dismissible && (
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors shrink-0"
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
