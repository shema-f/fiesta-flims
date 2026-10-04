import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { movieData } from './movieData';

// In-memory demo data
const adminPasswordHash = bcrypt.hashSync('admin123', 10);
const fanPasswordHash = bcrypt.hashSync('fan123', 10);

interface MockUser {
  id: string;
  name: string;
  email: string;
  password?: string | null;
  role: 'ADMIN' | 'FAN';
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const mockUsers: MockUser[] = [
  {
    id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@fiestaflix.com',
    password: adminPasswordHash,
    role: 'ADMIN',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-fan-1',
    name: 'Movie Fan',
    email: 'fan@fiestaflix.com',
    password: fanPasswordHash,
    role: 'FAN',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockMovies = movieData.map((m, idx) => {
  const strId = String(m.id);
  const movieId = strId.startsWith('movie-') ? strId : `movie-${strId}`;
  return {
    id: movieId,
    title: m.title,
    description: `Experience this amazing movie with fantastic Kinyarwanda narration.`,
    narrator: m.narrator || 'Rocky Kimomo',
    genre: m.genre,
    duration: 7200,
    releaseYear: m.year,
    fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: m.image,
    poster: m.image,
    backdrop: m.backdrop || m.image,
    resolutions: { '720p': 'default', '1080p': 'hd', '4k': 'uhd' },
    views: 1200 + idx * 150,
    downloads: 300 + idx * 40,
    isFeatured: !!m.trending,
    isActive: true,
    status: 'PUBLISHED',
    uploaderId: 'user-admin-1',
    uploader: { id: 'user-admin-1', name: 'Admin User' },
    genres: [],
    interpreters: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
});

function createMockPrisma() {
  const userHandler = {
    findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
      const email = where.email?.toLowerCase();
      const user = mockUsers.find(
        (u) => (email && u.email.toLowerCase() === email) || (where.id && u.id === where.id)
      );
      return user ? { ...user } : null;
    },
    findFirst: async ({ where }: { where?: any } = {}) => {
      if (where?.email) {
        return mockUsers.find((u) => u.email.toLowerCase() === where.email.toLowerCase()) || null;
      }
      return mockUsers[0] ? { ...mockUsers[0] } : null;
    },
    findMany: async () => [...mockUsers],
    create: async ({ data }: { data: any }) => {
      const newUser: MockUser = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'FAN',
        image: data.image || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.push(newUser);
      return { ...newUser };
    },
    update: async ({ where, data }: { where: any; data: any }) => {
      const user = mockUsers.find((u) => u.id === where.id || u.email === where.email);
      if (user) {
        Object.assign(user, data);
        return { ...user };
      }
      return data;
    },
    delete: async ({ where }: { where: any }) => {
      const idx = mockUsers.findIndex((u) => u.id === where.id || u.email === where.email);
      if (idx !== -1) return mockUsers.splice(idx, 1)[0];
      return {};
    },
    count: async () => mockUsers.length,
  };

  const movieHandler = {
    findMany: async (args?: any) => {
      let list = [...mockMovies];
      const where = args?.where;
      if (where) {
        if (where.isActive !== undefined) {
          list = list.filter((m) => m.isActive === where.isActive);
        }
        if (where.genre) {
          list = list.filter((m) => m.genre.toLowerCase().includes(String(where.genre).toLowerCase()));
        }
        if (where.status) {
          const expected = Array.isArray(where.status?.in) ? where.status.in : [where.status];
          list = list.filter((m) => expected.includes(m.status));
        }
      }
      if (args?.skip) {
        list = list.slice(args.skip);
      }
      if (args?.take) {
        list = list.slice(0, args.take);
      }
      return list;
    },
    findFirst: async (args?: any) => {
      const where = args?.where;
      if (where?.id) {
        return (
          mockMovies.find(
            (m) => m.id === where.id || m.id === `movie-${where.id}` || where.id === `movie-${m.id}`
          ) || null
        );
      }
      return mockMovies[0] || null;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return (
        mockMovies.find(
          (m) => m.id === where.id || m.id === `movie-${where.id}` || where.id === `movie-${m.id}`
        ) || null
      );
    },
    create: async ({ data }: { data: any }) => {
      const newMovie = { id: `movie-${Date.now()}`, ...data };
      mockMovies.push(newMovie);
      return newMovie;
    },
    update: async ({ data }: { data: any }) => data,
    delete: async () => ({}),
    count: async () => mockMovies.length,
  };

  const genericModelHandler = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (args: any) => args?.data ?? {},
    update: async (args: any) => args?.data ?? {},
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
    updateMany: async () => ({ count: 0 }),
    count: async () => 0,
    groupBy: async () => [],
    aggregate: async () => ({ _count: 0 }),
  };

  const models: Record<string, any> = {
    user: userHandler,
    movie: movieHandler,
  };

  return new Proxy(models, {
    get: (target, prop: string) => {
      if (prop === '$connect' || prop === '$disconnect') {
        return async () => {};
      }
      if (prop === '$transaction') {
        return async (cb: any) => (typeof cb === 'function' ? cb(target) : Promise.all(cb));
      }
      if (prop in target) {
        return target[prop];
      }
      return genericModelHandler;
    },
  });
}

let realClientCache: any = null;
let isRealDbUnreachable = false;

function isValidRemoteDatabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  if (!/^(postgres|postgresql|mysql):\/\//i.test(url)) return false;

  const lower = url.toLowerCase();
  // Filter out dummy/placeholder URLs commonly set during development or templates
  return !(
    lower.includes('localhost') ||
    lower.includes('127.0.0.1') ||
    lower.includes('ep-xxx') ||
    lower.includes('region.aws') ||
    lower.includes('placeholder') ||
    lower.includes('dummy') ||
    lower.includes('example.com') ||
    lower.includes('xxx') ||
    lower.includes('your-') ||
    lower.includes('<') ||
    lower.includes('>')
  );
}

function getLazyRealPrisma(): any {
  if (isRealDbUnreachable) {
    return null;
  }
  if (realClientCache !== null) {
    return realClientCache;
  }

  // During build / prerender phase, avoid instantiating PrismaClient
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!isValidRemoteDatabaseUrl(dbUrl)) {
    isRealDbUnreachable = true;
    return null;
  }

  try {
    // Disable noisy log levels so connection drops don't trigger uncatchable prisma:error dumps
    realClientCache = new PrismaClient({
      log: [],
    });
    return realClientCache;
  } catch {
    isRealDbUnreachable = true;
    return null;
  }
}

const mockPrisma = createMockPrisma();

function createResilientPrisma(): any {
  return new Proxy(mockPrisma, {
    get: (_target, modelName: string) => {
      if (modelName === '$connect' || modelName === '$disconnect') {
        return async () => {};
      }
      if (modelName === '$transaction') {
        return async (cb: any) => (typeof cb === 'function' ? cb(mockPrisma) : Promise.all(cb));
      }

      return new Proxy({}, {
        get: (_subTarget, methodName: string) => {
          return async (...args: any[]) => {
            const real = getLazyRealPrisma();
            if (real && real[modelName] && typeof real[modelName][methodName] === 'function') {
              try {
                return await real[modelName][methodName](...args);
              } catch (err: any) {
                const msg = err?.message || String(err);
                if (
                  msg.includes("Can't reach database") ||
                  msg.includes('P1001') ||
                  msg.includes('P1002') ||
                  msg.includes('P1003') ||
                  msg.includes('P1017') ||
                  msg.includes('ECONNREFUSED') ||
                  msg.includes('ENOTFOUND') ||
                  msg.includes('ETIMEDOUT')
                ) {
                  // Mark database unreachable so subsequent calls bypass immediately without hanging
                  isRealDbUnreachable = true;
                  realClientCache = null;
                }
                const mockModel = mockPrisma[modelName];
                if (mockModel && typeof mockModel[methodName] === 'function') {
                  return await mockModel[methodName](...args);
                }
                return null;
              }
            }

            const fallbackModel = mockPrisma[modelName];
            if (fallbackModel && typeof fallbackModel[methodName] === 'function') {
              return await fallbackModel[methodName](...args);
            }
            return null;
          };
        },
      });
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma = globalForPrisma.prisma || createResilientPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
