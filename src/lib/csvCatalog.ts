import fs from 'fs';
import path from 'path';
import type { Movie, Episode } from './movieData';
import { sanitizeImage } from './catalogMap';

// Cache parsed catalog in memory
let cachedCatalog: Movie[] | null = null;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export function loadCsvCatalog(): Movie[] {
  if (cachedCatalog) return cachedCatalog;

  const csvPath = path.join(process.cwd(), 'movies.csv');
  if (!fs.existsSync(csvPath)) return [];

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.trim().split('\n');
  if (lines.length <= 1) return [];

  const seriesMap = new Map<string, {
    baseTitle: string;
    description: string;
    narrator: string;
    genre: string;
    releaseYear: number;
    poster: string;
    episodes: Episode[];
  }>();

  const singleMovies: Movie[] = [];
  let currentIdCounter = 1000;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const rawTitle = cols[0];
    if (!rawTitle) continue;

    const description = cols[1] || '';
    const narrator = cols[2] || 'Rocky Kimomo';
    const genre = cols[3] || 'Action';
    const durationSec = parseInt(cols[4], 10) || 3600;
    const releaseYear = parseInt(cols[5], 10) || 2024;
    const fileUrl = cols[6] || '';
    const rawThumb = cols[7] || '';

    // Check episodic: S01 Ep 01, Ep 1, Part A, Part 1, E01
    const isEpisodic = /(?:\s+S\d+\s+Ep\s*\d+|\s+Ep\s*\d+|\s+E\d+|\s*-\s*Part\s+[A-Za-z0-9]+)/i.test(rawTitle);

    if (isEpisodic) {
      const baseTitle = rawTitle
        .replace(/(?:\s+S\d+\s+Ep\s*\d+.*|\s+Ep\s*\d+.*|\s+E\d+.*|\s*-\s*Part\s+[A-Za-z0-9]+.*)/i, '')
        .trim();

      const epNumMatch = rawTitle.match(/(?:Ep\s*|E|Part\s+)(\d+|[A-Za-z])/i);
      let episodeNumber = 1;
      if (epNumMatch) {
        const val = epNumMatch[1];
        if (/^\d+$/.test(val)) {
          episodeNumber = parseInt(val, 10);
        } else {
          episodeNumber = val.toUpperCase().charCodeAt(0) - 64; // A -> 1, B -> 2
        }
      }

      const seasonMatch = rawTitle.match(/S(\d+)/i);
      const seasonNumber = seasonMatch ? parseInt(seasonMatch[1], 10) : 1;

      if (!seriesMap.has(baseTitle)) {
        seriesMap.set(baseTitle, {
          baseTitle,
          description,
          narrator,
          genre,
          releaseYear,
          poster: rawThumb,
          episodes: [],
        });
      }

      const group = seriesMap.get(baseTitle)!;
      if (!group.description && description) group.description = description;
      if (!group.poster && rawThumb) group.poster = rawThumb;

      const durationMins = Math.round(durationSec / 60);
      const durationStr = durationMins > 0 ? `${durationMins}m` : '45m';

      const episodeThumb = sanitizeImage(rawThumb, rawTitle, genre);

      group.episodes.push({
        id: `${baseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-s${seasonNumber}-e${episodeNumber}`,
        seasonNumber,
        episodeNumber,
        title: rawTitle,
        duration: durationStr,
        description: description || `Episode ${episodeNumber} of ${baseTitle}`,
        thumbnail: episodeThumb,
        directStreamUrl: fileUrl,
        downloadUrl: fileUrl,
        quality: '1080p FHD',
        narrator,
      });
    } else {
      currentIdCounter++;
      const durationMins = Math.round(durationSec / 60);
      const hours = Math.floor(durationMins / 60);
      const mins = durationMins % 60;
      const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

      const safePoster = sanitizeImage(rawThumb, rawTitle, genre);

      singleMovies.push({
        id: `csv-${currentIdCounter}`,
        title: rawTitle,
        year: releaseYear,
        genre,
        rating: 8.7,
        narrator,
        duration: durationStr,
        quality: '1080p FHD',
        fileSize: '1.45 GB',
        description,
        image: safePoster,
        backdrop: safePoster,
        trending: singleMovies.length < 10,
        directStreamUrl: fileUrl,
        contentType: 'movie',
      });
    }
  }

  // Convert series groups into Movie objects
  const seriesMovies: Movie[] = [];
  for (const [title, group] of seriesMap.entries()) {
    currentIdCounter++;
    group.episodes.sort((a, b) => {
      if (a.seasonNumber !== b.seasonNumber) return a.seasonNumber - b.seasonNumber;
      return a.episodeNumber - b.episodeNumber;
    });

    const safePoster = sanitizeImage(group.poster, title, group.genre);

    seriesMovies.push({
      id: `series-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title,
      year: group.releaseYear,
      genre: group.genre,
      rating: 8.9,
      narrator: group.narrator,
      duration: `Season 1 (${group.episodes.length} Eps)`,
      quality: '1080p FHD',
      fileSize: '5.2 GB',
      description: group.description || `Follow ${title} translated into Kinyarwanda by ${group.narrator}.`,
      image: safePoster,
      backdrop: safePoster,
      trending: seriesMovies.length < 12,
      contentType: 'series',
      seasonsCount: Math.max(...group.episodes.map(e => e.seasonNumber), 1),
      episodesCount: group.episodes.length,
      episodes: group.episodes,
      directStreamUrl: group.episodes[0]?.directStreamUrl || '',
    });
  }

  cachedCatalog = [...seriesMovies, ...singleMovies];
  return cachedCatalog;
}
