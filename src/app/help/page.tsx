'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Download,
  Tv,
  HelpCircle,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Send,
  MessageCircle,
  Wifi,
  Settings,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<'all' | '4k' | 'download' | 'faq' | 'pwa'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is Agasobanuye cinema?',
      a: 'Agasobanuye is a beloved Rwandan film translation and commentary tradition where skilled narrators (Abasobanuzi) perform real-time voice translation, contextual cultural humor, and scene commentary over international films, bringing world cinema alive in vibrant Kinyarwanda.',
      category: 'General',
    },
    {
      q: 'How do I download movies for offline viewing?',
      a: 'Navigate to any movie page on FiestaFlix. Click the orange "Download" button to save directly to your device, or choose "Download via Telegram" for high-speed cloud file delivery directly inside the Telegram app without consuming browser cache.',
      category: 'Download',
    },
    {
      q: 'What internet speed do I need to stream in 4K Ultra HD?',
      a: 'A stable connection of at least 25 Mbps is recommended for smooth 4K Ultra HD playback with zero buffering. For 1080p Full HD, 10 Mbps is sufficient, and for 720p HD, 4 Mbps is recommended.',
      category: 'Streaming',
    },
    {
      q: 'Can I install FiestaFlix as a native app on my Android or iPhone?',
      a: 'Yes! FiestaFlix is a Progressive Web App (PWA). On Android/Chrome, tap the "Install on Phone" prompt. On iOS Safari, tap the Share icon and select "Add to Home Screen" to get full-screen app performance with offline capabilities.',
      category: 'App',
    },
    {
      q: 'Are the movie downloads free of ads and viruses?',
      a: 'Yes. All direct downloads and Telegram cloud links on FiestaFlix are 100% clean, ad-free direct video files (MP4/H.264 or MKV) hosted on high-speed content delivery networks.',
      category: 'Download',
    },
    {
      q: 'How do I request a movie or follow my favorite interpreter?',
      a: 'You can request any movie by visiting our Request Movie page (/request-movie) or chatting with our concierge bot on Telegram or WhatsApp. You can follow interpreters directly from their profile page to get real-time alerts when they drop new dubs.',
      category: 'General',
    },
    {
      q: 'Why does my 4K video occasionally drop quality?',
      a: 'FiestaFlix utilizes Adaptive Bitrate Streaming (HLS). If your network bandwidth fluctuates, the player dynamically drops quality to prevent freezing. You can manually lock the player to "4K (2160p)" in the player settings cog icon if you have fiber internet.',
      category: 'Streaming',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          {/* Hero Banner */}
          <div className="text-center py-10 sm:py-14 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" /> FiestaFlix Knowledge Base
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Help Center, FAQ & <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">4K Guide</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Find complete guides on streaming in 4K Ultra HD, downloading movies for offline trips, installing the app, and troubleshooting playback.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { id: 'all', label: 'All Topics' },
              { id: '4k', label: 'How to Stream in 4K', icon: Tv },
              { id: 'download', label: 'Download Help', icon: Download },
              { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle },
              { id: 'pwa', label: 'Install on Phone', icon: Smartphone },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* SECTION 1: HOW TO STREAM IN 4K ULTRA HD */}
          {(activeTab === 'all' || activeTab === '4k') && (
            <section id="4k" className="mb-14 rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-primary/20 text-primary border border-primary/30">
                  <Tv className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    How to Stream in 4K Ultra HD
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Get crisp 2160p resolution, HDR color depth, and crystal-clear narration.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-primary text-xs font-bold">
                    <Wifi className="w-4 h-4" /> 25+ Mbps Internet
                  </div>
                  <h4 className="text-sm font-bold text-white">High-Speed Connection</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Fiber optics (Canalbox, Liquid Telecom, MTN 5G) ensures uninterrupted 4K stream delivery without compression artifacts.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-primary text-xs font-bold">
                    <Settings className="w-4 h-4" /> Player Quality Lock
                  </div>
                  <h4 className="text-sm font-bold text-white">Manual 4K Selection</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Inside the FiestaFlix video player, click the gear/settings icon on the bottom bar and select <strong>2160p (4K UHD)</strong> instead of Auto.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-primary text-xs font-bold">
                    <Layers className="w-4 h-4" /> Compatible Display
                  </div>
                  <h4 className="text-sm font-bold text-white">Hardware Acceleration</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ensure hardware acceleration is enabled in Chrome or Edge settings for smooth 60fps rendering without CPU heating.
                  </p>
                </div>
              </div>

              {/* Step by Step instructions */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Step-by-Step 4K Streaming Setup
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-400">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                    <span>Open any movie tagged with the <strong>4K UHD</strong> badge on FiestaFlix.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                    <span>Click Play. Once loaded, click the <strong>Gear icon</strong> on the control bar.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                    <span>Switch from <em>Auto (Adaptive)</em> to <strong>2160p 4K</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                    <span>Enter Fullscreen for an immersive cinematic theater experience.</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 2: DOWNLOAD HELP DETAILS */}
          {(activeTab === 'all' || activeTab === 'download') && (
            <section id="download" className="mb-14 rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Download Help & Offline Viewing
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Two fast ways to save movies on your phone, laptop, or flash drive.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Method 1: Direct Browser Download */}
                <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Method 1</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">Browser Direct</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Direct CDN Download</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Click the <strong>Download</strong> button on the movie page. Your browser will immediately download the high-definition MP4 file with embedded Kinyarwanda narration.
                  </p>
                  <ul className="text-xs text-zinc-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Compatible with all media players (VLC, MX Player)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Can be transferred to USB drives for Smart TVs
                    </li>
                  </ul>
                </div>

                {/* Method 2: Telegram Cloud Download */}
                <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#229ED9]">Method 2</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#229ED9]/20 text-[#229ED9]">Unlimited Cloud</span>
                  </div>
                  <h3 className="text-base font-bold text-white">High-Speed Telegram Cloud</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Choose <strong>Download via Telegram</strong>. This routes you to our official Telegram channel where movies are stored permanently in the cloud.
                  </p>
                  <ul className="text-xs text-zinc-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Resumable downloads that never get cancelled by spotty networks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero phone storage consumed until you save the video
                    </li>
                  </ul>
                </div>
              </div>

              {/* Troubleshooting Note */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  <strong>Tip for iPhone users:</strong> Safari saves downloads to the <em>Files</em> app under <em>Downloads</em>. You can tap the downloaded file and select <em>Save Video</em> to move it directly to your Photos camera roll.
                </p>
              </div>
            </section>
          )}

          {/* SECTION 3: FREQUENTLY ASKED QUESTIONS */}
          {(activeTab === 'all' || activeTab === 'faq') && (
            <section id="faq" className="mb-14 rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Frequently Asked Questions (FAQ)
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Quick answers to common questions about accounts, movies, and interpreters.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={faq.q}
                      className="rounded-2xl bg-zinc-950/80 border border-zinc-800 overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="font-bold text-sm sm:text-base text-zinc-100">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-primary' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 4: INSTALL APP ON PHONE (PWA) */}
          {(activeTab === 'all' || activeTab === 'pwa') && (
            <section id="pwa" className="mb-14 rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    How to Install on Your Phone (Android & iOS)
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Enjoy FiestaFlix with no app store downloads, full-screen playback, and ultra-fast caching.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Android Chrome */}
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Android (Google Chrome)
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-400">
                    <li>Open <strong>fiesta-flims.vercel.app</strong> in Chrome.</li>
                    <li>Look for the floating <strong>"Install on Phone"</strong> prompt at the bottom of the screen.</li>
                    <li>Tap <strong>Install</strong> to add the icon to your app drawer and home screen.</li>
                  </ol>
                </div>

                {/* iPhone Safari */}
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> iPhone (Apple Safari)
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-400">
                    <li>Open <strong>fiesta-flims.vercel.app</strong> in Safari.</li>
                    <li>Tap the <strong>Share</strong> button (box with an arrow pointing up) on the bottom toolbar.</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                    <li>Tap <strong>Add</strong> in the top-right corner.</li>
                  </ol>
                </div>
              </div>
            </section>
          )}

          {/* CONTACT & DIRECT SUPPORT CARD */}
          <div className="rounded-3xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-primary/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-black text-white">Still need assistance?</h3>
              <p className="text-xs text-zinc-400 max-w-md">
                Our Rwandan support concierges are available 24/7 on WhatsApp and Telegram to solve playback, download, or movie request inquiries.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/250780000000"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Live Chat</span>
              </a>
              <a
                href="https://t.me/fiestaflix_movies"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-[#229ED9] hover:bg-[#229ED9]/90 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-sky-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Telegram Support</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
