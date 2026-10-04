import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText, ShieldAlert, CheckCircle, Scale, AlertTriangle, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service · Fiesta Flix',
  description:
    'Review the terms, rules, and conditions governing the use of Fiesta Flix streaming and media services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header Banner */}
          <div className="py-10 space-y-3 border-b border-zinc-800">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" /> Legal Terms & Conditions
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Terms of Service
            </h1>
            <p className="text-sm text-zinc-400">
              Last Updated: October 2026 • Please read these terms carefully before using FiestaFlix.
            </p>
          </div>

          <div className="py-8 space-y-10 text-sm leading-relaxed text-zinc-300">
            {/* Section 1: Acceptance */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" /> 1. Acceptance of Terms
              </h2>
              <p>
                By accessing, browsing, or creating an account on FiestaFlix (accessible via web and mobile application), you agree to be bound by these Terms of Service, our Privacy Policy, and our Content Guidelines. If you do not agree to these terms, you must not use our service.
              </p>
            </section>

            {/* Section 2: User Accounts */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> 2. User Accounts and Security
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your login credentials and for all activities conducted through your account. You agree to notify us immediately of any unauthorized use or security compromise. FiestaFlix reserves the right to terminate or suspend accounts that engage in fraudulent behavior or violate community safety standards.
              </p>
            </section>

            {/* Section 3: Permitted Use & Streaming License */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" /> 3. Permitted Personal Use License
              </h2>
              <p>
                FiestaFlix grants you a limited, non-exclusive, non-transferable, revocable license to stream and download video content for personal, non-commercial entertainment purposes only. You may not:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400 text-xs sm:text-sm">
                <li>Sell, sublicense, rent, or publicly broadcast any media downloaded from the platform without explicit commercial licensing.</li>
                <li>Decompile, disassemble, or reverse-engineer any proprietary video delivery mechanisms, players, or API endpoints.</li>
                <li>Employ automated bots, scrapers, or mass downloaders that impair platform server performance or degrade other users' streaming quality.</li>
              </ul>
            </section>

            {/* Section 4: Agasobanuye Curation & Cultural Attribution */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" /> 4. Agasobanuye Translation Heritage
              </h2>
              <p>
                FiestaFlix celebrates the distinctive Rwandan art of <em>Agasobanuye</em>. The voice dubbing, commentary, and cultural translation provided by featured Abasobanuzi (including Rocky Kimomo, Junior Giti, Sankara, and rising interpreters) reflect independent linguistic and performance interpretations. All voice artists are credited respectfully on their respective creator profile pages.
              </p>
            </section>

            {/* Section 5: Disclaimers & Limitation of Liability */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" /> 5. Warranty Disclaimers
              </h2>
              <p>
                FiestaFlix is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for 99.9% uptime, seamless 4K CDN delivery, and rapid response times, we do not warrant that video streaming will be error-free or uninterrupted during unexpected ISP outages, severe weather disruptions, or upstream cloud provider maintenance.
              </p>
            </section>

            {/* Section 6: Governing Law */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">6. Governing Law and Jurisdiction</h2>
              <p>
                These Terms of Service are governed by and construed in accordance with the substantive laws of the Republic of Rwanda. Any legal actions or proceedings arising from these terms shall be subject to the exclusive jurisdiction of the competent courts in Kigali, Rwanda.
              </p>
            </section>

            {/* Questions Banner */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
              For questions regarding these Terms of Service, please contact <strong className="text-white">legal@fiestaflix.rw</strong> or visit our <Link href="/help" className="text-primary hover:underline font-semibold">Help Center</Link>.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
