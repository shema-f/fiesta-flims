import { prisma } from '@/lib/prisma';
import { interpretersData } from '@/lib/interpreters';
import { getCatalog } from '@/lib/catalog';
import { buildInterpreterStats } from '@/lib/interpreterCounts';
import { jsonOk, jsonError, requireAdmin } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/interpreters/recount
 *
 * Recomputes every interpreter's movie count from the live catalogue and
 * writes it back to `Interpreter.moviesCount`, so the database and the site
 * always agree. Also creates rows for interpreters that do not exist yet.
 */
export async function POST() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const { movies, tvShows } = await getCatalog();
    const stats = buildInterpreterStats(movies, tvShows);

    let updated = 0;
    let created = 0;

    for (const interpreter of interpretersData) {
      const count = stats.countsBySlug.get(interpreter.slug) ?? 0;
      try {
        const existing = await prisma.interpreter.findUnique({ where: { slug: interpreter.slug } });
        if (existing) {
          if ((existing.moviesCount || 0) !== count) {
            await prisma.interpreter.update({
              where: { slug: interpreter.slug },
              data: { moviesCount: count },
            });
            updated += 1;
          }
        } else {
          await prisma.interpreter.create({
            data: { name: interpreter.name, slug: interpreter.slug, moviesCount: count },
          });
          created += 1;
        }
      } catch (rowErr) {
        console.warn('[interpreters/recount] row failed:', interpreter.slug, rowErr);
      }
    }

    return jsonOk({
      totalMovies: stats.totalMovies,
      totalEpisodes: stats.totalEpisodes,
      unattributedMovies: stats.unattributedMovies,
      attributedMovies: stats.attributedMovies,
      interpreters: interpretersData.length,
      updated,
      created,
      counts: Object.fromEntries(stats.countsBySlug),
    });
  } catch (err) {
    console.error('[interpreters/recount] failed:', err);
    return jsonError('Failed to recount interpreters', 500);
  }
}
