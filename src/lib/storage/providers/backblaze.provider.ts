import { S3CompatibleProvider } from './base-s3.provider';

/** Backblaze B2 via its S3-compatible API. */
export class BackblazeProvider extends S3CompatibleProvider {
  constructor() {
    const endpoint = process.env.BACKBLAZE_ENDPOINT || 's3.us-east-001.backblazeb2.com';
    const normalizedEndpoint = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
    super({
      type: 'BACKBLAZE_B2',
      region: process.env.BACKBLAZE_REGION || 'us-east-001',
      endpoint: normalizedEndpoint,
      bucket: process.env.BACKBLAZE_BUCKET_NAME || '',
      accessKeyId: process.env.BACKBLAZE_KEY_ID,
      secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY,
      keyPrefix: process.env.BACKBLAZE_KEY_PREFIX || 'fiesta-flix',
    });
  }
}
