import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import MobileBottomNav from '@/components/MobileBottomNav';
import FiestaBot from '@/components/FiestaBot';
import InstallAppPrompt from '@/components/InstallAppPrompt';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const viewport: Viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  referrer: 'no-referrer',
  title: {
    default: 'Fiesta Flix — Filime. Ijwi. Umuco.',
    template: '%s · Fiesta Flix',
  },
  description:
    'The home of Kinyarwanda cinema and Agasobanuye. Stream movies, follow interpreters, download offline, and discover Rwandan film.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FiestaFlix',
  },
  openGraph: {
    title: 'Fiesta Flix — Filime. Ijwi. Umuco.',
    description:
      'The home of Kinyarwanda cinema and Agasobanuye. Stream, download and follow the voices behind the movies.',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>
          {children}
          <MobileBottomNav />
          <FiestaBot />
          <InstallAppPrompt />
        </Providers>
      </body>
    </html>
  );
}
