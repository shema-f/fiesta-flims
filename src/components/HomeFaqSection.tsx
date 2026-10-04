'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, Tv, Download, Smartphone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomeFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const homeFaqs = [
    {
      q: 'What is Agasobanuye and why is it special?',
      a: 'Agasobanuye is Rwanda’s celebrated film translation tradition. Skilled voice artists (Abasobanuzi) perform real-time Kinyarwanda translation, localized jokes, and narrative commentary over international cinema, turning every movie into an authentic cultural spectacle.',
    },
    {
      q: 'How do I stream movies in 4K Ultra HD?',
      a: 'FiestaFlix automatically detects your internet connection and device resolution to deliver the highest possible bitrate. You can also click the "4K" toggle or the Gear icon in the video player to manually switch between 2160p 4K UHD and Adaptive Auto quality.',
    },
    {
      q: 'How do direct downloads and Telegram cloud files work?',
      a: 'Every movie page has two fast download options: Direct Browser Download for saving high-definition MP4 files straight to your device, and Telegram Cloud Download for unlimited resumable downloads without eating up your browser storage.',
    },
    {
      q: 'Can I install FiestaFlix directly on my Android or iPhone?',
      a: 'Yes! FiestaFlix is a lightweight Progressive Web App (PWA). Android users can tap the "Install on Phone" popup, while iPhone users can tap Share in Safari and select "Add to Home Screen" to enjoy fullscreen playback with zero app store hassle.',
    },
    {
      q: 'How often are new movies and interpreter dubs added?',
      a: 'Our library is updated daily with the newest releases dubbed by Rocky Kimomo, Junior Giti, Sankara, Dylan, and rising voice artists. You can follow any interpreter to receive immediate alerts when their new films drop.',
    },
  ];

  return (
    <section className="container-tight py-12 border-t border-white/[0.06]">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Everything You Need to Know
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Learn how to stream in 4K, save movies for offline travel, and follow your favorite Rwandan voice interpreters.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {homeFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.q}
              className="rounded-2xl bg-zinc-950/70 border border-zinc-800/80 overflow-hidden transition-all hover:border-zinc-700"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 transition-colors"
                aria-expanded={isOpen}
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
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/help"
          className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-orange-400 transition-colors"
        >
          <span>Have more questions? Visit our complete 4K & Download Help Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
