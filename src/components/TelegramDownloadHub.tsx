'use client';

import { useState } from 'react';
import { 
  Send, 
  Download, 
  Sparkles, 
  Check, 
  Copy, 
  HardDrive, 
  Zap, 
  ShieldCheck, 
  ExternalLink,
  Smartphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  generateTelegramDownloadOptions, 
  trackTelegramDownloadClick,
  type TelegramDownloadOption 
} from '@/services/telegramService';
import { motion, AnimatePresence } from 'motion/react';

interface TelegramDownloadHubProps {
  movieId: string | number;
  movieTitle: string;
  quality?: string;
  fileSize?: string;
  channelPostUrl?: string;
  botLink?: string;
}

export default function TelegramDownloadHub({
  movieId,
  movieTitle,
  quality,
  fileSize,
  channelPostUrl,
  botLink,
}: TelegramDownloadHubProps) {
  const options = generateTelegramDownloadOptions({
    movieId,
    movieTitle,
    quality,
    fileSize,
    channelPostUrl,
    botLink,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAllOptions, setShowAllOptions] = useState(false);

  const handleCopy = (option: TelegramDownloadOption) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(option.channelUrl);
      setCopiedId(option.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownloadClick = (option: TelegramDownloadOption) => {
    trackTelegramDownloadClick(movieId, option.quality);
  };

  const displayedOptions = showAllOptions ? options : options.slice(0, 3);

  return (
    <section className="my-8 rounded-3xl bg-gradient-to-br from-sky-950/60 via-zinc-900/90 to-zinc-950 border border-sky-500/40 p-5 sm:p-8 backdrop-blur-xl shadow-2xl shadow-sky-950/50 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#229ED9] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#229ED9]/40">
            <Send className="w-6 h-6 sm:w-7 sm:h-7 -rotate-12 translate-x-px" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Telegram Movie Downloads
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30">
                Direct Cloud
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1">
              Choose your preferred resolution for <strong className="text-white font-semibold">&ldquo;{movieTitle}&rdquo;</strong>.
              Fast background resume, zero waiting timers.
            </p>
          </div>
        </div>

        {/* Telegram Bot Direct Access */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <a
            href={options[1]?.botUrl || 'https://t.me/FiestaFlixBot'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold border border-zinc-700 transition-colors"
          >
            <Smartphone className="w-4 h-4 text-[#229ED9]" />
            <span>Open in Telegram Bot</span>
          </a>
        </div>
      </div>

      {/* Feature Highlights Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-4 border-b border-zinc-800/80 text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Max Download Speed</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Verified Safe & No Ads</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-300">
          <HardDrive className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Multiple Resolutions</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-300">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span>Auto-Resume on Pause</span>
        </div>
      </div>

      {/* Multi-Quality Download Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-6">
        {displayedOptions.map((option) => {
          const isCopied = copiedId === option.id;

          return (
            <motion.div
              key={option.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-2xl p-4 flex flex-col justify-between border transition-all ${
                option.isRecommended
                  ? 'bg-zinc-900/90 border-sky-400/60 shadow-lg shadow-sky-500/10'
                  : 'bg-zinc-900/60 border-zinc-800/90 hover:border-zinc-700'
              }`}
            >
              {option.isRecommended && (
                <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-[#229ED9] to-primary text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                  Most Popular
                </span>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-white">
                    {option.quality}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md">
                    {option.resolution}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-semibold text-white">{option.fileSize}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">Kinyarwanda Audio</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <a
                  href={option.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleDownloadClick(option)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md ${
                    option.isRecommended
                      ? 'bg-[#229ED9] hover:bg-[#1E8BC0] text-white shadow-[#229ED9]/30 hover:scale-[1.02]'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Download in Telegram</span>
                </a>

                <div className="flex items-center gap-2">
                  <a
                    href={option.botUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-medium text-center border border-zinc-700/50 transition-colors"
                  >
                    Bot Link
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(option)}
                    className="py-1.5 px-3 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-medium border border-zinc-700/50 flex items-center gap-1 transition-colors"
                    title="Copy direct Telegram link"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show more resolutions toggle */}
      {options.length > 3 && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setShowAllOptions(!showAllOptions)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <span>{showAllOptions ? 'Show Less Resolutions' : 'Show All Resolutions (4K & 480p)'}</span>
            {showAllOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </section>
  );
}
