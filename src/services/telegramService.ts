/**
 * Telegram Movie Storage & Download Links Service
 * 
 * Manages Telegram channel posts, bot deep-links, multi-resolution download links,
 * and mobile-native application protocol deeplinks for Fiesta Flix.
 */

export interface TelegramDownloadOption {
  id: string;
  quality: string;
  label: string;
  resolution: string;
  fileSize: string;
  channelUrl: string;
  appDeeplink: string;
  botUrl: string;
  botAppDeeplink: string;
  streamUrl?: string;
  isRecommended?: boolean;
}

export interface TelegramMovieConfig {
  movieId: string | number;
  movieTitle: string;
  quality?: string;
  fileSize?: string;
  channelPostUrl?: string;
  botLink?: string;
  telegramFileId?: string;
}

const DEFAULT_CHANNEL_USERNAME = 'fiestaflix_movies';
const DEFAULT_BOT_USERNAME = 'FiestaFlixBot';

/**
 * Normalizes or extracts the Telegram post ID from a channel link or number
 */
export function extractTelegramPostId(postIdOrUrl?: string | number): string {
  if (!postIdOrUrl) return '101';
  const str = String(postIdOrUrl).trim();
  const match = str.match(/\/(\d+)\/?$/);
  if (match && match[1]) {
    return match[1];
  }
  return str.replace(/\D/g, '') || '101';
}

/**
 * Builds standard HTTPS Telegram channel post link
 */
export function getChannelPostUrl(postIdOrUrl?: string | number, channel = DEFAULT_CHANNEL_USERNAME): string {
  if (typeof postIdOrUrl === 'string' && postIdOrUrl.startsWith('http')) {
    return postIdOrUrl;
  }
  const postId = extractTelegramPostId(postIdOrUrl);
  return `https://t.me/${channel}/${postId}`;
}

/**
 * Builds mobile-native protocol link (tg://resolve?domain=...&post=...)
 * Directly launches the Telegram application on iOS/Android without opening a browser tab
 */
export function getNativeAppChannelLink(postIdOrUrl?: string | number, channel = DEFAULT_CHANNEL_USERNAME): string {
  const postId = extractTelegramPostId(postIdOrUrl);
  return `tg://resolve?domain=${channel}&post=${postId}`;
}

/**
 * Builds Telegram Bot deep-link for instant file dispatch
 * e.g. https://t.me/FiestaFlixBot?start=dl_1_1080p
 */
export function getBotDeeplinkUrl(
  movieId: string | number,
  quality = '1080p',
  botUsername = DEFAULT_BOT_USERNAME
): string {
  const sanitizedId = String(movieId).replace(/[^a-zA-Z0-9_-]/g, '');
  const sanitizedQuality = quality.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://t.me/${botUsername}?start=dl_${sanitizedId}_${sanitizedQuality}`;
}

/**
 * Builds native protocol deep-link for bot on mobile
 */
export function getNativeAppBotLink(
  movieId: string | number,
  quality = '1080p',
  botUsername = DEFAULT_BOT_USERNAME
): string {
  const sanitizedId = String(movieId).replace(/[^a-zA-Z0-9_-]/g, '');
  const sanitizedQuality = quality.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `tg://resolve?domain=${botUsername}&start=dl_${sanitizedId}_${sanitizedQuality}`;
}

/**
 * Generate full tier of download options (1080p, 720p, 4K, 480p) for a movie
 */
export function generateTelegramDownloadOptions(config: TelegramMovieConfig): TelegramDownloadOption[] {
  const { movieId, quality = '1080p FHD', fileSize = '1.45 GB', channelPostUrl } = config;
  const basePostId = extractTelegramPostId(channelPostUrl || movieId);
  const numId = parseInt(basePostId, 10) || 100;

  return [
    {
      id: `${movieId}-4k`,
      quality: '4K Ultra HD',
      label: 'Ultra HD (4K)',
      resolution: '3840x2160',
      fileSize: fileSize.includes('GB') ? `${(parseFloat(fileSize) * 1.8).toFixed(1)} GB` : '2.8 GB',
      channelUrl: getChannelPostUrl(numId + 2),
      appDeeplink: getNativeAppChannelLink(numId + 2),
      botUrl: getBotDeeplinkUrl(movieId, '4k'),
      botAppDeeplink: getNativeAppBotLink(movieId, '4k'),
      isRecommended: false,
    },
    {
      id: `${movieId}-1080p`,
      quality: '1080p FHD',
      label: 'Full HD (1080p)',
      resolution: '1920x1080',
      fileSize: fileSize || '1.45 GB',
      channelUrl: getChannelPostUrl(channelPostUrl || numId),
      appDeeplink: getNativeAppChannelLink(channelPostUrl || numId),
      botUrl: getBotDeeplinkUrl(movieId, '1080p'),
      botAppDeeplink: getNativeAppBotLink(movieId, '1080p'),
      isRecommended: true,
    },
    {
      id: `${movieId}-720p`,
      quality: '720p HD',
      label: 'High Definition (720p)',
      resolution: '1280x720',
      fileSize: fileSize.includes('GB') ? `${(parseFloat(fileSize) * 0.6).toFixed(1)} GB` : '780 MB',
      channelUrl: getChannelPostUrl(numId + 1),
      appDeeplink: getNativeAppChannelLink(numId + 1),
      botUrl: getBotDeeplinkUrl(movieId, '720p'),
      botAppDeeplink: getNativeAppBotLink(movieId, '720p'),
      isRecommended: false,
    },
    {
      id: `${movieId}-480p`,
      quality: '480p Mobile',
      label: 'Data Saver (480p)',
      resolution: '854x480',
      fileSize: '420 MB',
      channelUrl: getChannelPostUrl(numId + 3),
      appDeeplink: getNativeAppChannelLink(numId + 3),
      botUrl: getBotDeeplinkUrl(movieId, '480p'),
      botAppDeeplink: getNativeAppBotLink(movieId, '480p'),
      isRecommended: false,
    },
  ];
}

/**
 * Tracks Telegram download click analytics in localStorage
 */
export function trackTelegramDownloadClick(movieId: string | number, quality: string): void {
  try {
    if (typeof window === 'undefined') return;
    const key = 'fiesta_flix_telegram_downloads';
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    const movieKey = String(movieId);
    existing[movieKey] = (existing[movieKey] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (err) {
    console.warn('Analytics tracking error', err);
  }
}
