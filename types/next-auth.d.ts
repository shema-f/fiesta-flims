import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'ADMIN' | 'FAN';
      image?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'FAN';
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** User database id, persisted on sign-in — see the jwt callback in src/lib/auth.ts. */
    id?: string;
    role: 'ADMIN' | 'FAN';
  }
}
