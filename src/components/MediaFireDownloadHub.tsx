'use client';

import { useState } from 'react';
import { 
  Flame, 
  Download, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';

interface MediaFireDownloadHubProps {
  movieTitle: string;
  mediafireUrl?: string | null;
  quality?: string;
  fileSize?: string;
  onPlayDirect?: (url: string) => void;
}

export default function MediaFireDownloadHub({
  movieTitle,
  mediafireUrl,
  quality = '1080p FHD',
  fileSize = '1.45 GB',
  onPlayDirect,
}: MediaFireDownloadHubProps) {
  const [copied, setCopied] = useState(false);
  const [directInput, setDirectInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  if (!mediafireUrl) return null;

  const handleCopy = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(mediafireUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-8 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-orange-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-orange-400" />
            <span>High-Speed Cloud Storage</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>MediaFire Download & Stream Hub</span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Download or stream &ldquo;{movieTitle}&rdquo; with uncapped bandwidth, resume support, and no registration required.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-right">
            <div className="text-[10px] text-zinc-500 font-bold uppercase">Quality & Size</div>
            <div className="text-xs font-bold text-zinc-200">
              {quality} • <span className="text-orange-400">{fileSize}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        {/* Step 1: Direct Download */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">1-Click Download</h4>
              <p className="text-[11px] text-zinc-400">Full speed direct file transfer</p>
            </div>
          </div>
          <a
            href={mediafireUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-950/40 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Open & Download</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>

        {/* Step 2: In-Browser Direct Stream */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 fill-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Stream in Browser</h4>
              <p className="text-[11px] text-zinc-400">Watch without saving whole file</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInput((p) => !p)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{showInput ? 'Hide Stream Input' : 'Stream with Direct MP4 Link'}</span>
          </button>
        </div>

        {/* Step 3: Copy Link */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Share / External Apps</h4>
              <p className="text-[11px] text-zinc-400">Play in VLC, MX Player, or IDM</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Copy MediaFire Link'}</span>
          </button>
        </div>
      </div>

      {/* Expandable In-Browser Stream Setup */}
      {showInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="relative z-10 mt-4 p-4 rounded-2xl bg-black/70 border border-orange-500/30 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>How to Stream Directly in Browser without Waiting</span>
            </span>
            <span className="text-[10px] text-zinc-500">2-Second Trick</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            1. Click <strong>&quot;Open & Download&quot;</strong> above to view your file on MediaFire.<br />
            2. <strong>Right-click</strong> the blue Download button and select <strong>&quot;Copy link address&quot;</strong> (it begins with <code>https://download...</code>).<br />
            3. Paste that direct link below to start streaming immediately in 1080p/4K:
          </p>
          <div className="flex gap-2 pt-1">
            <input
              type="url"
              value={directInput}
              onChange={(e) => setDirectInput(e.target.value)}
              placeholder="https://download...mediafire.com/file.mp4"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={() => {
                if (directInput.trim() && onPlayDirect) {
                  onPlayDirect(directInput.trim());
                }
              }}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors shrink-0"
            >
              Start Stream
            </button>
          </div>
        </motion.div>
      )}

      {/* Feature Badges Footer */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-zinc-800 text-[11px] text-zinc-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Virus & Malware Scanned</span>
          </span>
          <span className="flex items-center gap-1 text-zinc-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Uncapped Speed</span>
          </span>
        </div>
        <span>100% Free • No Subscription Needed</span>
      </div>
    </div>
  );
}
