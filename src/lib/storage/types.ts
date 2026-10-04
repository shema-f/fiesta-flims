/**
 * Storage abstraction layer — shared types.
 *
 * Nothing outside `src/lib/storage` should import a concrete provider.
 * The rest of the app talks to the StorageManager.
 */

import type { Readable } from 'stream';

export type StorageProviderType =
  | 'TELEGRAM'
  | 'GOOGLE_DRIVE'
  | 'MEDIAFIRE'
  | 'BACKBLAZE_B2'
  | 'CLOUDFLARE_R2'
  | 'AMAZON_S3'
  | 'S3_COMPATIBLE';

export type StoragePurpose = 'STREAMING' | 'DOWNLOAD' | 'BACKUP';
export type MediaTier = 'HOT' | 'WARM' | 'COLD';
export type ProviderHealthStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';
export type StorageObjectStatus = 'PENDING' | 'ACTIVE' | 'MISSING' | 'FAILED' | 'DELETED';

export interface ProviderCapabilities {
  streaming: boolean;
  downloads: boolean;
  resumableUpload: boolean;
  signedUrls: boolean;
  rangeRequests: boolean;
  publicAccess: boolean;
  maxObjectSizeBytes?: number;
}

export interface UploadInput {
  /** Logical object key / path, e.g. `movies/<movieId>/1080p/movie.mp4`. */
  key: string;
  body: Buffer | ArrayBuffer | Readable;
  contentType: string;
  sizeBytes?: number;
  purpose?: StoragePurpose;
  filename?: string;
  checksum?: string;
  metadata?: Record<string, string>;
}

export interface StoredObject {
  provider: StorageProviderType;
  /** Provider-native id: S3 object key, Drive file id, Telegram file_id. */
  externalObjectId: string;
  /** Telegram message id when relevant. */
  externalMessageId?: string;
  path: string;
  filename: string;
  mimeType: string;
  sizeBytes?: number;
  checksum?: string;
  purpose: StoragePurpose;
  url?: string;
}

export interface StoredObjectMetadata {
  provider: StorageProviderType;
  externalObjectId: string;
  path?: string;
  filename?: string;
  mimeType?: string;
  sizeBytes?: number;
  checksum?: string;
  exists: boolean;
  modifiedAt?: Date;
}

export interface MediaSource {
  provider: StorageProviderType;
  /** Direct/signed URL for the browser. May expire. */
  url: string;
  /** When the URL stops working (signed URLs only). */
  expiresAt?: Date;
  purpose: StoragePurpose;
  quality?: string;
  mimeType?: string;
  supportsRange: boolean;
  /** True when the URL points at an HLS master playlist. */
  isHls: boolean;
  /** Any extra headers the client must send (rare). */
  headers?: Record<string, string>;
}

export interface ProviderHealth {
  provider: StorageProviderType;
  status: ProviderHealthStatus;
  latencyMs?: number;
  message?: string;
  checkedAt: Date;
}

export interface StorageProvider {
  readonly type: StorageProviderType;
  readonly capabilities: ProviderCapabilities;
  /** Whether this provider has the credentials it needs to operate. */
  isConfigured(): boolean;
  upload(input: UploadInput): Promise<StoredObject>;
  getMetadata(objectId: string, externalMessageId?: string): Promise<StoredObjectMetadata | null>;
  delete(objectId: string, externalMessageId?: string): Promise<void>;
  exists(objectId: string, externalMessageId?: string): Promise<boolean>;
  getDownloadSource(objectId: string, externalMessageId?: string): Promise<MediaSource>;
  getStreamSource(objectId: string, externalMessageId?: string): Promise<MediaSource>;
  healthCheck(): Promise<ProviderHealth>;
}

/** Persisted StorageObject row (subset used by the manager). */
export interface StorageObjectRef {
  id: string;
  providerId: string;
  providerSlug: string;
  providerType: StorageProviderType;
  providerPriority: number;
  providerEnabled: boolean;
  providerHealthStatus: ProviderHealthStatus;
  providerPurposes: StoragePurpose[];
  providerTiers: MediaTier[];
  providerCapabilities: ProviderCapabilities;
  videoAssetId: string | null;
  qualityId: string | null;
  qualityLabel: string | null;
  externalObjectId: string | null;
  externalMessageId: string | null;
  path: string | null;
  filename: string | null;
  mimeType: string | null;
  sizeBytes: bigint | number | null;
  checksum: string | null;
  status: StorageObjectStatus;
  purpose: StoragePurpose;
}

export interface SourceQuery {
  movieId: string;
  quality?: string;
  purpose: StoragePurpose;
  /** Optional preferred provider slug. */
  preferredProvider?: string;
  /** Allow falling back to lower qualities when the requested one is missing. */
  allowQualityFallback?: boolean;
}

export interface ResolvedSource {
  source: MediaSource;
  storageObjectId?: string;
  quality?: string;
  providerSlug: string;
  /** Qualities available for this purpose, best first. */
  availableQualities: string[];
  /** True when the manager fell back to the legacy fileUrl/resolutions columns. */
  legacy: boolean;
}

export const QUALITY_ORDER = ['4K', '2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p'] as const;

export function rankQuality(label: string | null | undefined): number {
  if (!label) return -1;
  const idx = QUALITY_ORDER.indexOf(label as (typeof QUALITY_ORDER)[number]);
  return idx === -1 ? QUALITY_ORDER.length : idx;
}
