/**
 * Shared authentication configuration and authorization helpers.
 * API routes import `getCurrentUser` / `requireAdmin` from here.
 */

import type { AuthOptions, Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseIdToken } from '@/lib/firebaseVerify';

/**
 * Session signing secret.
 *
 * A missing secret must never fall back to a literal in source — anyone who
 * can read the repo could forge an admin session. If it is absent in
 * production we generate an ephemeral one instead: sessions stop working
 * (fail closed) and the site logs a clear error, but public pages stay up.
 */
function resolveSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[auth] NEXTAUTH_SECRET is missing or shorter than 32 chars. ' +
        'Sessions are disabled until it is set — set it in your environment.'
    );
    return randomBytes(32).toString('hex');
  }

  // Local development only.
  return 'fiesta-flix-local-development-secret-not-for-production';
}

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
            image: user.image ?? undefined,
          };
        } catch (err) {
          console.error('[Auth] Authorize error:', err);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: 'firebase',
      name: 'Firebase',
      credentials: { idToken: { label: 'ID Token', type: 'text' } },
      /**
       * Google sign-in, promoted to a real NextAuth session.
       *
       * The token is verified with Google before anything else happens, and
       * the role is read from OUR database — never inferred from the email
       * address, which anyone can choose.
       */
      async authorize(credentials) {
        const profile = await verifyFirebaseIdToken(credentials?.idToken);
        if (!profile?.email) return null;

        try {
          let user = await prisma.user.findUnique({ where: { email: profile.email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name || profile.email.split('@')[0] || 'Fiesta Fan',
                image: profile.photoUrl,
                // No password: this account can only authenticate via Firebase.
                password: null,
                role: 'FAN',
              },
            });
          } else if (profile.photoUrl && !user.image) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { image: profile.photoUrl },
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image ?? undefined,
          };
        } catch (err) {
          console.error('[Auth] Firebase authorize error:', err);
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
  secret: resolveSecret(),
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
