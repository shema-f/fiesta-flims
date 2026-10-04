'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface PlaybackControlsProps {
  playing: boolean;
  currentTime: number;
  duration: number;
  /** Buffered position in seconds. */
  buffered: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSkip: (deltaSeconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onRateChange: (rate: number) => void;
  /** Quality / subtitle / audio / fullscreen controls. */
  children?: ReactNode;
}

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

export default function PlaybackControls({
  playing,
  currentTime,
  duration,
  buffered,
  volume,
  muted,
  playbackRate,
  onTogglePlay,
  onSeek,
  onSkip,
  onVolumeChange,
  onToggleMute,
  onRateChange,
  children,
}: PlaybackControlsProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const handleSeek = (clientX: number) => {
    const bar = barRef.current;
    if (!bar || duration <= 0) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-8">
      {/* Seek bar */}
      <div
        ref={barRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentTime)}
        tabIndex={0}
        onMouseDown={(e) => handleSeek(e.clientX)}
        className="group relative mb-2 h-1.5 w-full cursor-pointer rounded-full bg-white/20"
      >
        <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width: `${bufferedPct}%` }} />
        <div className="absolute inset-y-0 left-0 rounded-full bg-fuchsia-500" style={{ width: `${progress}%` }} />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 text-white">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Back 10 seconds"
            onClick={() => onSkip(-10)}
            className="rounded-md p-1.5 hover:bg-white/10"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={playing ? 'Pause' : 'Play'}
            onClick={onTogglePlay}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            type="button"
            aria-label="Forward 10 seconds"
            onClick={() => onSkip(10)}
            className="rounded-md p-1.5 hover:bg-white/10"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <div className="ml-1 flex items-center gap-1 group">
            <button
              type="button"
              aria-label={muted ? 'Unmute' : 'Mute'}
              onClick={onToggleMute}
              className="rounded-md p-1.5 hover:bg-white/10"
            >
              {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              aria-label="Volume"
              className="h-1 w-0 cursor-pointer accent-fuchsia-500 transition-all group-hover:w-16"
            />
          </div>

          <span className="ml-2 text-xs tabular-nums text-white/80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <select
            aria-label="Playback speed"
            value={playbackRate}
            onChange={(e) => onRateChange(Number(e.target.value))}
            className="rounded-md bg-transparent px-1 py-1 text-xs text-white/90 hover:bg-white/10 focus:outline-none"
          >
            {RATES.map((r) => (
              <option key={r} value={r} className="bg-black text-white">
                {r}×
              </option>
            ))}
          </select>
          {children}
        </div>
      </div>
    </div>
  );
}
