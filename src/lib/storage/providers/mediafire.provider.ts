/**
 * MediaFire provider — optional COLD tier.
 *
 * Uses the documented MediaFire REST API with an application id + session
 * token. It does NOT scrape pages or rely on undocumented URL tricks.
 * Capabilities are marked conservatively and can be tuned in the provider row.
 */

import type { Readable } from 'stream';
import type {
  MediaSource,
  ProviderCapabilities,
  ProviderHealth,
  StorageProvider,
  StoredObject,
  StoredObjectMetadata,
  UploadInput,
} from '../types';

const API_BASE = 'https://www.mediafire.com/api/1.5';

export class MediaFireProvider implements StorageProvider {
  readonly type = 'MEDIAFIRE' as const;
  readonly capabilities: ProviderCapabilities = {
    streaming: false,
    downloads: true,
    resumableUpload: true,
    signedUrls: false,
    rangeRequests: true,
    publicAccess: true,
  };

  private get appId(): string | undefined {
    return process.env.MEDIAFIRE_APP_ID;
  }

  private get sessionToken(): string | undefined {
    return process.env.MEDIAFIRE_SESSION_TOKEN;
  }

  isConfigured(): boolean {
    return Boolean(this.appId && this.sessionToken);
  }

  private async bodyToBuffer(body: UploadInput['body']): Promise<Buffer> {
    if (Buffer.isBuffer(body)) return body;
    if (body instanceof ArrayBuffer) return Buffer.from(body);
    const chunks: Buffer[] = [];
    for await (const chunk of body as Readable) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async upload(input: UploadInput): Promise<StoredObject> {
    const buffer = await this.bodyToBuffer(input.body);
    const filename = input.filename || input.key.split('/').pop() || 'file.bin';

    const form = new FormData();
    form.append('session_token', this.sessionToken as string);
    form.append('action_on_duplicate', 'replace');
    form.append('file', new Blob([new Uint8Array(buffer)], { type: input.contentType }), filename);

    const res = await fetch(`${API_BASE}/upload/simple.php`, { method: 'POST', body: form });
    const json = (await res.json()) as any;
    if (json.response?.result !== 'Success') {
      throw new Error(`MediaFire upload failed: ${json.response?.message || 'unknown error'}`);
    }
    const f = json.response?.doupload || json.response;
    return {
      provider: this.type,
      externalObjectId: f.quickkey || f.key || '',
      path: input.key,
      filename: f.filename || filename,
      mimeType: input.contentType,
      sizeBytes: f.size ? Number(f.size) : buffer.byteLength,
      checksum: input.checksum,
      purpose: input.purpose || 'BACKUP',
    };
  }

  async getMetadata(objectId: string): Promise<StoredObjectMetadata | null> {
    try {
      const res = await fetch(
        `${API_BASE}/file/get_info.php?response_format=json&quick_key=${encodeURIComponent(objectId)}`
      );
      const json = (await res.json()) as any;
      const info = json.response?.file_info;
      if (json.response?.result !== 'Success' || !info) return null;
      return {
        provider: this.type,
        externalObjectId: objectId,
        filename: info.filename,
        mimeType: info.mimetype,
        sizeBytes: info.size ? Number(info.size) : undefined,
        exists: true,
      };
    } catch {
      return null;
    }
  }

  async delete(objectId: string): Promise<void> {
    await fetch(
      `${API_BASE}/file/delete.php?response_format=json&session_token=${encodeURIComponent(
        this.sessionToken as string
      )}&quick_key=${encodeURIComponent(objectId)}`
    );
  }

  async exists(objectId: string): Promise<boolean> {
    return (await this.getMetadata(objectId)) !== null;
  }

  private async buildSource(objectId: string, purpose: 'STREAMING' | 'DOWNLOAD'): Promise<MediaSource> {
    const res = await fetch(
      `${API_BASE}/file/get_links.php?response_format=json&link_type=direct_download&quick_key=${encodeURIComponent(
        objectId
      )}`
    );
    const json = (await res.json()) as any;
    const link = json.response?.links?.[0]?.direct_download;
    if (json.response?.result !== 'Success' || !link) {
      throw new Error(`MediaFire link unavailable: ${json.response?.message || 'unknown'}`);
    }
    return {
      provider: this.type,
      url: link,
      purpose,
      supportsRange: true,
      isHls: false,
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
      return { provider: this.type, status: 'DOWN', message: 'Provider not configured', checkedAt: new Date() };
    }
    const start = Date.now();
    try {
      const res = await fetch(
        `${API_BASE}/user/get_info.php?response_format=json&session_token=${encodeURIComponent(
          this.sessionToken as string
        )}`
      );
      const json = (await res.json()) as any;
      const ok = json.response?.result === 'Success';
      return {
        provider: this.type,
        status: ok ? 'HEALTHY' : 'DEGRADED',
        latencyMs: Date.now() - start,
        message: ok ? undefined : json.response?.message,
        checkedAt: new Date(),
      };
    } catch (err: any) {
      return {
        provider: this.type,
        status: 'DOWN',
        latencyMs: Date.now() - start,
        message: err?.message || String(err),
        checkedAt: new Date(),
      };
    }
  }
}
