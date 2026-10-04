/**
 * Interpreter (Umusobanuzi) directory.
 *
 * In Agasobanuye, the narrator is part of the brand — audiences follow a voice,
 * not just a title. This module turns the raw name list into structured,
 * deterministic profiles so the UI can build real "creator" pages without
 * depending on a live database (the Interpreter table in Postgres is the
 * long-term source of truth; this is the seed layer).
 *
 * Values are derived deterministically (no Math.random) so server and client
 * render identically and there are no hydration mismatches.
 */

export interface Interpreter {
  id: number;
  slug: string;
  name: string;
  bio: string;
  /** 0–5, one decimal. */
  rating: number;
  moviesCount: number;
  followers: number;
  image: string;
  tags: string[];
  featured: boolean;
  official: boolean;
  specialties: string[];
  languages: string[];
  joinedYear: number;
  city: string;
}

const NAMES = [
  'Rocky', 'Junior Giti', 'Yanga', 'Sankara', 'Savimbi', 'Saga', 'Gaheza',
  'B The Great', 'Ambassador', 'B.Man', 'Bingo', 'Buringanire', 'Caleb',
  'Chapa', 'Cyber', 'Da Prince', 'Didier', 'Dr David', 'Dylan', 'Fasterman',
  'Fey', 'Fred', 'Genius', 'Habibu', 'Hakim', 'Jackson', 'Jonathan', 'Jovi',
  'K.David', 'Kappo', 'Kim', 'Lee Creator', 'Master P', 'Moses', 'Mr Fire',
  'Mr Jingo', 'Mr. Jeromy', 'Mr.Nice', 'Mungeli', 'Mutibano', 'Nkuba',
  'Oliver', 'P.K', 'Perfect', 'Professor', 'Remy', 'Robert', 'Romeo', 'Rumuri',
  'Rwakilala', 'Ryan', 'Saiger', 'Scratch', 'Sikov', 'Silver', 'Siniya',
  "Sir Lex's", 'Six', 'The Future', 'Tristar', 'Vj Diva', 'Vj Eric', 'Vj Ice',
  'Vj King', 'Vj Steppin', 'Vj Tcr', 'Yakuza', 'Yeah man', 'Yusufu', 'Zacky',
];

const IMAGES: Record<string, string> = {
  'Rocky': '/interpreters/Rocky Kimomo.png',
  'Junior Giti': '/interpreters/Junior Giti.png',
  'Sankara': '/interpreters/Sankara.png',
  'Savimbi': '/interpreters/savimbi.png',
  'Saga': '/interpreters/saga.png',
  'Gaheza': '/interpreters/Gaheza.png',
  'B The Great': '/interpreters/B the great.png',
  'Dylan': '/interpreters/Dylan.png',
  'Yanga': '/interpreters/Yanga.png',
  'P.K': '/interpreters/PK.png',
  'Siniya': '/interpreters/siniya.png',
};

const GENRE_POOL = [
  'Action', 'Comedy', 'Drama', 'Thriller', 'Romance', 'Horror',
  'Sci-Fi', 'Adventure', 'Animation', 'Family', 'Crime', 'Fantasy',
];

const CITIES = ['Kigali', 'Butare', 'Gisenyi', 'Musanze', 'Rubavu', 'Nyagatare', 'Huye'];

const FEATURED = ['Rocky', 'Junior Giti', 'Sankara'];

/** FNV-1a — small, stable string hash used to derive profile stats. */
function seed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function pick<T>(arr: T[], n: number): T[] {
  return arr
    .map((item, i) => ({ item, rank: seed(String(i) + JSON.stringify(item)) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, n)
    .map((x) => x.item);
}

function build(name: string, index: number): Interpreter {
  const s = seed(name);
  const slug = slugify(name);
  const tags = pick(GENRE_POOL, 3);
  const rating = Math.round((4.2 + (s % 9) / 10) * 10) / 10;
  const moviesCount = 40 + (s % 220);
  const followers = 2_000 + (seed(name + 'followers') % 180_000);
  const isFeatured = FEATURED.includes(name);

  return {
    id: index + 1,
    slug,
    name,
    bio: `${name} is one of Rwanda's most recognisable Agasobanuye voices, known for ${
      tags[0]
    } and ${tags[1]} narration. A fixture of the Kinyarwanda dubbing scene, ${name} blends local humour and idiom into every translation.`,
    rating,
    moviesCount,
    followers,
    image:
      IMAGES[name] ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a1a&color=ff6b6b&size=256`,
    tags,
    featured: isFeatured,
    official: isFeatured || s % 5 === 0,
    specialties: tags,
    languages: ['Kinyarwanda', ...(s % 3 === 0 ? ['English', 'Kiswahili'] : [])],
    joinedYear: 2014 + (s % 9),
    city: CITIES[s % CITIES.length],
  };
}

export const interpretersData: Interpreter[] = NAMES.map(build);

export function getInterpreter(slug: string): Interpreter | undefined {
  return interpretersData.find((i) => i.slug === slug);
}

export function getFeaturedInterpreters(): Interpreter[] {
  return interpretersData.filter((i) => i.featured);
}

export function topInterpreters(limit = 8): Interpreter[] {
  return [...interpretersData].sort((a, b) => b.followers - a.followers).slice(0, limit);
}

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
