'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Wifi, Flame, ExternalLink, Download, Play, AlertCircle, RefreshCw } from 'lucide-react';
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

export function extractYouTubeId(urlOrId: string | null | undefined): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const str = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
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
  const ytId = useMemo(() => extractYouTubeId(src), [src]);

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

  // Dynamic source override and MediaFire integration
  const [activeSrc, setActiveSrc] = useState(src);
  const [forceStreamAttempt, setForceStreamAttempt] = useState(false);
  const [directLinkInput, setDirectLinkInput] = useState('');
  const [showBufferingHelp, setShowBufferingHelp] = useState(false);
  const bufferingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActiveSrc(src);
    setForceStreamAttempt(false);
    setShowBufferingHelp(false);
    setError(null);
  }, [src]);

  const isMediaFirePage = useMemo(() => {
    return (
      typeof activeSrc === 'string' &&
      activeSrc.includes('mediafire.com') &&
      !activeSrc.includes('download') &&
      !forceStreamAttempt
    );
  }, [activeSrc, forceStreamAttempt]);

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

  const isHls = useMemo(() => (activeSrc || '').includes('.m3u8'), [activeSrc]);

  // --- Setup native / hls.js playback -------------------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSrc || isMediaFirePage) return;
    startupMeasured.current = false;
    resumeApplied.current = false;
    srcStartTime.current = Date.now();
    setError(null);

    let disposed = false;
    let hls: any = null;

    const setup = async () => {
      if (!isHls) {
        video.src = activeSrc;
        return;
      }

      const nativeHls = video.canPlayType('application/vnd.apple.mpegurl');
      if (nativeHls) {
        video.src = activeSrc;
        return;
      }

      const HlsMod = (await import('hls.js')).default;
      if (disposed) return;

      if (HlsMod.isSupported()) {
        hls = new HlsMod({ enableWorker: true, lowLatencyMode: false });
        hlsRef.current = hls;
        hls.attachMedia(video);
        hls.on(HlsMod.Events.MEDIA_ATTACHED, () => hls.loadSource(activeSrc));
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
        video.src = activeSrc;
      }
    };

    void setup();

    return () => {
      disposed = true;
      if (hls) hls.destroy();
      hlsRef.current = null;
    };
  }, [activeSrc, isHls, isMediaFirePage, onError]);

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
      if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
      bufferingTimerRef.current = setTimeout(() => {
        setShowBufferingHelp(true);
      }, 6000);
    };
    const onPlaying = () => {
      setBuffering(false);
      setShowBufferingHelp(false);
      if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
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
    const onVideoError = () => {
      setBuffering(false);
      setShowBufferingHelp(false);
      if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
      const mediaErr = video.error;
      let msg = 'Playback error: Unable to stream video file directly.';
      if (mediaErr?.code === 4) {
        msg = 'File format not supported for in-browser streaming or requires direct download.';
      } else if (mediaErr?.code === 2) {
        msg = 'Network error while buffering video stream.';
      }
      setError(msg);
      onError?.(msg);
    };

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('progress', onTime);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onVideoError);
    video.addEventListener('ratechange', onRate);
    video.addEventListener('volumechange', onVol);

    return () => {
      if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('progress', onTime);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onVideoError);
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

  if (ytId) {
    return (
      <div className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black ${className ?? ''}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title="Video Playback"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  if (isMediaFirePage) {
    return (
      <div
        ref={containerRef}
        className={`group relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-orange-500/30 p-6 flex flex-col justify-between ${className ?? ''}`}
      >
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt="Poster"
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm"
          />
        )}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-orange-400" />
            <span>MediaFire Cloud Video</span>
          </div>
          <span className="text-[11px] text-zinc-400 bg-black/60 px-2.5 py-1 rounded-lg border border-zinc-800">
            Full Speed Download & Stream
          </span>
        </div>

        <div className="relative z-10 max-w-lg space-y-2 text-center sm:text-left my-auto">
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
            <span>MediaFire Video Stream & Download</span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            This movie is hosted on MediaFire high-speed servers. You can open and stream it directly at maximum download speed, or enter the direct link below to play directly inside this player.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
            <a
              href={activeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-orange-950/50 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>⚡ Download / Stream on MediaFire</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <button
              type="button"
              onClick={() => setForceStreamAttempt(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Try In-Browser Stream</span>
            </button>
          </div>

          {/* Quick Direct Link Input */}
          <div className="pt-2 text-left">
            <details className="text-xs text-zinc-400 group/details">
              <summary className="cursor-pointer hover:text-white font-semibold text-[11px] text-orange-400 flex items-center gap-1">
                <span>Have a Direct MediaFire MP4 link? Paste it to play here</span>
              </summary>
              <div className="mt-2 p-3 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                <p className="text-[11px] text-zinc-400">
                  Tip: On your MediaFire page, right-click the blue &quot;Download&quot; button, choose &quot;Copy link address&quot; (starts with <code>https://download...</code>), and paste it here:
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={directLinkInput}
                    onChange={(e) => setDirectLinkInput(e.target.value)}
                    placeholder="https://download...mediafire.com/..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (directLinkInput.trim()) {
                        setActiveSrc(directLinkInput.trim());
                        setForceStreamAttempt(true);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                  >
                    Play
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-zinc-500 text-center sm:text-left flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Compatible with VLC, MX Player, and high-speed mobile browsers</span>
        </div>
      </div>
    );
  }

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
        crossOrigin={subtitles && subtitles.length > 0 ? 'anonymous' : undefined}
      >
        {subtitles.map((s) => (
          <track key={s.id} kind="subtitles" src={s.url} srcLang={s.language} label={s.label} />
        ))}
      </video>

      <BufferIndicator buffering={buffering} bufferedFraction={bufferedFraction} />

      {/* Persistent Buffering Helper */}
      {showBufferingHelp && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/95 border border-amber-500/50 text-white text-xs px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Stream buffering slowly?</span>
          {activeSrc.includes('mediafire.com') ? (
            <a
              href={activeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Open in MediaFire</span>
            </a>
          ) : (
            <a
              href={activeSrc}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-[11px] flex items-center gap-1 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </a>
          )}
        </div>
      )}

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
