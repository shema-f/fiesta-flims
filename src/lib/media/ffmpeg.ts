/**
 * FFmpeg HLS transcoder (spec §9).
 *
 * Produces one HLS rendition per quality level. This is CPU/IO heavy and must
 * run in the dedicated worker — never in a Vercel request.
 */

import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import { buildMasterPlaylist, type Rendition } from './hls';

const execFileAsync = promisify(execFile);

export function ffmpegBinary(): string {
  return process.env.FFMPEG_PATH || 'ffmpeg';
}

export async function ffmpegAvailable(): Promise<boolean> {
  try {
    await execFileAsync(ffmpegBinary(), ['-version']);
    return true;
  } catch {
    return false;
  }
}

export interface TranscodeRenditionInput {
  label: string;
  width: number;
  height: number;
  videoBitrate: number;
  audioBitrate: number;
}

export interface TranscodeOptions {
  inputPath: string;
  outputDir: string;
  renditions: TranscodeRenditionInput[];
  segmentDuration?: number;
  onProgress?: (rendition: string, percent: number) => void;
  onLog?: (line: string) => void;
}

export interface TranscodeResult {
  renditions: Rendition[];
  masterPath: string;
  masterPlaylist: string;
}

function transcodeOne(
  opts: TranscodeOptions,
  rendition: TranscodeRenditionInput,
  totalDurationSeconds?: number
): Promise<Rendition> {
  const segmentDuration = opts.segmentDuration ?? 6;
  const playlistPath = `${opts.outputDir}/${rendition.label}/playlist.m3u8`;
  const segmentPattern = `${opts.outputDir}/${rendition.label}/segment%04d.ts`;

  const args = [
    '-y',
    '-i', opts.inputPath,
    '-vf', `scale=w=${rendition.width}:h=${rendition.height}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`,
    '-c:a', 'aac',
    '-ar', '48000',
    '-b:a', String(rendition.audioBitrate),
    '-c:v', 'libx264',
    '-profile:v', 'main',
    '-preset', process.env.FFMPEG_PRESET || 'veryfast',
    '-b:v', String(rendition.videoBitrate),
    '-maxrate', String(Math.round(rendition.videoBitrate * 1.07)),
    '-bufsize', String(Math.round(rendition.videoBitrate * 1.5)),
    '-g', String(segmentDuration * 2),
    '-keyint_min', String(segmentDuration * 2),
    '-sc_threshold', '0',
    '-hls_time', String(segmentDuration),
    '-hls_playlist_type', 'vod',
    '-hls_segment_filename', segmentPattern,
    playlistPath,
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegBinary(), args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (opts.onLog) {
        text.split('\n').filter(Boolean).forEach((l: string) => opts.onLog!(l));
      }
      // Parse `time=00:00:12.34` to estimate progress.
      const match = stderr.match(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g);
      if (match && totalDurationSeconds && opts.onProgress) {
        const last = match[match.length - 1];
        const parts = last.replace('time=', '').split(':').map(Number);
        const seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        const percent = Math.min(100, Math.round((seconds / totalDurationSeconds) * 100));
        opts.onProgress(rendition.label, percent);
      }
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({
          label: rendition.label,
          width: rendition.width,
          height: rendition.height,
          videoBitrate: rendition.videoBitrate,
          audioBitrate: rendition.audioBitrate,
          playlist: `${rendition.label}/playlist.m3u8`,
          codec: 'avc1.640028,mp4a.40.2',
        });
      } else {
        reject(new Error(`ffmpeg exited with code ${code} for ${rendition.label}`));
      }
    });
  });
}

/** Transcode every rendition sequentially and write the master playlist. */
export async function transcodeToHls(
  opts: TranscodeOptions,
  totalDurationSeconds?: number
): Promise<TranscodeResult> {
  const renditions: Rendition[] = [];
  for (const rendition of opts.renditions) {
    const result = await transcodeOne(opts, rendition, totalDurationSeconds);
    renditions.push(result);
  }

  const masterPlaylist = buildMasterPlaylist(renditions);
  const masterPath = `${opts.outputDir}/master.m3u8`;
  const { writeFile, mkdir } = await import('fs/promises');
  await mkdir(opts.outputDir, { recursive: true });
  await writeFile(masterPath, masterPlaylist, 'utf8');

  return { renditions, masterPath, masterPlaylist };
}
