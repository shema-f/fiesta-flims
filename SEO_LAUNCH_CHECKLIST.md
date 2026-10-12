# Fiesta Flix — SEO launch checklist

> Internal runbook. Do **not** store secrets, API keys, database URLs, or tokens
> in this file. If a step needs credentials, keep them in the project `.env`
> files (gitignored) and note only the step, not the value.

## Before you request indexing

- [ ] Connect the custom `.rw` domain in Vercel and set it as the production
      domain. Redirect the `*.vercel.app` origin to the custom domain so there
      is only one canonical origin.
- [ ] Update `NEXTAUTH_URL` in the production environment to the custom domain
      **after** the domain is live and the DNS is resolving. Until then, leave
      the current value alone — this checklist deliberately avoids printing it.
- [ ] Confirm `NEXT_PUBLIC_SITE_URL` in production points to the custom domain.
      The single source of truth is `src/lib/seo.ts`; change it there and the
      `metadataBase`, sitemap, canonicals, OG/Twitter images, and JSON-LD all
      follow.
- [ ] Verify the favicons and `icon-512.png` still resolve at the new domain
      (share image is set from `SITE_URL/icon-512.png`).
- [ ] Re-check robots.txt locally before launch:
      `curl -s https://your-domain.rw/robots.txt`
      It should allow public pages, block `/admin`, `/api/`, auth, account,
      `/favorites`, `/upload-clip`, `/search`, and point to
      `/sitemap.xml`.
- [ ] Re-check sitemap locally before launch:
      `curl -s https://your-domain.rw/sitemap.xml | head -20`
      Confirm it lists home, catalogue, genres, narrators, legal pages, and
      every active published movie — and no admin/API/auth/search URLs.

## Google Search Console

- [ ] Verify ownership of the custom domain in Google Search Console (DNS TXT,
      HTML file, or domain provider method — whichever you used for the
      property).
- [ ] Submit `/sitemap.xml` **after** the live site is serving correct
      metadata, not before.
- [ ] Confirm the property shows the custom domain, not the Vercel preview
      domain, as the canonical property.

## Analytics (privacy-conscious)

- [ ] Decide on analytics before launch if you want usage data. Options that
      fit a small Rwandan streaming site better than ad-tech stacks:
      - Vercel Web Analytics (built in, no extra SDK wiring)
      - a self-hosted, consent-light tool if you prefer not to send data to a
        third party
- [ ] If you add analytics, avoid placing marketing trackers on pages that
      include video players or login flows unless you have a reason and a
      disclosure for it.

## Only after pages are live and useful

- [ ] Request indexing **only after** the following are true on the live
      domain:
      - every public page has a unique Kinyarwanda-first title and description
      - movie, narrator, and genre pages render real content server-side
      - structured data is valid JSON-LD and does not invent reviews or ratings
      - no thin or empty category pages are reachable (empty genres return 404)
      - the homepage, movies, genres, narrators, and legal pages all load
        without console errors
- [ ] Do not mass-request indexing for pages that are still empty, duplicated,
      or under construction.

## Monthly monitoring

- [ ] Check Search Console once a month for:
      - indexing coverage / crawl errors
      - Core Web Vitals (mobile especially — Rwanda is mostly mobile)
      - top Kinyarwanda queries bringing users to the site
      - pages suddenly dropped from the index
- [ ] Re-validate sitemap and robots.txt whenever routes, slugs, or the domain
      change.
- [ ] After any movie catalogue import or re-import, confirm the sitemap shows
      only **active, published/ready** movies and that no unpublished film
      appears.

## Content rights (no shortcuts here)

- [ ] Keep proof of distribution rights for every film you serve: licenses,
      agreements, or documented public-domain status. Store that proof outside
      the public repo (it is not SEO metadata; it is legal proof).
- [ ] If a film's rights status changes, update or remove it before the next
      sitemap regeneration. Do not keep unlicensed titles publicly listed "just
      in case."
- [ ] Do not publish fake distributor info, fake licenses, or fake upload dates
      in structured data or visible copy.

## What this checklist deliberately does **not** promise

- It does not guarantee, promise, or imply a #1 rank — for any query.
- It does not recommend keyword stuffing, doorway pages, cloaking, fake
  ratings, or fabricated facts. If you are tempted to do any of those, stop
  and ask instead of shipping it.
