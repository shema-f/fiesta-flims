import { S3CompatibleProvider } from './base-s3.provider';

/** Cloudflare R2 — S3-compatible object storage, ideal HOT tier + public CDN. */
export class CloudflareR2Provider extends S3CompatibleProvider {
  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    const endpoint =
      process.env.CLOUDFLARE_R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
    super({
      type: 'CLOUDFLARE_R2',
      region: process.env.CLOUDFLARE_R2_REGION || 'auto',
      endpoint,
      bucket: process.env.CLOUDFLARE_R2_BUCKET || '',
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      // R2 serves via a public bucket domain / custom domain when configured.
      publicBaseUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
      keyPrefix: process.env.CLOUDFLARE_R2_KEY_PREFIX || 'fiesta-flix',
    });
  }
}
