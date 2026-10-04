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

const INTERPRETER_BIOGRAPHIES: Record<string, string> = {
  'Rocky':
    'Uwizeyimana Marc, professionally known as Rocky Kimomo or Rocky Kirabiranya, is a leading Rwandan film interpreter, digital creator, and founder of Rocky Entertainment. Celebrated for his lightning-fast delivery, humor, and memorable catchphrases, Rocky revolutionized modern Agasobanuye for the digital streaming era, translating Hollywood action blockbusters, sci-fi epics, and superhero franchises with unrivaled swagger and Kigali pop culture references.',
  'Junior Giti':
    'Junior Giti is widely acclaimed as the "King of Bollywood Agasobanuye" in Rwanda. Rising to fame in the 2000s, Junior Giti became a household name across Rwanda and the Great Lakes region for his emotive, melodramatic translation of Indian cinema, Turkish telenovelas, and martial arts action films. His soulful voice acting and ability to capture romance, heartbreak, and dramatic tension made his voice synonymous with weekend family cinema.',
  'Yanga':
    'Nkusi Thomas, known to millions as Yanga, is revered as the founding pioneer and godfather of modern Agasobanuye cinema. Beginning in the early 2000s in Nyamirambo video clubs, Yanga transformed foreign film dubbing into an authentic Rwandan art form with philosophical wisdom, social satire, and unmatched storytelling charm. Until his passing in South Africa in 2022, Yanga remained a beloved cultural icon whose legacy shaped the entire Rwandan film commentary industry.',
  'Sankara':
    'Habimana Sankara, known simply as Sankara, is one of Rwanda\'s premier action and military movie interpreters. Renowned for his authoritative baritone, tactical weapon breakdowns, and thrilling pacing, Sankara is the go-to voice for war epics, espionage thrillers, and explosive Hollywood blockbusters, providing precise dialogue translations blended with raw Kigali street intensity.',
  'Savimbi':
    'Savimbi is a veteran Agasobanuye master famous for his gruff, commanding voice and fierce commentary during combat and martial arts films. Active for over two decades, Savimbi\'s dubs of classic Hong Kong cinema, Jean-Claude Van Damme actioners, and military war sagas are legendary throughout video halls from Kigali to Gisenyi.',
  'Saga':
    'Saga is a fan-favorite Agasobanuye voice actor renowned for his razor-sharp comedic timing and exhilarating martial arts dubbing. Known for dubbing Chinese Wuxia epics and high-octane police thrillers, Saga infuses each scene with hilarious localized idioms and fast-paced sound interpretations.',
  'Gaheza':
    'Gaheza is a celebrated interpreter known for his resonant tone, narrative depth, and thoughtful pacing. Specializing in dramatic epics, African cinema, and psychological thrillers, Gaheza bridges complex foreign storylines into accessible, deeply engaging Kinyarwanda storytelling.',
  'B The Great':
    'B The Great is an acclaimed Rwandan movie translator praised for his articulate, clean narration and mastery of complex sci-fi, time-travel, and superhero cinema. He brings cinematic gravitas and crystal-clear pronunciation that appeals to both seasoned fans and younger viewers.',
  'Dylan':
    'Dylan is a prominent modern-wave interpreter who captured Kigali\'s youth audience with his dubs of anime, Korean dramas, and teen fantasy movies. His youthful cadence, vibrant slang, and expressive dialogue adaptations have made him one of the fastest-growing voices in contemporary Agasobanuye.',
  'P.K':
    'P.K is a distinguished interpreter famous for his energetic superhero and combat film dubbing. Known for mimicking sound effects, gunfire, and explosive impacts with his own voice, P.K creates an electrifying audio-visual experience that keeps viewers on the edge of their seats.',
  'Siniya':
    'Siniya is a veteran translator whose legacy spans the golden era of VHS and DVD video libraries across Rwanda. Known for gritty crime thrillers, mafia chronicles, and kung fu masterworks, his steady, suspenseful storytelling remains widely respected.',
  'Mutibano':
    'Mutibano is a well-known Agasobanuye voice celebrated for his smooth narration of romantic dramas, Latin telenovelas, and family adventures, bringing emotional nuance and relatable Rwandan dialogue to every scene.',
  'Kasuku':
    'Kasuku is one of the classic voices of Rwandan video clubs, remembered for his vivid descriptions of historical wars, biblical epics, and vintage action sagas with captivating oral storytelling flair.',
  'Pacifique':
    'Pacifique is a veteran translator known for his heartfelt interpretation of true-story dramas, historical epics, and international award-winning cinema, celebrated for his clarity and cultural reverence.',
  'Ambassador':
    'Ambassador is an established Agasobanuye voice known for dubbing geopolitical thrillers, international crime mysteries, and courtroom dramas with a formal yet gripping narrative presence.',
  'Master P':
    'Master P is an influential video hall voice artist known for high-octane martial arts, kickboxing, and urban action movies, delivering relentless energy and punchy one-liners.',
  'Mr Fire':
    'Mr Fire is recognized for explosive, fiery commentary over high-speed car chases, action spectacles, and superhero showdowns, delivering pure adrenaline to his audiences.',
  'Dr David':
    'Dr David is an analytical and articulate interpreter renowned for suspense, mystery, and cerebral sci-fi films, breaking down intricate storylines with calm intelligence and dramatic flair.',
  'Genius':
    'Genius is a popular voice artist known for clever wordplay, sharp humor, and translating complex tech and futuristic thrillers into captivating street Kinyarwanda.',
  'Vj Diva':
    'Vj Diva is a trailblazing female voice in Agasobanuye, acclaimed for bringing dynamic emotion, romance, and fresh contemporary perspectives to romantic comedies, family sagas, and drama series.',
  'Vj Ice':
    'Vj Ice is known for his cool, steady delivery over cold war thrillers, espionage sagas, and survival adventures, balancing tension and suspense with effortless poise.',
  'Vj Tcr':
    'Vj Tcr is a beloved Agasobanuye creator known for action-comedy translations, quick-witted banter, and keeping energy high throughout two-hour Hollywood spectacles.',
  'Cyber':
    'Cyber is a cutting-edge interpreter specializing in high-tech sci-fi, video game adaptations, and cybersecurity thrillers, decoding digital futuristic themes into lively vernacular.',
  'Fasterman':
    'Fasterman is legendary for his ultra-high-speed narrative delivery, matching the rapid pacing of action car chases and frantic gun battles word-for-word.',
  'Chapa':
    'Chapa is an energetic street-style interpreter known for urban crime dramas and underground martial arts films with witty Kigali commentary.',
  'B.Man':
    'B.Man is a dynamic voice in Rwandan cinema dubbing, widely followed for action thrillers, Western adventures, and heroic quest storylines.',
  'Caleb':
    'Caleb is a respected interpreter known for translating historical epics, mythological sagas, and sword-and-sandal blockbusters with dramatic gravitas.',
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
  const moviesCount = 40 + (s % 220);
  const followers = 2_000 + (seed(name + 'followers') % 180_000);
  const isFeatured = FEATURED.includes(name);

  const bio =
    INTERPRETER_BIOGRAPHIES[name] ||
    `${name} is an active rising Agasobanuye interpreter in Rwandan cinema, known for fast-paced dubbing, energetic street commentary, and expanding local access to international films in Kinyarwanda.`;

  return {
    id: index + 1,
    slug,
    name,
    bio,
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
