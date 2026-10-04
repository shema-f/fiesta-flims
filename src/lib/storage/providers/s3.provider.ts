import { S3CompatibleProvider, type S3CompatibleConfig } from './base-s3.provider';

/** Amazon S3. */
export class AmazonS3Provider extends S3CompatibleProvider {
  constructor() {
    super({
      type: 'AMAZON_S3',
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || '',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      publicBaseUrl: process.env.AWS_S3_PUBLIC_URL,
      keyPrefix: process.env.AWS_S3_KEY_PREFIX || 'fiesta-flix',
    });
  }
}

/** Generic S3-compatible storage (MinIO, Wasabi, Storj, ...). */
export class GenericS3Provider extends S3CompatibleProvider {
  constructor(config?: Partial<S3CompatibleConfig>) {
    super({
      type: 'S3_COMPATIBLE',
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      bucket: process.env.S3_BUCKET || '',
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      publicBaseUrl: process.env.S3_PUBLIC_URL,
      keyPrefix: process.env.S3_KEY_PREFIX || 'fiesta-flix',
      ...config,
    });
  }
}
