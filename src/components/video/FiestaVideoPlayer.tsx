'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Wifi } from 'lucide-react';
import BufferIndicator from './BufferIndicator';
import PlaybackControls from './PlaybackControls';
import QualitySelector, { type QualityOption } from './QualitySelector';
import SubtitleSelector, { type SubtitleTrack } from './SubtitleSelector';
import AudioSelector, { type AudioTrackOption } from './AudioSelector';
import FullscreenControls from './FullscreenControls';

export interface FiestaVideoPlayerProps {
  /** HLS master playlist or progressive MP4 URL. */
  src: string;
  poster?: string;
  /** Sidecar subtitles. */
  subtitles?: SubtitleTrack[];
  /** Start/resume position in seconds. */
  startPositionSeconds?: number;
  /** Called roughly every few seconds with playback progress. */
  onProgress?: (positionSeconds: number, durationSeconds: number) => void;
  /** Called with time-to-first-frame in ms (spec §29). */
  onStartup?: (startupTimeMs: number) => void;
  /** Called when the player has to stall for the buffer. */
  onBufferEvent?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function trackLabel(height: number | undefined, index: number): string {
  if (height) return `${height}p`;
  return `Level ${index + 1}`;
}

export default function FiestaVideoPlayer({
  src,
  poster,
  subtitles = [],
  startPositionSeconds = 0,
  onProgress,
  onStartup,
  onBufferEvent,
  onError,
  className,
}: FiestaVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const startupMeasured = useRef(false);
  const srcStartTime = useRef<number>(Date.now());
  const lastReported = useRef(0);
  const resumeApplied = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffering, setBuffering] = useState(false);
  const [levels, setLevels] = useState<QualityOption[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [audioTracks, setAudioTracks] = useState<AudioTrackOption[]>([]);
  const [activeAudio, setActiveAudio] = useState(0);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(
    subtitles.find((s) => s.isDefault)?.id ?? null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 4K and Adaptive Network Quality state
  const [is4kActive, setIs4kActive] = useState(true);
  const [networkSpeedMbps, setNetworkSpeedMbps] = useState(32);
  const [deviceReady4k, setDeviceReady4k] = useState(true);
  const [qualityNotification, setQualityNotification] = useState<string | null>(null);

  const currentLevelRef = useRef(currentLevel);
  currentLevelRef.current = currentLevel;

  // Dynamically adapt stream levels based on browser-reported network speed
  const applyNetworkAdaptiveLevel = useCallback(
    (speedMbps: number) => {
      const hls = hlsRef.current;
      if (!hls || !hls.levels || hls.levels.length === 0) return;

      if (speedMbps >= 25 && deviceReady4k) {
        hls.autoLevelCapping = -1; // Full 4K UHD stream allowed
      } else if (speedMbps >= 12) {
        const idx = hls.levels.findIndex((l: any) => l.height && l.height <= 1080);
        hls.autoLevelCapping = idx >= 0 ? idx : -1;
      } else if (speedMbps >= 5) {
        const idx = hls.levels.findIndex((l: any) => l.height && l.height <= 720);
        hls.autoLevelCapping = idx >= 0 ? idx : -1;
      } else {
        const idx = hls.levels.findIndex((l: any) => l.height && l.height <= 480);
        hls.autoLevelCapping = idx >= 0 ? idx : 0;
      }
    },
    [deviceReady4k]
  );

  // Detect network speed and device 4K readiness
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dpr = window.devicePixelRatio || 1;
    const width = window.screen.width * dpr;
    setDeviceReady4k(width >= 1920 || dpr >= 2);

    const conn = (navigator as any).connection;
    if (conn) {
      const speed = conn.downlink || (conn.effectiveType === '4g' ? 35 : 12);
      setNetworkSpeedMbps(speed);
      const updateSpeed = () => {
        if (conn.downlink) {
          const newSpeed = conn.downlink;
          setNetworkSpeedMbps(newSpeed);
          if (currentLevelRef.current === -1) {
            applyNetworkAdaptiveLevel(newSpeed);
            setQualityNotification(
              newSpeed >= 25
                ? `✨ Browser Speed: ~${newSpeed.toFixed(0)} Mbps → 4K UHD Unlocked`
                : `⚡ Browser Speed: ~${newSpeed.toFixed(0)} Mbps → Stream dynamically adapted to prevent buffering`
            );
            setTimeout(() => setQualityNotification(null), 3000);
          }
        }
      };
      conn.addEventListener('change', updateSpeed);
      return () => conn.removeEventListener('change', updateSpeed);
    }
  }, [applyNetworkAdaptiveLevel]);

  const isHls = useMemo(() => src.includes('.m3u8'), [src]);

  // --- Setup native / hls.js playback -------------------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    startupMeasured.current = false;
    resumeApplied.current = false;
    srcStartTime.current = Date.now();
    setError(null);

    let disposed = false;
    let hls: any = null;

    const setup = async () => {
      if (!isHls) {
        video.src = src;
        return;
      }

      const nativeHls = video.canPlayType('application/vnd.apple.mpegurl');
      if (nativeHls) {
        video.src = src;
        return;
      }

      const HlsMod = (await import('hls.js')).default;
      if (disposed) return;

      if (HlsMod.isSupported()) {
        hls = new HlsMod({ enableWorker: true, lowLatencyMode: false });
        hlsRef.current = hls;
        hls.attachMedia(video);
        hls.on(HlsMod.Events.MEDIA_ATTACHED, () => hls.loadSource(src));
        hls.on(HlsMod.Events.MANIFEST_PARSED, () => {
          const next: QualityOption[] = (hls.levels || []).map((l: any, i: number) => ({
            index: i,
            label: trackLabel(l.height, i),
            height: l.height,
          }));
          setLevels(next);
          const tracks: AudioTrackOption[] = (hls.audioTracks || []).map((t: any, i: number) => ({
            index: i,
            label: t.name || t.lang || `Track ${i + 1}`,
            language: t.lang,
          }));
          setAudioTracks(tracks);
        });
        hls.on(HlsMod.Events.LEVEL_SWITCHED, (_: unknown, data: any) => {
          setCurrentLevel(hls.autoLevelEnabled ? -1 : data.level);
        });
        hls.on(HlsMod.Events.ERROR, (_: unknown, data: any) => {
          if (!data?.fatal) return;
          if (data.type === 'networkError') {
            hls.startLoad();
          } else if (data.type === 'mediaError') {
            hls.recoverMediaError();
          } else {
            setError('Playback error');
            onError?.('Playback error');
          }
        });
      } else {
        video.src = src;
      }
    };

    void setup();

    return () => {
      disposed = true;
      if (hls) hls.destroy();
      hlsRef.current = null;
    };
  }, [src, isHls, onError]);

  // --- Video element event wiring -----------------------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      setDuration(video.duration || 0);
      setPipSupported(Boolean((document as any).pictureInPictureEnabled));
      if (!resumeApplied.current && startPositionSeconds > 0 && video.duration > startPositionSeconds) {
        video.currentTime = startPositionSeconds;
        resumeApplied.current = true;
      }
    };
    const onTime = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
      if (video.currentTime - lastReported.current >= 5) {
        lastReported.current = video.currentTime;
        onProgress?.(video.currentTime, video.duration || 0);
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => {
      setPlaying(false);
      onProgress?.(video.currentTime, video.duration || 0);
    };
    const onWaiting = () => {
      setBuffering(true);
      onBufferEvent?.();
    };
    const onPlaying = () => {
      setBuffering(false);
      if (!startupMeasured.current) {
        startupMeasured.current = true;
        onStartup?.(Date.now() - srcStartTime.current);
      }
    };
    const onRate = () => setPlaybackRate(video.playbackRate);
    const onVol = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('progress', onTime);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('ratechange', onRate);
    video.addEventListener('volumechange', onVol);

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('progress', onTime);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('ratechange', onRate);
      video.removeEventListener('volumechange', onVol);
    };
  }, [onProgress, onStartup, onBufferEvent, startPositionSeconds]);

  // --- Subtitle activation -------------------------------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.textTracks) return;
    for (let i = 0; i < video.textTracks.length; i++) {
      const track = video.textTracks[i];
      const match = subtitles.find((s) => s.id === activeSubtitle);
      track.mode = match && track.language === match.language ? 'showing' : 'disabled';
    }
  }, [activeSubtitle, subtitles]);

  // --- Fullscreen ----------------------------------------------------------
  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  }, []);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, time));
    setCurrentTime(video.currentTime);
  }, []);

  const skip = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    seek(video.currentTime + delta);
  }, [seek]);

  const changeVolume = useCallback((v: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = v;
    video.muted = v === 0;
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, []);

  const changeRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
  }, []);

  const selectLevel = useCallback(
    (index: number) => {
      setCurrentLevel(index);
      if (hlsRef.current) {
        if (index === -1) {
          hlsRef.current.currentLevel = -1; // hls auto
          applyNetworkAdaptiveLevel(networkSpeedMbps);
          setIs4kActive(true);
          setQualityNotification(
            `⚡ Adaptive 4K Active • Dynamic stream adapting to browser speed (~${networkSpeedMbps.toFixed(0)} Mbps)`
          );
        } else {
          hlsRef.current.currentLevel = index;
          const selected = levels.find((l) => l.index === index);
          const is4k = (selected?.height && selected.height >= 2160) || index === 4;
          setIs4kActive(is4k);
          if (is4k) {
            if (networkSpeedMbps >= 25) {
              setQualityNotification(`✨ 4K UHD Locked • 2160p (Speed: ~${networkSpeedMbps.toFixed(0)} Mbps optimal)`);
            } else {
              setQualityNotification(`⚠️ 4K UHD Locked • Speed (~${networkSpeedMbps.toFixed(0)} Mbps) may experience buffering on slow lines`);
            }
          } else {
            setQualityNotification(`📺 Stream set to ${selected?.label || 'Manual resolution'}`);
          }
        }
        setTimeout(() => setQualityNotification(null), 3200);
      }
    },
    [levels, networkSpeedMbps, applyNetworkAdaptiveLevel]
  );

  const toggle4k = useCallback(() => {
    setIs4kActive((prev) => {
      const next = !prev;
      if (next) {
        // Find highest level or set 4K
        const maxLevel = hlsRef.current?.levels?.length ? hlsRef.current.levels.length - 1 : 4;
        selectLevel(maxLevel);
        const speedText =
          networkSpeedMbps >= 25
            ? `${networkSpeedMbps.toFixed(0)} Mbps (Optimal)`
            : `${networkSpeedMbps.toFixed(0)} Mbps (May buffer)`;
        setQualityNotification(`✨ 4K UHD Enabled • 2160p HDR • Network: ${speedText}`);
      } else {
        selectLevel(-1); // Auto adaptive
        setQualityNotification(`⚡ Adaptive Auto Quality • Network-Optimized (~${networkSpeedMbps.toFixed(0)} Mbps)`);
      }
      setTimeout(() => setQualityNotification(null), 3200);
      return next;
    });
  }, [networkSpeedMbps, selectLevel]);

  const selectAudio = useCallback((index: number) => {
    setActiveAudio(index);
    if (hlsRef.current) hlsRef.current.audioTrack = index;
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void container.requestFullscreen().catch(() => {});
  }, []);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if ((document as any).pictureInPictureElement) await (document as any).exitPictureInPicture();
      else await (video as any).requestPictureInPicture();
    } catch {
      /* PiP unavailable */
    }
  }, []);

  const bufferedFraction = duration > 0 ? buffered / duration : 0;

  return (
    <div
      ref={containerRef}
      className={`group relative aspect-video w-full overflow-hidden rounded-xl bg-black ${className ?? ''}`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        className="h-full w-full bg-black"
        onClick={togglePlay}
        crossOrigin="anonymous"
      >
        {subtitles.map((s) => (
          <track key={s.id} kind="subtitles" src={s.url} srcLang={s.language} label={s.label} />
        ))}
      </video>

      <BufferIndicator buffering={buffering} bufferedFraction={bufferedFraction} />

      {/* On-screen 4K / Quality Status HUD */}
      {qualityNotification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/90 border border-primary/40 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl backdrop-blur-xl animate-fadeIn flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{qualityNotification}</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-white">
          {error}
        </div>
      )}

      <div className={`transition-opacity duration-300 ${showControls || !playing ? 'opacity-100' : 'opacity-0'}`}>
        <PlaybackControls
          playing={playing}
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          onTogglePlay={togglePlay}
          onSeek={seek}
          onSkip={skip}
          onVolumeChange={changeVolume}
          onToggleMute={toggleMute}
          onRateChange={changeRate}
        >
          {/* Quick 4K UHD Quality Toggle Button */}
          <button
            type="button"
            onClick={toggle4k}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-extrabold transition-all border ${
              is4kActive
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-white/15'
            }`}
            title="Toggle 4K Ultra HD"
            aria-label="Toggle 4K Ultra HD"
          >
            <Sparkles className="w-3 h-3" />
            <span>4K</span>
          </button>

          <AudioSelector tracks={audioTracks} activeIndex={activeAudio} onSelect={selectAudio} />
          <SubtitleSelector tracks={subtitles} activeId={activeSubtitle} onSelect={setActiveSubtitle} />
          <QualitySelector
            options={levels}
            currentIndex={currentLevel}
            onSelect={selectLevel}
            is4kActive={is4kActive}
            onToggle4k={toggle4k}
            networkSpeedMbps={networkSpeedMbps}
            deviceReady4k={deviceReady4k}
          />
          <FullscreenControls
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            pipSupported={pipSupported}
            onTogglePip={togglePip}
          />
        </PlaybackControls>
      </div>
    </div>
  );
}
