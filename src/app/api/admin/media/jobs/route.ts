import { NextRequest } from 'next/server';
import { listJobs } from '@/lib/media/job-service';
import { jsonOk, intParam, requireAdmin } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/** GET /api/admin/media/jobs?status=&movieId=&limit= */
export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const sp = request.nextUrl.searchParams;
  const jobs = await listJobs({
    status: (sp.get('status') as any) || undefined,
    movieId: sp.get('movieId') || undefined,
    jobType: (sp.get('jobType') as any) || undefined,
    limit: intParam(sp.get('limit'), 50, 1, 200),
  });

  return jsonOk(jobs);
}
