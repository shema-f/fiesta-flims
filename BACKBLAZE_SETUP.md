# Backblaze B2 Storage Setup Guide

## 📦 Installation

```bash
npm install @aws-sdk/client-s3
```

## 🔐 Configuration

Add these to your `.env` file:

```env
# Backblaze B2 Configuration
BACKBLAZE_KEY_ID=7e52fce3e9be
BACKBLAZE_APPLICATION_KEY=your_application_key_here
BACKBLAZE_BUCKET_NAME=fiesta-flix
BACKBLAZE_REGION=us-east-001
BACKBLAZE_ENDPOINT=s3.us-east-001.backblazeb2.com
```

## 🎯 Steps to Complete Setup

1. **Get your Application Key**:
   - Go to https://secure.backblaze.com/app_keys.htm
   - Create a new application key with read/write access
   - Copy both the key ID and application key

2. **Create a Bucket**:
   - Go to https://secure.backblaze.com/b2_buckets.htm
   - Create a new bucket named `fiesta-flix`
   - Set bucket to "Public" if you want direct file access

3. **Get Endpoint**:
   - Your bucket's endpoint will be: `s3.<region>.backblazeb2.com`
   - Replace `<region>` with your region (e.g., us-east-001)

## 📝 Storage Utility Functions

Create these in `src/lib/storage.ts`:

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize Backblaze B2 client
const s3Client = new S3Client({
  region: process.env.BACKBLAZE_REGION,
  endpoint: process.env.BACKBLAZE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID || '',
    secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY || '',
  },
});

// Upload file to Backblaze B2
export async function uploadFile(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return the public URL
  return `https://${process.env.BACKBLAZE_BUCKET_NAME}.${process.env.BACKBLAZE_ENDPOINT?.replace('s3.', '')}/${key}`;
}

// Delete file from Backblaze B2
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

// Generate file key
export function generateFileKey(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const ext = filename.split('.').pop();
  return `${prefix}/${timestamp}-${random}.${ext}`;
}
```

## 🎬 Usage Examples

### Upload a Movie
```typescript
import { uploadFile, generateFileKey } from '@/lib/backblaze';

const fileBuffer = await movieFile.arrayBuffer();
const key = generateFileKey('movies', 'my-movie.mp4');
const videoUrl = await uploadFile(
  Buffer.from(fileBuffer),
  key,
  'video/mp4'
);
```

### Upload a Fan Clip
```typescript
const key = generateFileKey('fan-clips', 'funny-clip.mp4');
const videoUrl = await uploadFile(
  Buffer.from(fileBuffer),
  key,
  'video/mp4'
);
```

### Upload a Thumbnail
```typescript
const key = generateFileKey('thumbnails', 'poster.jpg');
const thumbnailUrl = await uploadFile(
  Buffer.from(fileBuffer),
  key,
  'image/jpeg'
);
```

## 📊 File Organization

- `/movies/` - All movie files
- `/fan-clips/` - User-uploaded clips
- `/thumbnails/` - Movie and clip thumbnails
- `/avatars/` - User profile pictures

## 💰 Cost Efficiency

- Backblaze B2 is **5x cheaper** than AWS S3
- First 10 GB storage is **FREE**
- First 1 GB download per day is **FREE**
- Perfect for a movie streaming app!

## 🔒 Security Tips

1. Use separate application keys for different environments
2. Set bucket to private and use signed URLs for sensitive content
3. Enable versioning on your bucket
4. Set up lifecycle rules to delete old files
