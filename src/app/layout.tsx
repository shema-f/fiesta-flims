import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Poppins } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import MobileBottomNav from '@/components/MobileBottomNav';
import FiestaBot from '@/components/FiestaBot';
import InstallAppPrompt from '@/components/InstallAppPrompt';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationJsonLd, webSiteJsonLd } from '@/components/seo/structuredData';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
} from '@/lib/seo';

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

const shareImage = `${SITE_URL}/icon-512.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  referrer: 'no-referrer',
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'agasobanuye',
    'filime agasobanuye',
    'filime zisobanuye mu Kinyarwanda',
    'reba filime mu Kinyarwanda',
    'Kinyarwanda dubbed movies',
    'Rwandan movies online',
    'filime za Rwanda',
    'umusobanuzi',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FiestaFlix',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'rw_RW',
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: shareImage,
        width: 512,
        height: 512,
        alt: 'Fiesta Flix — Filime zisobanuye mu Kinyarwanda',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [shareImage],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
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
    <html lang="rw">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ea580c" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FiestaFlix" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased bg-background text-foreground`}>
        {/* Google Analytics (gtag.js). Declared once in the root layout so it
            is present on every page, including ones reached by client-side
            navigation. The loader tag is emitted in the server HTML; the
            config runs as soon as the app hydrates. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3R25V151MV"
          strategy="afterInteractive"
        />
        <Script id="ga-gtag-config" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-3R25V151MV');`}
        </Script>

        {/* Site-wide structured data: who runs the site + sitelinks search box. */}
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
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
