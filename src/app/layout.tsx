import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import MobileBottomNav from '@/components/MobileBottomNav';
import FiestaBot from '@/components/FiestaBot';
import InstallAppPrompt from '@/components/InstallAppPrompt';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

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
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FiestaFlix" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>
          {children}
          <MobileBottomNav />
          <FiestaBot />
          <InstallAppPrompt />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
