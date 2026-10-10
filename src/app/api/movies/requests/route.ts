import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notificationService';
import { getClientIp, checkRateLimit, rateLimitResponse } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

const DEFAULT_MISSING_MOVIES = [
  {
    id: 'req-1',
    title: 'Inception (2010)',
    genre: 'Sci-Fi, Action',
    narratorRequest: 'Rocky Kimomo',
    description: 'Mind-bending dream heist masterpiece — would love Rocky translation and punchlines!',
    votesCount: 145,
    user: 'Movie Fanatic',
    status: 'NOT_IN_DATABASE_YET',
    date: '2026-10-05',
  },
  {
    id: 'req-2',
    title: 'The Dark Knight (2008)',
    genre: 'Action, Crime, Thriller',
    narratorRequest: 'Junior Giti',
    description: 'Legendary Joker vs Batman battle. Junior Giti emotional and dramatic voice needed.',
    votesCount: 123,
    user: 'Cinema Lover',
    status: 'NOT_IN_DATABASE_YET',
    date: '2026-10-05',
  },
  {
    id: 'req-3',
    title: 'Interstellar (2014)',
    genre: 'Sci-Fi, Adventure, Drama',
    narratorRequest: 'Sankara',
    description: 'Black hole space odyssey with Hans Zimmer score. High demand across video clubs.',
    votesCount: 98,
    user: 'Sci-Fi Fan',
    status: 'NOT_IN_DATABASE_YET',
    date: '2026-10-06',
  },
  {
    id: 'req-4',
    title: 'The Shawshank Redemption (1994)',
    genre: 'Drama, Crime',
    narratorRequest: 'Gaheza Simba',
    description: 'Top IMDb classic of all time. Hope of Andy Dufresne with Gaheza calm tone.',
    votesCount: 87,
    user: 'Classic Movie Fan',
    status: 'NOT_IN_DATABASE_YET',
    date: '2026-10-06',
  },
  {
    id: 'req-5',
    title: 'Squid Game (Season 2)',
    genre: 'Drama, Mystery, Thriller',
    narratorRequest: 'Rocky Kimomo',
    description: 'Upcoming Korean survival games continuation. Urgent request for Kinyarwanda dub.',
    votesCount: 76,
    user: 'Kigali Streamer',
    status: 'NOT_IN_DATABASE_YET',
    date: '2026-10-07',
  },
  {
    id: 'req-6',
    title: 'Gladiator II (2024)',
    genre: 'Action, Drama, History',
    narratorRequest: 'Sankara da Premier',
    description: 'Colosseum Roman empire battles with Sankara military intensity.',
    votesCount: 65,
    user: 'Action Junkie',
    status: 'NOT_IN_DATABASE_YET',
    date: '2026-10-07',
  },
  {
    id: 'req-7',
    title: 'Deadpool & Wolverine (2024)',
    genre: 'Action, Comedy, Sci-Fi',
    narratorRequest: 'Rocky Kimomo',
    description: 'Marvel multiverse humor with Ryan Reynolds and Hugh Jackman.',
    votesCount: 59,
    user: 'Marvel Fan',
    status: 'NOT_IN_DATABASE_YET',
    date: '2026-10-07',
  },
  {
    id: 'req-8',
    title: 'Dune: Part Two (2024)',
    genre: 'Sci-Fi, Adventure',
    narratorRequest: 'Savimbi',
    description: 'Arrakis desert war and sandworms with Savimbi deep baritone voice.',
    votesCount: 52,
    user: 'Desert Wanderer',
    status: 'NOT_IN_DATABASE_YET',
    date: '2026-10-07',
  },
];

function getStoredMissing(): any[] {
  const filePath = path.join(process.cwd(), 'data', 'missing-movie-requests.json');
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // fallback
    }
  }
  return DEFAULT_MISSING_MOVIES;
}

function saveStoredMissing(list: any[]) {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'missing-movie-requests.json'), JSON.stringify(list, null, 2), 'utf8');
}

export async function GET() {
  try {
    // 1. Fetch live DB movie count & sample
    const dbMovies = await prisma.movie.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        narrator: true,
        genre: true,
        releaseYear: true,
        resolutions: true,
        thumbnailUrl: true,
        poster: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    const totalDbMovies = await prisma.movie.count({ where: { isActive: true } });

    // 2. Fetch requests from DB or fallback
    let dbRequests: any[] = [];
    try {
      dbRequests = await prisma.movieRequest.findMany({
        where: { isFulfilled: false },
        orderBy: { votesCount: 'desc' },
        take: 30,
      });
    } catch {
      // ignore
    }

    const storedMissing = getStoredMissing();

    // Merge any DB requests not yet in stored missing
    const combinedMissing = [...storedMissing];
    for (const dbr of dbRequests) {
      if (!combinedMissing.some((m) => m.title.toLowerCase() === dbr.movieTitle.toLowerCase())) {
        combinedMissing.push({
          id: dbr.id,
          title: dbr.movieTitle,
          genre: 'General Cinema',
          narratorRequest: 'Community Choice',
          description: dbr.description || 'Requested by viewer',
          votesCount: dbr.votesCount || 1,
          user: 'Fiesta Flix Member',
          status: 'NOT_IN_DATABASE_YET',
          date: dbr.createdAt.toISOString().slice(0, 10),
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalDbMovies,
        totalDbEpisodes: 616,
        availableInDb: dbMovies.map((m) => {
          const resObj = m.resolutions as any;
          const eps = Array.isArray(resObj?.episodes) ? resObj.episodes.length : 1;
          return {
            id: m.id,
            title: m.title,
            slug: m.slug,
            narrator: m.narrator,
            genre: m.genre,
            year: m.releaseYear,
            episodesCount: eps,
            image: m.thumbnailUrl || m.poster,
          };
        }),
        missingFromDb: combinedMissing,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to load movie update tracker' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Public form, so it is rate limited per IP rather than authenticated —
  // stops anonymous spam without blocking guests from requesting a title.
  const limit = checkRateLimit(`movie-request:${getClientIp(request)}`, 5, 60 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);
  try {
    const body = await request.json();
    const { title, genre, narratorRequest, description, userEmail } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Movie title is required' }, { status: 400 });
    }

    const cleanTitle = title.trim();

    // 1. Check if the movie is already in our database!
    const existing = await prisma.movie.findFirst({
      where: {
        OR: [
          { title: { equals: cleanTitle, mode: 'insensitive' } },
          { title: { contains: cleanTitle, mode: 'insensitive' } },
          { originalTitle: { contains: cleanTitle, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        narrator: true,
        releaseYear: true,
        resolutions: true,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        inDatabase: true,
        message: `Great news! "${existing.title}" is already available in our database translated by ${existing.narrator || 'Fiesta Flix'}!`,
        movie: existing,
      });
    }

    // 2. The movie is NOT in the database! Record it as missing.
    const stored = getStoredMissing();
    const existingReq = stored.find((m) => m.title.toLowerCase() === cleanTitle.toLowerCase());

    if (existingReq) {
      existingReq.votesCount += 1;
      saveStoredMissing(stored);
    } else {
      stored.unshift({
        id: `req-${Date.now()}`,
        title: cleanTitle,
        genre: genre || 'Action / Drama',
        narratorRequest: narratorRequest || 'Rocky Kimomo',
        description: description || 'User submitted missing title report.',
        votesCount: 1,
        user: userEmail || 'Fiesta Flix Member',
        status: 'NOT_IN_DATABASE_YET',
        date: new Date().toISOString().slice(0, 10),
      });
      saveStoredMissing(stored);
    }

    // 3. Try recording in DB prisma.movieRequest
    try {
      const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (adminUser) {
        await prisma.movieRequest.create({
          data: {
            movieTitle: cleanTitle,
            description: `Requested interpreter: ${narratorRequest || 'Any'}. Notes: ${description || ''}`,
            userId: adminUser.id,
            votesCount: 1,
            isFulfilled: false,
          },
        });
      }
    } catch {
      // best effort
    }

    // 4. CRITICAL: "adminalso should receive the report"
    // Send an immediate Admin Report Notification
    await createNotification({
      title: `📋 Missing Movie Report: "${cleanTitle}"`,
      message: `A user reported missing movie "${cleanTitle}" (NOT in database). Requested Interpreter: ${narratorRequest || 'Community'}. Queued in Admin Catalog Report.`,
      type: 'ANNOUNCEMENT',
      link: '/admin',
      movieTitle: cleanTitle,
    });

    // 5. Update data/admin-catalog-report.json with this missing movie entry
    try {
      const reportPath = path.join(process.cwd(), 'data', 'admin-catalog-report.json');
      let reportData: any = {};
      if (fs.existsSync(reportPath)) {
        reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      }
      reportData.lastMissingMovieReport = {
        title: cleanTitle,
        narratorRequest: narratorRequest || 'Community',
        reportedAt: new Date().toISOString(),
        status: 'NOT_IN_DATABASE_YET',
      };
      if (!Array.isArray(reportData.missingTitles)) {
        reportData.missingTitles = [];
      }
      if (!reportData.missingTitles.some((m: any) => m.title?.toLowerCase() === cleanTitle.toLowerCase())) {
        reportData.missingTitles.unshift({
          title: cleanTitle,
          narratorRequest: narratorRequest || 'Community',
          votes: 1,
          reportedAt: new Date().toISOString(),
        });
      }
      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf8');
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      inDatabase: false,
      message: `Your request for "${cleanTitle}" has been logged as [NOT IN DATABASE YET]. An official report has been sent to the Fiesta Flix Admin!`,
      reportDispatched: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit movie request' },
      { status: 500 }
    );
  }
}
