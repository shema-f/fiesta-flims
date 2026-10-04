/**
 * Provider registry — the single place that knows how to construct each
 * provider implementation. No other module should instantiate providers.
 */

import type { MediaTier, ProviderCapabilities, StorageProvider, StorageProviderType, StoragePurpose } from './types';
import { BackblazeProvider } from './providers/backblaze.provider';
import { CloudflareR2Provider } from './providers/cloudflare-r2.provider';
import { AmazonS3Provider, GenericS3Provider } from './providers/s3.provider';
import { TelegramProvider } from './providers/telegram.provider';
import { GoogleDriveProvider } from './providers/google-drive.provider';
import { MediaFireProvider } from './providers/mediafire.provider';

export interface ProviderDefinition {
  type: StorageProviderType;
  slug: string;
  name: string;
  /** Default priority used when seeding the DB (higher = preferred). */
  defaultPriority: number;
  defaultTiers: MediaTier[];
  defaultPurposes: StoragePurpose[];
  capabilities: ProviderCapabilities;
  factory: () => StorageProvider;
}

export const PROVIDER_DEFINITIONS: ProviderDefinition[] = [
  {
    type: 'CLOUDFLARE_R2',
    slug: 'cloudflare-r2',
    name: 'Cloudflare R2',
    defaultPriority: 100,
    defaultTiers: ['HOT', 'WARM'],
    defaultPurposes: ['STREAMING', 'DOWNLOAD'],
    capabilities: {
      streaming: true,
      downloads: true,
      resumableUpload: true,
      signedUrls: true,
      rangeRequests: true,
      publicAccess: true,
    },
    factory: () => new CloudflareR2Provider(),
  },
  {
    type: 'BACKBLAZE_B2',
    slug: 'backblaze-b2',
    name: 'Backblaze B2',
    defaultPriority: 90,
    defaultTiers: ['HOT', 'WARM'],
    defaultPurposes: ['STREAMING', 'DOWNLOAD', 'BACKUP'],
    capabilities: {
      streaming: true,
      downloads: true,
      resumableUpload: true,
      signedUrls: true,
      rangeRequests: true,
      publicAccess: true,
    },
    factory: () => new BackblazeProvider(),
  },
  {
    type: 'AMAZON_S3',
    slug: 'amazon-s3',
    name: 'Amazon S3',
    defaultPriority: 90,
    defaultTiers: ['HOT', 'WARM'],
    defaultPurposes: ['STREAMING', 'DOWNLOAD', 'BACKUP'],
    capabilities: {
      streaming: true,
      downloads: true,
      resumableUpload: true,
      signedUrls: true,
      rangeRequests: true,
      publicAccess: true,
    },
    factory: () => new AmazonS3Provider(),
  },
  {
    type: 'S3_COMPATIBLE',
    slug: 's3-compatible',
    name: 'S3-Compatible Storage',
    defaultPriority: 80,
    defaultTiers: ['WARM'],
    defaultPurposes: ['STREAMING', 'DOWNLOAD', 'BACKUP'],
    capabilities: {
      streaming: true,
      downloads: true,
      resumableUpload: true,
      signedUrls: true,
      rangeRequests: true,
      publicAccess: true,
    },
    factory: () => new GenericS3Provider(),
  },
  {
    type: 'TELEGRAM',
    slug: 'telegram',
    name: 'Telegram',
    defaultPriority: 50,
    defaultTiers: ['COLD'],
    defaultPurposes: ['DOWNLOAD', 'BACKUP'],
    capabilities: {
      streaming: false,
      downloads: true,
      resumableUpload: false,
      signedUrls: false,
      rangeRequests: false,
      publicAccess: false,
    },
    factory: () => new TelegramProvider(),
  },
  {
    type: 'GOOGLE_DRIVE',
    slug: 'google-drive',
    name: 'Google Drive',
    defaultPriority: 40,
    defaultTiers: ['COLD'],
    defaultPurposes: ['DOWNLOAD', 'BACKUP'],
    capabilities: {
      streaming: true,
      downloads: true,
      resumableUpload: true,
      signedUrls: false,
      rangeRequests: true,
      publicAccess: true,
    },
    factory: () => new GoogleDriveProvider(),
  },
  {
    type: 'MEDIAFIRE',
    slug: 'mediafire',
    name: 'MediaFire',
    defaultPriority: 30,
    defaultTiers: ['COLD'],
    defaultPurposes: ['DOWNLOAD', 'BACKUP'],
    capabilities: {
      streaming: false,
      downloads: true,
      resumableUpload: true,
      signedUrls: false,
      rangeRequests: true,
      publicAccess: true,
    },
    factory: () => new MediaFireProvider(),
  },
];

const cache = new Map<string, StorageProvider>();

function keyOf(slugOrType: string): string {
  return slugOrType.toLowerCase();
}

/** Get a provider instance by slug or type. Instances are cached per process. */
export function getProvider(slugOrType: string): StorageProvider | null {
  const key = keyOf(slugOrType);
  const def = PROVIDER_DEFINITIONS.find(
    (d) => keyOf(d.slug) === key || keyOf(d.type) === key
  );
  if (!def) return null;
  if (!cache.has(def.slug)) {
    cache.set(def.slug, def.factory());
  }
  return cache.get(def.slug) as StorageProvider;
}

export function getProviderDefinition(slugOrType: string): ProviderDefinition | null {
  const key = keyOf(slugOrType);
  return (
    PROVIDER_DEFINITIONS.find((d) => keyOf(d.slug) === key || keyOf(d.type) === key) || null
  );
}

/** Every provider whose credentials are present in the environment. */
export function getConfiguredProviders(): StorageProvider[] {
  return PROVIDER_DEFINITIONS.map((d) => getProvider(d.slug))
    .filter((p): p is StorageProvider => Boolean(p && p.isConfigured()));
}

export function listProviderDefinitions(): ProviderDefinition[] {
  return PROVIDER_DEFINITIONS;
}
