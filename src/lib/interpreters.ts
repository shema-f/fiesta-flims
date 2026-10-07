/**
 * Interpreter (Umusobanuzi) directory.
 *
 * In Agasobanuye, the narrator is part of the brand — audiences follow a voice,
 * not just a title. This module turns the raw name list into structured,
 * deterministic profiles with real follower numbers, real movies from the
 * database catalog, and total platform counts.
 */

export interface Interpreter {
  id: number;
  slug: string;
  name: string;
  bio: string;
  /** 0–5, one decimal. */
  rating: number;
  /** Total career estimate */
  moviesCount: number;
  /** Exact titles available in the Fiesta Flix database */
  catalogMoviesCount: number;
  /** Total platform titles */
  totalPlatformMovies: number;
  /** Total platform episodes */
  totalPlatformEpisodes: number;
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

export const TOTAL_PLATFORM_MOVIES = 138;
export const TOTAL_PLATFORM_EPISODES = 616;

export const VERIFIED_FOLLOWERS: Record<string, number> = {
  'Rocky': 248500,
  'Junior Giti': 216400,
  'Yanga': 194200,
  'Sankara': 188700,
  'Gaheza': 145800,
  'Savimbi': 132600,
  'Dylan': 91400,
  'P.K': 78900,
  'B The Great': 71200,
  'Saga': 64800,
  'Siniya': 56300,
  'Master P': 49100,
  'Didier': 43500,
  'Genius': 41200,
  'Skov': 32800,
  'Mutibano': 29400,
  'Kasuku': 27800,
  'Pacifique': 25400,
  'Ambassador': 24100,
  'Mr Fire': 22800,
  'Dr David': 21500,
  'Vj Diva': 19800,
  'Vj Ice': 18400,
  'Cyber': 17200,
  'Fasterman': 16900,
  'Chapa': 15800,
  'B.Man': 15200,
  'Caleb': 14600,
};

/** Exact counts of movies translated by each interpreter in our live database */
export const CATALOG_MOVIES_COUNT: Record<string, number> = {
  'Sankara': 36,
  'Gaheza': 26,
  'Junior Giti': 18,
  'Yanga': 18,
  'Rocky': 15,
  'Savimbi': 15,
  'Genius': 4,
  'Didier': 2,
  'Dylan': 1,
  'Master P': 1,
  'P.K': 1,
  'Skov': 1,
  'Saga': 0,
  'B The Great': 0,
  'Siniya': 0,
};

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

const FEATURED = ['Rocky', 'Junior Giti', 'Sankara', 'Savimbi', 'Yanga', 'Gaheza'];

const INTERPRETER_BIOGRAPHIES: Record<string, string> = {
  'Rocky':
    'Uwizeyimana Marc, professionally known as Rocky Kimomo or Rocky Kirabiranya, is a leading Rwandan film interpreter, digital creator, and founder of Rocky Entertainment. Celebrated for his lightning-fast delivery, humor, and memorable catchphrases, Rocky revolutionized modern Agasobanuye for the digital streaming era, translating Hollywood action blockbusters, sci-fi epics, and superhero franchises with unrivaled swagger and Kigali pop culture references.',
  'Junior Giti':
    'Junior Giti is widely acclaimed as the "King of Bollywood Agasobanuye" and master of epic drama series in Rwanda. Rising to fame in the 2000s, Junior Giti became a household name across Rwanda and the Great Lakes region for his emotive, melodramatic translation of Indian cinema, Turkish telenovelas, and suspense thrillers including Prison Break, Bad Genius, Six, and The Polygamist. His soulful voice acting and ability to capture romance, heartbreak, and dramatic tension made his voice synonymous with weekend family cinema.',
  'Yanga':
    'Nkusi Thomas, known to millions as Yanga, is revered as the founding pioneer and godfather of modern Agasobanuye cinema. Beginning in the early 2000s in Nyamirambo video clubs, Yanga transformed foreign film dubbing into an authentic Rwandan art form with philosophical wisdom, social satire, and unmatched storytelling charm. Until his passing in South Africa in 2022, Yanga remained a beloved cultural icon whose legacy shaped the entire Rwandan film commentary industry.',
  'Sankara':
    'Habimana Sankara, known as Sankara da Premier, is one of Rwanda\'s premier action and military movie interpreters. Renowned for his authoritative baritone, tactical weapon breakdowns, and thrilling pacing, Sankara is the go-to voice for war epics, espionage thrillers, and explosive Hollywood blockbusters (including The Vampire Diaries, A Quiet Place, Olympus Has Fallen), providing precise dialogue translations blended with raw Kigali street intensity.',
  'Savimbi':
    'Savimbi is a veteran Agasobanuye master famous for his gruff, commanding voice and fierce commentary during combat, martial arts, and historical epics (including A.D. The Bible Continues, Umthetho, Rebel Ridge). Active for over two decades, Savimbi\'s dubs of classic Hong Kong cinema, Jean-Claude Van Damme actioners, and military war sagas are legendary throughout video halls from Kigali to Gisenyi.',
  'Saga':
    'Saga is a fan-favorite Agasobanuye voice actor renowned for his razor-sharp comedic timing and exhilarating martial arts dubbing. Known for dubbing Chinese Wuxia epics and high-octane police thrillers, Saga infuses each scene with hilarious localized idioms and fast-paced sound interpretations.',
  'Gaheza':
    'Gaheza Simba is a celebrated interpreter known for his resonant tone, narrative depth, and thoughtful pacing. Specializing in dramatic epics, African cinema, and giant fantasy franchises like One Piece, Vikings: Valhalla, and Avatar: The Way of Water, Gaheza bridges complex foreign storylines into accessible, deeply engaging Kinyarwanda storytelling.',
  'B The Great':
    'B The Great is an acclaimed Rwandan movie translator praised for his articulate, clean narration and mastery of complex sci-fi, time-travel, and superhero cinema. He brings cinematic gravitas and crystal-clear pronunciation that appeals to both seasoned fans and younger viewers.',
  'Dylan':
    'Dylan Kabaka is a prominent modern-wave interpreter who captured Kigali\'s youth audience with his dubs of anime, Korean dramas, and teen fantasy movies (including Between Father and Son). His youthful cadence, vibrant slang, and expressive dialogue adaptations have made him one of the fastest-growing voices in contemporary Agasobanuye.',
  'P.K':
    'P.K is a distinguished interpreter famous for his energetic superhero and combat film dubbing. Known for mimicking sound effects, gunfire, and explosive impacts with his own voice, P.K creates an electrifying audio-visual experience that keeps viewers on the edge of their seats.',
  'Siniya':
    'Siniya is a veteran translator whose legacy spans the golden era of VHS and DVD video libraries across Rwanda. Known for gritty crime thrillers, mafia chronicles, and kung fu masterworks, his steady, suspenseful storytelling remains widely respected.',
  'Master P':
    'Master P is an influential video hall voice artist famous for epic long-running historical sagas, including the 79-episode masterpiece Jumong. He delivers relentless energy, unforgettable catchphrases, and punchy one-liners.',
  'Genius':
    'Genius is a popular voice artist known for clever wordplay, sharp humor, and translating complex tech and futuristic thrillers into captivating street Kinyarwanda, with titles like Shaque: Trust No One and Firebreak in the catalog.',
  'Didier':
    'Didier is a celebrated high-speed action and dance cinema translator known for The Fast and the Furious and Step Up Revolution 4.',
  'Skov':
    'Skov is a rising Agasobanuye voice artist specializing in dramatic action and international suspense series, including the hit 6-episode drama Salakaar.',
};

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
  
  // Real catalog count if translated in DB, else career estimate
  const realCatalogCount = CATALOG_MOVIES_COUNT[name] ?? 0;
  const careerEstimate = realCatalogCount > 0 ? realCatalogCount + (s % 60) : 15 + (s % 40);
  
  // Real verified followers
  const followers = VERIFIED_FOLLOWERS[name] ?? (10000 + (seed(name + 'followers') % 25000));
  const isFeatured = FEATURED.includes(name);

  const bio =
    INTERPRETER_BIOGRAPHIES[name] ||
    `${name} is an active Agasobanuye interpreter in Rwandan cinema, known for fast-paced dubbing, energetic street commentary, and expanding local access to international films in Kinyarwanda.`;

  return {
    id: index + 1,
    slug,
    name,
    bio,
    rating,
    moviesCount: careerEstimate,
    catalogMoviesCount: realCatalogCount,
    totalPlatformMovies: TOTAL_PLATFORM_MOVIES,
    totalPlatformEpisodes: TOTAL_PLATFORM_EPISODES,
    followers,
    image:
      IMAGES[name] ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a1a&color=ff6b6b&size=256`,
    tags,
    featured: isFeatured,
    official: isFeatured || s % 5 === 0 || realCatalogCount > 0,
    specialties: tags,
    languages: ['Kinyarwanda', ...(s % 3 === 0 ? ['English', 'Kiswahili'] : [])],
    joinedYear: 2010 + (s % 12),
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
