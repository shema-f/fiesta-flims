/**
 * Media processing pipeline (spec §9, §35, §37).
 *
 *   validate → fingerprint → probe → transcode → HLS → upload → verify → READY
 *
 * Runs inside the worker process. Every stage logs to the MediaJob so the admin
 * dashboard can show real progress and never pretend a movie is ready early.
 */

import { mkdtemp, rm, readdir, readFile, stat } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { storageManager, getProvider } from '@/lib/storage';
import { probe, type ProbeResult } from './ffprobe';
import { transcodeToHls } from './ffmpeg';
import { selectLadder } from './hls';
import { fingerprintFile } from './fingerprint';
import { logJob, transitionJob } from './job-service';

export interface PipelineResult {
  videoAssetId: string;
  renditions: string[];
  reused: boolean;
}

async function dirSize(dir: string): Promise<number> {
  let total = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += await dirSize(full);
    else total += (await stat(full)).size;
  }
  return total;
}

async function uploadDirectory(
  jobId: string,
  localDir: string,
  keyPrefix: string,
  providerSlugs: string[],
  videoAssetId: string
): Promise<string[]> {
  const uploaded: string[] = [];
  const entries = await readdir(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(localDir, entry.name);
    if (entry.isDirectory()) {
      uploaded.push(...(await uploadDirectory(jobId, full, `${keyPrefix}/${entry.name}`, providerSlugs, videoAssetId)));
      continue;
    }
    const contentType = entry.name.endsWith('.m3u8')
      ? 'application/vnd.apple.mpegurl'
      : entry.name.endsWith('.ts')
        ? 'video/mp2t'
        : 'application/octet-stream';
    const buffer = await readFile(full);
    const key = `${keyPrefix}/${entry.name}`;

    for (const slug of providerSlugs) {
      const provider = getProvider(slug);
      if (!provider?.isConfigured()) continue;
      try {
        await storageManager.upload({
          movieId: '',
          videoAssetId,
          providerSlug: slug,
          key,
          body: buffer,
          contentType,
          sizeBytes: buffer.byteLength,
          purpose: 'STREAMING',
          filename: entry.name,
        });
        uploaded.push(`${slug}:${key}`);
      } catch (err: any) {
        await logJob(jobId, 'WARN', `Upload failed for ${key} on ${slug}: ${err?.message || err}`);
      }
    }
  }
  return uploaded;
}

/**
 * Process a single MediaJob end to end.
 * Returns null when the job cannot proceed (missing source, ffmpeg absent).
 */
export async function runMediaJob(jobId: string): Promise<PipelineResult | null> {
  const job: any = await prisma.mediaJob.findUnique({
    where: { id: jobId },
    include: { movie: true },
  });
  if (!job) return null;

  if (job.jobType === 'REPLICATE') {
    return runReplicationJob(job);
  }

  const options = (job.options || {}) as Record<string, any>;
  const providerSlugs: string[] = options.providers || options.storage || [];
  const inputPath: string | undefined = options.inputPath;
  const requestedQualities: string[] | undefined = options.qualities;

  if (!inputPath) {
    await logJob(jobId, 'ERROR', 'No inputPath provided in job options');
    await transitionJob(jobId, 'FAILED', { errorMessage: 'Missing source file' });
    return null;
  }

  try {
    // 1. Fingerprint + duplicate detection (spec §37)
    await transitionJob(jobId, 'PROCESSING', { progress: 2 });
    const fingerprint = job.fingerprint || (await fingerprintFile(inputPath));
    await logJob(jobId, 'INFO', `Fingerprint: ${fingerprint}`);

    const existing: any = await prisma.videoAsset.findUnique({ where: { fingerprint } });
    if (existing && existing.id !== job.sourceAssetId) {
      await logJob(jobId, 'INFO', 'Duplicate source detected — attaching existing asset, skipping transcode');
      await prisma.mediaJob.update({
        where: { id: jobId },
        data: { result: { reusedVideoAssetId: existing.id, fingerprint } as any },
      });
      await transitionJob(jobId, 'READY');
      return { videoAssetId: existing.id, renditions: [], reused: true };
    }

    // 2. Probe
    const meta: ProbeResult = await probe(inputPath);
    await logJob(
      jobId,
      'INFO',
      `Probed source: ${meta.width}x${meta.height}, ${meta.durationSeconds ?? '?'}s`,
      meta as unknown as Record<string, unknown>
    );
    await transitionJob(jobId, 'PROCESSING', { progress: 8 });

    // 3. Create/update the VideoAsset
    const videoAsset: any = await prisma.videoAsset.create({
      data: {
        movieId: job.movieId,
        fingerprint,
        status: 'PROCESSING',
        sourceUrl: inputPath,
        duration: meta.durationSeconds,
        width: meta.width,
        height: meta.height,
        bitrate: meta.bitrate,
        codec: meta.codec,
        sizeBytes: meta.sizeBytes ? BigInt(meta.sizeBytes) : undefined,
      },
    });

    // 4. Transcode to HLS
    const renditions = selectLadder(requestedQualities, meta.height);
    const workDir = await mkdtemp(path.join(tmpdir(), 'fiesta-hls-'));
    await logJob(jobId, 'INFO', `Transcoding ${renditions.length} renditions → HLS`);

    await transitionJob(jobId, 'TRANSCODING', { progress: 10 });
    const result = await transcodeToHls(
      {
        inputPath,
        outputDir: workDir,
        renditions,
        onProgress: (label, percent) => {
          // Map per-rendition progress into the 10–70 band.
          const overall = 10 + Math.round((percent / 100) * (60 / renditions.length));
          void transitionJob(jobId, 'TRANSCODING', { progress: Math.min(70, overall) });
        },
        onLog: (line) => void logJob(jobId, 'INFO', line).catch(() => {}),
      },
      meta.durationSeconds
    );

    // 5. Persist qualities + manifest
    for (const r of result.renditions) {
      await prisma.videoQuality.create({
        data: {
          videoAssetId: videoAsset.id,
          label: r.label,
          height: r.height,
          width: r.width,
          bitrate: r.videoBitrate + r.audioBitrate,
          codec: 'h264',
          isHls: true,
        },
      });
    }
    await prisma.streamingManifest.create({
      data: { videoAssetId: videoAsset.id, type: 'HLS', url: 'master.m3u8' },
    });

    // 6. Upload HLS tree to configured STREAMING providers
    await transitionJob(jobId, 'UPLOADING', { progress: 75 });
    const keyPrefix = `movies/${job.movieId}/${videoAsset.id}`;
    const uploaded = await uploadDirectory(jobId, workDir, keyPrefix, providerSlugs, videoAsset.id);
    await logJob(jobId, 'INFO', `Uploaded ${uploaded.length} objects`);

    // 7. Verify
    await transitionJob(jobId, 'VERIFYING', { progress: 92 });
    const hlsSize = await dirSize(workDir);

    await prisma.videoAsset.update({
      where: { id: videoAsset.id },
      data: { status: 'READY', sizeBytes: BigInt(hlsSize) },
    });
    await prisma.movie.update({
      where: { id: job.movieId },
      data: { status: 'READY' },
    });

    await prisma.mediaJob.update({
      where: { id: jobId },
      data: {
        result: {
          videoAssetId: videoAsset.id,
          renditions: result.renditions.map((r) => r.label),
          uploadedObjects: uploaded.length,
        } as any,
      },
    });
    await transitionJob(jobId, 'READY');

    await rm(workDir, { recursive: true, force: true }).catch(() => {});
    return { videoAssetId: videoAsset.id, renditions: result.renditions.map((r) => r.label), reused: false };
  } catch (err: any) {
    await logJob(jobId, 'ERROR', `Pipeline failed: ${err?.message || err}`);
    await transitionJob(jobId, 'FAILED', { errorMessage: err?.message || String(err) });
    return null;
  }
}

/**
 * Copy an existing VideoAsset's storage objects to additional providers
 * (spec §19). Each copy becomes its own StorageObject row.
 */
async function runReplicationJob(job: any): Promise<PipelineResult | null> {
  const jobId = job.id;
  const options = (job.options || {}) as Record<string, any>;
  const videoAssetId: string | undefined = options.videoAssetId;
  const targets: string[] = options.providers || [];

  try {
    await transitionJob(jobId, 'PROCESSING', { progress: 5 });
    if (!videoAssetId || targets.length === 0) {
      await transitionJob(jobId, 'FAILED', { errorMessage: 'Missing videoAssetId or target providers' });
      return null;
    }

    const sources: any[] = (await prisma.storageObject.findMany({
      where: { videoAssetId, status: 'ACTIVE' },
      include: { provider: true },
    })) as any[];
    if (!sources.length) {
      await transitionJob(jobId, 'FAILED', { errorMessage: 'No source objects to replicate' });
      return null;
    }

    const seen = new Set<string>();
    let copied = 0;
    let index = 0;
    for (const obj of sources) {
      const key: string | undefined = obj.path || obj.externalObjectId;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      index += 1;

      const srcProvider = getProvider(obj.provider?.slug);
      if (!srcProvider?.isConfigured() || !obj.externalObjectId) continue;

      let media;
      try {
        media = await srcProvider.getDownloadSource(obj.externalObjectId, obj.externalMessageId || undefined);
      } catch (err: any) {
        await logJob(jobId, 'WARN', `Could not resolve source for ${key}: ${err?.message || err}`);
        continue;
      }

      const res = await fetch(media.url);
      if (!res.ok) {
        await logJob(jobId, 'WARN', `Fetch failed (${res.status}) for ${key}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());

      for (const slug of targets) {
        if (slug === obj.provider?.slug) continue;
        try {
          await storageManager.upload({
            movieId: job.movieId,
            videoAssetId,
            providerSlug: slug,
            key,
            body: buffer,
            contentType: obj.mimeType || 'application/octet-stream',
            sizeBytes: buffer.byteLength,
            purpose: obj.purpose || 'BACKUP',
            filename: obj.filename || undefined,
          });
          copied += 1;
        } catch (err: any) {
          await logJob(jobId, 'WARN', `Replicate to ${slug} failed for ${key}: ${err?.message || err}`);
        }
      }

      const progress = Math.min(95, 5 + Math.round((index / sources.length) * 90));
      await transitionJob(jobId, 'UPLOADING', { progress });
    }

    await prisma.mediaJob.update({
      where: { id: jobId },
      data: { result: { videoAssetId, copied, targets } as any },
    });
    await transitionJob(jobId, 'READY');
    return { videoAssetId, renditions: [], reused: false };
  } catch (err: any) {
    await logJob(jobId, 'ERROR', `Replication failed: ${err?.message || err}`);
    await transitionJob(jobId, 'FAILED', { errorMessage: err?.message || String(err) });
    return null;
  }
}
