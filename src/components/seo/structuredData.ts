import { SITE_URL } from '@/lib/seo';

/**
 * Thin, reusable JSON-LD templates for Fiesta Flix.
 *
 * Kept in a component-importable file so server pages can call it without
 * pulling in server-only modules. Every template accepts only fields we
 * actually have — never fabricates reviews, ratings, addresses, or social
 * profiles.
 */

/** Organization — only the facts we are confident are true. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fiesta Flix',
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    sameAs: [
      // Only links that actually resolve to a real, maintained presence.
      // If a profile is not live, remove it rather than link to a placeholder.
      'https://t.me/fiestaflix_movies',
      'https://t.me/FiestaFlixBot',
    ],
  };
}

/** WebSite + SearchAction pointing at the real site search route. */
export function webSiteJsonLd() {
  const siteUrl = SITE_URL;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Fiesta Flix',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        // Real on-site search URL pattern used by the UI.
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** BreadcrumbList — generic builder for movie / narrator / genre / series pages. */
export function breadcrumbJsonLd(items: Array<{ name: string; href?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      // The current page is the last crumb — schema.org omits `item` for it.
      ...(item.href
        ? {
            item: item.href.startsWith('http')
              ? item.href
              : `${SITE_URL}${item.href.startsWith('/') ? '' : '/'}${item.href}`,
          }
        : {}),
    })),
  };
}

/** Movie — uses only the fields the server page resolves from the DB/seed. */
export function movieJsonLd({
  title,
  description,
  image,
  durationSeconds,
  genre,
  releaseYear,
  dateCreated,
  datePublished,
  url,
  narrator,
  director,
  actor,
  contentRating,
  countryOfOrigin,
}: {
  title: string;
  description?: string | null;
  image?: string | null;
  durationSeconds?: number | null;
  genre?: string | null;
  releaseYear?: number | null;
  dateCreated?: string | null;
  datePublished?: string | null;
  url?: string | null;
  narrator?: string | null;
  director?: string | null;
  actor?: string | null;
  contentRating?: string | null;
  countryOfOrigin?: string | null;
}) {
  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: title,
  };

  if (description) payload.description = description;
  if (url) {
    payload.url = url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    payload['@id'] = payload.url;
  }
  if (image) {
    payload.posterImage = image;
    payload.thumbnailUrl = image;
  }
  if (genre) payload.genre = genre;
  if (durationSeconds && durationSeconds > 0) {
    payload.duration = `PT${Math.floor(durationSeconds / 3600)}H${Math.floor((durationSeconds % 3600) / 60)}M${(durationSeconds % 60)}S`;
  }
  if (releaseYear) payload.dateCreated = `${releaseYear}-01-01`;
  if (datePublished) payload.datePublished = datePublished;
  else if (releaseYear) payload.datePublished = `${releaseYear}-01-01`;
  if (dateCreated && dateCreated !== (releaseYear ? `${releaseYear}-01-01` : null)) payload.dateCreated = dateCreated;
  if (narrator) payload.actor = [{ '@type': 'Person', name: narrator }];
  if (director) payload.director = [{ '@type': 'Person', name: director }];
  if (actor && actor !== narrator) {
    const existing = Array.isArray(payload.actor) ? payload.actor : [];
    if (!existing.some((a) => (a as any).name === actor)) payload.actor = [...existing, { '@type': 'Person', name: actor }];
  }
  if (contentRating) payload.contentRating = contentRating;
  if (countryOfOrigin) payload.countryOfOrigin = { '@type': 'Country', name: countryOfOrigin };

  return payload;
}

/** VideoObject — only emitted when the page actually has a playable source + thumbnail. */
export function videoObjectJsonLd({
  name,
  description,
  thumbnailUrl,
  contentUrl,
  embedUrl,
  uploadDate,
  durationSeconds,
  expires,
}: {
  name: string;
  description?: string | null;
  thumbnailUrl: string;
  contentUrl?: string | null;
  embedUrl?: string | null;
  uploadDate?: string | null;
  durationSeconds?: number | null;
  expires?: string | null;
}) {
  if (!thumbnailUrl) return null;

  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    thumbnailUrl,
  };

  if (description) payload.description = description;
  if (uploadDate) payload.uploadDate = uploadDate;
  if (durationSeconds && durationSeconds > 0) {
    payload.duration = `PT${Math.floor(durationSeconds / 3600)}H${Math.floor((durationSeconds % 3600) / 60)}M${(durationSeconds % 60)}S`;
  }
  if (contentUrl) payload.contentUrl = contentUrl;
  if (embedUrl) payload.embedUrl = embedUrl;
  if (expires) payload.expires = expires;

  // We never claim a specific license / rating / production company here unless
  // the page has real, verified data for it.
  return payload;
}

/** CollectionPage for genre / series landing pages. */
export function collectionPageJsonLd({
  name,
  description,
  url,
  inLanguage,
  count,
}: {
  name: string;
  description?: string | null;
  url: string;
  inLanguage: string;
  count?: number;
}) {
  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url,
    inLanguage,
  };
  if (description) payload.description = description;
  if (count != null && count > 0) payload.numberOfItems = count;
  return payload;
}

/** Person for narrator landing pages. */
export function personJsonLd({
  name,
  description,
  image,
  url,
  jobTitle,
  worksFor,
  sameAs,
}: {
  name: string;
  description?: string | null;
  image?: string | null;
  url: string;
  jobTitle?: string | null;
  worksFor?: { name: string } | null;
  sameAs?: Array<string> | null;
}) {
  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url,
  };

  if (description) payload.description = description;
  if (image) payload.image = image;
  if (jobTitle) payload.jobTitle = jobTitle;
  if (worksFor) payload.worksFor = worksFor;
  if (sameAs && sameAs.length) payload.sameAs = sameAs;

  return payload;
}
