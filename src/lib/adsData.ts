export type AdPlacement =
  | 'HEADER_BANNER'
  | 'HOME_INTERSTITIAL'
  | 'NEWS_IN_FEED'
  | 'ARTICLE_IN_BODY'
  | 'VIDEO_PLAYER_BANNER'
  | 'FOOTER_PROMO';

export interface SiteAd {
  id: string;
  title: string;
  headline: string;
  description: string;
  placement: AdPlacement;
  imageUrl: string;
  targetUrl: string;
  badgeText: string;
  ctaText: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: string;
}

export const INITIAL_ADS: SiteAd[] = [
  {
    id: 'ad-1',
    title: 'FiestaFlix 100% Free Forever',
    headline: '100% Free Cinema (Ku Buntu) — Support Our High-Speed Servers Optionally',
    description: 'Every movie, 4K stream, and Agasobanuye voice track is 100% free with no paywall. Love our work? Support our fast servers optionally via MTN MoMo.',
    placement: 'HEADER_BANNER',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    targetUrl: '/support',
    badgeText: '100% Free • Optional Support',
    ctaText: 'Support Optionally ❤️',
    isActive: true,
    impressions: 12450,
    clicks: 1420,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'ad-2',
    title: 'Kigali Cinema Super Pack',
    headline: 'Stream Rwandan Blockbusters on High-Speed 4G/5G Cinema Data',
    description: 'Special data bundles optimized for streaming Agasobanuye movies and downloading 1080p/4K releases with zero lag.',
    placement: 'HOME_INTERSTITIAL',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
    targetUrl: 'https://wa.me/250780000000',
    badgeText: 'Featured Sponsor',
    ctaText: 'Activate Bundle',
    isActive: true,
    impressions: 9840,
    clicks: 860,
    createdAt: '2026-09-10T12:00:00Z',
  },
  {
    id: 'ad-3',
    title: 'Telegram Movie Cloud Channel',
    headline: 'Join 50,000+ Fans on Our Telegram Cloud Cinema Channel',
    description: 'Receive instant 4K movie uploads, direct download files without links, and exclusive narrator announcements.',
    placement: 'NEWS_IN_FEED',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    targetUrl: 'https://t.me/fiestaflix_movies',
    badgeText: 'Telegram Partner',
    ctaText: 'Join Channel Free',
    isActive: true,
    impressions: 7410,
    clicks: 980,
    createdAt: '2026-09-15T09:30:00Z',
  },
  {
    id: 'ad-4',
    title: 'Ultra Cinema Headphones & Audio Gear',
    headline: 'Experience Agasobanuye Narration in Crystal Clear Surround Sound',
    description: 'Studio-grade noise-cancelling headphones tailored for movie immersion and voice-over clarity.',
    placement: 'ARTICLE_IN_BODY',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop',
    targetUrl: 'https://wa.me/250780000000',
    badgeText: 'Gear Sponsor',
    ctaText: 'Shop Gear',
    isActive: true,
    impressions: 5120,
    clicks: 410,
    createdAt: '2026-09-20T14:00:00Z',
  },
  {
    id: 'ad-5',
    title: 'High-Speed Home Fiber Internet',
    headline: 'Stream 4K Ultra HD Cinema with Unlimited Home High-Speed Internet',
    description: 'Never buffer again while streaming Rocky Kimomo or Hollywood releases with high-speed fiber.',
    placement: 'VIDEO_PLAYER_BANNER',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop',
    targetUrl: 'https://wa.me/250780000000',
    badgeText: 'Partner Ad',
    ctaText: 'Connect Now',
    isActive: true,
    impressions: 8900,
    clicks: 720,
    createdAt: '2026-09-25T11:00:00Z',
  },
  {
    id: 'ad-6',
    title: 'FiestaFlix Mobile App PWA',
    headline: 'Install FiestaFlix on Your Android or iPhone in One Tap',
    description: 'Instant offline access, background downloads, and custom push notifications for your favorite narrators.',
    placement: 'FOOTER_PROMO',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop',
    targetUrl: '/help#pwa',
    badgeText: 'Official App',
    ctaText: 'Install App',
    isActive: true,
    impressions: 11200,
    clicks: 1350,
    createdAt: '2026-09-28T16:00:00Z',
  },
];

// Global in-memory ads store for runtime modifications across Next.js route chunks
const globalAdsStore = globalThis as unknown as {
  __FIESTAFLIX_ADS_STORE__?: SiteAd[];
};

if (!globalAdsStore.__FIESTAFLIX_ADS_STORE__) {
  globalAdsStore.__FIESTAFLIX_ADS_STORE__ = [...INITIAL_ADS];
}

export function getAllAds(): SiteAd[] {
  return globalAdsStore.__FIESTAFLIX_ADS_STORE__ || INITIAL_ADS;
}

export function getActiveAds(placement?: AdPlacement): SiteAd[] {
  const all = getAllAds();
  return all.filter((ad) => ad.isActive && (!placement || ad.placement === placement));
}

export function createAd(data: Omit<SiteAd, 'id' | 'impressions' | 'clicks' | 'createdAt'>): SiteAd {
  const newAd: SiteAd = {
    ...data,
    id: `ad-${Date.now()}`,
    impressions: 1,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };

  if (!globalAdsStore.__FIESTAFLIX_ADS_STORE__) {
    globalAdsStore.__FIESTAFLIX_ADS_STORE__ = [...INITIAL_ADS];
  }

  globalAdsStore.__FIESTAFLIX_ADS_STORE__ = [newAd, ...globalAdsStore.__FIESTAFLIX_ADS_STORE__];
  return newAd;
}

export function updateAd(id: string, updates: Partial<SiteAd>): SiteAd | null {
  const ads = getAllAds();
  const index = ads.findIndex((a) => a.id === id);
  if (index === -1) return null;

  ads[index] = { ...ads[index], ...updates };
  return ads[index];
}

export function toggleAdActive(id: string): SiteAd | null {
  const ads = getAllAds();
  const ad = ads.find((a) => a.id === id);
  if (!ad) return null;

  ad.isActive = !ad.isActive;
  return ad;
}

export function deleteAd(id: string): boolean {
  if (!globalAdsStore.__FIESTAFLIX_ADS_STORE__) return false;
  const initialLen = globalAdsStore.__FIESTAFLIX_ADS_STORE__.length;
  globalAdsStore.__FIESTAFLIX_ADS_STORE__ = globalAdsStore.__FIESTAFLIX_ADS_STORE__.filter((a) => a.id !== id);
  return globalAdsStore.__FIESTAFLIX_ADS_STORE__.length < initialLen;
}

export function trackAdImpression(id: string) {
  const ad = getAllAds().find((a) => a.id === id);
  if (ad) ad.impressions += 1;
}

export function trackAdClick(id: string) {
  const ad = getAllAds().find((a) => a.id === id);
  if (ad) ad.clicks += 1;
}
