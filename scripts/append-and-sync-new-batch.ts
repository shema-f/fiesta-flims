import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const NEON_URL =
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes('ep-xxx') &&
  !process.env.DATABASE_URL.includes('user:password')
    ? process.env.DATABASE_URL
    : 'postgresql://neondb_owner:npg_Ais3XE9DuWLz@ep-twilight-glitter-b5gdjgeo-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

process.env.DATABASE_URL = NEON_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: NEON_URL,
    },
  },
});

interface RawRow {
  title: string;
  description: string;
  narrator: string;
  genre: string;
  duration: number;
  releaseYear: number;
  fileUrl: string;
  thumbnailUrl: string;
  backdrop: string;
  trailer: string;
  views: number;
  downloads: number;
  isFeatured: boolean;
  isActive: boolean;
}

// Rich metadata dictionary for new series and standout titles
const METADATA_DICTIONARY: Record<string, {
  cleanTitle: string;
  narrator: string;
  genre: string;
  releaseYear: number;
  description: string;
  imdbPoster: string;
  backdrop: string;
  trailer: string;
  isFeatured: boolean;
  isSeries: boolean;
  seasonsCount: number;
}> = {
  'prison break': {
    cleanTitle: 'Prison Break',
    narrator: 'Junior Giti',
    genre: 'Action, Crime, Drama, Thriller',
    releaseYear: 2005,
    description: 'Structural engineer Michael Scofield deliberately gets himself imprisoned in Fox River State Penitentiary to break out his falsely accused brother Lincoln Burrows before his execution. Spans all 5 seasons with full Kinyarwanda translation by Junior Giti.',
    imdbPoster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=AL9zLctDJaU',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 5,
  },
  'the vampire diaries': {
    cleanTitle: 'The Vampire Diaries',
    narrator: 'Sankara da Premier',
    genre: 'Drama, Fantasy, Horror, Mystery',
    releaseYear: 2009,
    description: 'In Mystic Falls, Virginia, high school student Elena Gilbert finds herself drawn to two vampire brothers, Stefan and Damon Salvatore, entangled in a supernatural battle across generations. Full Season 1 with Kinyarwanda narration by Sankara da Premier.',
    imdbPoster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=BmVmhjjkN4E',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 1,
  },
  "death's game": {
    cleanTitle: "Death's Game",
    narrator: 'Sankara da Premier',
    genre: 'Fantasy, Thriller, Drama',
    releaseYear: 2023,
    description: 'Facing imminent death by suicide, a despairing young man is condemned by Death to endure dying over and over through 12 different reincarnations, learning what life truly means.',
    imdbPoster: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=q6gO6k49n7g',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 1,
  },
  'the girlfriend': {
    cleanTitle: 'The Girlfriend',
    narrator: 'Sankara da Premier',
    genre: 'Drama, Mystery, Thriller',
    releaseYear: 2026,
    description: 'A psychological romantic drama exploring hidden identities, obsessive devotion, and secrets that turn an idyllic relationship into a lethal cat-and-mouse game.',
    imdbPoster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=kY3B19J8m9M',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'the prisoner': {
    cleanTitle: 'The Prisoner',
    narrator: 'Sankara da Premier',
    genre: 'Drama, Mystery, Sci-Fi',
    releaseYear: 2026,
    description: 'A government operative resigns from his covert post only to awaken trapped in a surreal coastal village where residents are known only by assigned numbers.',
    imdbPoster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=F7j4uW_6j8E',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'watching you': {
    cleanTitle: 'Watching You',
    narrator: 'Sankara da Premier',
    genre: 'Mystery, Thriller',
    releaseYear: 2026,
    description: "A woman's life spirals out of control when an anonymous stalker bugs her apartment and begins manipulating her reality with lethal precision.",
    imdbPoster: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=F7j4uW_6j8E',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'who is erin carter?': {
    cleanTitle: 'Who Is Erin Carter?',
    narrator: 'Junior Giti',
    genre: 'Action, Adventure, Crime, Thriller',
    releaseYear: 2023,
    description: 'A British expat teacher living a quiet life in Barcelona is caught up in an armed supermarket heist, unleashing deadly combat skills that expose her buried past.',
    imdbPoster: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=2fR8Y_0jW-U',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 1,
  },
  'desperate lies': {
    cleanTitle: 'Desperate Lies',
    narrator: 'Sankara da Premier',
    genre: 'Drama, Romance',
    releaseYear: 2024,
    description: 'A woman discovers she is pregnant with twins by two different men through a rare medical phenomenon, igniting a dangerous web of deception.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTgyMTktOGVjNS00MjA5LWFmOGYtMDNkZWY5YjIxMTAxXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=kY3B19J8m9M',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'umthetho': {
    cleanTitle: 'Umthetho',
    narrator: 'Savimbi',
    genre: 'Action, Crime, Drama',
    releaseYear: 2024,
    description: 'A gritty South African crime series exploring township justice, rogue police, and survival in the streets of Johannesburg.',
    imdbPoster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=F7j4uW_6j8E',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'kung fu jungle': {
    cleanTitle: 'Kung Fu Jungle',
    narrator: 'Sankara da Premier',
    genre: 'Action, Crime, Thriller',
    releaseYear: 2014,
    description: 'A police martial arts instructor imprisoned for accidental manslaughter helps authorities hunt down a ruthless martial arts serial killer targeting masters across Hong Kong.',
    imdbPoster: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=wZti8UjW15U',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 1,
  },
  'step up: all in': {
    cleanTitle: 'Step Up: All In',
    narrator: 'Sankara da Premier',
    genre: 'Drama, Music, Romance',
    releaseYear: 2014,
    description: 'All-stars from previous Step Up installments assemble in Las Vegas, battling for a life-changing contract in a high-stakes televised competition.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/aM3tZ8oGjGk5r4p9fT0r8h2d3iB.jpg',
    backdrop: 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=cZpW4wM4J4w',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'skin trade': {
    cleanTitle: 'Skin Trade',
    narrator: 'Sankara da Premier',
    genre: 'Action, Crime, Thriller',
    releaseYear: 2014,
    description: 'After a Serbian mobster murders his family, a hardened New Jersey detective travels to Bangkok to join forces with a Thai cop and take down an international human trafficking syndicate.',
    imdbPoster: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=ti6S3NZ5mKI',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'after earth': {
    cleanTitle: 'After Earth',
    narrator: 'Sankara da Premier',
    genre: 'Action, Adventure, Sci-Fi',
    releaseYear: 2013,
    description: 'Stranded on a long-abandoned Earth after a crash landing, a young ranger must traverse hostile terrain to recover an emergency beacon and save his wounded father.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/afterEarthPoster500.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=CZIt20EmgLY',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'brotherhood': {
    cleanTitle: 'Brotherhood',
    narrator: 'Savimbi',
    genre: 'Action, Crime, Drama',
    releaseYear: 2022,
    description: 'In Lagos, twin brothers find themselves on opposing sides of the law when one joins an elite SWAT unit and the other leads a notorious armed robbery crew.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/brotherhoodNollywoodPoster500.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=F7j4uW_6j8E',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'the lone ranger': {
    cleanTitle: 'The Lone Ranger',
    narrator: 'Savimbi',
    genre: 'Action, Adventure, Western',
    releaseYear: 2013,
    description: 'Native American warrior Tonto recounts the untold adventures that turned lawman John Reid into an iconic masked legend of frontier justice.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/loneRangerPoster500.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=JjFsNsoYgSE',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'bilal: a new breed of hero': {
    cleanTitle: 'Bilal: A New Breed of Hero',
    narrator: 'Savimbi',
    genre: 'Animation, Action, Adventure, Biography',
    releaseYear: 2015,
    description: 'Abducted as a child into slavery, a courageous youth with a powerful voice finds the strength to rise against injustice and tyranny.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/bilalPoster500.jpg',
    backdrop: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=IB6Z3DkG62g',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'pk': {
    cleanTitle: 'PK',
    narrator: 'Savimbi',
    genre: 'Comedy, Drama, Sci-Fi',
    releaseYear: 2014,
    description: 'An extraterrestrial lands in Rajasthan and loses the remote control to his spaceship. His innocent curiosity challenges societal superstitions.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/pkMoviePoster500.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=82ZEDGPCkT8',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'rebel ridge': {
    cleanTitle: 'Rebel Ridge',
    narrator: 'Savimbi',
    genre: 'Action, Crime, Drama, Thriller',
    releaseYear: 2024,
    description: 'An ex-Marine confronts deep-rooted police corruption in a small Southern town after officers illegally seize his bail money.',
    imdbPoster: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=q6gO6k49n7g',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 1,
  },
  'who am i?': {
    cleanTitle: 'Who Am I?',
    narrator: 'Yanga',
    genre: 'Action, Adventure, Comedy',
    releaseYear: 1998,
    description: 'A special operative loses his memory after a sabotaged mission in South Africa and must fight CIA assassins while uncovering his identity.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/whoAmIJackieChanPoster500.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=F7j4uW_6j8E',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'gallowwalkers': {
    cleanTitle: 'Gallowwalkers',
    narrator: 'Yanga',
    genre: 'Action, Fantasy, Horror, Western',
    releaseYear: 2012,
    description: 'A cursed gunslinger whose victims rise from the grave recruits an apprentice to help him fight off an undead gang of outlaws.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/gallowwalkersPoster500.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=F7j4uW_6j8E',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'evil dead': {
    cleanTitle: 'Evil Dead',
    narrator: 'Yanga',
    genre: 'Horror',
    releaseYear: 2013,
    description: 'Five friends staying at an isolated forest cabin inadvertently unleash bloodthirsty flesh-possessing demons after reading from the Naturom Demonto.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/evilDead2013Poster500.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=BHLQtq7-E_0',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'true legend': {
    cleanTitle: 'True Legend',
    narrator: 'Yanga',
    genre: 'Action, History',
    releaseYear: 2010,
    description: 'Betrayed by his vengeful stepbrother, general Su Qi-er perfects the legendary Five Venom Fists and Drunken Boxing martial art style.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/trueLegendPoster500.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=F7j4uW_6j8E',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
};

function identifyGroupKey(title: string): string {
  const t = title.toLowerCase();
  for (const key of Object.keys(METADATA_DICTIONARY)) {
    if (t.includes(key)) return key;
  }
  let clean = title.trim();
  clean = clean.replace(/\s*-\s*Part\s+[A-Za-z0-9]+.*$/i, '');
  clean = clean.replace(/\s+Part\s+[A-Za-z0-9]+.*$/i, '');
  clean = clean.replace(/\s+S\d+\s*E\d+.*$/i, '');
  clean = clean.replace(/\s+(?:Ep|Episode|E)\s*\d+.*$/i, '');
  clean = clean.replace(/\s+Pt\.?\s*\d+.*$/i, '');
  clean = clean.replace(/\s+S\d+$/i, '');
  return clean.toLowerCase().trim();
}

function parseSeasonNumber(title: string): number {
  const m = title.match(/s0?(\d+)/i);
  return m ? parseInt(m[1], 10) : 1;
}

function parseEpisodeNumber(title: string, indexInGroup: number): number {
  const m = title.match(/(?:ep|episode|e)\s*0?(\d+)/i);
  if (m) return parseInt(m[1], 10);
  const partMatch = title.match(/part\s*([a-z0-9]+)/i);
  if (partMatch) {
    const val = partMatch[1].toUpperCase();
    if (val === 'A' || val === '1') return 1;
    if (val === 'B' || val === '2') return 2;
    if (val === 'C' || val === '3') return 3;
    if (val === 'D' || val === '4') return 4;
  }
  return indexInGroup + 1;
}

function parseCsvLine(text: string): string[] {
  // If tab separated (from TSV format)
  if (text.includes('\t')) {
    return text.split('\t').map((p) => p.trim());
  }
  const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    let val = match[1];
    if (val === undefined) break;
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1).replace(/""/g, '"');
    }
    matches.push(val.trim());
    if (regex.lastIndex >= text.length) break;
  }
  return matches;
}

async function run() {
  console.log('⚡ Step 1: Connecting to Neon DB...');
  const uploader = await prisma.user.upsert({
    where: { email: 'admin@fiestaflix.com' },
    update: {},
    create: {
      id: 'admin-01',
      name: 'Fiesta Flix Admin',
      email: 'admin@fiestaflix.com',
      role: 'ADMIN',
    },
  });

  // Step 2: Fetch existing movies in DB
  const existingMovies = await prisma.movie.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      narrator: true,
      genre: true,
      resolutions: true,
    },
  });
  const existingMap = new Map<string, typeof existingMovies[0]>();
  for (const m of existingMovies) {
    existingMap.set(m.title.toLowerCase().trim(), m);
  }
  console.log(`📊 Found ${existingMovies.length} existing titles currently in Neon DB.`);

  // Step 3: Read current movies.csv
  const csvPath = path.join(process.cwd(), 'movies.csv');
  const rawCsv = fs.readFileSync(csvPath, 'utf8');
  const lines = rawCsv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = lines.slice(1);

  // Group all rows
  const groups = new Map<string, RawRow[]>();

  for (const row of rows) {
    const matches = parseCsvLine(row);
    if (matches.length < 5) continue;

    const [
      title,
      description,
      narrator,
      genre,
      duration,
      releaseYear,
      fileUrl,
      thumbnailUrl,
      backdrop,
      trailer,
      views,
      downloads,
      isFeatured,
      isActive,
    ] = matches;

    const groupKey = identifyGroupKey(title);
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }

    groups.get(groupKey)!.push({
      title,
      description: (description || '').replace(/^['"(]+|['")]+$/g, ''),
      narrator,
      genre,
      duration: parseInt(duration, 10) || 3600,
      releaseYear: parseInt(releaseYear, 10) || 2024,
      fileUrl,
      thumbnailUrl,
      backdrop,
      trailer,
      views: parseInt(views, 10) || 0,
      downloads: parseInt(downloads, 10) || 0,
      isFeatured: isFeatured?.toLowerCase() === 'true',
      isActive: isActive?.toLowerCase() !== 'false',
    });
  }

  console.log(`📦 Grouped ${rows.length} total rows into ${groups.size} unified titles!`);

  const newlyAdded: Array<{ title: string; episodesCount: number; narrator: string }> = [];
  const updatedExisting: Array<{ title: string; episodesCount: number; narrator: string }> = [];

  let count = 0;
  const usedSlugs = new Set<string>();

  for (const [groupKey, items] of groups.entries()) {
    const definedMeta = METADATA_DICTIONARY[groupKey];
    const firstItem = items[0];

    let computedTitle = definedMeta?.cleanTitle;
    if (!computedTitle) {
      computedTitle = firstItem.title
        .replace(/\s*-\s*Part\s+[A-Za-z0-9]+.*$/i, '')
        .replace(/\s+Part\s+[A-Za-z0-9]+.*$/i, '')
        .replace(/\s+S\d+\s*E\d+.*$/i, '')
        .replace(/\s+(?:Ep|Episode|E)\s*\d+.*$/i, '')
        .replace(/\s+Pt\.?\s*\d+.*$/i, '')
        .replace(/\s+S\d+$/i, '')
        .trim();
    }

    const narrator = definedMeta?.narrator || firstItem.narrator || 'Sankara da Premier';
    const genre = definedMeta?.genre || firstItem.genre || 'Action, Drama';
    const releaseYear = definedMeta?.releaseYear || firstItem.releaseYear || 2024;
    const description =
      definedMeta?.description ||
      firstItem.description ||
      `Experience ${computedTitle} translated into Kinyarwanda by ${narrator}. Stream in high definition or download directly.`;

    const poster =
      definedMeta?.imdbPoster ||
      (firstItem.thumbnailUrl && !firstItem.thumbnailUrl.includes('placeholder')
        ? firstItem.thumbnailUrl
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000');

    const backdrop =
      definedMeta?.backdrop ||
      (firstItem.backdrop && !firstItem.backdrop.includes('placeholder')
        ? firstItem.backdrop
        : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600');

    const trailer = definedMeta?.trailer || firstItem.trailer || 'https://www.youtube.com/watch?v=qEVUtrk8_B4';
    const isFeatured = definedMeta?.isFeatured ?? (count < 6 || firstItem.isFeatured);
    const isSeries = (definedMeta?.isSeries ?? false) || items.length > 1;

    let maxSeason = definedMeta?.seasonsCount || 1;
    for (const it of items) {
      const sNum = parseSeasonNumber(it.title);
      if (sNum > maxSeason) maxSeason = sNum;
    }

    const episodes = items.map((item, idx) => {
      const sNum = parseSeasonNumber(item.title);
      const epNum = parseEpisodeNumber(item.title, idx);
      const epDurationMinutes = Math.round(item.duration / 60) || 45;

      return {
        id: `ep-${idx + 1}`,
        episodeNumber: epNum,
        seasonNumber: sNum,
        title: item.title,
        duration: `${epDurationMinutes}m`,
        description: item.description || description,
        thumbnail: item.thumbnailUrl || poster,
        videoUrl: item.fileUrl,
        directStreamUrl: item.fileUrl,
        downloadUrl: item.fileUrl,
        quality: '1080p FHD',
        narrator: item.narrator || narrator,
      };
    });

    let baseSlug = computedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let sc = 1;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${sc}`;
      sc++;
    }
    usedSlugs.add(slug);

    const totalViews = items.reduce((acc, it) => acc + (it.views || 4500), 0) + 12000;
    const totalDownloads = Math.round(totalViews / 3.4);
    const avgDuration = items.length > 0 ? items[0].duration : 3600;

    const existingMatch = existingMap.get(computedTitle.toLowerCase().trim());

    if (existingMatch) {
      // Update existing
      await prisma.movie.update({
        where: { id: existingMatch.id },
        data: {
          description,
          synopsis: description,
          narrator,
          genre,
          duration: avgDuration,
          releaseYear,
          fileUrl: items[0].fileUrl,
          thumbnailUrl: poster,
          poster,
          backdrop,
          trailer,
          resolutions: {
            seasonsCount: maxSeason,
            episodesCount: episodes.length,
            episodes,
          },
          views: totalViews,
          viewCount: totalViews,
          downloads: totalDownloads,
          downloadCount: totalDownloads,
          isActive: true,
          status: 'PUBLISHED',
        },
      });
      updatedExisting.push({
        title: computedTitle,
        episodesCount: episodes.length,
        narrator,
      });
    } else {
      // Create brand new
      await prisma.movie.create({
        data: {
          title: computedTitle,
          slug,
          description,
          synopsis: description,
          narrator,
          genre,
          duration: avgDuration,
          releaseYear,
          fileUrl: items[0].fileUrl,
          thumbnailUrl: poster,
          poster,
          backdrop,
          trailer,
          resolutions: {
            seasonsCount: maxSeason,
            episodesCount: episodes.length,
            episodes,
          },
          views: totalViews,
          viewCount: totalViews,
          downloads: totalDownloads,
          downloadCount: totalDownloads,
          rating: 8.8 + ((count % 10) * 0.1),
          ratingCount: Math.round(totalViews / 35),
          isFeatured,
          isActive: true,
          status: 'PUBLISHED',
          publishedAt: new Date(Date.now() - count * 3600000 * 2),
          uploaderId: uploader.id,
        },
      });
      newlyAdded.push({
        title: computedTitle,
        episodesCount: episodes.length,
        narrator,
      });
    }

    count++;
  }

  // Aggregate stats per interpreter
  const allDbMovies = await prisma.movie.findMany({
    select: { id: true, title: true, narrator: true, resolutions: true },
  });

  const narratorBreakdown: Record<string, { moviesCount: number; episodesCount: number }> = {};
  let totalPlatformEpisodes = 0;

  for (const m of allDbMovies) {
    const n = m.narrator || 'Unknown';
    if (!narratorBreakdown[n]) {
      narratorBreakdown[n] = { moviesCount: 0, episodesCount: 0 };
    }
    narratorBreakdown[n].moviesCount += 1;

    const resObj = m.resolutions as any;
    const eps = Array.isArray(resObj?.episodes) ? resObj.episodes.length : 1;
    narratorBreakdown[n].episodesCount += eps;
    totalPlatformEpisodes += eps;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totalDatabaseTitles: allDbMovies.length,
    totalPlatformEpisodes,
    newlyImportedTitlesCount: newlyAdded.length,
    updatedTitlesCount: updatedExisting.length,
    newlyAddedTitles: newlyAdded,
    updatedExistingTitles: updatedExisting,
    narratorBreakdown,
  };

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(dataDir, 'admin-catalog-report.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );

  console.log('\n=============================================');
  console.log('🎉 CATALOG SYNC COMPLETE!');
  console.log(`Total Database Titles: ${allDbMovies.length}`);
  console.log(`Total Platform Episodes: ${totalPlatformEpisodes}`);
  console.log(`Newly Added Titles (${newlyAdded.length}):`);
  newlyAdded.forEach((n) => console.log(`  + ${n.title} (${n.episodesCount} eps) - ${n.narrator}`));
  console.log(`Updated Existing Titles (${updatedExisting.length}):`);
  updatedExisting.forEach((u) => console.log(`  ~ ${u.title} (${u.episodesCount} eps) - ${u.narrator}`));
  console.log('=============================================\n');

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error('Fatal import error:', e);
  process.exit(1);
});
