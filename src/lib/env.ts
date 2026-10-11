/**
 * Runtime environment validation.
 *
 * The app must never fall back to a credential committed in source: if a
 * required secret is missing or weak in production we fail closed with an
 * actionable message instead of quietly using a shared default that anyone
 * who has read the repository can also use.
 *
 * Values are never logged — only the variable *names* are.
 */

export const isProduction = process.env.NODE_ENV === 'production';

export interface EnvRequirement {
  key: string;
  /** Minimum length for non-empty secrets. */
  minLength?: number;
  /** Fail in production when missing (defaults to true). */
  requiredInProd?: boolean;
  why: string;
}

/**
 * Secrets the application depends on. `requiredInProd: false` marks variables
 * that are strongly recommended but whose absence degrades a feature rather
 * than opening a hole (e.g. crons simply stop being schedulable).
 */
export const REQUIREMENTS: EnvRequirement[] = [
  {
    key: 'DATABASE_URL',
    minLength: 12,
    why: 'PostgreSQL connection string — without it the catalogue cannot be read.',
  },
  {
    key: 'NEXTAUTH_SECRET',
    minLength: 32,
    why: 'signs session tokens; short or missing values allow session forgery.',
  },
  {
    key: 'IP_HASH_SALT',
    minLength: 16,
    why: 'salts IP hashes; without it stored hashes are trivially reversible.',
  },
  {
    key: 'CRON_SECRET',
    minLength: 16,
    requiredInProd: false,
    why: 'authorises the scheduled maintenance routes (they fail closed without it).',
  },
];

/** Placeholder values that ship in `.env.example` and must never reach production. */
const PLACEHOLDER_PATTERNS = [/^$/i, /^<.*>$/i, /^your[-_]?/i, /^changeme$/i, /^xxx+$/i, /^replace/i];

function looksLikePlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((re) => re.test(value.trim()));
}

export interface EnvProblem {
  key: string;
  problem: 'missing' | 'placeholder' | 'too-short';
  why: string;
}

/**
 * Returns every problem with the current environment. Never throws and never
 * includes a value, so it is safe to call from a route handler or a script.
 */
export function auditEnv(requirements: EnvRequirement[] = REQUIREMENTS): EnvProblem[] {
  const problems: EnvProblem[] = [];

  for (const req of requirements) {
    const value = process.env[req.key];
    const required = req.requiredInProd !== false;

    if (value === undefined || value.trim() === '') {
      if (isProduction && required) problems.push({ key: req.key, problem: 'missing', why: req.why });
      continue;
    }

    if (looksLikePlaceholder(value)) {
      if (isProduction && required) {
        problems.push({ key: req.key, problem: 'placeholder', why: req.why });
      }
      continue;
    }

    if (req.minLength && value.trim().length < req.minLength) {
      if (isProduction && required) {
        problems.push({ key: req.key, problem: 'too-short', why: req.why });
      }
    }
  }

  return problems;
}

let reported = false;

/**
 * Logs missing/weak production secrets once per process. Does not throw:
 * `NEXTAUTH_SECRET` already fails closed inside `auth.ts`, and the database
 * layer fails closed on its own — crashing the whole process would also take
 * down static pages that need no secrets at all.
 */
export function reportEnv(): void {
  if (reported || !isProduction) return;
  reported = true;

  const problems = auditEnv();
  if (problems.length === 0) return;

  const summary = problems
    .map((p) => `  - ${p.key} (${p.problem}): ${p.why}`)
    .join('\n');

  // Variable names and reasons only — never a value.
  console.error(`[env] Refusing to run with an insecure configuration:\n${summary}`);
}
