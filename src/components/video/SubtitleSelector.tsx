'use client';

import { useState } from 'react';
import { Subtitles, Check } from 'lucide-react';

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  url: string;
  isDefault?: boolean;
}

interface SubtitleSelectorProps {
  tracks: SubtitleTrack[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

export default function SubtitleSelector({ tracks, activeId, onSelect }: SubtitleSelectorProps) {
  const [open, setOpen] = useState(false);
  if (tracks.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Subtitles"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-white/90 hover:bg-white/10"
      >
        <Subtitles className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute bottom-10 right-0 z-30 w-40 overflow-hidden rounded-lg border border-white/10 bg-black/90 backdrop-blur">
          <button
            type="button"
            onMouseDown={() => onSelect(null)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs text-white hover:bg-white/10"
          >
            Off
            {activeId === null && <Check className="h-3 w-3" />}
          </button>
          {tracks.map((t) => (
            <button
              key={t.id}
              type="button"
              onMouseDown={() => onSelect(t.id)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs text-white hover:bg-white/10"
            >
              {t.label}
              {activeId === t.id && <Check className="h-3 w-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
