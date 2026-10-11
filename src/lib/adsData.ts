import { prisma } from '@/lib/prisma';

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

const PLACEMENTS = new Set<string>([
  'HEADER_BANNER',
  'HOME_INTERSTITIAL',
  'NEWS_IN_FEED',
  'ARTICLE_IN_BODY',
  'VIDEO_PLAYER_BANNER',
  'FOOTER_PROMO',
]);

/** Unknown placement values (hand-edited rows) degrade to the header slot. */
function normalizePlacement(value: string): AdPlacement {
  return PLACEMENTS.has(value) ? (value as AdPlacement) : 'HEADER_BANNER';
}

export const INITIAL_ADS: SiteAd[] = [
  {
    id: 'ad-1',
    title: 'FiestaFlix 100% Free Forever',
    headline: '100% Free Cinema (Ku Buntu) — Support Our High-Speed Servers Optionally',
    description:
      'Every movie, 4K stream, and Agasobanuye voice track is 100% free with no paywall. Love our work? Support our fast servers optionally via MTN MoMo.',
    placement: 'HEADER_BANNER',
    imageUrl: '/fallback-poster.png',
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
    description:
      'Special data bundles optimized for streaming Agasobanuye movies and downloading 1080p/4K releases with zero lag.',
    placement: 'HOME_INTERSTITIAL',
    imageUrl: '/fallback-poster.png',
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
    description:
      'Receive instant 4K movie uploads, direct download files without links, and exclusive narrator announcements.',
    placement: 'NEWS_IN_FEED',
    imageUrl: '/fallback-poster.png',
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
    description:
      'Studio-grade noise-cancelling headphones tailored for movie immersion and voice-over clarity.',
    placement: 'ARTICLE_IN_BODY',
    imageUrl: '/fallback-poster.png',
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
    description:
      'Never buffer again while streaming Rocky Kimomo or Hollywood releases with high-speed fiber.',
    placement: 'VIDEO_PLAYER_BANNER',
    imageUrl: '/fallback-poster.png',
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
    description:
      'Instant offline access, background downloads, and custom push notifications for your favorite narrators.',
    placement: 'FOOTER_PROMO',
    imageUrl: '/fallback-poster.png',
    targetUrl: '/help#pwa',
    badgeText: 'Official App',
    ctaText: 'Install App',
    isActive: true,
    impressions: 11200,
    clicks: 1350,
    createdAt: '2026-09-28T16:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// In-memory fallback
//
// Campaigns now live in the `SiteAd` table so they survive cold starts. The
// memory store remains as a safety net for the window before the migration is
// applied and for a database outage — the site must keep serving ads.
// ---------------------------------------------------------------------------

const globalAdsStore = globalThis as unknown as {
  __FIESTAFLIX_ADS_STORE__?: SiteAd[];
};

function memoryAds(): SiteAd[] {
  if (!globalAdsStore.__FIESTAFLIX_ADS_STORE__) {
    globalAdsStore.__FIESTAFLIX_ADS_STORE__ = [...INITIAL_ADS];
  }
  return globalAdsStore.__FIESTAFLIX_ADS_STORE__;
}

interface SiteAdRow {
  id: string;
  title: string;
  headline: string;
  description: string;
  placement: string;
  imageUrl: string;
  targetUrl: string;
  badgeText: string;
  ctaText: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: Date;
}

function toAd(row: SiteAdRow): SiteAd {
  return {
    id: row.id,
    title: row.title,
    headline: row.headline,
    description: row.description,
    placement: normalizePlacement(row.placement),
    imageUrl: row.imageUrl,
    targetUrl: row.targetUrl,
    badgeText: row.badgeText,
    ctaText: row.ctaText,
    isActive: row.isActive,
    impressions: row.impressions,
    clicks: row.clicks,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Newest campaigns first, matching the admin table order. */
const AD_ORDER = { createdAt: 'desc' } as const;

export async function getAllAds(): Promise<SiteAd[]> {
  try {
    const rows = await prisma.siteAd.findMany({ orderBy: AD_ORDER });
    // Empty table (fresh database, migration not applied yet) → serve defaults.
    if (rows.length > 0) return rows.map(toAd);
  } catch {
    // Fall through to memory.
  }
  return memoryAds();
}

export async function getActiveAds(placement?: AdPlacement): Promise<SiteAd[]> {
  try {
    const rows = await prisma.siteAd.findMany({
      where: { isActive: true, ...(placement ? { placement } : {}) },
      orderBy: AD_ORDER,
    });
    if (rows.length > 0) return rows.map(toAd);
  } catch {
    // Fall through to memory.
  }
  return memoryAds().filter((ad) => ad.isActive && (!placement || ad.placement === placement));
}

export type NewAd = Omit<SiteAd, 'id' | 'impressions' | 'clicks' | 'createdAt'>;

export async function createAd(data: NewAd): Promise<SiteAd> {
  const created = await prisma.siteAd.create({
    data: {
      title: data.title,
      headline: data.headline,
      description: data.description || '',
      placement: normalizePlacement(data.placement),
      imageUrl: data.imageUrl || '/fallback-poster.png',
      targetUrl: data.targetUrl,
      badgeText: data.badgeText || 'Sponsored',
      ctaText: data.ctaText || 'Learn More',
      isActive: data.isActive !== false,
    },
  });

  // Keep the fallback in sync so a later outage still shows the new campaign.
  memoryAds().unshift(toAd(created));
  return toAd(created);
}

export async function updateAd(id: string, updates: Partial<SiteAd>): Promise<SiteAd | null> {
  const data: Record<string, unknown> = {};
  if (updates.title !== undefined) data.title = updates.title;
  if (updates.headline !== undefined) data.headline = updates.headline;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.placement !== undefined) data.placement = normalizePlacement(updates.placement);
  if (updates.imageUrl !== undefined) data.imageUrl = updates.imageUrl;
  if (updates.targetUrl !== undefined) data.targetUrl = updates.targetUrl;
  if (updates.badgeText !== undefined) data.badgeText = updates.badgeText;
  if (updates.ctaText !== undefined) data.ctaText = updates.ctaText;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  try {
    const updated = await prisma.siteAd.update({ where: { id }, data });
    const mem = memoryAds();
    const index = mem.findIndex((a) => a.id === id);
    if (index !== -1) mem[index] = toAd(updated);
    return toAd(updated);
  } catch {
    const mem = memoryAds();
    const index = mem.findIndex((a) => a.id === id);
    if (index === -1) return null;
    mem[index] = { ...mem[index], ...updates };
    return mem[index];
  }
}

export async function toggleAdActive(id: string): Promise<SiteAd | null> {
  try {
    const current = await prisma.siteAd.findUnique({ where: { id } });
    if (!current) return null;
    const updated = await prisma.siteAd.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    const mem = memoryAds();
    const index = mem.findIndex((a) => a.id === id);
    if (index !== -1) mem[index] = toAd(updated);
    return toAd(updated);
  } catch {
    const ad = memoryAds().find((a) => a.id === id);
    if (!ad) return null;
    ad.isActive = !ad.isActive;
    return ad;
  }
}

export async function deleteAd(id: string): Promise<boolean> {
  let deleted = false;
  try {
    await prisma.siteAd.delete({ where: { id } });
    deleted = true;
  } catch {
    // Not in the database (memory-only fallback) — still remove it below.
  }
  const mem = memoryAds();
  const before = mem.length;
  globalAdsStore.__FIESTAFLIX_ADS_STORE__ = mem.filter((a) => a.id !== id);
  return deleted || globalAdsStore.__FIESTAFLIX_ADS_STORE__.length < before;
}

export async function trackAdImpression(id: string): Promise<void> {
  try {
    await prisma.siteAd.update({
      where: { id },
      data: { impressions: { increment: 1 } },
    });
  } catch {
    const ad = memoryAds().find((a) => a.id === id);
    if (ad) ad.impressions += 1;
  }
}

export async function trackAdClick(id: string): Promise<void> {
  try {
    await prisma.siteAd.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
  } catch {
    const ad = memoryAds().find((a) => a.id === id);
    if (ad) ad.clicks += 1;
  }
}
