/**
 * FFprobe wrapper — extracts media metadata before transcoding.
 * Runs in the worker process only, never inside a Vercel request.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface ProbeResult {
  durationSeconds?: number;
  width?: number;
  height?: number;
  bitrate?: number;
  codec?: string;
  sizeBytes?: number;
  hasAudio: boolean;
}

function probeBinary(): string {
  return process.env.FFPROBE_PATH || 'ffprobe';
}

export async function ffprobeAvailable(): Promise<boolean> {
  try {
    await execFileAsync(probeBinary(), ['-version']);
    return true;
  } catch {
    return false;
  }
}

export async function probe(filePath: string): Promise<ProbeResult> {
  const { stdout } = await execFileAsync(
    probeBinary(),
    ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath],
    { maxBuffer: 10 * 1024 * 1024 }
  );
  const data = JSON.parse(stdout);
  const videoStream = (data.streams || []).find((s: any) => s.codec_type === 'video');
  const audioStream = (data.streams || []).find((s: any) => s.codec_type === 'audio');
  const format = data.format || {};

  return {
    durationSeconds: format.duration ? Math.round(Number(format.duration)) : undefined,
    width: videoStream?.width,
    height: videoStream?.height,
    bitrate: format.bit_rate ? Number(format.bit_rate) : undefined,
    codec: videoStream?.codec_name,
    sizeBytes: format.size ? Number(format.size) : undefined,
    hasAudio: Boolean(audioStream),
  };
}
