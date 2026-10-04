'use client';

import { useCallback, useEffect, useState } from 'react';

interface ProviderRow {
  id: string;
  slug: string;
  name: string;
  type: string;
  enabled: boolean;
  priority: number;
  tiers: string[];
  purposes: string[];
  configured: boolean;
  healthStatus: string;
  latencyMs: number | null;
  successRate: number | null;
  failureCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
}

const HEALTH_STYLES: Record<string, string> = {
  HEALTHY: 'bg-green-500/20 text-green-400',
  DEGRADED: 'bg-yellow-500/20 text-yellow-400',
  DOWN: 'bg-red-500/20 text-red-400',
  UNKNOWN: 'bg-gray-500/20 text-gray-400',
};

type LoadStatus = 'loading' | 'ready' | 'forbidden' | 'error';

export default function StoragePanel() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/storage/providers', { cache: 'no-store' });
      if (res.status === 401 || res.status === 403) {
        setStatus('forbidden');
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load providers');
      setProviders(json.data ?? []);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleEnabled = async (provider: ProviderRow) => {
    setBusySlug(provider.slug);
    try {
      const res = await fetch('/api/admin/storage/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: provider.slug, enabled: !provider.enabled }),
      });
      if (res.ok) {
        setProviders((prev) =>
          prev.map((p) => (p.slug === provider.slug ? { ...p, enabled: !p.enabled } : p))
        );
      }
    } finally {
      setBusySlug(null);
    }
  };

  const testProvider = async (provider: ProviderRow) => {
    setBusySlug(provider.slug);
    try {
      const res = await fetch(`/api/admin/storage/${provider.slug}/test`, { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.success) {
        const health = json.data;
        setProviders((prev) =>
          prev.map((p) =>
            p.slug === provider.slug
              ? { ...p, healthStatus: health.status, latencyMs: health.latencyMs ?? null }
              : p
          )
        );
      }
    } finally {
      setBusySlug(null);
    }
  };

  const refreshHealth = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/admin/storage/health?refresh=true', { cache: 'no-store' });
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  if (status === 'loading') {
    return <p className="text-muted">Loading storage providers…</p>;
  }

  if (status === 'forbidden') {
    return (
      <div className="bg-card rounded-2xl p-8 border border-white/10 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-xl font-bold mb-2">Admin access required</h2>
        <p className="text-muted">Sign in with an administrator account to manage storage.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-card rounded-2xl p-8 border border-white/10 text-center">
        <div className="text-4xl mb-3">📡</div>
        <h2 className="text-xl font-bold mb-2">Couldn&apos;t load providers</h2>
        <button
          onClick={load}
          className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">🗄️ Storage Providers</h1>
        <button
          onClick={refreshHealth}
          disabled={refreshing}
          className="px-5 py-2.5 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all disabled:opacity-60"
        >
          {refreshing ? 'Checking…' : 'Run health checks'}
        </button>
      </div>

      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.slug}
            className="bg-card rounded-2xl p-5 border border-white/10 flex flex-col lg:flex-row lg:items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-bold text-lg">{provider.name}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    HEALTH_STYLES[provider.healthStatus] ?? HEALTH_STYLES.UNKNOWN
                  }`}
                >
                  {provider.healthStatus}
                </span>
                {!provider.configured && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-orange-500/20 text-orange-400">
                    Not configured
                  </span>
                )}
                <span className="text-xs text-muted">{provider.slug}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-xs text-muted">
                <span>Priority {provider.priority}</span>
                <span>Tiers: {provider.tiers.join(', ') || '—'}</span>
                <span>Purposes: {provider.purposes.join(', ') || '—'}</span>
                {provider.latencyMs !== null && <span>{provider.latencyMs} ms</span>}
                {provider.successRate !== null && (
                  <span>{Math.round((provider.successRate ?? 0) * 100)}% success</span>
                )}
                {provider.failureCount > 0 && <span>{provider.failureCount} failures</span>}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => testProvider(provider)}
                disabled={busySlug === provider.slug}
                className="px-4 py-2 rounded-lg bg-white/10 text-sm font-semibold hover:bg-white/20 transition-all disabled:opacity-60"
              >
                {busySlug === provider.slug ? 'Testing…' : 'Test'}
              </button>
              <button
                onClick={() => toggleEnabled(provider)}
                disabled={busySlug === provider.slug}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-60 ${
                  provider.enabled
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-white/10 text-muted hover:bg-white/20'
                }`}
              >
                {provider.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
