/**
 * Telegram provider — COLD tier archive / backup / secondary source.
 *
 * Telegram is NOT a CDN. It stores files as chat messages and exposes them
 * through `getFile`, which is fine for backups and secondary downloads but is
 * subject to Telegram's own rate limits and terms.
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

interface TelegramGetFileResponse {
  ok: boolean;
  result?: { file_id: string; file_path?: string; file_size?: number };
  description?: string;
}

export class TelegramProvider implements StorageProvider {
  readonly type = 'TELEGRAM' as const;
  readonly capabilities: ProviderCapabilities = {
    streaming: false, // file links are not a streaming CDN; treat as download/backup
    downloads: true,
    resumableUpload: false,
    signedUrls: false,
    rangeRequests: false,
    publicAccess: false,
  };

  private get token(): string | undefined {
    return process.env.TELEGRAM_BOT_TOKEN;
  }

  private get chatId(): string | undefined {
    return process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHANNEL_ID;
  }

  isConfigured(): boolean {
    return Boolean(this.token && this.chatId);
  }

  private apiUrl(method: string): string {
    return `https://api.telegram.org/bot${this.token}/${method}`;
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
    form.append('chat_id', this.chatId as string);
    form.append('caption', input.metadata?.caption || filename);
    form.append('document', new Blob([new Uint8Array(buffer)], { type: input.contentType }), filename);

    const res = await fetch(this.apiUrl('sendDocument'), { method: 'POST', body: form });
    const json = (await res.json()) as any;
    if (!json.ok) {
      throw new Error(`Telegram upload failed: ${json.description || res.statusText}`);
    }

    const doc = json.result?.document || json.result?.video || {};
    const messageId = String(json.result?.message_id ?? '');
    return {
      provider: this.type,
      externalObjectId: doc.file_id || '',
      externalMessageId: messageId,
      path: input.key,
      filename,
      mimeType: input.contentType,
      sizeBytes: doc.file_size ?? buffer.byteLength,
      checksum: input.checksum,
      purpose: input.purpose || 'BACKUP',
    };
  }

  private async resolveFilePath(objectId: string): Promise<{ filePath?: string; size?: number }> {
    const res = await fetch(`${this.apiUrl('getFile')}?file_id=${encodeURIComponent(objectId)}`);
    const json = (await res.json()) as TelegramGetFileResponse;
    if (!json.ok || !json.result) {
      throw new Error(`Telegram getFile failed: ${json.description || 'unknown error'}`);
    }
    return { filePath: json.result.file_path, size: json.result.file_size };
  }

  async getMetadata(objectId: string): Promise<StoredObjectMetadata | null> {
    try {
      const { filePath, size } = await this.resolveFilePath(objectId);
      return {
        provider: this.type,
        externalObjectId: objectId,
        path: filePath,
        filename: filePath?.split('/').pop(),
        sizeBytes: size,
        exists: Boolean(filePath),
      };
    } catch {
      return null;
    }
  }

  async delete(objectId: string, externalMessageId?: string): Promise<void> {
    if (!externalMessageId) {
      // Telegram has no deletion-by-file_id; a message id is required.
      return;
    }
    await fetch(this.apiUrl('deleteMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: this.chatId, message_id: Number(externalMessageId) }),
    });
  }

  async exists(objectId: string): Promise<boolean> {
    return (await this.getMetadata(objectId)) !== null;
  }

  getDownloadSource(objectId: string): Promise<MediaSource> {
    return this.getStreamSource(objectId);
  }

  async getStreamSource(objectId: string): Promise<MediaSource> {
    const { filePath } = await this.resolveFilePath(objectId);
    if (!filePath) throw new Error('Telegram file path unavailable');
    return {
      provider: this.type,
      url: `https://api.telegram.org/file/bot${this.token}/${filePath}`,
      purpose: 'DOWNLOAD',
      supportsRange: false,
      isHls: false,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    if (!this.isConfigured()) {
      return { provider: this.type, status: 'DOWN', message: 'Provider not configured', checkedAt: new Date() };
    }
    const start = Date.now();
    try {
      const res = await fetch(this.apiUrl('getMe'));
      const json = (await res.json()) as any;
      return {
        provider: this.type,
        status: json.ok ? 'HEALTHY' : 'DOWN',
        latencyMs: Date.now() - start,
        message: json.ok ? undefined : json.description,
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
