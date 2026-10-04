import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import MobileBottomNav from '@/components/MobileBottomNav';
import FiestaBot from '@/components/FiestaBot';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: {
    default: 'Fiesta Flix — Filime. Ijwi. Umuco.',
    template: '%s · Fiesta Flix',
  },
  description:
    'The home of Kinyarwanda cinema and Agasobanuye. Stream movies, follow interpreters, download offline, and discover Rwandan film.',
  openGraph: {
    title: 'Fiesta Flix — Filime. Ijwi. Umuco.',
    description:
      'The home of Kinyarwanda cinema and Agasobanuye. Stream, download and follow the voices behind the movies.',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
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
        </Providers>
      </body>
    </html>
  );
}
