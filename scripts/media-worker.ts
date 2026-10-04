/**
 * Fiesta Flix media worker (spec §9).
 *
 * Run this on a box with FFmpeg installed (Fly.io, Railway, a VPS, or locally):
 *
 *   npx ts-node scripts/media-worker.ts
 *
 * It claims MediaJobs from PostgreSQL and processes them asynchronously, so the
 * Vercel web app only ever creates a job and returns immediately.
 */

import { prisma } from '../src/lib/prisma';
import { storageManager } from '../src/lib/storage';
import { claimNextQueuedJob, recoverStuckJobs, logJob } from '../src/lib/media/job-service';
import { runMediaJob } from '../src/lib/media/pipeline';
import { ffmpegAvailable } from '../src/lib/media/ffmpeg';
import { ffprobeAvailable } from '../src/lib/media/ffprobe';

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_MS || 5000);
let running = true;

async function main() {
  console.log('[media-worker] starting');
  await storageManager.ensureProvidersSeeded().catch(() => {});

  const ffmpegOk = await ffmpegAvailable();
  const ffprobeOk = await ffprobeAvailable();
  console.log(`[media-worker] ffmpeg=${ffmpegOk ? 'ok' : 'MISSING'} ffprobe=${ffprobeOk ? 'ok' : 'MISSING'}`);
  if (!ffmpegOk || !ffprobeOk) {
    console.warn('[media-worker] FFmpeg/FFprobe not found — jobs will fail until installed.');
  }

  const recovered = await recoverStuckJobs().catch(() => 0);
  if (recovered) console.log(`[media-worker] requeued ${recovered} stuck jobs`);

  while (running) {
    let job: any = null;
    try {
      job = await claimNextQueuedJob();
    } catch (err) {
      console.error('[media-worker] claim failed:', (err as Error)?.message);
    }

    if (!job) {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    console.log(`[media-worker] processing job ${job.id} (${job.jobType})`);
    try {
      await logJob(job.id, 'INFO', 'Worker picked up job');
      const result = await runMediaJob(job.id);
      console.log(`[media-worker] job ${job.id} →`, result);
    } catch (err) {
      console.error(`[media-worker] job ${job.id} crashed:`, (err as Error)?.message);
      await prisma.mediaJob
        .update({ where: { id: job.id }, data: { status: 'FAILED', errorMessage: (err as Error)?.message } })
        .catch(() => {});
    }
  }

  await prisma.$disconnect().catch(() => {});
  console.log('[media-worker] stopped');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shutdown() {
  console.log('[media-worker] shutdown requested');
  running = false;
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch((err) => {
  console.error('[media-worker] fatal:', err);
  process.exit(1);
});
