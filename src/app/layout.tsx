import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Fiesta Flix - Stream & Download Movies',
  description: 'Your ultimate destination for streaming and downloading movies in HD quality.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
