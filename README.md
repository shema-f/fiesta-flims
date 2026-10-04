# Fiesta Flix

Streaming and movie-download platform for Kinyarwanda-narrated films.

Fiesta Flix is a **media orchestration platform**: the app asks the `StorageManager`
for a logical asset ("the 1080p stream for movie 123") and the manager decides the
best provider, quality and delivery method. The web app/API runs on Vercel;
video bytes travel through object storage + CDN, never through Vercel.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + motion/react
- **ORM**: Prisma 5 · **Database**: PostgreSQL (Neon recommended)
- **Auth**: NextAuth.js (JWT, roles: ADMIN / FAN)
- **Streaming**: adaptive HLS (`hls.js`)
- **Transcoding**: FFmpeg/FFprobe worker (run outside Vercel)
- **Storage**: provider abstraction — Cloudflare R2, Backblaze B2, Amazon S3,
  generic S3, Telegram, Google Drive, MediaFire

## Architecture

```
USER → FIESTA FLIX WEB/PWA → NEXT.JS API → STORAGE MANAGER
     → PROVIDER (R2 / B2 / S3 / Telegram / Drive / MediaFire)
     → CDN → USER
```

Key modules:

- `src/lib/storage/` — provider interface, registry, `StorageManager`
  (source selection, failover, replication, health)
- `src/lib/media/` — fingerprinting, FFprobe, FFmpeg→HLS, MediaJob service,
  pipeline, tiering
- `src/components/video/` — HLS player + quality/subtitle/audio/controls
- `scripts/media-worker.ts` — background job worker (FFmpeg)

## API

Movies: `GET/POST /api/movies`, `GET /api/movies/:id`,
`GET /api/movies/:id/{play,download,qualities,subtitles}`,
`POST /api/movies/:id/view`, `GET/POST /api/watch-history`

Admin (ADMIN only): `/api/admin/media/*`, `/api/admin/storage/*`

Cron: `/api/cron/storage-health`, `/api/cron/tiering`

## Getting Started

```bash
npm install --legacy-peer-deps
cp .env.example .env      # fill in DATABASE_URL, secrets, provider keys
npx prisma migrate deploy # create the PostgreSQL schema
npm run db:seed-providers # register storage providers (disabled by default)
npm run dev
```

## Media processing

FFmpeg does not run inside Vercel. Create a job from the admin API, then run a
worker on any machine with FFmpeg installed:

```bash
npm run worker
```

Flow: upload → validate → hash → probe → transcode → HLS → upload → verify → READY.
The same source file is never transcoded twice (SHA-256 fingerprint).

## Deployment (Vercel + Neon)

1. Create a Neon PostgreSQL database and copy the pooled `DATABASE_URL`.
2. In Vercel, set all environment variables from `.env.example`.
3. Deploy (Vercel runs `prisma generate && next build`).
4. Apply the schema once: `npx prisma migrate deploy` (or from CI).
5. Add storage provider credentials and enable them in the admin dashboard.
6. Run the media worker on a separate host (Fly.io / Railway / VPS).

`vercel.json` schedules the health and tiering crons.

## Environment Variables

See `.env.example` for the full list (database, auth, R2/B2/S3, Telegram,
Google Drive, MediaFire, media/worker tuning, cron secret).

## Notes

- The existing catalog pages still read the legacy `movieData.ts` seed while the
  catalog is migrated to PostgreSQL; the API and storage layers are already
  database-backed.
- No video bytes are ever proxied through Vercel.

## License

Private and proprietary.
