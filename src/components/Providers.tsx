'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
