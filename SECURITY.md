# Security

## Action required: rotate the database credential

A live Neon connection string used to be committed in source as the fallback
for `DATABASE_URL` (in `src/lib/prisma.ts` and several `scripts/*.ts`). It has
been removed, but **removing it from the repository does not revoke it**.

1. Rotate the Neon password (or create a new role and delete the old one).
2. Set `DATABASE_URL` in `.env` locally and in your hosting dashboard.
3. Re-run `npx prisma migrate deploy` if the connection fails after rotation.

Anyone who has ever read this repository — including forks, clones and CI logs
— can still use the old credential until it is rotated.

## Environment variables

Nothing falls back to a value committed in source. Missing secrets fail closed
with an actionable message; `reportEnv()` (called from `src/lib/prisma.ts`)
logs the offending variable *names* once per process in production and never
logs a value.

| Variable | Required in production | Why |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string. `src/lib/prisma.ts` and `scripts/_database-url.ts` throw without it. |
| `NEXTAUTH_SECRET` | yes | Signs session tokens; must be ≥ 32 chars. Enforced in `src/lib/auth.ts`. |
| `IP_HASH_SALT` | yes | Salts IP hashes. Without it, identifiers are not recorded at all (see below). |
| `CRON_SECRET` | no | Authorises `/api/cron/*`; those routes return 401 without it. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | recommended | Shared rate-limit counters (see below). |
| `TRUSTED_PROXY_HOPS` / `TRUSTED_PROXY_IPS` | no | How many proxies in front of the app may set `x-forwarded-for`. |

Copy `.env.example` to `.env` and fill in values — the placeholders it ships
with are rejected by both the runtime audit and the import scripts.

## Rate limiting

Counters live in Upstash Redis when `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` are set, so a limit such as 20 chat requests per
minute means 20 across the whole deployment. Without them, each instance keeps
its own counter and the effective limit becomes `limit × instance count`; a
warning is logged once in production so that weaker configuration cannot go
unnoticed.

Keys are hashed before they leave the process, so no raw IP reaches a third
party. When the store is unreachable the limiter fails open (the site stays
up) and logs the reason.

Endpoints covered: `POST /api/chat` (20/min), `GET /api/movies/:id/play` and
`POST /api/movies/:id/view` (120/min), `GET /api/movies/:id/download`
(60/min), `POST /api/watch-history` (120/min per user), `POST /api/movies/requests`
(5/hour).

## IP addresses

- `getClientIp()` prefers Vercel's platform-derived `request.ip`, which cannot
  be spoofed from the public internet.
- `x-forwarded-for` is only trusted when the nearest hop is a proxy we control
  (`TRUSTED_PROXY_IPS`, or a private address when none is configured), then the
  chain is walked back past `TRUSTED_PROXY_HOPS` trusted proxies.
- Raw IPs are never stored or logged. `hashIp()` returns a salted SHA-256
  digest and returns `null` in production when `IP_HASH_SALT` is missing, so a
  reversible unsalted hash is never written to the database.

## Authorisation

Every admin route goes through `requireAdmin()` and every user-scoped route
through `requireUser()` from `@/lib/api/helpers`, both built on
`getCurrentUser()` from `src/lib/auth.ts`. Client-supplied ids are never
trusted for ownership checks.
