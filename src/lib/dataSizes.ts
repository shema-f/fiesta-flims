/**
 * Data estimates for Rwanda-first streaming.
 *
 * Mobile data is metered and expensive, so every quality option should tell the
 * user roughly what it costs before they press play or download.
 */

/** Approximate video bitrate in MB per minute, by resolution label. */
const MB_PER_MINUTE: Record<string, number> = {
  '360p': 2.5,
  '480p': 4.5,
  '720p': 8.5,
  '1080p': 16,
  '1440p': 28,
  '4K': 45,
  '2160p': 45,
};

function rateFor(label: string): number {
  const key = Object.keys(MB_PER_MINUTE).find((k) => label.toLowerCase().includes(k.toLowerCase()));
  if (key) return MB_PER_MINUTE[key];
  const num = parseInt(label, 10);
  if (!Number.isNaN(num)) {
    if (num >= 2000) return MB_PER_MINUTE['4K'];
    if (num >= 1400) return MB_PER_MINUTE['1440p'];
    if (num >= 1000) return MB_PER_MINUTE['1080p'];
    if (num >= 700) return MB_PER_MINUTE['720p'];
    if (num >= 460) return MB_PER_MINUTE['480p'];
    return MB_PER_MINUTE['360p'];
  }
  return MB_PER_MINUTE['720p'];
}

/** Estimated download/stream size in MB for a quality over a given duration. */
export function estimateSizeMb(qualityLabel: string, durationSeconds: number): number {
  const minutes = Math.max(1, durationSeconds / 60);
  return Math.round(rateFor(qualityLabel) * minutes);
}

/** Human-readable size, e.g. "1.45 GB" or "420 MB". */
export function formatSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb} MB`;
}

export function estimateSizeLabel(qualityLabel: string, durationSeconds: number): string {
  return formatSize(estimateSizeMb(qualityLabel, durationSeconds));
}

export const DATA_SAVER_TIP =
  'On a slow or metered connection, switch to 480p — it uses roughly a quarter of the data of 1080p.';
