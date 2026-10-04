/**
 * Shared authentication configuration and authorization helpers.
 * API routes import `getCurrentUser` / `requireAdmin` from here.
 */

import type { AuthOptions, Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user || !user.password) return null;
          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) return null;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          };
        } catch (err) {
          console.error('[Auth] Authorize error:', err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', newUser: '/signup', error: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = (token.role as 'ADMIN' | 'FAN') || 'FAN';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fiesta-flix-auth-secret-key-32-chars-long-minimum!',
};

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'FAN';
  image?: string | null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user) return null;
    return session.user as CurrentUser;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'ADMIN';
}
