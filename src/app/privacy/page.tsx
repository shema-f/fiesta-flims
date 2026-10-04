import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, Eye, Database, Globe, UserCheck, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy · Fiesta Flix',
  description:
    'Learn how Fiesta Flix collects, uses, and protects your personal information and streaming preferences.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header Banner */}
          <div className="py-10 space-y-3 border-b border-zinc-800">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Legal & Trust Center
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Privacy Policy
            </h1>
            <p className="text-sm text-zinc-400">
              Last Updated: October 2026 • Effective Date: October 2026
            </p>
          </div>

          <div className="py-8 space-y-10 text-sm leading-relaxed text-zinc-300">
            {/* Summary highlight */}
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> Our Commitment to Your Privacy
              </h3>
              <p>
                At FiestaFlix, your privacy is paramount. We do not sell your personal data to data brokers or advertisers. We collect only what is necessary to authenticate your account, recommend Kinyarwanda cinema titles tailored to your taste, and maintain reliable video streaming across our global CDN.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" /> 1. Information We Collect
              </h2>
              <p>
                When you interact with the FiestaFlix streaming platform, we may collect the following categories of information:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400 text-xs sm:text-sm">
                <li>
                  <strong className="text-zinc-200">Account Credentials:</strong> Name, email address, password hash (salted using bcrypt), and profile avatar when you sign up.
                </li>
                <li>
                  <strong className="text-zinc-200">Viewing & Watchlist Preferences:</strong> Movies added to your favorites list, interpreters you follow, and playback timestamps for resume functionality.
                </li>
                <li>
                  <strong className="text-zinc-200">Device & Diagnostic Telemetry:</strong> Browser type, operating system, IP address (for geographical CDN routing), connection bitrate, and video player error logs to troubleshoot buffering issues.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" /> 2. How We Use Your Information
              </h2>
              <p>We use your information strictly for the following purposes:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400 text-xs sm:text-sm">
                <li>To provide seamless streaming, bookmarking, and offline download capabilities.</li>
                <li>To notify you about newly uploaded Agasobanuye movies translated by narrators you follow.</li>
                <li>To optimize adaptive video delivery (HLS bitrates) for your device and internet speed.</li>
                <li>To prevent fraud, account takeover, and unauthorized platform manipulation.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> 3. Cookies and Local Storage
              </h2>
              <p>
                FiestaFlix utilizes browser local storage and essential session cookies to preserve your login session, dark mode theme preferences, and video volume settings. We do not deploy cross-site tracking cookies from third-party advertising networks.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" /> 4. Your Rights and Data Control
              </h2>
              <p>
                You retain complete sovereignty over your data. At any time, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400 text-xs sm:text-sm">
                <li>Access, review, or update your personal account information.</li>
                <li>Clear your watch history and favorited movies from your profile.</li>
                <li>Request permanent account deletion and purging of all associated records.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> 5. Contacting Our Data Protection Team
              </h2>
              <p>
                If you have questions regarding this Privacy Policy or wish to exercise your data privacy rights under applicable Rwandan and international regulations, please contact us:
              </p>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <p><strong>FiestaFlix Legal & Privacy Office</strong></p>
                <p>Email: legal@fiestaflix.rw • privacy@fiestaflix.rw</p>
                <p>Kigali, Rwanda</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
