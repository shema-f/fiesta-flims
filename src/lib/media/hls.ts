/**
 * HLS helpers — build and parse adaptive streaming manifests (spec §8).
 */

export interface Rendition {
  /** Quality label, e.g. "1080p". */
  label: string;
  width: number;
  height: number;
  /** Average video bitrate in bits/sec. */
  videoBitrate: number;
  audioBitrate: number;
  /** Playlist path relative to the master playlist. */
  playlist: string;
  codec?: string;
}

/** Canonical quality ladder. H.264/AAC is used for maximum browser support. */
export const DEFAULT_LADDER: Omit<Rendition, 'playlist' | 'codec'>[] = [
  { label: '2160p', width: 3840, height: 2160, videoBitrate: 14_000_000, audioBitrate: 192_000 },
  { label: '1440p', width: 2560, height: 1440, videoBitrate: 8_000_000, audioBitrate: 192_000 },
  { label: '1080p', width: 1920, height: 1080, videoBitrate: 5_000_000, audioBitrate: 128_000 },
  { label: '720p', width: 1280, height: 720, videoBitrate: 2_800_000, audioBitrate: 128_000 },
  { label: '480p', width: 854, height: 480, videoBitrate: 1_400_000, audioBitrate: 128_000 },
  { label: '360p', width: 640, height: 360, videoBitrate: 800_000, audioBitrate: 96_000 },
];

/**
 * Select which renditions to produce given the source height and a requested set.
 * Never upscale beyond the source resolution.
 */
export function selectLadder(
  requested: string[] | undefined,
  sourceHeight?: number
): Omit<Rendition, 'playlist' | 'codec'>[] {
  const ladder = DEFAULT_LADDER.filter((r) => !sourceHeight || r.height <= sourceHeight);
  if (!requested?.length) return ladder;
  return ladder.filter((r) => requested.includes(r.label));
}

/**
 * Build an HLS master playlist from renditions. The first segments of each
 * rendition are what the player needs for fast startup (spec §12).
 */
export function buildMasterPlaylist(renditions: Rendition[]): string {
  const lines: string[] = ['#EXTM3U', '#EXT-X-VERSION:3'];
  for (const r of renditions) {
    const bandwidth = r.videoBitrate + r.audioBitrate;
    const resolution = `${r.width}x${r.height}`;
    lines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution},CODECS="${r.codec || 'avc1.640028,mp4a.40.2'}",NAME="${r.label}"`
    );
    lines.push(r.playlist);
  }
  return lines.join('\n') + '\n';
}

/** Build a single rendition's media playlist. Only used for synthetic/testing. */
export function buildMediaPlaylist(segmentPrefix: string, count: number, targetDuration = 6): string {
  const lines = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    `#EXT-X-TARGETDURATION:${targetDuration}`,
    '#EXT-X-MEDIA-SEQUENCE:0',
    '#EXT-X-PLAYLIST-TYPE:VOD',
  ];
  for (let i = 1; i <= count; i++) {
    lines.push(`#EXTINF:${targetDuration.toFixed(3)},`);
    lines.push(`${segmentPrefix}${String(i).padStart(4, '0')}.ts`);
  }
  lines.push('#EXT-X-ENDLIST');
  return lines.join('\n') + '\n';
}
