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
    description: 'The legendary Korean epic chronicling prince Ju Mong, who rises through betrayal and mythic battles to unite divided tribes and found the empire of Goguryeo. All 79 episodes translated into Kinyarwanda by Master P.',
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
    genre: 'Drama, Thriller, Crime',
    releaseYear: 2015,
    description: "Naively framed for corporate fraud by her lover, innocent accountant Macarena Ferreiro is thrown into Cruz del Sur high-security women's prison, forced to fight for survival among dangerous inmates.",
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BYzA4YzM5MDQtYzU1OS00MGYxLTlhMzQtNTFmZDIzYzU2N2EyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=6rWp-R1i_bM',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 4,
  },
  'the polygamist': {
    cleanTitle: 'The Polygamist',
    narrator: 'Junior Giti',
    genre: 'Drama, Romance',
    releaseYear: 2026,
    description: 'A complex web of traditional expectations, jealousy, and fierce ambition ensues when a wealthy patriarch balances multiple households under one roof. All 22 episodes with full Kinyarwanda narration by Junior Giti.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTgyMTktOGVjNS00MjA5LWFmOGYtMDNkZWY5YjIxMTAxXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=kY3B19J8m9M',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 1,
  },
  'one piece': {
    cleanTitle: 'One Piece',
    narrator: 'Junior Giti',
    genre: 'Action, Adventure, Fantasy',
    releaseYear: 2023,
    description: 'With his straw hat and ragtag crew, young pirate Monkey D. Luffy sets out across the perilous oceans on an epic voyage for treasure in this acclaimed live-action adaptation.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMTY5MjY0ZGMtYjVkNi00NmExLTgxYTAtODQ4OTkyOWY0MDQ2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=Ades3pQbeh8',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 2,
  },
  'vikings: valhalla': {
    cleanTitle: 'Vikings: Valhalla',
    narrator: 'Rocky Kimomo',
    genre: 'Action, Drama, History',
    releaseYear: 2024,
    description: 'Follow the legendary adventures of some of the most famous Vikings who ever lived: Leif Eriksson, Freydis Eriksdotter, and Harald Sigurdsson, as they blaze new paths in an ever-changing Europe.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BYzA0NGQ3YmYtYzBhNi00ZDVhLWEwMDAtMWY0MmEyOTY3MWNlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=Yi4Ynwft7Gg',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 3,
  },
  'my country: the new age': {
    cleanTitle: 'My Country: The New Age',
    narrator: 'Junior Giti',
    genre: 'Action, Drama, History',
    releaseYear: 2019,
    description: 'Set during the end of the Goryeo period and into the early Joseon period, two childhood friends turn enemies after a misunderstanding forces them to raise swords against one another.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BNTBmYzcyMGYtYmExYS00ZDVjLWE5MTctNjQ2Yzg5ZTU2NGQzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=R9Yl6oYk91w',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 1,
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
    seasonsCount: 4,
  },
  'six': {
    cleanTitle: 'Six',
    narrator: 'Rocky Kimomo',
    genre: 'Action, Drama, War',
    releaseYear: 2017,
    description: 'Members of Navy SEAL Team Six attempt to eliminate a Taliban leader in Afghanistan when they discover an American citizen working with the enemy.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMjAzMjA3MDI0NF5BMl5BanBnXkFtZTgwNTcyNDc5MDI@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=F0fR90W39Yw',
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
    seasonsCount: 1,
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
  'teach lesson': {
    cleanTitle: 'Teach Lesson',
    narrator: 'Rocky Kimomo',
    genre: 'Drama',
    releaseYear: 2026,
    description: 'A high-stakes campus drama exploring discipline, forbidden romance, and life lessons that unravel the lives of students and their devoted mentors.',
    imdbPoster: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=kY3B19J8m9M',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 1,
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
    imdbPoster: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=Z_K7mK1JpQw',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'treadstone': {
    cleanTitle: 'Treadstone',
    narrator: 'Rocky Kimomo',
    genre: 'Action, Thriller',
    releaseYear: 2019,
    description: 'The Treadstone project is a covert CIA black ops program that turns recruits into nearly superhuman assassins using behavior-modification protocol.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMDFkOTljMzctMTZiOC00N2EzLWFkMTEtZmI4OGIzNDcyY2Q3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=jX8iR9Jv_5w',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'salakaar': {
    cleanTitle: 'Salakaar',
    narrator: 'Genius',
    genre: 'Thriller, Action',
    releaseYear: 2026,
    description: 'A sharp, deceptive mind game where strategists and operators maneuver behind the shadows in a world of high-stakes intelligence.',
    imdbPoster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=mZ7kX2_7j8E',
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
  'avatar: the way of water': {
    cleanTitle: 'Avatar: The Way of Water',
    narrator: 'Gaheza Simba',
    genre: 'Action, Adventure, Fantasy',
    releaseYear: 2022,
    description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 1,
  },
  'knights of the zodiac': {
    cleanTitle: 'Knights of the Zodiac',
    narrator: 'Gaheza Simba',
    genre: 'Action, Adventure, Fantasy',
    releaseYear: 2023,
    description: 'When a goddess of war reincarnates in the body of a young girl, street orphan Seiya discovers that he is destined to protect her and save the world.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/qW4crfED8mpNDadSmMdi7Spzh9X.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=k3R8g_8d9_w',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'day shift': {
    cleanTitle: 'Day Shift',
    narrator: 'Gaheza Simba',
    genre: 'Action, Comedy, Fantasy',
    releaseYear: 2022,
    description: 'A hard-working, blue-collar dad just wants to provide a good life for his quick-witted 10-year-old daughter, using a pool cleaning job as a front for his real work: hunting vampires.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/9eAnMtqvzJ7YCE4eaCGfsa0E296.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=GN_ZwB14JGs',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'world war z': {
    cleanTitle: 'World War Z',
    narrator: 'Gaheza Simba',
    genre: 'Action, Adventure, Sci-Fi',
    releaseYear: 2013,
    description: 'Former United Nations employee Gerry Lane traverses the world in a race against time to stop a zombie pandemic that is toppling armies and governments and threatening to destroy humanity itself.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/1SWBflCgnNDVwLKm4fHnFj8V87F.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=Md6Dvxdr0AQ',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'kal ho naa ho': {
    cleanTitle: 'Kal Ho Naa Ho',
    narrator: 'Junior Giti',
    genre: 'Comedy, Drama, Musical, Romance',
    releaseYear: 2003,
    description: "Naina, an introverted, depressed girl's life changes when she meets Aman. But Aman has a secret of his own which changes their lives forever.",
    imdbPoster: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=Gk7c39W2Ekw',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'kuch kuch hota hai': {
    cleanTitle: 'Kuch Kuch Hota Hai',
    narrator: 'Junior Giti',
    genre: 'Comedy, Drama, Musical, Romance',
    releaseYear: 1998,
    description: "During their college years, Anjali was in love with her best-friend Rahul, but he had eyes only for Tina. Years later, Rahul's daughter attempts to reunite her father and Anjali.",
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMjExYjhhMTMtNDY1Ny00OWVmLTk3NDgtMWZkZmEzNjFmY2YxXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=0hKqX6kP_9w',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'bad genius': {
    cleanTitle: 'Bad Genius',
    narrator: 'Junior Giti',
    genre: 'Comedy, Crime, Drama, Thriller',
    releaseYear: 2017,
    description: 'Lynn, a genius high school student who makes money cheating on tests, receives a new task that leads her to Sydney, Australia to stage an international exam heist.',
    imdbPoster: 'https://m.media-amazon.com/images/M/MV5BMGMyOWMwZTUtMzg0YS00YWI3LWE5MDgtYzFkYjExMDYxOGExXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=Cl3g140oGqM',
    isFeatured: false,
    isSeries: true,
    seasonsCount: 1,
  },
  'nobody': {
    cleanTitle: 'Nobody',
    narrator: 'Junior Giti',
    genre: 'Action, Crime, Thriller',
    releaseYear: 2021,
    description: 'A docile family man slowly reveals his true character after his house is burgled by two petty thieves, which leads him into a bloody war with a Russian crime boss.',
    imdbPoster: 'https://image.tmdb.org/t/p/w500/oBgWY00bEFeZ9N25wWVyuQddbBc.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=wZti8UjW15U',
    isFeatured: true,
    isSeries: true,
    seasonsCount: 1,
  },
  'ready or not': {
    cleanTitle: 'Ready or Not',
    narrator: 'Gaheza Simba',
    genre: 'Action, Comedy, Horror',
    releaseYear: 2019,
    description: "A bride's wedding night takes a sinister turn when her eccentric, new in-laws force her to take part in a terrifying game.",
    imdbPoster: 'https://image.tmdb.org/t/p/w500/vOl6LmNu2ocZhYuIAOh93DNqh9o.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=zRmsvJ_iO0s',
    isFeatured: false,
    isSeries: true,
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
    isSeries: true,
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
    isSeries: true,
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
    isSeries: true,
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
    imdbPoster: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop',
    trailer: 'https://www.youtube.com/watch?v=qf4kZqX6VdI',
    isFeatured: true,
    isSeries: false,
    seasonsCount: 1,
  },
};

function identifyGroup(title: string): string {
  const t = title.toLowerCase();
  for (const key of Object.keys(SERIES_METADATA)) {
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
  console.log('✅ Admin confirmed:', uploader.email);

  console.log('\n🧹 Step 2: Purging old movies table...');
  await prisma.movie.deleteMany({});
  console.log('✅ Cleared old database records.');

  console.log('\n📖 Step 3: Reading movies.csv and grouping series...');
  const csvPath = path.join(process.cwd(), 'movies.csv');
  const rawCsv = fs.readFileSync(csvPath, 'utf8');
  const lines = rawCsv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = lines.slice(1);

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
  const usedSlugs = new Set<string>();

  for (const [groupKey, items] of groups.entries()) {
    const definedMeta = SERIES_METADATA[groupKey];
    const firstItem = items[0];

    // Compute clean title
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

    const narrator = definedMeta?.narrator || firstItem.narrator || 'Rocky Kimomo';
    const genre = definedMeta?.genre || firstItem.genre || 'Action, Drama';
    const releaseYear = definedMeta?.releaseYear || firstItem.releaseYear || 2024;
    const description =
      definedMeta?.description ||
      firstItem.description ||
      `Watch ${computedTitle} translated with authentic Kinyarwanda narration by ${narrator}. Stream in crystal clear HD or download directly.`;

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
    const isFeatured = definedMeta?.isFeatured ?? (masterCount < 4 || firstItem.isFeatured);
    const isSeries = (definedMeta?.isSeries ?? false) || items.length > 1;

    // Calculate max season
    let maxSeason = definedMeta?.seasonsCount || 1;
    for (const it of items) {
      const sNum = parseSeasonNumber(it.title);
      if (sNum > maxSeason) maxSeason = sNum;
    }

    // Build episodes
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
        rating: 8.8 + ((masterCount % 10) * 0.1),
        ratingCount: Math.round(totalViews / 35),
        isFeatured,
        isActive: true,
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - masterCount * 3600000 * 2),
        uploaderId: uploader.id,
      },
    });

    masterCount++;
    console.log(
      `✅ [${masterCount}/${groups.size}] Created "${computedTitle}" with ${episodes.length} episodes/parts (${narrator})`
    );
  }

  console.log(`\n🎉 DONE! Created ${masterCount} unified movies & series in Neon DB!`);
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
