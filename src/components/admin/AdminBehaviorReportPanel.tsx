'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Download,
  Users,
  Heart,
  CheckCircle2,
  Smartphone,
  Lightbulb,
  BarChart3,
  PlayCircle,
} from 'lucide-react';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

interface Insight {
  tone: 'good' | 'warn' | 'info';
  title: string;
  detail: string;
  action: string;
}

interface BehaviorReport {
  window: { days: number; from: string; to: string };
  totals: {
    views14d: number;
    downloads14d: number;
    newUsers14d: number;
    favorites14d: number;
    watchSessions14d: number;
    trend7d: { views: number | null; downloads: number | null; newUsers: number | null };
    recent7d: { views: number; downloads: number; newUsers: number };
  };
  quality: {
    completionRate: number;
    avgWatchSeconds: number;
    downloadConversion: number;
    deviceBreakdown: { device: string; count: number }[];
    qualityBreakdown: { quality: string; count: number }[];
    mobileShare: number;
  };
  audience: {
    activeVisitors7d: number;
    activeUsers7d: number;
    returningUsers: number;
    anonymousViewShare: number;
  };
  daily: { day: string; views: number; downloads: number; users: number }[];
  topViewed: { id: string; title: string; genre: string; views: number }[];
  topDownloaded: { id: string; title: string; genre: string; downloads: number }[];
  topGenres: { genre: string; views: number }[];
  insights: Insight[];
}

const nf = new Intl.NumberFormat('en-US');

function TrendChip({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20">
        new
      </span>
    );
  }
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
        <Minus className="w-3 h-3" /> 0%
      </span>
    );
  }
  const up = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md border ${
        up
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
          : 'bg-rose-500/10 text-rose-300 border-rose-500/25'
      }`}
    >
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}
      {value}%
    </span>
  );
}

function StatCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  trend?: number | null;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 animate-fadeInUp hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-400 font-bold">{label}</span>
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl sm:text-3xl font-black text-white leading-none">{value}</span>
        {trend !== undefined && <TrendChip value={trend} />}
      </div>
      <p className="text-[11px] text-zinc-500 mt-1.5">{hint}</p>
    </div>
  );
}

function BreakdownBars({
  rows,
  color,
}: {
  rows: { label: string; count: number }[];
  color: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-zinc-300 font-semibold truncate pr-2">{r.label}</span>
            <span className="text-zinc-500 font-bold shrink-0">
              {nf.format(r.count)} · {Math.round((r.count / total) * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className={`h-full rounded-full ${color} transition-all duration-700`}
              style={{
                width: `${Math.max(3, (r.count / max) * 100)}%`,
                animation: 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
                animationDelay: `${i * 60}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminBehaviorReportPanel() {
  const [report, setReport] = useState<BehaviorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/behavior-report');
      const json = await res.json();
      if (json.success && json.data) {
        setReport(json.data);
      } else {
        setError(json.error || 'Report unavailable');
      }
    } catch {
      setError('Could not reach the behavior API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 animate-fadeIn">
        <RefreshCw className="w-7 h-7 text-primary animate-spin" />
        <p className="text-xs text-zinc-400 font-bold">
          Crunching 14 days of views, downloads and sessions…
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-sm text-rose-300 font-bold animate-fadeIn">
        {error || 'No report data.'}
        <button
          onClick={fetchReport}
          className="ml-3 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-black transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { totals, quality, audience, daily, topViewed, topDownloaded, topGenres, insights } =
    report;
  const maxViews = Math.max(1, ...daily.map((d) => d.views));
  const maxDownloads = Math.max(1, ...daily.map((d) => d.downloads));
  const topViewTotal = topViewed.reduce((s, t) => s + t.views, 0) || 1;
  const topDownloadTotal = topDownloaded.reduce((s, t) => s + t.downloads, 0) || 1;

  const toneStyles: Record<Insight['tone'], string> = {
    good: 'border-emerald-500/25 bg-emerald-500/[0.06]',
    warn: 'border-amber-500/30 bg-amber-500/[0.06]',
    info: 'border-sky-500/25 bg-sky-500/[0.06]',
  };
  const toneDot: Record<Insight['tone'], string> = {
    good: 'bg-emerald-400',
    warn: 'bg-amber-400',
    info: 'bg-sky-400',
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white">User Behavior Report</h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-primary/15 text-primary border border-primary/30">
              <Activity className="w-3 h-3" />
              {report.window.days} days
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {report.window.from} → {report.window.to} · First-party data from plays, downloads and
            sessions · GA tag {GA_MEASUREMENT_ID}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://analytics.google.com/analytics/web/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Google Analytics</span>
          </a>
          <button
            onClick={fetchReport}
            className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 flex items-center gap-2 transition-all shadow-lg shadow-primary/25"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          label="Plays (14d)"
          value={nf.format(totals.views14d)}
          hint={`${nf.format(totals.recent7d.views)} in the last 7 days`}
          trend={totals.trend7d.views}
          icon={Eye}
          accent="bg-primary/15 text-primary border border-primary/25"
        />
        <StatCard
          label="Downloads (14d)"
          value={nf.format(totals.downloads14d)}
          hint={`${quality.downloadConversion}% of plays convert`}
          trend={totals.trend7d.downloads}
          icon={Download}
          accent="bg-sky-500/15 text-sky-300 border border-sky-500/25"
        />
        <StatCard
          label="New Signups (14d)"
          value={nf.format(totals.newUsers14d)}
          hint={`${nf.format(totals.recent7d.newUsers)} joined in the last 7 days`}
          trend={totals.trend7d.newUsers}
          icon={Users}
          accent="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
        />
        <StatCard
          label="Completion Rate"
          value={`${quality.completionRate}%`}
          hint={`~${quality.avgWatchSeconds}s watched per play`}
          icon={CheckCircle2}
          accent="bg-violet-500/15 text-violet-300 border border-violet-500/25"
        />
        <StatCard
          label="Active Visitors (7d)"
          value={nf.format(audience.activeVisitors7d)}
          hint={`${audience.returningUsers} signed-in viewers returned`}
          icon={Activity}
          accent="bg-amber-500/15 text-amber-300 border border-amber-500/25"
        />
        <StatCard
          label="Favorites Added (14d)"
          value={nf.format(totals.favorites14d)}
          hint={`${totals.watchSessions14d} continue-watching sessions`}
          icon={Heart}
          accent="bg-rose-500/15 text-rose-300 border border-rose-500/25"
        />
      </div>

      {/* DAILY CHART + DEVICES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Daily Plays & Downloads
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Plays
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" /> Downloads
              </span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 sm:gap-2 h-44">
            {daily.map((d, i) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-1 group relative min-w-0"
                title={`${d.day}: ${d.views} plays, ${d.downloads} downloads, ${d.users} new users`}
              >
                <div className="w-full flex items-end justify-center gap-[2px] h-full">
                  <div
                    className="w-1/2 max-w-[10px] rounded-t bg-gradient-to-t from-primary/60 to-primary transition-all duration-700 group-hover:brightness-125"
                    style={{
                      height: `${Math.max(2, (d.views / maxViews) * 100)}%`,
                      animation: 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
                      animationDelay: `${i * 45}ms`,
                    }}
                  />
                  <div
                    className="w-1/2 max-w-[10px] rounded-t bg-sky-400/80 transition-all duration-700 group-hover:brightness-125"
                    style={{
                      height: `${Math.max(2, (d.downloads / maxDownloads) * 100)}%`,
                      animation: 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
                      animationDelay: `${i * 45 + 120}ms`,
                    }}
                  />
                </div>
                <span className="text-[8px] sm:text-[9px] text-zinc-600 font-bold truncate w-full text-center">
                  {d.day.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
          <h3 className="text-sm font-black text-white flex items-center gap-2 mb-1">
            <Smartphone className="w-4 h-4 text-sky-300" />
            Devices
          </h3>
          <p className="text-[11px] text-zinc-500 mb-4">
            {quality.mobileShare}% of plays come from phones.
          </p>
          {quality.deviceBreakdown.length === 0 ? (
            <p className="text-xs text-zinc-600">No plays recorded in this window yet.</p>
          ) : (
            <BreakdownBars
              rows={quality.deviceBreakdown.map((d) => ({ label: d.device, count: d.count }))}
              color="bg-gradient-to-r from-sky-500 to-cyan-400"
            />
          )}
        </div>
      </div>

      {/* TOP CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {[
          {
            title: 'Most Played',
            rows: topViewed.map((r) => ({ ...r, count: r.views })),
            total: topViewTotal,
            icon: PlayCircle,
          },
          {
            title: 'Most Downloaded',
            rows: topDownloaded.map((r) => ({ ...r, count: r.downloads })),
            total: topDownloadTotal,
            icon: Download,
          },
        ].map((section) => (
          <div
            key={section.title}
            className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80"
          >
            <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
              <section.icon className="w-4 h-4 text-primary" />
              {section.title}
            </h3>
            {section.rows.length === 0 ? (
              <p className="text-xs text-zinc-600">Nothing here yet — data appears as people watch.</p>
            ) : (
              <ol className="space-y-3">
                {section.rows.map((row, i) => {
                  const count = row.count;
                  return (
                    <li key={row.id} className="group">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-5 h-5 shrink-0 rounded-md flex items-center justify-center text-[10px] font-black ${
                            i < 3
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                              {row.title}
                            </span>
                            <span className="text-[10px] font-black text-zinc-500 shrink-0">
                              {nf.format(count)} · {Math.round((count / section.total) * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 mt-1 rounded-full bg-zinc-900 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-700"
                              style={{ width: `${Math.max(3, (count / section.total) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-zinc-600">{row.genre}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        ))}
      </div>

      {/* INSIGHTS — the actionable part of the report */}
      <div className="p-4 sm:p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
        <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
          <Lightbulb className="w-4 h-4 text-amber-300" />
          Improvement Insights
        </h3>
        <p className="text-xs text-zinc-500 mb-5">
          Derived from this window’s behavior — each card ends with the concrete next step.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((ins, i) => (
            <div
              key={ins.title}
              className={`p-4 rounded-xl border animate-fadeInUp ${toneStyles[ins.tone]}`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-start gap-2.5">
                <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${toneDot[ins.tone]}`} />
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-white leading-snug">{ins.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1">{ins.detail}</p>
                  <p className="text-xs text-zinc-200 mt-2 font-semibold flex items-start gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 shrink-0 mt-0.5">
                      Do
                    </span>
                    <span>{ins.action}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP GENRES + GA CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
          <h3 className="text-sm font-black text-white mb-4">What People Watch</h3>
          <div className="flex flex-wrap gap-2">
            {topGenres.map((g, i) => (
              <span
                key={g.genre}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:border-primary/40 hover:text-white transition-colors animate-fadeInUp"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span>{g.genre}</span>
                <span className="text-[10px] font-black text-primary">{nf.format(g.views)}</span>
              </span>
            ))}
            {topGenres.length === 0 && (
              <p className="text-xs text-zinc-600">No genre data in this window.</p>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-zinc-950/80 to-zinc-950/80 border border-primary/25">
          <h3 className="text-sm font-black text-white mb-1">Search terms & referrers live in GA</h3>
          <p className="text-xs text-zinc-400 mb-4">
            This report covers in-app behavior. Google Analytics ({GA_MEASUREMENT_ID}) holds search
            terms, traffic sources, countries and realtime visitors — check it for the full picture.
          </p>
          <a
            href="https://analytics.google.com/analytics/web/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open GA Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
