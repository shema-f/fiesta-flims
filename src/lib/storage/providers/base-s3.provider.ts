/**
 * Shared implementation for every S3-compatible provider
 * (Backblaze B2, Cloudflare R2, Amazon S3, generic S3).
 *
 * The concrete providers only differ in credentials, endpoint and URL style,
 * so the whole interface lives here.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';
import type {
  MediaSource,
  ProviderCapabilities,
  ProviderHealth,
  StorageProvider,
  StorageProviderType,
  StoredObject,
  StoredObjectMetadata,
  UploadInput,
} from '../types';

export interface S3CompatibleConfig {
  type: StorageProviderType;
  /** S3 API endpoint, e.g. `https://s3.us-east-001.backblazeb2.com`. */
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  /** Force path-style addressing (R2, MinIO, some B2 setups). */
  forcePathStyle?: boolean;
  /**
   * Base URL used to build public object URLs when the bucket is public.
   * Defaults to `${endpoint}/${bucket}`.
   */
  publicBaseUrl?: string;
  /** Signed URL lifetime, seconds. */
  signedUrlTtlSeconds?: number;
  /** Default prefix for logical keys. */
  keyPrefix?: string;
}

const DEFAULT_SIGNED_TTL = 15 * 60;

export class S3CompatibleProvider implements StorageProvider {
  readonly type: StorageProviderType;
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    downloads: true,
    resumableUpload: true,
    signedUrls: true,
    rangeRequests: true,
    publicAccess: true,
  };

  protected readonly config: S3CompatibleConfig;
  private client: S3Client | null = null;

  constructor(config: S3CompatibleConfig) {
    this.type = config.type;
    this.config = config;
  }

  isConfigured(): boolean {
    return Boolean(this.config.bucket && this.config.accessKeyId && this.config.secretAccessKey);
  }

  protected get signedTtl(): number {
    return this.config.signedUrlTtlSeconds ?? DEFAULT_SIGNED_TTL;
  }

  protected getClient(): S3Client {
    if (!this.client) {
      this.client = new S3Client({
        region: this.config.region,
        ...(this.config.endpoint ? { endpoint: this.config.endpoint } : {}),
        forcePathStyle: this.config.forcePathStyle ?? Boolean(this.config.endpoint),
        credentials: {
          accessKeyId: this.config.accessKeyId || '',
          secretAccessKey: this.config.secretAccessKey || '',
        },
      });
    }
    return this.client;
  }

  protected fullKey(key: string): string {
    const prefix = this.config.keyPrefix?.replace(/\/+$/, '');
    return prefix ? `${prefix}/${key.replace(/^\/+/, '')}` : key.replace(/^\/+/, '');
  }

  protected publicUrl(key: string): string {
    if (this.config.publicBaseUrl) {
      return `${this.config.publicBaseUrl.replace(/\/+$/, '')}/${key}`;
    }
    if (this.config.endpoint) {
      return `${this.config.endpoint.replace(/\/+$/, '')}/${this.config.bucket}/${key}`;
    }
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
  }

  protected async bodyToBuffer(body: UploadInput['body']): Promise<Buffer> {
    if (Buffer.isBuffer(body)) return body;
    if (body instanceof ArrayBuffer) return Buffer.from(body);
    const chunks: Buffer[] = [];
    for await (const chunk of body as Readable) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async upload(input: UploadInput): Promise<StoredObject> {
    const key = this.fullKey(input.key);
    const buffer = await this.bodyToBuffer(input.body);
    await this.getClient().send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: input.contentType,
        Metadata: input.metadata,
      })
    );

    return {
      provider: this.type,
      externalObjectId: key,
      path: key,
      filename: input.filename || key.split('/').pop() || key,
      mimeType: input.contentType,
      sizeBytes: input.sizeBytes ?? buffer.byteLength,
      checksum: input.checksum,
      purpose: input.purpose || 'BACKUP',
      url: this.publicUrl(key),
    };
  }

  async getMetadata(objectId: string): Promise<StoredObjectMetadata | null> {
    try {
      const res = await this.getClient().send(
        new HeadObjectCommand({ Bucket: this.config.bucket, Key: objectId })
      );
      return {
        provider: this.type,
        externalObjectId: objectId,
        path: objectId,
        filename: objectId.split('/').pop(),
        mimeType: res.ContentType,
        sizeBytes: res.ContentLength,
        exists: true,
        modifiedAt: res.LastModified,
      };
    } catch {
      return null;
    }
  }

  async delete(objectId: string): Promise<void> {
    await this.getClient().send(
      new DeleteObjectCommand({ Bucket: this.config.bucket, Key: objectId })
    );
  }

  async exists(objectId: string): Promise<boolean> {
    return (await this.getMetadata(objectId)) !== null;
  }

  protected async buildSource(
    objectId: string,
    purpose: 'STREAMING' | 'DOWNLOAD'
  ): Promise<MediaSource> {
    const ttl = this.signedTtl;
    const url = await getSignedUrl(
      this.getClient(),
      new GetObjectCommand({ Bucket: this.config.bucket, Key: objectId }),
      { expiresIn: ttl }
    );
    return {
      provider: this.type,
      url,
      expiresAt: new Date(Date.now() + ttl * 1000),
      purpose,
      supportsRange: true,
      isHls: objectId.endsWith('.m3u8'),
    };
  }

  /**
   * Presigned direct-upload target so large files never pass through Vercel.
   * The browser/admin PUTs straight to object storage.
   */
  async getUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 3600
  ): Promise<{ url: string; key: string; contentType: string; expiresAt: string }> {
    const fullKey = this.fullKey(key);
    const url = await getSignedUrl(
      this.getClient(),
      new PutObjectCommand({ Bucket: this.config.bucket, Key: fullKey, ContentType: contentType }),
      { expiresIn: expiresInSeconds }
    );
    return {
      url,
      key: fullKey,
      contentType,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    };
  }

  getDownloadSource(objectId: string): Promise<MediaSource> {
    return this.buildSource(objectId, 'DOWNLOAD');
  }

  getStreamSource(objectId: string): Promise<MediaSource> {
    return this.buildSource(objectId, 'STREAMING');
  }

  async healthCheck(): Promise<ProviderHealth> {
    if (!this.isConfigured()) {
      return {
        provider: this.type,
        status: 'DOWN',
        message: 'Provider not configured',
        checkedAt: new Date(),
      };
    }
    const start = Date.now();
    try {
      await this.getClient().send(
        new HeadObjectCommand({ Bucket: this.config.bucket, Key: this.config.keyPrefix || '.keep' })
      );
      // A 404 for a missing key still proves the bucket is reachable.
      return { provider: this.type, status: 'HEALTHY', latencyMs: Date.now() - start, checkedAt: new Date() };
    } catch (err: any) {
      const code = err?.$metadata?.httpStatusCode;
      const reachable = code === 403 || code === 404;
      return {
        provider: this.type,
        status: reachable ? 'HEALTHY' : 'DOWN',
        latencyMs: Date.now() - start,
        message: reachable ? undefined : err?.name || String(err),
        checkedAt: new Date(),
      };
    }
  }
}
