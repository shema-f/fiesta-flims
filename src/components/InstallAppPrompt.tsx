'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import AppLogo from '@/components/AppLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // Check if already in standalone/PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed recently (dismiss for 7 days)
    const dismissedUntil = localStorage.getItem('fiesta_pwa_dismissed_until');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Listen for Chrome/Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Reveal popup with a gentle delay
      setTimeout(() => setShowPrompt(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not standalone, show prompt after delay
    if (isAppleDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 3500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSTip(true);
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      setShowPrompt(false);
      window.location.href = '/help#pwa';
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 7 days
    localStorage.setItem('fiesta_pwa_dismissed_until', String(Date.now() + 7 * 86400000));
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-scaleUp">
      <div className="relative rounded-2xl bg-zinc-950/95 border border-primary/30 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl text-white overflow-hidden ring-1 ring-white/10">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Dismiss installation prompt"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          {/* Logo / App Icon */}
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0 shadow-lg shadow-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-192.png"
              alt="FiestaFlix App Icon"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Install FiestaFlix on Phone
              </h4>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                App
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Pin FiestaFlix with full app icon to your phone home screen for 4K streaming & offline downloads.
            </p>
          </div>
        </div>

        {/* Features bullet points */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Fast 4K Buffering</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Offline Downloads</span>
          </div>
        </div>

        {/* iOS Step-by-Step Guidance */}
        {showIOSTip && (
          <div className="mt-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-700 text-xs space-y-2 animate-fadeIn text-zinc-300">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-primary" /> How to install on iOS Safari:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px]">
              <li>
                Tap the <Share2 className="w-3 h-3 inline mx-1 text-sky-400" /> <strong>Share</strong> button at bottom of Safari.
              </li>
              <li>
                Scroll down and tap <PlusSquare className="w-3 h-3 inline mx-1 text-emerald-400" /> <strong>Add to Home Screen</strong>.
              </li>
              <li>Tap <strong>Add</strong> in the top-right corner.</li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-primary/25 hover:scale-[1.02] flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIOS ? 'Show iOS Instructions' : 'Install on Phone'}</span>
          </button>
          <button
            onClick={handleDismiss}
            className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold border border-zinc-800 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
