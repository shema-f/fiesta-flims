import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Sparkles, HeartHandshake, Flag, AlertOctagon, CheckCircle2, BookmarkCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Content Guidelines · Fiesta Flix',
  description:
    'Our curation standards, Agasobanuye narration ethics, age advisory ratings, and community safety guidelines.',
};

export default function ContentGuidelinesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header Banner */}
          <div className="py-10 space-y-3 border-b border-zinc-800">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Community Standards & Curation
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Content Guidelines
            </h1>
            <p className="text-sm text-zinc-400">
              Upholding cultural dignity, authentic Agasobanuye translation, and viewer safety across FiestaFlix.
            </p>
          </div>

          <div className="py-8 space-y-10 text-sm leading-relaxed text-zinc-300">
            {/* Overview */}
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> The Mission of Agasobanuye Curation
              </h3>
              <p>
                Agasobanuye is more than translation; it is a vibrant cultural bridge connecting global cinema with Rwandan audiences. These guidelines outline our standards for audio quality, linguistic accuracy, respectful cultural storytelling, and appropriate viewer labeling.
              </p>
            </div>

            {/* Section 1: Agasobanuye Translation Standards */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-primary" /> 1. Translation Quality & Interpreter Ethics
              </h2>
              <p>All featured films and Agasobanuye audio commentaries must meet the following criteria:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400 text-xs sm:text-sm">
                <li>
                  <strong className="text-zinc-200">Clear Audio Balance:</strong> Narrator vocals must be distinct, balanced cleanly against the original background audio and soundtrack.
                </li>
                <li>
                  <strong className="text-zinc-200">Narrator Attribution:</strong> The voice interpreter (Umusobanuzi) must be accurately named and credited on the title card and details page.
                </li>
                <li>
                  <strong className="text-zinc-200">Contextual Authenticity:</strong> Interpreters are encouraged to incorporate creative Rwandan metaphors, proverbs, and witty commentary while preserving the core narrative arc of the original film.
                </li>
              </ul>
            </section>

            {/* Section 2: Age Ratings & Advisories */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> 2. Age Advisory Classification
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    G / Family
                  </span>
                  <p className="text-zinc-300 font-semibold mt-1">General Audiences</p>
                  <p className="text-zinc-400 text-[11px]">Suitable for all ages, children, and wholesome family viewing.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="font-black px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    PG-13
                  </span>
                  <p className="text-zinc-300 font-semibold mt-1">Teen Guidance</p>
                  <p className="text-zinc-400 text-[11px]">Mild fantasy violence, mild language, or intense adventure themes.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    16+
                  </span>
                  <p className="text-zinc-300 font-semibold mt-1">Mature Audiences</p>
                  <p className="text-zinc-400 text-[11px]">Martial arts violence, crime action, war themes, or suspense thrillers.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    18+
                  </span>
                  <p className="text-zinc-300 font-semibold mt-1">Adults Only</p>
                  <p className="text-zinc-400 text-[11px]">Intense graphic horror, explicit language, or severe adult themes.</p>
                </div>
              </div>
            </section>

            {/* Section 3: Prohibited Content */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" /> 3. Strictly Prohibited Content
              </h2>
              <p>
                FiestaFlix enforces zero-tolerance policies against the following content across all movies, commentary tracks, and community comments:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400 text-xs sm:text-sm">
                <li>Hate speech, ethnic discrimination, divisionism, or incitement to real-world violence.</li>
                <li>Child sexual abuse material or exploitation of minors in any form.</li>
                <li>Uncensored non-consensual sexual content or extreme graphic cruelty.</li>
                <li>Defamation, harassment, or doxxing of real individuals in commentary tracks.</li>
              </ul>
            </section>

            {/* Section 4: Reporting Violations */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" /> 4. Reporting Content & Feedback
              </h2>
              <p>
                If you encounter any movie or commentary that violates these guidelines, or if an audio track contains inappropriate content not properly flagged, please report it immediately:
              </p>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <p><strong>FiestaFlix Safety & Moderation Council</strong></p>
                <p>Email: <strong>moderation@fiestaflix.rw</strong></p>
                <p>Or use the <strong>Talk to Us</strong> live chat on WhatsApp for rapid review within 2 hours.</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
