import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize Backblaze B2 client (compatible with AWS S3 API)
const createS3Client = () => {
  return new S3Client({
    region: process.env.BACKBLAZE_REGION || 'us-east-001',
    endpoint: process.env.BACKBLAZE_ENDPOINT || 's3.us-east-001.backblazeb2.com',
    credentials: {
      accessKeyId: process.env.BACKBLAZE_KEY_ID || '',
      secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY || '',
    },
  });
};

/**
 * Upload a file to Backblaze B2
 * @param file - File buffer or ArrayBuffer
 * @param key - File path/key in the bucket
 * @param contentType - MIME type of the file
 * @returns Public URL of the uploaded file
 */
export async function uploadFile(
  file: Buffer | ArrayBuffer,
  key: string,
  contentType: string
): Promise<string> {
  if (!process.env.BACKBLAZE_KEY_ID || !process.env.BACKBLAZE_APPLICATION_KEY) {
    console.warn('[AI Studio] Backblaze credentials not set — using local mock URL');
    return `/uploads/${key}`;
  }

  const s3Client = createS3Client();
  const buffer = file instanceof ArrayBuffer ? Buffer.from(file) : file;

  const command = new PutObjectCommand({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME || 'fiesta-flix',
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Construct and return the public URL
  const endpoint = process.env.BACKBLAZE_ENDPOINT || 's3.us-east-001.backblazeb2.com';
  const bucket = process.env.BACKBLAZE_BUCKET_NAME || 'fiesta-flix';
  return `https://${bucket}.${endpoint.replace('s3.', '')}/${key}`;
}

/**
 * Delete a file from Backblaze B2
 * @param key - File path/key in the bucket
 */
export async function deleteFile(key: string): Promise<void> {
  if (!process.env.BACKBLAZE_KEY_ID || !process.env.BACKBLAZE_APPLICATION_KEY) {
    return;
  }

  const s3Client = createS3Client();

  const command = new DeleteObjectCommand({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME || 'fiesta-flix',
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generate a unique file key/path
 * @param prefix - Directory prefix (e.g., 'movies', 'thumbnails')
 * @param filename - Original filename
 * @returns Unique file key
 */
export function generateFileKey(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const ext = filename.split('.').pop() || 'bin';
  return `${prefix}/${timestamp}-${random}.${ext}`;
}

/**
 * Get file extension from filename or MIME type
 * @param filename - Filename
 * @returns File extension without dot
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is a video
 * @param mimeType - MIME type
 * @returns boolean
 */
export function isVideo(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/**
 * Check if file is an image
 * @param mimeType - MIME type
 * @returns boolean
 */
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "5.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
