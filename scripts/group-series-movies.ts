import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const NEON_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_Ais3XE9DuWLz@ep-twilight-glitter-b5gdjgeo-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

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

// Master metadata for the grouped parent titles
const SERIES_METADATA: Record<string, {
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
  'jumong': {
    cleanTitle: 'Jumong',
    narrator: 'Master P',
    genre: 'Action, Drama, History',
    releaseYear: 2006,
    description: 'The legendary Korean epic chronicling prince Ju Mong, who rises through betrayal and mythic battles to unite divided tribes and found the empire of Goguryeo. All 81 episodes translated into Kinyarwanda by Master P.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BZmEwZTFhNjAtOGJmNy00N2IxLThkOTgtOWFlZjMyYTM1ODk4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=F3i9R0mN8q0',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 1,
  },
  'vis a vis': {
    cleanTitle: 'Vis a Vis (Locked Up)',
    narrator: 'Rocky Kimomo',
    genre: 'Drama, Thriller',
    releaseYear: 2015,
    description: "Naively framed for corporate fraud by her lover, innocent accountant Macarena Ferreiro is thrown into Cruz del Sur high-security women's prison, forced to fight for survival among dangerous inmates.",
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BYzA4YzM5MDQtYzU1OS00MGYxLTlhMzQtNTFmZDIzYzU2N2EyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=6rWp-R1i_bM',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 4,
  },
  'outer banks': {
    cleanTitle: 'Outer Banks',
    narrator: 'Rocky Kimomo',
    genre: 'Action, Adventure, Mystery',
    releaseYear: 2024,
    description: "On an island of haves and have-nots, teen John B enlists his three best friends to hunt for a legendary four-hundred-million-dollar treasure linked to his father's disappearance in the Outer Banks.",
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMjY5YzE5NmMtYjQ0Ni00MDliLWIxMGMtMjhhMzZlZTY1MjQ2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=GC68w9tvv6I',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 5,
  },
  'between father and son': {
    cleanTitle: 'Between Father and Son',
    narrator: 'Dylan Kabaka',
    genre: 'Drama, Thriller',
    releaseYear: 2026,
    description: 'A gripping Mexican miniseries exploring generational fractures, buried cartel rivalries, and the emotional battle for honor between a father and his son.',
    imdbPoster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=jW8mZqX9gPo',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'beauty in black': {
    cleanTitle: 'Beauty in Black',
    narrator: 'Rocky Kimomo',
    genre: 'Drama',
    releaseYear: 2024,
    description: 'A young woman navigates dark urban secrets when she crosses paths with the wealthy, dysfunctional cosmetics dynasty entangled in an underground human trafficking operation.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BN2E4ZGYzMDUtOTQ3MS00MGE5LWI4YWEtYmQ2YmY1ZDFiZjI5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=b4wH0L2jW2U',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 3,
  },
  'a.d. the bible continues': {
    cleanTitle: 'A.D. The Bible Continues',
    narrator: 'Savimbi',
    genre: 'Drama, History',
    releaseYear: 2015,
    description: 'When Jesus is crucified by Pontius Pilate, the unparalleled impact of his death and resurrection on his followers, the Jewish elders and the Romans lays the foundation for a new faith.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMTQyNzAzNTcwOV5BMl5BanBnXkFtZTgwODk2ODU5NDE@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=P21rGz6R1lM',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'taken': {
    cleanTitle: 'Taken (The Series)',
    narrator: 'Rocky',
    genre: 'Action, Thriller',
    releaseYear: 2024,
    description: 'Bryan Mills, a former CIA operative dealing with personal tragedy, embarks on a relentless path of action and vengeance against dangerous international syndicates.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMjA5OTc3NjExNV5BMl5BanBnXkFtZTgwNTcyNDc5MDI@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=Z_K7mK1JpQw',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'shaque: trust no one': {
    cleanTitle: 'Shaque: Trust No One',
    narrator: 'Genius',
    genre: 'Mystery, Thriller',
    releaseYear: 2026,
    description: 'A high-tension mystery thriller where dark family secrets, betrayal, and deceit unfold as investigators untangle a dangerous conspiracy.',
    imdbPoster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=P21rGz6R1lM',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'salakaar': {
    cleanTitle: 'Salakaar',
    narrator: 'Skov',
    genre: 'Action, Thriller',
    releaseYear: 2026,
    description: 'A high-stakes espionage thriller following a young intelligence agent uncovering buried state secrets intertwined with a legendary veteran spymaster.',
    imdbPoster: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=LX6kVRsdXW4',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'treadstone': {
    cleanTitle: 'Treadstone',
    narrator: 'Rocky Kimomo',
    genre: 'Action, Thriller',
    releaseYear: 2019,
    description: 'Connected to the Bourne universe, sleeper agents across the globe are mysteriously awakened to resume deadly covert black-ops missions.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMzkzMDI0ZTctMTc4Yi00ZDIxLWI2ODQtNjUxZWI0MzYzNTk4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=N6Z3HqjT2-M',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'teach lesson': {
    cleanTitle: 'Teach Lesson',
    narrator: 'Rocky Kimomo',
    genre: 'Drama',
    releaseYear: 2026,
    description: 'A high-stakes campus drama exploring discipline, forbidden romance, and life lessons that unravel the lives of students and their devoted mentors.',
    imdbPoster: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=kY3B19J8m9M',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'knock knock': {
    cleanTitle: 'Knock Knock',
    narrator: 'Rocky',
    genre: 'Thriller',
    releaseYear: 2015,
    description: 'A devoted husband and father alone for the weekend opens his door to two stranded young women seeking shelter, leading to a dangerous psychological cat-and-mouse trap.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMTQxMjk5NzIzM15BMl5BanBnXkFtZTgwNTU5MTY1NjE@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=ti6S3NZ5mKI',
    isFeatured: false,
    isSeries: false,
    seasonsCount: 1,
  },
  'step up revolution 4': {
    cleanTitle: 'Step Up Revolution 4',
    narrator: 'Didier',
    genre: 'Drama, Music, Romance',
    releaseYear: 2020,
    description: 'An aspiring dancer in Miami teams up with the leader of an underground flash mob dance crew called The MOB to save their historic neighborhood from commercial demolition.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMjEyNzQzMjk5MV5BMl5BanBnXkFtZTcwNzYxODc4Nw@@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=cZpW4wM4J4w',
    isFeatured: false,
    isSeries: false,
    seasonsCount: 1,
  },
  'mayday': {
    cleanTitle: 'Mayday',
    narrator: 'Rocky',
    genre: 'Action, Thriller',
    releaseYear: 2026,
    description: 'High-intensity survival action when an emergency forced landing leads a courageous pilot and his passengers into dangerous militant territory.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BNTI2ZmExNzMtMDYxNC00NWUzLTkzZDMtNDlhYTY2MDU5OWUzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=M25zXBIUVr0',
    isFeatured: false,
    isSeries: false,
    seasonsCount: 1,
  },
  'vishwanath and sons': {
    cleanTitle: 'Vishwanath and Sons',
    narrator: 'Rocky',
    genre: 'Drama',
    releaseYear: 2026,
    description: "An aging international shooter remains dedicated to his career. However, growing family obligations and an unexpected new romance force him to re-evaluate his life's priorities.",
    imdbPoster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=gT8vW2P7rMo',
    isFeatured: false,
    isSeries: false,
    seasonsCount: 1,
  },
  'alpha': {
    cleanTitle: 'Alpha',
    narrator: 'Rocky Kimomo',
    genre: 'Action, Drama',
    releaseYear: 2026,
    description: 'Two determined heroines are pushed to their physical and emotional limits when forced to join forces against a ruthless criminal syndicate.',
    imdbPoster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=uKkP_2q6P8g',
    isFeatured: false,
    isSeries: false,
    seasonsCount: 1,
  },
  'no good deed': {
    cleanTitle: 'No Good Deed',
    narrator: 'Sankara',
    genre: 'Crime, Thriller',
    releaseYear: 2026,
    description: 'An unhinged escaped convict terrorizes an unsuspecting suburban family after charming his way into their home during a stormy evening.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMjA4Nzg5MTg5N15BMl5BanBnXkFtZTgwNTU5NTE4MjE@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=F7j4uW_6j8E',
    isFeatured: true,
    isSeries: false,
    seasonsCount: 1,
  },
  'let it shine': {
    cleanTitle: 'Let It Shine',
    narrator: 'Rocky Kimomo',
    genre: 'Comedy, Romance',
    releaseYear: 2012,
    description: 'A talented teenage choir boy writes dazzling hip-hop lyrics under a pseudonym, hoping to win the heart of a rising music sensation without revealing his true identity.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMTQ4NTcyODc5MF5BMl5BanBnXkFtZTcwMjU2NzM2Nw@@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=qf4kZqX6VdI',
    isFeatured: true,
    isSeries: false,
    seasonsCount: 1,
  },
  'the fast and the furious 1': {
    cleanTitle: 'The Fast and the Furious 1',
    narrator: 'Didier',
    genre: 'Action, Crime',
    releaseYear: 2020,
    description: 'Undercover LAPD officer Brian O Conner infiltrates a street racing hijack crew suspected of masterminding a string of high-speed electronic hijackings.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BNzlkNzVjMDMtOTdhZC00MGE1LTkxODctMzFmMjkwZmMxZjFhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=2TAOizOnNPo',
    isFeatured: false,
    isSeries: false,
    seasonsCount: 1,
  },
  'escape and evasion': {
    cleanTitle: 'Escape and Evasion',
    narrator: 'Junior Giti',
    genre: 'Drama, War',
    releaseYear: 2025,
    description: 'Haunted by the memories of a bungled mission in Myanmar, a lone soldier returns to Australia to seek solace until he is confronted by an investigative journalist.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMjQzNTMxMDYyN15BMl5BanBnXkFtZTgwNzE0NTg3NzM@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=z8XyY1q4b-8',
    isFeatured: false,
    isSeries: false,
    seasonsCount: 1,
  },
  'a frozen flower': {
    cleanTitle: 'A Frozen Flower',
    narrator: 'PK',
    genre: 'Drama, Romance, History',
    releaseYear: 2026,
    description: "When Korea's king is unable to father a male heir, he tasks his military commander with the duty, sparking a turbulent emotional rivalry.",
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMDE1ZjcwMjAtNGM5ZC00NGExLWFiNzQtZjJhMzg4MWJmMDZhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=J3gP1bE_w3w',
    isFeatured: false,
    isSeries: false,
    seasonsCount: 1,
  },
  'law abiding citizen': {
    cleanTitle: 'Law Abiding Citizen',
    narrator: 'Rocky Kimomo',
    genre: 'Action, Crime, Thriller',
    releaseYear: 2026,
    description: 'Clyde Shelton is desperate to exact revenge on those who killed his family as well as the police officials who could not guarantee a proper jail term for the culprits.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=LX6kVRsdXW4',
    isFeatured: false,
    isSeries: false,
    seasonsCount: 1,
  },
  'doing life': {
    cleanTitle: 'Doing Life',
    narrator: 'Rocky',
    genre: 'Comedy, Romance',
    releaseYear: 2026,
    description: 'A lighthearted romantic comedy following an unexpected path to love.',
    imdbPoster: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=0hKqX6kP_9w',
    isFeatured: false,
    isSeries: false,
    seasonsCount: 1,
  },
};

function identifyGroup(title: string): string {
  const t = title.toLowerCase();
  for (const key of Object.keys(SERIES_METADATA)) {
    if (t.includes(key)) return key;
  }
  return t;
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

async function groupAndImport() {
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

  console.log('\n🧹 Step 2: Purging old movies table...');
  await prisma.movie.deleteMany({});
  console.log('✅ Cleared old database records.');

  console.log('\n📖 Step 3: Reading movies.csv and grouping series...');
  const csvPath = path.join(process.cwd(), 'movies.csv');
  const rawCsv = fs.readFileSync(csvPath, 'utf8');
  const lines = rawCsv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = lines.slice(1);

  // Group rows by master series / film key
  const groups = new Map<string, RawRow[]>();

  for (const row of rows) {
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(row)) !== null) {
      let val = match[1];
      if (val === undefined) break;
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      matches.push(val.trim());
      if (regex.lastIndex >= row.length) break;
    }

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

    const groupKey = identifyGroup(title);
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }

    groups.get(groupKey)!.push({
      title,
      description,
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

  console.log(`📦 Grouped ${rows.length} raw episode rows into ${groups.size} unified titles!`);

  let masterCount = 0;
  for (const [groupKey, items] of groups.entries()) {
    const meta = SERIES_METADATA[groupKey] || {
      cleanTitle: items[0].title,
      narrator: items[0].narrator || 'Rocky Kimomo',
      genre: items[0].genre || 'Drama',
      releaseYear: items[0].releaseYear || 2024,
      description: items[0].description || 'Experience this great title translated into Kinyarwanda.',
      imdbPoster: items[0].thumbnailUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000',
      backdrop: items[0].backdrop || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600',
      trailer: items[0].trailer || 'https://www.youtube.com/watch?v=qEVUtrk8_B4',
      isFeatured: items[0].isFeatured,
      isSeries: items.length > 1,
      seasonsCount: 1,
    };

    const isSeries = meta.isSeries || items.length > 1;

    // Build episodes array
    let maxSeason = meta.seasonsCount || 1;
    const episodes = items.map((item, idx) => {
      const sNum = parseSeasonNumber(item.title);
      if (sNum > maxSeason) maxSeason = sNum;
      const epNum = parseEpisodeNumber(item.title, idx);
      const epDurationMinutes = Math.round(item.duration / 60);

      return {
        id: `ep-${idx + 1}`,
        episodeNumber: epNum,
        seasonNumber: sNum,
        title: item.title,
        duration: `${epDurationMinutes}m`,
        description: item.description || meta.description,
        thumbnail: item.thumbnailUrl || meta.imdbPoster,
        videoUrl: item.fileUrl,
        directStreamUrl: item.fileUrl,
        downloadUrl: item.fileUrl,
        quality: '1080p FHD',
        narrator: item.narrator || meta.narrator,
      };
    });

    const slug = meta.cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const totalViews = items.reduce((acc, it) => acc + (it.views || 4500), 0) + 12000;
    const totalDownloads = Math.round(totalViews / 3.4);
    const avgDuration = items.length > 0 ? items[0].duration : 3600;

    await prisma.movie.create({
      data: {
        title: meta.cleanTitle,
        slug,
        description: meta.description,
        synopsis: meta.description,
        narrator: meta.narrator,
        genre: meta.genre,
        duration: avgDuration,
        releaseYear: meta.releaseYear,
        fileUrl: items[0].fileUrl,
        thumbnailUrl: meta.imdbPoster,
        poster: meta.imdbPoster,
        backdrop: meta.backdrop,
        trailer: meta.trailer,
        resolutions: {
          seasonsCount: maxSeason,
          episodesCount: episodes.length,
          episodes,
        },
        views: totalViews,
        viewCount: totalViews,
        downloads: totalDownloads,
        downloadCount: totalDownloads,
        rating: 8.8 + ((masterCount % 10) * 0.1),
        ratingCount: Math.round(totalViews / 35),
        isFeatured: meta.isFeatured,
        isActive: true,
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - masterCount * 3600000 * 2),
        uploaderId: uploader.id,
      },
    });

    masterCount++;
    console.log(`✅ [${masterCount}/${groups.size}] Created "${meta.cleanTitle}" with ${episodes.length} episodes (${meta.narrator})`);
  }

  console.log(`\n🎉 DONE! Created ${masterCount} unified movies & series with full episode lists!`);
  await prisma.$disconnect();
}

groupAndImport().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
