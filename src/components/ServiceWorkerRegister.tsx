'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function ServiceWorkerRegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBackOnlineToast, setShowBackOnlineToast] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('[SW] New version available.');
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn('[SW] Registration failed:', error);
          });
      });
    }

    // 2. Connectivity Listeners
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => {
        setIsOffline(false);
        setShowBackOnlineToast(true);
        setTimeout(() => setShowBackOnlineToast(false), 3500);
      };

      const handleOffline = () => {
        setIsOffline(true);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <>
      {/* Offline Toast */}
      {isOffline && (
        <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600/95 border border-amber-400/40 px-4 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-fadeIn">
          <WifiOff className="h-4 w-4 shrink-0 text-amber-200 animate-pulse" />
          <span>Offline Mode — Cached movie metadata &amp; cinema details active.</span>
        </div>
      )}

      {/* Back Online Toast */}
      {showBackOnlineToast && (
        <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-emerald-600/95 border border-emerald-400/40 px-4 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-fadeIn">
          <Wifi className="h-4 w-4 shrink-0 text-emerald-200" />
          <span>Connected — Online streaming and live updates restored.</span>
        </div>
      )}
    </>
  );
}
