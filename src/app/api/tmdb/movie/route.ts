import { NextRequest, NextResponse } from 'next/server';
import { TMDB_CAST_REGISTRY, getMovieCast, type CastMember } from '@/lib/movieCastData';

export const dynamic = 'force-dynamic';

const TMDB_READ_TOKEN =
  process.env.TMDB_API_READ_ACCESS_TOKEN ||
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjOTEwYjYwNWMyMDY1N2E4ZmVkNjZkYjlkNGZkN2JiMSIsIm5iZiI6MTc5MTMwNDU3NC40ODMsInN1YiI6IjZhYzUyMzdlM2FmMWFmZTkxOTY0ZWFlZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.akLVtZt2JNVL9jttWkzkP4uSvs5NXpPBe6SY5maHlZ4';

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'c910b605c20657a8fed66db9d4fd7bb1';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title')?.trim();

  if (!title) {
    return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
  }

  // Check local registry first
  const cleanTitle = title.toLowerCase().trim();
  let curatedCast: CastMember[] | null = null;
  for (const [key, castList] of Object.entries(TMDB_CAST_REGISTRY)) {
    if (cleanTitle.includes(key)) {
      curatedCast = castList;
      break;
    }
  }

  // Attempt live TMDB API query
  try {
    const searchUrl = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
      title
    )}&include_adult=false&language=en-US&page=1`;

    let searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${TMDB_READ_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 86400 },
    });

    // Fallback to query param API key if bearer header fails
    if (!searchRes.ok && TMDB_API_KEY) {
      searchRes = await fetch(`${searchUrl}&api_key=${encodeURIComponent(TMDB_API_KEY)}`, {
        next: { revalidate: 86400 },
      });
    }

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const results = (searchData.results || []).filter(
        (r: any) => r.media_type === 'movie' || r.media_type === 'tv'
      );

      if (results.length > 0) {
        const best = results[0];
        const mediaType = best.media_type === 'tv' ? 'tv' : 'movie';
        const tmdbId = best.id;

        // Fetch credits
        let creditsRes = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/credits?language=en-US`,
          {
            headers: { Authorization: `Bearer ${TMDB_READ_TOKEN}` },
            next: { revalidate: 86400 },
          }
        );

        if (!creditsRes.ok && TMDB_API_KEY) {
          creditsRes = await fetch(
            `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/credits?api_key=${encodeURIComponent(TMDB_API_KEY)}&language=en-US`,
            { next: { revalidate: 86400 } }
          );
        }

        let liveCast: CastMember[] = [];
        if (creditsRes.ok) {
          const creditsData = await creditsRes.json();
          liveCast = (creditsData.cast || [])
            .slice(0, 12)
            .map((c: any, index: number) => ({
              id: c.id,
              name: c.name,
              character: c.character || 'Supporting Role',
              profileUrl: c.profile_path
                ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
              order: c.order !== undefined ? c.order : index,
            }));
        }

        const posterUrl = best.poster_path
          ? `https://image.tmdb.org/t/p/w500${best.poster_path}`
          : null;
        const backdropUrl = best.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${best.backdrop_path}`
          : null;

        const finalCast = curatedCast || (liveCast.length > 0 ? liveCast : getMovieCast(title));

        return NextResponse.json({
          success: true,
          source: curatedCast ? 'curated_plus_tmdb' : 'tmdb_live',
          tmdbId,
          mediaType,
          title: best.title || best.name,
          poster: posterUrl,
          backdrop: backdropUrl,
          overview: best.overview,
          voteAverage: best.vote_average,
          releaseYear: best.release_date
            ? parseInt(best.release_date.split('-')[0], 10)
            : best.first_air_date
            ? parseInt(best.first_air_date.split('-')[0], 10)
            : undefined,
          cast: finalCast,
        });
      }
    }
  } catch (err) {
    console.warn('[api/tmdb/movie] TMDB lookup error:', err);
  }

  // If TMDB lookup had no hits or failed, check if we have curated registry or fallback
  if (curatedCast) {
    return NextResponse.json({
      success: true,
      source: 'curated_registry',
      cast: curatedCast,
    });
  }

  // Fallback to high-fidelity deterministic cast
  return NextResponse.json({
    success: true,
    source: 'fallback',
    cast: getMovieCast(title),
  });
}
