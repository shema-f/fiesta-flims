'use client';

import { useState } from 'react';
import { Settings, Check } from 'lucide-react';

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
}

export default function QualitySelector({ options, currentIndex, onSelect }: QualitySelectorProps) {
  const [open, setOpen] = useState(false);
  if (options.length <= 1) return null;

  const current = options.find((o) => o.index === currentIndex);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Video quality"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-white/90 hover:bg-white/10"
      >
        <Settings className="h-4 w-4" />
        {current?.label ?? 'Auto'}
      </button>
      {open && (
        <div className="absolute bottom-10 right-0 z-30 w-36 overflow-hidden rounded-lg border border-white/10 bg-black/90 backdrop-blur">
          <button
            type="button"
            onMouseDown={() => onSelect(-1)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs text-white hover:bg-white/10"
          >
            Auto
            {currentIndex === -1 && <Check className="h-3 w-3" />}
          </button>
          {options
            .filter((o) => o.index >= 0)
            .map((o) => (
              <button
                key={o.index}
                type="button"
                onMouseDown={() => onSelect(o.index)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs text-white hover:bg-white/10"
              >
                {o.label}
                {currentIndex === o.index && <Check className="h-3 w-3" />}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
