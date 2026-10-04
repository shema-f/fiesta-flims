/**
 * StorageManager — the single entry point for media orchestration.
 *
 * The rest of the application asks for a logical asset ("the 1080p stream for
 * movie 123") and the manager decides the best available provider, quality and
 * delivery method. No caller should ever touch a concrete provider directly.
 */

import { prisma } from '@/lib/prisma';
import {
  getProvider,
  getProviderDefinition,
  PROVIDER_DEFINITIONS,
} from './provider-registry';
import {
  QUALITY_ORDER,
  rankQuality,
  type MediaSource,
  type ProviderCapabilities,
  type ProviderHealth,
  type ResolvedSource,
  type SourceQuery,
  type StorageObjectRef,
  type StorageProviderType,
  type StoragePurpose,
  type UploadInput,
} from './types';

interface StorageManagerUploadInput extends UploadInput {
  movieId: string;
  videoAssetId?: string;
  qualityId?: string;
  qualityLabel?: string;
  providerSlug: string;
}

interface ReplicationResult {
  providerSlug: string;
  success: boolean;
  objectId?: string;
  error?: string;
}

function toNumber(value: bigint | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  return typeof value === 'bigint' ? Number(value) : value;
}

/** Order quality labels: requested first, then lower qualities, then higher. */
function qualitySearchOrder(requested?: string): string[] {
  const all = [...QUALITY_ORDER] as string[];
  if (!requested) return all;
  const idx = all.indexOf(requested);
  if (idx === -1) return [requested, ...all];
  const lower = all.slice(idx); // requested + lower
  const higher = all.slice(0, idx); // higher, in ascending rank (best first)
  return [...lower, ...higher];
}

class StorageManager {
  // -------------------------------------------------------------------------
  // Provider rows / seeding
  // -------------------------------------------------------------------------

  /** Ensure every known provider exists as a DB row (idempotent). */
  async ensureProvidersSeeded(): Promise<void> {
    for (const def of PROVIDER_DEFINITIONS) {
      try {
        await prisma.storageProvider.upsert({
          where: { slug: def.slug },
          create: {
            type: def.type,
            slug: def.slug,
            name: def.name,
            enabled: false,
            priority: def.defaultPriority,
            tiers: def.defaultTiers,
            purposes: def.defaultPurposes,
            capabilities: def.capabilities,
          },
          update: {},
        });
      } catch (err) {
        // Mock/dev environment without a live DB — ignore and continue.
        console.warn(`[StorageManager] Could not seed provider ${def.slug}:`, (err as Error)?.message);
      }
    }
  }

  private async providerRows(): Promise<any[]> {
    try {
      return (await prisma.storageProvider.findMany()) as any[];
    } catch {
      return [];
    }
  }

  // -------------------------------------------------------------------------
  // Source resolution
  // -------------------------------------------------------------------------

  /**
   * Resolve the best source for a movie/quality/purpose.
   * Falls back across providers (failover) and then across qualities, and
   * finally to the legacy `fileUrl`/`resolutions` columns so the app keeps
   * working before storage is fully migrated.
   */
  async findSource(query: SourceQuery): Promise<ResolvedSource | null> {
    const { movieId, purpose, allowQualityFallback = true, preferredProvider } = query;

    const rows = await this.loadStorageObjects(movieId, purpose);
    const availableQualities = this.collectQualities(rows);

    if (rows.length > 0) {
      const ordered = this.rankCandidates(rows, query, preferredProvider);
      const qualitiesToTry = allowQualityFallback
        ? qualitySearchOrder(query.quality)
        : [query.quality].filter(Boolean) as string[];

      for (const quality of qualitiesToTry.length ? qualitiesToTry : ['undefined']) {
        const candidates =
          quality === 'undefined' ? ordered : ordered.filter((r) => (r.qualityLabel || '') === quality);
        for (const candidate of candidates) {
          const provider = getProvider(candidate.providerType);
          if (!provider || !provider.isConfigured()) continue;
          try {
            const source =
              purpose === 'STREAMING'
                ? await provider.getStreamSource(candidate.externalObjectId as string, candidate.externalMessageId || undefined)
                : await provider.getDownloadSource(candidate.externalObjectId as string, candidate.externalMessageId || undefined);
            return {
              source: { ...source, quality: candidate.qualityLabel || undefined },
              storageObjectId: candidate.id,
              quality: candidate.qualityLabel || undefined,
              providerSlug: candidate.providerSlug,
              availableQualities,
              legacy: false,
            };
          } catch (err) {
            console.warn(
              `[StorageManager] Provider ${candidate.providerSlug} failed for ${movieId}:`,
              (err as Error)?.message
            );
            // Failover: mark object MISSING and continue.
            await this.markObjectMissing(candidate.id);
          }
        }
      }
    }

    // Legacy fallback — keeps the current catalog playable during migration.
    const legacy = await this.legacySource(movieId, query.quality, purpose);
    if (legacy) {
      return {
        source: legacy,
        providerSlug: 'legacy',
        quality: query.quality,
        availableQualities: availableQualities.length ? availableQualities : legacy.isHls ? ['auto'] : [],
        legacy: true,
      };
    }
    return null;
  }

  getStreamingSource(query: Omit<SourceQuery, 'purpose'>): Promise<ResolvedSource | null> {
    return this.findSource({ ...query, purpose: 'STREAMING' });
  }

  getDownloadSource(query: Omit<SourceQuery, 'purpose'>): Promise<ResolvedSource | null> {
    return this.findSource({ ...query, purpose: 'DOWNLOAD' });
  }

  private async loadStorageObjects(movieId: string, purpose: StoragePurpose): Promise<StorageObjectRef[]> {
    let raw: any[] = [];
    try {
      raw = (await prisma.storageObject.findMany({
        where: {
          status: 'ACTIVE',
          purpose,
          videoAsset: { movieId },
        },
        include: {
          provider: true,
          quality: true,
        },
      })) as any[];
    } catch {
      return [];
    }

    return raw
      .filter((o) => o.provider?.enabled)
      .map((o) => ({
        id: o.id,
        providerId: o.providerId,
        providerSlug: o.provider?.slug,
        providerType: o.provider?.type as StorageProviderType,
        providerPriority: o.provider?.priority ?? 0,
        providerEnabled: Boolean(o.provider?.enabled),
        providerHealthStatus: o.provider?.healthStatus ?? 'UNKNOWN',
        providerPurposes: (o.provider?.purposes ?? []) as StoragePurpose[],
        providerTiers: o.provider?.tiers ?? [],
        providerCapabilities: (o.provider?.capabilities ?? {}) as ProviderCapabilities,
        videoAssetId: o.videoAssetId ?? null,
        qualityId: o.qualityId ?? null,
        qualityLabel: o.quality?.label ?? null,
        externalObjectId: o.externalObjectId ?? null,
        externalMessageId: o.externalMessageId ?? null,
        path: o.path ?? null,
        filename: o.filename ?? null,
        mimeType: o.mimeType ?? null,
        sizeBytes: o.sizeBytes ?? null,
        checksum: o.checksum ?? null,
        status: o.status,
        purpose: o.purpose,
      }))
      .filter((o) => o.externalObjectId);
  }

  private collectQualities(rows: StorageObjectRef[]): string[] {
    const set = new Set<string>();
    rows.forEach((r) => r.qualityLabel && set.add(r.qualityLabel));
    return [...set].sort((a, b) => rankQuality(a) - rankQuality(b));
  }

  /** Sort by health, priority, then quality preference. */
  private rankCandidates(
    rows: StorageObjectRef[],
    query: SourceQuery,
    preferredProvider?: string
  ): StorageObjectRef[] {
    const healthScore = (s: string) => (s === 'HEALTHY' ? 0 : s === 'DEGRADED' ? 1 : s === 'UNKNOWN' ? 2 : 3);
    return [...rows].sort((a, b) => {
      if (preferredProvider) {
        const ap = a.providerSlug === preferredProvider ? 0 : 1;
        const bp = b.providerSlug === preferredProvider ? 0 : 1;
        if (ap !== bp) return ap - bp;
      }
      // Matches requested purpose explicitly.
      const ap = a.providerPurposes.includes(query.purpose) ? 0 : 1;
      const bp = b.providerPurposes.includes(query.purpose) ? 0 : 1;
      if (ap !== bp) return ap - bp;

      const ah = healthScore(a.providerHealthStatus);
      const bh = healthScore(b.providerHealthStatus);
      if (ah !== bh) return ah - bh;

      if (query.quality) {
        const aq = a.qualityLabel === query.quality ? 0 : 1;
        const bq = b.qualityLabel === query.quality ? 0 : 1;
        if (aq !== bq) return aq - bq;
      }

      // Lower rankQuality == better.
      const aRank = rankQuality(a.qualityLabel);
      const bRank = rankQuality(b.qualityLabel);
      if (aRank !== bRank) return aRank - bRank;

      return b.providerPriority - a.providerPriority;
    });
  }

  private async markObjectMissing(id: string): Promise<void> {
    try {
      await prisma.storageObject.update({ where: { id }, data: { status: 'MISSING' } });
    } catch {
      /* ignore in mock env */
    }
  }

  /** Legacy fallback from Movie.fileUrl / Movie.resolutions. */
  private async legacySource(
    movieId: string,
    quality: string | undefined,
    purpose: StoragePurpose
  ): Promise<MediaSource | null> {
    let movie: any = null;
    try {
      movie = await prisma.movie.findUnique({ where: { id: movieId } });
    } catch {
      movie = null;
    }
    if (!movie) return null;

    let url: string | undefined;
    if (movie.resolutions && typeof movie.resolutions === 'object') {
      const res = movie.resolutions as Record<string, unknown>;
      if (quality && typeof res[quality] === 'string') url = res[quality] as string;
      else {
        const keys = Object.keys(res).sort((a, b) => rankQuality(a) - rankQuality(b));
        const first = keys.find((k) => typeof res[k] === 'string');
        if (first) url = res[first] as string;
      }
    }
    if (!url) url = movie.fileUrl || undefined;
    if (!url) return null;

    return {
      provider: 'S3_COMPATIBLE',
      url,
      purpose,
      quality,
      supportsRange: true,
      isHls: url.endsWith('.m3u8'),
    };
  }

  // -------------------------------------------------------------------------
  // Qualities / metadata
  // -------------------------------------------------------------------------

  async getQualities(movieId: string): Promise<
    { label: string; height?: number; sizeBytes?: number; providers: string[]; purposes: StoragePurpose[] }[]
  > {
    let raw: any[] = [];
    try {
      raw = (await prisma.storageObject.findMany({
        where: { status: 'ACTIVE', videoAsset: { movieId } },
        include: { quality: true, provider: true },
      })) as any[];
    } catch {
      raw = [];
    }

    const byQuality = new Map<string, { height?: number; sizeBytes?: number; providers: Set<string>; purposes: Set<StoragePurpose> }>();
    for (const o of raw) {
      const label = o.quality?.label;
      if (!label) continue;
      if (!byQuality.has(label)) {
        byQuality.set(label, {
          height: o.quality?.height,
          sizeBytes: toNumber(o.sizeBytes) ?? toNumber(o.quality?.sizeBytes),
          providers: new Set(),
          purposes: new Set(),
        });
      }
      const entry = byQuality.get(label)!;
      if (o.provider?.slug) entry.providers.add(o.provider.slug);
      if (o.purpose) entry.purposes.add(o.purpose);
    }

    return [...byQuality.entries()]
      .map(([label, v]) => ({
        label,
        height: v.height,
        sizeBytes: v.sizeBytes,
        providers: [...v.providers],
        purposes: [...v.purposes],
      }))
      .sort((a, b) => rankQuality(a.label) - rankQuality(b.label));
  }

  // -------------------------------------------------------------------------
  // Upload / replicate / verify / delete
  // -------------------------------------------------------------------------

  async upload(input: StorageManagerUploadInput): Promise<{ storageObjectId: string; stored: boolean }> {
    const provider = getProvider(input.providerSlug);
    if (!provider) throw new Error(`Unknown provider: ${input.providerSlug}`);
    if (!provider.isConfigured()) throw new Error(`Provider not configured: ${input.providerSlug}`);

    const def = getProviderDefinition(input.providerSlug);
    // Persist a PENDING row first so progress is visible in the admin dashboard.
    const row = await prisma.storageObject.create({
      data: {
        provider: { connect: { slug: input.providerSlug } },
        videoAssetId: input.videoAssetId || undefined,
        qualityId: input.qualityId || undefined,
        path: input.key,
        filename: input.filename || input.key.split('/').pop(),
        mimeType: input.contentType,
        sizeBytes: input.sizeBytes ? BigInt(input.sizeBytes) : undefined,
        status: 'PENDING',
        purpose: input.purpose || def?.defaultPurposes[0] || 'BACKUP',
      },
    } as any);

    try {
      const stored = await provider.upload(input);
      await prisma.storageObject.update({
        where: { id: row.id },
        data: {
          externalObjectId: stored.externalObjectId,
          externalMessageId: stored.externalMessageId,
          path: stored.path,
          filename: stored.filename,
          mimeType: stored.mimeType,
          sizeBytes: stored.sizeBytes ? BigInt(stored.sizeBytes) : undefined,
          checksum: stored.checksum,
          status: 'ACTIVE',
        },
      });
      return { storageObjectId: row.id, stored: true };
    } catch (err) {
      await prisma.storageObject.update({
        where: { id: row.id },
        data: { status: 'FAILED' },
      });
      throw err;
    }
  }

  async replicate(
    input: Omit<StorageManagerUploadInput, 'providerSlug'>,
    providerSlugs: string[]
  ): Promise<ReplicationResult[]> {
    const results: ReplicationResult[] = [];
    for (const slug of providerSlugs) {
      try {
        const { storageObjectId } = await this.upload({ ...input, providerSlug: slug });
        results.push({ providerSlug: slug, success: true, objectId: storageObjectId });
      } catch (err: any) {
        results.push({ providerSlug: slug, success: false, error: err?.message || String(err) });
      }
    }
    return results;
  }

  async delete(storageObjectId: string): Promise<void> {
    let object: any = null;
    try {
      object = await prisma.storageObject.findUnique({
        where: { id: storageObjectId },
        include: { provider: true },
      });
    } catch {
      object = null;
    }
    if (!object?.provider?.slug || !object.externalObjectId) return;

    const provider = getProvider(object.provider.slug);
    if (provider?.isConfigured()) {
      try {
        await provider.delete(object.externalObjectId, object.externalMessageId || undefined);
      } catch (err) {
        console.warn(`[StorageManager] delete failed:`, (err as Error)?.message);
      }
    }
    await prisma.storageObject.update({ where: { id: storageObjectId }, data: { status: 'DELETED' } });
  }

  async verify(storageObjectIds: string[]): Promise<{ id: string; exists: boolean }[]> {
    const out: { id: string; exists: boolean }[] = [];
    for (const id of storageObjectIds) {
      let object: any = null;
      try {
        object = await prisma.storageObject.findUnique({
          where: { id },
          include: { provider: true },
        });
      } catch {
        object = null;
      }
      if (!object?.provider?.slug || !object.externalObjectId) {
        out.push({ id, exists: false });
        continue;
      }
      const provider = getProvider(object.provider.slug);
      const exists = provider?.isConfigured()
        ? await provider.exists(object.externalObjectId).catch(() => false)
        : false;
      out.push({ id, exists });
      try {
        await prisma.storageObject.update({
          where: { id },
          data: { status: exists ? 'ACTIVE' : 'MISSING' },
        });
      } catch {
        /* ignore */
      }
    }
    return out;
  }

  // -------------------------------------------------------------------------
  // Health monitoring
  // -------------------------------------------------------------------------

  async healthCheckAll(): Promise<ProviderHealth[]> {
    const results: ProviderHealth[] = [];
    for (const def of PROVIDER_DEFINITIONS) {
      const provider = getProvider(def.slug);
      if (!provider) continue;
      const health = await provider.healthCheck();
      results.push(health);
      await this.persistHealth(def.slug, health);
    }
    return results;
  }

  async healthCheckOne(slug: string): Promise<ProviderHealth | null> {
    const provider = getProvider(slug);
    if (!provider) return null;
    const health = await provider.healthCheck();
    await this.persistHealth(slug, health);
    return health;
  }

  /**
   * Create a direct (presigned) upload target so large files go straight to
   * object storage instead of through the Vercel request body (spec §22/§36).
   */
  async createUploadTarget(
    providerSlug: string,
    key: string,
    contentType: string,
    expiresInSeconds = 3600
  ): Promise<{ direct: boolean; provider: string; url?: string; key?: string; expiresAt?: string; reason?: string }> {
    const provider: any = getProvider(providerSlug);
    if (!provider) return { direct: false, provider: providerSlug, reason: 'Unknown provider' };
    if (!provider.isConfigured()) return { direct: false, provider: providerSlug, reason: 'Provider not configured' };
    if (typeof provider.getUploadUrl !== 'function') {
      return { direct: false, provider: providerSlug, reason: 'Provider does not support presigned uploads' };
    }
    const target = await provider.getUploadUrl(key, contentType, expiresInSeconds);
    return { direct: true, provider: providerSlug, url: target.url, key: target.key, expiresAt: target.expiresAt };
  }

  private async persistHealth(slug: string, health: ProviderHealth): Promise<void> {
    try {
      const row = await prisma.storageProvider.findUnique({ where: { slug } });
      if (!row) return;

      const success = health.status === 'HEALTHY';
      const failureCount = success ? 0 : (row.failureCount || 0) + 1;
      const total = (row.successRate ?? 1) * 100;
      // Exponential moving success rate.
      const nextRate = success ? Math.min(1, (total + 100) / 2 / 100) : Math.max(0, (total + 0) / 2 / 100);

      // Automatically reduce priority when a provider is failing, restore when healthy.
      let priority = row.priority;
      const def = getProviderDefinition(slug);
      const base = def?.defaultPriority ?? row.priority;
      if (health.status === 'DOWN') priority = Math.max(0, Math.round(base * 0.25));
      else if (health.status === 'DEGRADED') priority = Math.max(0, Math.round(base * 0.6));
      else if (health.status === 'HEALTHY') priority = base;

      await prisma.storageProvider.update({
        where: { slug },
        data: {
          healthStatus: health.status,
          latencyMs: health.latencyMs,
          successRate: nextRate,
          failureCount,
          priority,
          lastSuccessAt: success ? new Date() : row.lastSuccessAt,
          lastFailureAt: success ? row.lastFailureAt : new Date(),
        },
      });

      await prisma.providerHealthCheck.create({
        data: {
          providerId: row.id,
          status: health.status,
          latencyMs: health.latencyMs,
          success,
          message: health.message,
        },
      });
    } catch (err) {
      // Mock/dev env — ignore.
    }
  }
}

export const storageManager = new StorageManager();
