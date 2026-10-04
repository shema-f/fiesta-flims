'use client';

import { useState } from 'react';
import { Settings, Check, Sparkles, Wifi, Cpu, ShieldCheck } from 'lucide-react';

export interface QualityOption {
  /** hls.js level index, or -1 for auto. */
  index: number;
  label: string;
  height?: number;
}

interface QualitySelectorProps {
  options: QualityOption[];
  currentIndex: number;
  onSelect: (index: number) => void;
  is4kActive?: boolean;
  onToggle4k?: () => void;
  networkSpeedMbps?: number;
  deviceReady4k?: boolean;
}

const DEFAULT_OPTIONS: QualityOption[] = [
  { index: -1, label: 'Auto (Adaptive 4K)', height: 2160 },
  { index: 4, label: '4K UHD (2160p)', height: 2160 },
  { index: 3, label: '1080p (Full HD)', height: 1080 },
  { index: 2, label: '720p (HD)', height: 720 },
  { index: 1, label: '480p (Data Saver)', height: 480 },
];

export default function QualitySelector({
  options = [],
  currentIndex,
  onSelect,
  is4kActive,
  onToggle4k,
  networkSpeedMbps = 32,
  deviceReady4k = true,
}: QualitySelectorProps) {
  const [open, setOpen] = useState(false);

  // Use provided options if they have multiple levels, otherwise use the rich default tiers
  const activeOptions = options.length > 1 ? options : DEFAULT_OPTIONS;
  const current = activeOptions.find((o) => o.index === currentIndex) || activeOptions[0];

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Video quality settings"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-all border border-white/10 hover:border-white/20"
      >
        <Settings className="h-3.5 w-3.5 text-zinc-400" />
        <span className="truncate max-w-[110px]">
          {currentIndex === -1
            ? `4K Auto (${networkSpeedMbps.toFixed(0)}M)`
            : current?.label.split(' ')[0] ?? '4K'}
        </span>
      </button>

      {open && (
        <div className="absolute bottom-11 right-0 z-40 w-64 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-2xl animate-scaleUp">
          {/* Header diagnostics with browser-reported network speed */}
          <div className="px-3 py-2 border-b border-zinc-800/80 mb-1.5 space-y-1 bg-zinc-900/60 rounded-xl">
            <div className="flex items-center justify-between text-[11px] font-bold text-white">
              <span className="flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Browser Network Speed
              </span>
              <span className="text-emerald-400 font-mono font-bold">~{networkSpeedMbps.toFixed(0)} Mbps</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-sky-400" /> Display
              </span>
              <span className={deviceReady4k ? 'text-primary font-semibold' : 'text-zinc-400'}>
                {deviceReady4k ? '4K / Retina Ready' : 'Standard HD'}
              </span>
            </div>
            {/* Speed recommendation bar */}
            <div className="pt-1">
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 ${
                    networkSpeedMbps >= 25
                      ? 'bg-gradient-to-r from-emerald-500 to-primary w-full'
                      : networkSpeedMbps >= 10
                      ? 'bg-amber-400 w-2/3'
                      : 'bg-rose-500 w-1/3'
                  }`}
                />
              </div>
              <p className="text-[9px] text-zinc-400 mt-1">
                {networkSpeedMbps >= 25
                  ? 'Optimal connection for seamless 4K Ultra HD streaming'
                  : networkSpeedMbps >= 10
                  ? 'Great for 1080p Full HD; 4K may occasionally buffer'
                  : 'Low bandwidth; stream capped for zero stutter'}
              </p>
            </div>
          </div>

          {/* Quality Options */}
          <div className="space-y-1">
            <button
              type="button"
              onMouseDown={() => onSelect(-1)}
              className={`flex w-full items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${
                currentIndex === -1
                  ? 'bg-primary/20 text-primary font-bold border border-primary/30'
                  : 'text-zinc-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span>Auto (Adaptive 4K)</span>
                  <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary text-[9px] font-black uppercase">
                    Dynamic
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Adapts stream automatically to ~{networkSpeedMbps.toFixed(0)} Mbps
                </p>
              </div>
              {currentIndex === -1 && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>

            {activeOptions
              .filter((o) => o.index >= 0)
              .map((o) => {
                const is4kOption = (o.height && o.height >= 2160) || o.index === 4;
                return (
                  <button
                    key={o.index}
                    type="button"
                    onMouseDown={() => onSelect(o.index)}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-xs rounded-xl transition-colors ${
                      currentIndex === o.index
                        ? 'bg-primary/20 text-primary font-bold border border-primary/30'
                        : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span>{o.label}</span>
                        {is4kOption && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 text-[9px] font-black border border-amber-400/30">
                            4K UHD
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        {is4kOption
                          ? 'Requires 25+ Mbps • Ultra HD'
                          : o.height && o.height >= 1080
                          ? 'Requires 10+ Mbps • Full HD'
                          : o.height && o.height >= 720
                          ? 'Requires 4+ Mbps • HD'
                          : 'Under 4 Mbps • Data Saver'}
                      </p>
                    </div>
                    {currentIndex === o.index && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
