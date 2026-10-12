/** @license ISC — Fiesta Flix SEO config */

/** Final production origin. Update here when the custom .rw domain goes live. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fiesta-flims.vercel.app').replace(/\/+$/, '');

export const SITE_NAME = 'Fiesta Flix';
export const SITE_LOCALE = 'rw';

export const DEFAULT_TITLE = 'Fiesta Flix — Filime. Ijwi. Umuco.';
export const DEFAULT_DESCRIPTION =
  'Reba filime zisobanuye mu Kinyarwanda kuri internet. Fiesta Flix ni aho kurwanda kwa filime — streaming, gukuramo offline, no gukunda abasobanuzi.';

export function siteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
