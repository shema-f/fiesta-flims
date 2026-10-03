import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import MobileBottomNav from '@/components/MobileBottomNav';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Fiesta Flix - Stream & Download Movies',
  description: 'Stream and download movies with authentic Kinyarwanda narration.',
  openGraph: {
    title: 'Fiesta Flix - Stream & Download Movies',
    description: 'Stream and download movies with authentic Kinyarwanda narration.',
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
        </Providers>
      </body>
    </html>
  );
}
