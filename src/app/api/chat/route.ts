import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';
import catalogFallback from '@/data/csvCatalog.json';

export const dynamic = 'force-dynamic';

interface DbSummary {
  totalCount: number;
  sampleMovies: { id: string; title: string; narrator: string; genre: string; rating: number }[];
  rwandanMovies: { id: string; title: string; narrator: string }[];
  topNarrators: string[];
}

let cachedSummary: DbSummary | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

async function getDatabaseSummary(): Promise<DbSummary> {
  const now = Date.now();
  if (cachedSummary && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedSummary;
  }

  try {
    const totalCount = await prisma.movie.count({ where: { isActive: true } });
    const movies = await prisma.movie.findMany({
      where: { isActive: true },
      select: { id: true, title: true, narrator: true, genre: true, rating: true },
      take: 80,
      orderBy: { rating: 'desc' },
    });

    const rwandan = movies.filter(
      (m) =>
        (m.genre && m.genre.toLowerCase().includes('nyarwanda')) ||
        (m.narrator && m.narrator.toLowerCase().includes('rwandan')) ||
        ['seburikoko', 'bamenya', 'city maid', 'papa sava', 'rwasa', 'ikigeragezo'].some((k) =>
          m.title.toLowerCase().includes(k)
        )
    );

    const narratorCounts = new Map<string, number>();
    for (const m of movies) {
      if (m.narrator) {
        narratorCounts.set(m.narrator, (narratorCounts.get(m.narrator) || 0) + 1);
      }
    }
    const topNarrators = Array.from(narratorCounts.keys()).slice(0, 8);

    cachedSummary = {
      totalCount: totalCount || movies.length,
      sampleMovies: movies.map((m) => ({
        id: m.id,
        title: m.title,
        narrator: m.narrator || 'Rocky Kimomo',
        genre: m.genre || 'Action',
        rating: Number(m.rating) || 8.5,
      })),
      rwandanMovies: rwandan.map((m) => ({
        id: m.id,
        title: m.title,
        narrator: m.narrator || 'Original Rwandan Cast',
      })),
      topNarrators: topNarrators.length > 0 ? topNarrators : ['Rocky Kimomo', 'Junior Giti', 'Savimbi', 'Sankara'],
    };
    lastCacheTime = now;
    return cachedSummary;
  } catch (err) {
    console.warn('[api/chat] Failed querying database summary, using static fallback:', err);
    const fallbackList = (catalogFallback as any[]).slice(0, 50);
    return {
      totalCount: catalogFallback.length || 222,
      sampleMovies: fallbackList.map((m) => ({
        id: String(m.id),
        title: m.title,
        narrator: m.narrator || 'Rocky Kimomo',
        genre: m.genre || 'Action',
        rating: Number(m.rating) || 8.5,
      })),
      rwandanMovies: [
        { id: '101', title: 'Ikigeragezo cy\'Ubuzima', narrator: 'Original Rwandan Cast' },
        { id: '102', title: 'Seburikoko', narrator: 'Gratien Niyitegeka' },
        { id: '103', title: 'Bamenya Series', narrator: 'Denis Nsanzamahoro' },
        { id: '104', title: 'City Maid', narrator: 'Laura Musanase' },
        { id: '105', title: 'Papa Sava', narrator: 'Gratien Niyitegeka' },
      ],
      topNarrators: ['Rocky Kimomo', 'Junior Giti', 'Savimbi', 'Sankara', 'Dylan', 'PK', 'Yanga', 'Gaheza'],
    };
  }
}

function buildSystemInstruction(summary: DbSummary): string {
  return `
You are Fiesta Bot, the friendly AI movie concierge and comprehensive guide for "Fiesta Flix" — the premier Rwandan streaming platform for movies and series with authentic Kinyarwanda narration (Agasobanuye) and original Rwandan Cinema.

Platform Database & Catalog:
- Over ${summary.totalCount} active movies and TV series in the database.
- Key Interpreters on Fiesta Flix:
  * Rocky Kimomo (High-octane Action, Thrillers, Sci-Fi)
  * Junior Giti (Comedy, Laughs, Crime, Drama)
  * Savimbi (Adventure, Martial Arts, Horror)
  * Sankara da Premier (Action, Cyberpunk, Documentaries)
  * Dylan Kabaka (Romance, Drama)
  * PK (Sci-Fi, High Concept)
  * Yanga (Legends, Fantasy)
  * Gaheza (Drama, Nature)
- Authentic Rwandan Cinema (Filime Nyarwanda):
  * Seburikoko, Bamenya Series, City Maid, Papa Sava, Rwasa, Ikigeragezo cy'Ubuzima, Intore, Karahanyuze.
- Sample Available Titles:
${summary.sampleMovies.slice(0, 30).map((m) => `- "${m.title}" (${m.genre}, Narrated by: ${m.narrator}, Rating: ${m.rating}★, Link: /movies/${m.id})`).join('\n')}

Core Platform Features You Must Guide Users On:
1. Streaming Video:
   - Built-in cinematic player supports crystal-clear 1080p FHD and adaptive 4K UHD streaming.
   - Works with MediaFire files, YouTube video streams, and direct high-speed video URLs.
   - Built-in data saver mode: can stream smoothly on mobile networks.
2. Download Options:
   - High-speed Telegram Channel: https://t.me/fiestaflix_movies (0 ads, maximum speed, resumable).
   - Telegram Bot: https://t.me/FiestaFlixBot (get movie files directly in chat).
   - Direct downloads and MediaFire 1-click download links right on the movie page.
   - YouTube video tools for Rwandan cinema and trailers.
3. Web App Sections:
   - Home (/): Trending releases, top interpreters, Rwandan cinema banner, popular series, data saver.
   - Rwandan Movies (/rwandan-movies): Dedicated hub for original Rwandan productions, series, and short films.
   - Interpreters (/interpreters): Bios, follower counts, and dedicated catalogs for all 8+ Agasobanuye masters.
   - Genres (/genre/action, /genre/comedy, etc.): Filter by your favorite category.
   - Search (/search): Instant keyword search across all ${summary.totalCount} titles in the database.
   - Admin Dashboard (/admin): Catalog management, upload new movies, YouTube streaming links for Rwandan films, ads management.
   - User Profile & Favorites: Tap the heart icon on any movie to save to your personal watchlist.

Tone & Instructions:
- Polite, energetic, cinematic, and welcoming.
- Greet with warm Kinyarwanda touches when natural (e.g. "Muraho!", "Karibu kuri Fiesta Flix!", "Bite se!").
- Format answers clearly with emojis, bullet points, and clean markdown.
- When recommending a movie, ALWAYS link it using markdown: [Movie Title](/movies/{id}).
`;
}

async function getLocalFallbackResponse(query: string, summary: DbSummary): Promise<string> {
  const lower = query.toLowerCase();

  // 1. Rocky Kimomo
  if (lower.includes('rocky') || lower.includes('kimomo')) {
    const rockyMovies = summary.sampleMovies.filter((m) => m.narrator.toLowerCase().includes('rocky')).slice(0, 5);
    return (
      `🎬 **Rocky Kimomo Action & Thrillers on Fiesta Flix**:\n\n` +
      rockyMovies.map((m) => `• [${m.title}](/movies/${m.id}) (${m.genre} • ${m.rating}★)`).join('\n') +
      `\n\n⚡ **How to watch**: Tap any title above to stream in 1080p FHD, or download with 0 ads via our [Telegram Channel](https://t.me/fiestaflix_movies)!`
    );
  }

  // 2. Junior Giti
  if (lower.includes('junior') || lower.includes('giti')) {
    const gitiMovies = summary.sampleMovies.filter((m) => m.narrator.toLowerCase().includes('junior')).slice(0, 5);
    return (
      `😂 **Junior Giti Comedy & Drama on Fiesta Flix**:\n\n` +
      gitiMovies.map((m) => `• [${m.title}](/movies/${m.id}) (${m.genre} • ${m.rating}★)`).join('\n') +
      `\n\n⚡ **Stream or Download**: Unbeatable humor and witty punchlines! Stream now or download via our [Telegram Bot](https://t.me/FiestaFlixBot).`
    );
  }

  // 3. Rwandan Movies
  if (lower.includes('rwanda') || lower.includes('nyarwanda') || lower.includes('kigali') || lower.includes('seburikoko') || lower.includes('bamenya')) {
    return (
      `🇷🇼 **Top Rwandan Cinema (Filime Nyarwanda)**:\n\n` +
      `• **Seburikoko** - Iconic family comedy with Gratien & Siperansiya\n` +
      `• **Bamenya Series** - Drama & life in Kigali starring Denis Nsanzamahoro\n` +
      `• **City Maid** - The beloved journey of Nikuze in Kigali\n` +
      `• **Papa Sava** - Pure comedy and daily laughs\n` +
      `• **Rwasa** - Classic Rwandan action and courage\n\n` +
      `👉 Explore our full collection on the [Rwanda Cinema Page](/rwandan-movies)! Admins also provide direct YouTube streaming and fast downloads.`
    );
  }

  // 4. Downloading / Telegram / MediaFire
  if (lower.includes('download') || lower.includes('telegram') || lower.includes('save') || lower.includes('offline') || lower.includes('mediafire')) {
    return (
      `⚡ **How to Download Movies on Fiesta Flix**:\n\n` +
      `1. **Official Telegram Channel**: Join [t.me/fiestaflix_movies](https://t.me/fiestaflix_movies) for 1-click full HD downloads at maximum network speed with zero ads.\n` +
      `2. **Telegram Bot**: Start [t.me/FiestaFlixBot](https://t.me/FiestaFlixBot) to receive direct files in your chat.\n` +
      `3. **MediaFire & Direct Downloads**: Each movie page includes a high-speed download hub for 1080p and 720p files.\n` +
      `4. **Data Saver**: You can choose smaller video sizes (480p) to conserve your mobile data bundle!`
    );
  }

  // 5. How to stream / Video player
  if (lower.includes('stream') || lower.includes('watch') || lower.includes('player') || lower.includes('quality') || lower.includes('4k')) {
    return (
      `🎥 **Streaming on Fiesta Flix**:\n\n` +
      `• **Adaptive Player**: Automatically adjusts between 4K UHD, 1080p FHD, 720p HD, and 480p Data Saver depending on your connection speed.\n` +
      `• **MediaFire & YouTube**: We stream MediaFire files and YouTube videos thoroughly with full playback controls, fullscreen mode, and volume controls.\n` +
      `• **Watchlist**: Tap the heart icon ❤️ on any movie to save it to your personal favorites!`
    );
  }

  // 6. Search database query
  try {
    const searchWords = lower.replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).filter((w) => w.length > 2);
    if (searchWords.length > 0) {
      const dbMatches = await prisma.movie.findMany({
        where: {
          isActive: true,
          OR: searchWords.map((w) => ({
            title: { contains: w, mode: 'insensitive' },
          })),
        },
        select: { id: true, title: true, genre: true, narrator: true, rating: true },
        take: 4,
      });

      if (dbMatches.length > 0) {
        return (
          `🔍 **Found in our database matching "${query}"**:\n\n` +
          dbMatches.map((m) => `• [${m.title}](/movies/${m.id}) (${m.genre || 'Action'}, ${m.narrator || 'Rocky'} • ${m.rating}★)`).join('\n') +
          `\n\nTap any title to watch or download immediately! Or explore more in [Search](/search).`
        );
      }
    }
  } catch {
    // Ignore db search error
  }

  // Default welcome & guide
  const top = summary.sampleMovies.slice(0, 3);
  return (
    `Muraho! 👋 I am **Fiesta Bot**, your guide to **${summary.totalCount} movies and series** on Fiesta Flix.\n\n` +
    `🔥 **Trending Right Now**:\n` +
    top.map((m) => `• [${m.title}](/movies/${m.id}) (${m.narrator} • ${m.rating}★)`).join('\n') +
    `\n\nI can help you find movies by **Rocky Kimomo**, **Junior Giti**, or **Sankara**, explore [Rwanda Cinema](/rwandan-movies), stream in 4K, or download via our [Telegram Channel](https://t.me/fiestaflix_movies). What would you like to watch today?`
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const summary = await getDatabaseSummary();
    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is available, call Gemini
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const contents: any[] = [];
        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.content }],
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: buildSystemInstruction(summary),
            temperature: 0.7,
            topP: 0.95,
          },
        });

        const reply = response.text || (await getLocalFallbackResponse(message, summary));
        return NextResponse.json({ reply });
      } catch (err) {
        console.warn('Gemini API call failed, using live database concierge fallback:', err);
        const reply = await getLocalFallbackResponse(message, summary);
        return NextResponse.json({ reply });
      }
    }

    // Direct live database concierge response
    const reply = await getLocalFallbackResponse(message, summary);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
