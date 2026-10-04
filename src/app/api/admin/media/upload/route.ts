import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { storageManager, listProviderDefinitions } from '@/lib/storage';
import { jsonOk, jsonError, requireAdmin } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

const uploadSchema = z.object({
  movieId: z.string().min(1),
  filename: z.string().min(1).max(512),
  sizeBytes: z.number().int().min(1),
  contentType: z.string().min(1).max(255),
  providers: z.array(z.string()).min(1),
});

const MAX_SOURCE_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 20 * 1024 * 1024 * 1024);

/**
 * POST /api/admin/media/upload
 *
 * Never accepts the video bytes itself. Validates the request, then returns
 * short-lived direct upload URLs so the admin client PUTs straight to object
 * storage — keeping multi-GB files off Vercel entirely (spec §22/§36/§40).
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  let parsed;
  try {
    parsed = uploadSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.errors[0].message, 400);
    return jsonError('Invalid upload request', 400);
  }

  // Trust nothing from the client (spec §40): validate MIME + size server-side.
  if (!parsed.contentType.startsWith('video/')) {
    return jsonError('Only video uploads are accepted', 415);
  }
  if (parsed.sizeBytes > MAX_SOURCE_BYTES) {
    return jsonError('File exceeds maximum allowed size', 413);
  }
  // Sanitize the filename — never trust it as a path.
  const safeName = parsed.filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);

  const movie = await prisma.movie.findUnique({ where: { id: parsed.movieId } }).catch(() => null);
  if (!movie) return jsonError('Movie not found', 404);

  const known = new Set(listProviderDefinitions().map((d) => d.slug));
  const targets = [];
  for (const slug of parsed.providers) {
    if (!known.has(slug)) {
      targets.push({ provider: slug, direct: false, reason: 'Unknown provider' });
      continue;
    }
    const target = await storageManager.createUploadTarget(
      slug,
      `movies/${parsed.movieId}/source/${safeName}`,
      parsed.contentType
    );
    targets.push(target);
  }

  return jsonOk({
    movieId: parsed.movieId,
    filename: safeName,
    contentType: parsed.contentType,
    targets,
  });
}
