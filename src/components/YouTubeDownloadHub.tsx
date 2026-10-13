'use client';

import { useState } from 'react';
import { 
  Play, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck,
  Film,
  Heart,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { extractYouTubeId, getYouTubeEmbedUrl } from '@/components/video/FiestaVideoPlayer';

interface YouTubeDownloadHubProps {
  movieTitle: string;
  youtubeUrl: string;
  isRwandanCinema?: boolean;
  creator?: string;
  channelName?: string;
  onPlay?: () => void;
}

export default function YouTubeDownloadHub({
  movieTitle,
  youtubeUrl,
  isRwandanCinema = false,
  creator,
  channelName,
  onPlay,
}: YouTubeDownloadHubProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const ytId = extractYouTubeId(youtubeUrl);
  const ytEmbed = getYouTubeEmbedUrl(youtubeUrl);

  if (!ytId && !ytEmbed && !youtubeUrl.includes('youtube') && !youtubeUrl.includes('youtu.be')) {
    return null;
  }

  const cleanYtUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : youtubeUrl;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(cleanYtUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInAppDownload = async () => {
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      // Abstracted in-app download trigger via /api/download
      const downloadEndpoint = `/api/download?url=${encodeURIComponent(cleanYtUrl)}&title=${encodeURIComponent(movieTitle)}`;
      
      const link = document.createElement('a');
      link.href = downloadEndpoint;
      link.download = `${movieTitle.replace(/[^a-zA-Z0-9_-]+/g, '_')}.mp4`;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch {
      // Graceful fallback
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  return (
    <div className="my-6 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
      {/* Ambient background glow tailored for Rwandan Cinema */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Header section with legal contribution badge */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>🇷🇼 Rwandan Cinema (Ku Buntu)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Embedded In-App Playback</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold">
              Original Sound • No Interpreter
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white pt-1">
            {movieTitle}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            {creator ? (
              <>
                Created by <strong className="text-white">{creator}</strong> ({channelName || 'Official Channel'}).{' '}
              </>
            ) : null}
            This Rwandan production is streamed directly inside Fiesta Flix using YouTube&apos;s official embedded player. 
            All views, watch time, and engagement go <span className="text-emerald-400 font-bold">100% directly to the Rwandan creators</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs font-bold text-zinc-300 bg-zinc-900/90 px-4 py-2.5 rounded-2xl border border-zinc-800 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Legal Creator Contribution</span>
        </div>
      </div>

      {/* Action buttons — completely in-app, zero external redirects */}
      <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* In-App Watch Button */}
        {onPlay && (
          <button
            type="button"
            onClick={onPlay}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-between text-left group/btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 fill-current group-hover/btn:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-sm font-black flex items-center gap-1.5">
                  <span>Play In-Website Stream</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div className="text-[11px] text-emerald-100/80">Embedded Full HD 1080p Player</div>
              </div>
            </div>
            <span className="text-xs uppercase font-extrabold bg-white/20 px-2 py-1 rounded-md">Watch</span>
          </button>
        )}

        {/* Abstracted In-App Download Button */}
        <button
          type="button"
          onClick={handleInAppDownload}
          disabled={downloading}
          className="p-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-emerald-500/30 hover:border-emerald-500/60 transition-all group/btn flex items-center justify-between shadow-lg text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              {downloading ? (
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              ) : downloadSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Download className="w-5 h-5 text-emerald-400 group-hover/btn:scale-110 transition-transform" />
              )}
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>{downloading ? 'Preparing Download…' : downloadSuccess ? 'Download Initiated!' : 'Download for Offline'}</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                {downloading ? 'Starting direct file download…' : 'Save full video directly to device'}
              </div>
            </div>
          </div>
          <span className="text-xs font-extrabold text-emerald-400 uppercase">
            {downloadSuccess ? 'Done' : 'Download'}
          </span>
        </button>

        {/* Copy Share Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="p-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between text-left shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              {copied ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5 text-zinc-300" />
              )}
            </div>
            <div>
              <div className="font-bold text-sm text-white">
                {copied ? 'Share Link Copied!' : 'Share Rwandan Cinema'}
              </div>
              <div className="text-[11px] text-zinc-400 truncate max-w-[170px]">
                Support & spread Rwandan film
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-primary uppercase">
            {copied ? 'Copied' : 'Share'}
          </span>
        </button>
      </div>

      {/* Creator contribution note */}
      <div className="relative z-10 mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-current animate-pulse" />
          <span>Promoting Rwandan Cinema &amp; Local Producers</span>
        </div>
        <div className="text-[11px] text-zinc-500">
          No third-party ads or redirects • Pure Rwandan talent
        </div>
      </div>
    </div>
  );
}
