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
    role: 'ADMIN' | 'FAN';
  }
}
