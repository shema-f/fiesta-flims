/**
 * Google Drive provider — WARM/COLD storage via the official Drive API.
 *
 * Supports either a service account (recommended for server use) or an OAuth
 * refresh token. Drive has no true signed-URL mechanism, so private files are
 * streamed through the Drive web endpoint; public files expose `webContentLink`.
 */

import { Readable } from 'stream';
import type {
  MediaSource,
  ProviderCapabilities,
  ProviderHealth,
  StorageProvider,
  StoredObject,
  StoredObjectMetadata,
  UploadInput,
} from '../types';

// googleapis is large — load it lazily so it never lands in a client bundle.
type DriveClient = any;

export class GoogleDriveProvider implements StorageProvider {
  readonly type = 'GOOGLE_DRIVE' as const;
  readonly capabilities: ProviderCapabilities = {
    streaming: true, // conditional
    downloads: true,
    resumableUpload: true,
    signedUrls: false,
    rangeRequests: true,
    publicAccess: true,
  };

  private drive: DriveClient | null = null;

  isConfigured(): boolean {
    const serviceAccount = Boolean(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY
    );
    const oauth = Boolean(
      process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_REFRESH_TOKEN
    );
    return serviceAccount || oauth;
  }

  private async getDrive(): Promise<DriveClient> {
    if (this.drive) return this.drive;
    const { google } = await import('googleapis');

    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      this.drive = google.drive({ version: 'v3', auth });
    } else {
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
      this.drive = google.drive({ version: 'v3', auth });
    }
    return this.drive;
  }

  private get folderId(): string | undefined {
    return process.env.GOOGLE_DRIVE_FOLDER_ID;
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
    const drive = await this.getDrive();
    const buffer = await this.bodyToBuffer(input.body);
    const filename = input.filename || input.key.split('/').pop() || 'file.bin';

    // Strip the logical key into a same-named file inside the configured folder.
    const res = await drive.files.create({
      requestBody: {
        name: filename,
        parents: this.folderId ? [this.folderId] : undefined,
        mimeType: input.contentType,
      },
      media: { mimeType: input.contentType, body: Readable.from(buffer) },
      fields: 'id,name,size,mimeType,webContentLink',
    });

    const file = res.data;
    return {
      provider: this.type,
      externalObjectId: file.id,
      path: input.key,
      filename: file.name || filename,
      mimeType: file.mimeType || input.contentType,
      sizeBytes: file.size ? Number(file.size) : buffer.byteLength,
      checksum: input.checksum,
      purpose: input.purpose || 'BACKUP',
      url: file.webContentLink || undefined,
    };
  }

  async getMetadata(objectId: string): Promise<StoredObjectMetadata | null> {
    try {
      const drive = await this.getDrive();
      const res = await drive.files.get({
        fileId: objectId,
        fields: 'id,name,size,mimeType,modifiedTime',
      });
      const f = res.data;
      return {
        provider: this.type,
        externalObjectId: f.id,
        filename: f.name,
        mimeType: f.mimeType,
        sizeBytes: f.size ? Number(f.size) : undefined,
        exists: true,
        modifiedAt: f.modifiedTime ? new Date(f.modifiedTime) : undefined,
      };
    } catch {
      return null;
    }
  }

  async delete(objectId: string): Promise<void> {
    const drive = await this.getDrive();
    await drive.files.delete({ fileId: objectId });
  }

  async exists(objectId: string): Promise<boolean> {
    return (await this.getMetadata(objectId)) !== null;
  }

  private async buildSource(objectId: string, purpose: 'STREAMING' | 'DOWNLOAD'): Promise<MediaSource> {
    const drive = await this.getDrive();
    const res = await drive.files.get({
      fileId: objectId,
      fields: 'id,webContentLink,webViewLink,mimeType',
    });
    const f = res.data;
    // Public files get a direct link; otherwise the Drive web endpoint is used.
    const url =
      f.webContentLink ||
      `https://www.googleapis.com/drive/v3/files/${objectId}?alt=media`;
    return {
      provider: this.type,
      url,
      purpose,
      mimeType: f.mimeType,
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
      const drive = await this.getDrive();
      await drive.about.get({ fields: 'user' });
      return { provider: this.type, status: 'HEALTHY', latencyMs: Date.now() - start, checkedAt: new Date() };
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
