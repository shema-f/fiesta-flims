'use client';

import { Loader2 } from 'lucide-react';

interface BufferIndicatorProps {
  buffering: boolean;
  /** 0–1 fraction of the current buffer vs. duration. */
  bufferedFraction?: number;
}

/** Non-blocking buffering feedback (spec §12). */
export default function BufferIndicator({ buffering, bufferedFraction = 0 }: BufferIndicatorProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
      <div className="h-0.5 w-full bg-white/10">
        <div
          className="h-full bg-fuchsia-500 transition-[width] duration-300"
          style={{ width: `${Math.max(0, Math.min(1, bufferedFraction)) * 100}%` }}
        />
      </div>
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur">
            <Loader2 className="h-4 w-4 animate-spin" />
            Buffering…
          </div>
        </div>
      )}
    </div>
  );
}
