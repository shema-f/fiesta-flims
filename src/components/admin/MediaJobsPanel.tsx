'use client';

import { useCallback, useEffect, useState } from 'react';

interface MediaJobRow {
  id: string;
  jobType: string;
  status: string;
  progress: number;
  attempts: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  movie?: { id: string; title: string; slug: string | null } | null;
}

const STATUS_STYLES: Record<string, string> = {
  QUEUED: 'bg-gray-500/20 text-gray-300',
  RUNNING: 'bg-blue-500/20 text-blue-400',
  SUCCEEDED: 'bg-green-500/20 text-green-400',
  FAILED: 'bg-red-500/20 text-red-400',
  CANCELLED: 'bg-zinc-500/20 text-zinc-400',
};

type LoadStatus = 'loading' | 'ready' | 'forbidden' | 'error';

const FILTERS = ['ALL', 'QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED'] as const;
type Filter = (typeof FILTERS)[number];

export default function MediaJobsPanel() {
  const [jobs, setJobs] = useState<MediaJobRow[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setStatus('loading');
    try {
      const res = await fetch('/api/admin/media/jobs?limit=100', { cache: 'no-store' });
      if (res.status === 401 || res.status === 403) {
        setStatus('forbidden');
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load jobs');
      setJobs(json.data ?? []);
      setStatus('ready');
      setLastUpdated(new Date());
    } catch {
      setStatus((prev) => (prev === 'ready' ? prev : 'error'));
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  // Poll so queued/running jobs stay fresh without manual refreshes.
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      void load();
    }, 10_000);
    return () => clearInterval(timer);
  }, [load]);

  const retryJob = async (job: MediaJobRow) => {
    setBusyId(job.id);
    try {
      const res = await fetch(`/api/admin/media/${job.id}/retry`, { method: 'POST' });
      if (res.ok) await load();
    } finally {
      setBusyId(null);
    }
  };

  if (status === 'loading') return <p className="text-muted">Loading media jobs…</p>;

  if (status === 'forbidden') {
    return (
      <div className="bg-card rounded-2xl p-8 border border-white/10 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-xl font-bold mb-2">Admin access required</h2>
        <p className="text-muted">Sign in with an administrator account to view media jobs.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-card rounded-2xl p-8 border border-white/10 text-center">
        <div className="text-4xl mb-3">📡</div>
        <h2 className="text-xl font-bold mb-2">Couldn&apos;t load jobs</h2>
        <button
          onClick={() => load(true)}
          className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  const visible = filter === 'ALL' ? jobs : jobs.filter((j) => j.status === filter);
  const counts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">⚙️ Media Jobs</h1>
          {lastUpdated && (
            <p className="text-sm text-muted mt-1">
              Updated {lastUpdated.toLocaleTimeString()} · auto-refreshing
            </p>
          )}
        </div>
        <button
          onClick={() => load()}
          className="px-5 py-2.5 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-primary to-orange-400 text-white'
                : 'bg-card border border-white/10 text-muted hover:bg-white/10 hover:text-foreground'
            }`}
          >
            {f}
            {f !== 'ALL' && counts[f] ? ` (${counts[f]})` : ''}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 border border-white/10 text-center">
          <div className="text-5xl mb-3">🗂️</div>
          <h2 className="text-xl font-bold mb-2">No jobs</h2>
          <p className="text-muted">
            Enqueued transcodes and replications will appear here as the worker processes them.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((job) => (
            <div
              key={job.id}
              className="bg-card rounded-2xl p-5 border border-white/10 flex flex-col lg:flex-row lg:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold">{job.movie?.title ?? job.movie?.id ?? 'Unknown movie'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/10 text-muted">
                    {job.jobType}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      STATUS_STYLES[job.status] ?? STATUS_STYLES.QUEUED
                    }`}
                  >
                    {job.status}
                  </span>
                  <span className="text-xs text-muted">attempt {job.attempts}</span>
                </div>

                <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, job.progress))}%` }}
                  />
                </div>

                {job.errorMessage && (
                  <p className="text-xs text-red-400 mt-2 break-words">{job.errorMessage}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  {new Date(job.createdAt).toLocaleString()}
                </p>
              </div>

              {(job.status === 'FAILED' || job.status === 'CANCELLED') && (
                <button
                  onClick={() => retryJob(job)}
                  disabled={busyId === job.id}
                  className="shrink-0 px-5 py-2.5 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-all disabled:opacity-60"
                >
                  {busyId === job.id ? 'Retrying…' : 'Retry'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
