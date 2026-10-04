import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Copyright, Mail, AlertCircle, FileCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DMCA Notice & Copyright Policy · Fiesta Flix',
  description:
    'Review the Digital Millennium Copyright Act (DMCA) policy, notice requirements, and takedown procedures for Fiesta Flix.',
};

export default function DmcaNoticePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header Banner */}
          <div className="py-10 space-y-3 border-b border-zinc-800">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider">
              <Copyright className="w-3.5 h-3.5" /> Copyright Protection
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              DMCA Notice & Takedown Policy
            </h1>
            <p className="text-sm text-zinc-400">
              FiestaFlix respects the intellectual property rights of creators and rights-holders worldwide.
            </p>
          </div>

          <div className="py-8 space-y-10 text-sm leading-relaxed text-zinc-300">
            {/* Overview */}
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" /> Notice & Takedown Commitment
              </h3>
              <p>
                In accordance with the Digital Millennium Copyright Act (17 U.S.C. § 512) and applicable international copyright treaties, FiestaFlix responds promptly to valid copyright infringement notices submitted to our designated copyright agent.
              </p>
            </div>

            {/* Section 1: Designated Agent */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> 1. Designated Copyright Agent
              </h2>
              <p>
                Notifications of claimed copyright infringement must be sent in writing to our Designated Copyright Agent:
              </p>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <p><strong>FiestaFlix Copyright Compliance Dept.</strong></p>
                <p>Attn: Legal & Copyright Agent</p>
                <p>Email: <strong>dmca@fiestaflix.rw</strong> (with CC to: legal@fiestaflix.rw)</p>
                <p>Kigali, Rwanda</p>
                <p>Average response time: 24–48 business hours</p>
              </div>
            </section>

            {/* Section 2: What to Include in a Notice */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" /> 2. Required Information for DMCA Takedown
              </h2>
              <p>
                To expedite review of your notice, please ensure your written notification contains all of the following:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-zinc-400 text-xs sm:text-sm">
                <li>
                  A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
                </li>
                <li>
                  Identification of the copyrighted work claimed to have been infringed, or a representative list of such works.
                </li>
                <li>
                  Identification of the material claimed to be infringing and information reasonably sufficient to permit us to locate the material (exact FiestaFlix URL(s)).
                </li>
                <li>
                  Contact information reasonably sufficient to allow us to contact you (full legal name, physical address, telephone number, and email address).
                </li>
                <li>
                  A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
                </li>
                <li>
                  A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
                </li>
              </ul>
            </section>

            {/* Section 3: Counter-Notification */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> 3. Counter-Notification Procedure
              </h2>
              <p>
                If you believe your content was mistakenly removed or misidentified, you may send our Copyright Agent a formal counter-notification complying with 17 U.S.C. § 512(g)(3). Upon receiving a valid counter-notice, we will forward it to the original complaining party.
              </p>
            </section>

            {/* Section 4: Repeat Infringers */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">4. Repeat Infringer Policy</h2>
              <p>
                In accordance with the DMCA and other applicable law, FiestaFlix has adopted a policy of terminating, in appropriate circumstances, user accounts or creators who are deemed to be repeat infringers.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
