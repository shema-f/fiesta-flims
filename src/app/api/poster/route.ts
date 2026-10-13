import type { NextRequest } from 'next/server';

/**
 * Generated poster fallback — GET /api/poster?title=Umurabyo&year=1989&genre=Drama
 *
 * 85 Rwandan catalogue titles (Umurabyo, Munyurangabo, Sometimes in April, …)
 * have no key art anywhere in the database or the bundled data, so every card
 * used to render the identical Fiesta Flix placeholder. This draws a distinct,
 * deterministic 2:3 poster per title instead: a stable hue derived from the
 * title, the film's own name, its year and genre. No fabrication — the art is
 * generated from metadata the catalogue actually has.
 *
 * Served as SVG and cached hard, since a given title always draws the same
 * poster.
 */

function hashHue(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) % 360;
  }
  return hash;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Wrap a title into at most `maxLines` lines of roughly `perLine` characters. */
function wrapTitle(title: string, perLine: number, maxLines: number): string[] {
  const words = title.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > perLine && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = candidate;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = `${last.slice(0, Math.max(0, perLine - 1)).trimEnd()}…`;
  }
  return lines;
}

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = (params.get('title') || 'Fiesta Flix').trim().slice(0, 80);
  const year = (params.get('year') || '').trim().slice(0, 4);
  const genre = (params.get('genre') || '').trim().slice(0, 40);

  const hue = hashHue(title.toLowerCase());
  const lines = wrapTitle(title, 16, 4);
  const lineHeight = 52;
  const blockHeight = lines.length * lineHeight;
  // Centre the title block optically a little above the middle of the poster.
  const startY = 750 * 0.46 - blockHeight / 2 + 40;

  const safeTitle = escapeXml(title);
  const text = lines
    .map(
      (line, i) =>
        `<text x="250" y="${startY + i * lineHeight}" text-anchor="middle" fill="#fff" ` +
        `font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" ` +
        `font-size="40" font-weight="800">${escapeXml(line)}</text>`
    )
    .join('');

  const meta = [year, genre.split(',')[0]].filter(Boolean).map(escapeXml).join(' · ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750" role="img" aria-label="${safeTitle}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue}, 62%, 26%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 40) % 360}, 68%, 12%)"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.35" r="0.75">
      <stop offset="0%" stop-color="hsl(${hue}, 80%, 55%)" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="hsl(${hue}, 80%, 55%)" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="500" height="750" fill="url(#bg)"/>
  <rect width="500" height="750" fill="url(#glow)"/>
  <rect x="0" y="0" width="500" height="750" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
  <text x="250" y="${startY - 84}" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" font-weight="700" letter-spacing="6">FIESTA FLIX</text>
  ${text}
  ${meta ? `<text x="250" y="${startY + blockHeight + 46}" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-family="ui-sans-serif, system-ui, sans-serif" font-size="24" font-weight="600">${meta}</text>` : ''}
  <rect x="180" y="672" width="140" height="6" rx="3" fill="hsl(${hue}, 85%, 62%)"/>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
