'use client';

import { useState } from 'react';
import { AudioLines, Check } from 'lucide-react';

export interface AudioTrackOption {
  index: number;
  label: string;
  language?: string;
}

interface AudioSelectorProps {
  tracks: AudioTrackOption[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function AudioSelector({ tracks, activeIndex, onSelect }: AudioSelectorProps) {
  const [open, setOpen] = useState(false);
  if (tracks.length <= 1) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Audio track"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-white/90 hover:bg-white/10"
      >
        <AudioLines className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute bottom-10 right-0 z-30 w-40 overflow-hidden rounded-lg border border-white/10 bg-black/90 backdrop-blur">
          {tracks.map((t) => (
            <button
              key={t.index}
              type="button"
              onMouseDown={() => onSelect(t.index)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs text-white hover:bg-white/10"
            >
              {t.label}
              {activeIndex === t.index && <Check className="h-3 w-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
