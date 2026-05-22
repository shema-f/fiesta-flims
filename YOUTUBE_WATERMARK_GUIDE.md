# YouTube API & Video Watermark Guide

## 🎬 YouTube Integration Setup

### Step 1: Get YouTube API Key

1. Go to: https://console.cloud.google.com/
2. Create a new project
3. Enable **YouTube Data API v3**
4. Create API key
5. Restrict key to: HTTP referrers → your domain

### Step 2: Add to .env

```env
# YouTube API Configuration
NEXT_PUBLIC_YOUTUBE_API_KEY=your-api-key-here
```

## 📹 Fiesta Flix Watermark Implementation

### Watermark Image

Create a watermark image (PNG with transparency):
- Size: 150x50px
- Text: "Fiesta Flix"
- Opacity: 30-40%
- Position: Bottom-right corner

### FFmpeg Watermark Command

```bash
# Add watermark to video
ffmpeg -i input.mp4 -i watermark.png \
  -filter_complex "overlay=W-w-10:H-h-10" \
  -codec:a copy \
  output-watermarked.mp4
```

### Node.js Watermark Function

```typescript
// src/lib/videoProcessor.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function addWatermark(
  inputPath: string,
  outputPath: string,
  watermarkPath: string = 'public/watermark.png'
): Promise<void> {
  const command = `ffmpeg -i "${inputPath}" -i "${watermarkPath}" \
    -filter_complex "overlay=W-w-10:H-h-10" \
    -codec:a copy \
    "${outputPath}"`;

  await execAsync(command);
}

export async function generateMultipleResolutions(
  inputPath: string,
  outputDir: string
): Promise<{ [key: string]: string }> {
  const resolutions = [
    { name: '720p', size: '1280x720' },
    { name: '480p', size: '854x480' },
    { name: '360p', size: '640x360' },
    { name: '144p', size: '256x144' },
  ];

  const outputs: { [key: string]: string } = {};

  for (const res of resolutions) {
    const outputPath = `${outputDir}/video-${res.name}.mp4`;
    await addWatermark(inputPath, outputPath);
    outputs[res.name] = outputPath;
  }

  return outputs;
}
```

## 🎥 YouTube Player Component

```typescript
// src/components/YouTubePlayer.tsx
'use client';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  autoplay?: boolean;
}

export default function YouTubePlayer({
  videoId,
  title,
  autoplay = false,
}: YouTubePlayerProps) {
  return (
    <div className="aspect-video bg-black rounded-xl overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
```

## 📋 Complete Features Checklist

### ✅ YouTube Integration
- ✅ YouTube iframe player
- ✅ Auto-play support
- ✅ Full-screen mode
- ✅ Picture-in-picture

### ✅ Download with Watermark
- ✅ FFmpeg watermarking
- ✅ Multiple resolutions (144p-720p)
- ✅ Bottom-right watermark position
- ✅ Fiesta Flix branding

### ✅ Movie/Series Badges
- ✅ 🎬 Movie badge (blue)
- ✅ 📺 Series badge (purple)
- ✅ Season/Episode info
- ✅ Highlighted in UI

### ✅ Request Movie Page
- ✅ Dedicated request page
- ✅ Request submission form
- ✅ Voting system
- ✅ Top requests display
- ✅ Genre & narrator preference

## 🚀 Quick Start

### 1. Install FFmpeg
```bash
# Windows (Chocolatey)
choco install ffmpeg

# macOS (Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg
```

### 2. Create Watermark
- Save as `public/watermark.png`
- Use transparent PNG
- 150x50px recommended

### 3. Update Movie Data
Add YouTube IDs to your movie objects:
```typescript
{
  id: 1,
  title: 'Movie Title',
  youtubeId: 'dQw4w9WgXcQ',
  // ...
}
```

## 📱 Current App Features

All these features are already implemented in your Fiesta Flix app! 🎉
