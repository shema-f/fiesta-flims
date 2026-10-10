'use client';

import { useState } from 'react';
import { 
  Play, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck,
  Film
} from 'lucide-react';
import { extractYouTubeId } from '@/components/video/FiestaVideoPlayer';

interface YouTubeDownloadHubProps {
  movieTitle: string;
  youtubeUrl: string;
  isRwandanCinema?: boolean;
}

export default function YouTubeDownloadHub({
  movieTitle,
  youtubeUrl,
  isRwandanCinema = false,
}: YouTubeDownloadHubProps) {
  const [copied, setCopied] = useState(false);
  const ytId = extractYouTubeId(youtubeUrl);
  if (!ytId && !youtubeUrl.includes('youtube') && !youtubeUrl.includes('youtu.be')) {
    return null;
  }

  const cleanYtUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : youtubeUrl;
  const cobaltDownloadUrl = `https://cobalt.tools`;
  const y2mateUrl = ytId ? `https://en.y2mate.is/watch?v=${ytId}` : `https://en.y2mate.is`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cleanYtUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="my-6 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-red-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-0" />
      {isRwandanCinema && (
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-0" />
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider">
              <Play className="w-4 h-4 fill-red-500 text-white" />
              <span>YouTube Video Stream</span>
            </span>
            {isRwandanCinema && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider">
                🇷🇼 Rwandan Cinema
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Stream & Download {movieTitle}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
            Uploaded by Fiesta Flix Admin for high-definition streaming. You can play directly inside our player or download to your device using the YouTube download tools below.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-zinc-900/80 px-4 py-2 rounded-2xl border border-zinc-800 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Full HD 1080p Support</span>
        </div>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Fast YouTube Downloader Button (Cobalt) */}
        <a
          href={cobaltDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-red-500/30 hover:border-red-500/60 transition-all group/btn flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-red-400 group-hover/btn:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-1">
                <span>Fast 1080p Downloader</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-[11px] text-zinc-400">Save MP4 video with zero ads</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-zinc-500 group-hover/btn:text-white transition-colors" />
        </a>

        {/* Alternate Downloader (Y2Mate) */}
        <a
          href={y2mateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 transition-all group/btn flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              <Film className="w-5 h-5 text-primary group-hover/btn:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Direct MP4 Converter</div>
              <div className="text-[11px] text-zinc-400">Convert to 1080p or MP3 Audio</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-zinc-500 group-hover/btn:text-white transition-colors" />
        </a>

        {/* Copy Link Button */}
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
                {copied ? 'Link Copied!' : 'Copy Video URL'}
              </div>
              <div className="text-[11px] text-zinc-400 truncate max-w-[170px]">
                {cleanYtUrl}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-primary uppercase">
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
      </div>
    </div>
  );
}
