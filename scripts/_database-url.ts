/**
 * Connection string for one-off scripts.
 *
 * Next.js and the Prisma CLI load `.env` automatically; `ts-node` does not, so
 * these scripts read it themselves. There is deliberately **no fallback URL**:
 * a live production connection string must never be committed to source.
 */
import fs from 'fs';
import path from 'path';

let loaded = false;

/** Minimal `.env` loader — only sets variables that are not already set. */
function loadDotEnv(): void {
  if (loaded) return;
  loaded = true;

  for (const candidate of ['.env', '.env.local']) {
    const filePath = path.join(process.cwd(), candidate);
    if (!fs.existsSync(filePath)) continue;

    for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;
      const value = rawValue.replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  }
}

/** Returns `DATABASE_URL`, or throws with an actionable message. */
export function requireDatabaseUrl(): string {
  loadDotEnv();

  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and fill in your database connection string, then re-run.'
    );
  }

  // Guard against the placeholder values shipped in `.env.example`.
  if (/^<.*>$/.test(url) || /user:password|ep-xxx/i.test(url)) {
    throw new Error(
      'DATABASE_URL still contains a placeholder value from .env.example. Replace it with a real connection string.'
    );
  }

  return url;
}
