'use client';

import { Maximize, Minimize, PictureInPicture2 } from 'lucide-react';

interface FullscreenControlsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  pipSupported: boolean;
  onTogglePip: () => void;
}

export default function FullscreenControls({
  isFullscreen,
  onToggleFullscreen,
  pipSupported,
  onTogglePip,
}: FullscreenControlsProps) {
  return (
    <div className="flex items-center gap-1">
      {pipSupported && (
        <button
          type="button"
          aria-label="Picture in picture"
          onClick={onTogglePip}
          className="rounded-md p-1.5 text-white/90 hover:bg-white/10"
        >
          <PictureInPicture2 className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        onClick={onToggleFullscreen}
        className="rounded-md p-1.5 text-white/90 hover:bg-white/10"
      >
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </button>
    </div>
  );
}
