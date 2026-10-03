import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { movieData } from '@/lib/movieData';

const SYSTEM_INSTRUCTION = `
You are Fiesta Bot, the friendly AI movie concierge and streaming guide for "Fiesta Flix" — the premier streaming platform for movies and series with authentic Kinyarwanda narration (Agasobanuye).

Key Platform Details:
- Famous Rwandan Interpreters on Fiesta Flix:
  * Rocky Kimomo (Action, Thriller, Sci-Fi)
  * Junior Giti (Comedy, Thriller, Crime)
  * Savimbi (Adventure, Horror, Martial Arts)
  * Sankara (Cyberpunk, Action, Documentaries)
  * Dylan (Romance, Drama)
  * PK (Sci-Fi, High Concept)
  * Yanga (Fantasy, Legends)
  * Gaheza (Drama, Nature)

Available Movies on Fiesta Flix:
${movieData.map((m) => `- "${m.title}" (${m.year}, ${m.genre}, Narrator: ${m.narrator}, Rating: ${m.rating}/10, Link: /movies/${m.id})`).join('\n')}

Features & Storage:
- Users can stream movies directly on the website (4K, 1080p, 720p).
- Users can download full movies with 0 ads, max speed, and resumable downloads via our Telegram Channel (https://t.me/fiestaflix_movies) or Telegram Bot (https://t.me/FiestaFlixBot).
- Users can save favorites and rate movies.

Tone & Style:
- Warm, cinematic, knowledgeable, and energetic.
- Sprinkle polite Kinyarwanda greetings when appropriate (e.g. "Muraho!", "Karibu kuri Fiesta Flix!", "Bite se!").
- Keep replies concise, helpful, and formatted with markdown bullet points and emojis.
- Suggest direct movie links (e.g. [Watch Echoes of Tomorrow](/movies/1)) when recommending.
`;

function getLocalFallbackResponse(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('rocky') || lower.includes('kimomo')) {
    const rockyMovies = movieData.filter((m) => m.narrator?.toLowerCase().includes('rocky'));
    return `🎬 **Rocky Kimomo Movies on Fiesta Flix**:\n\n` +
      rockyMovies.map((m) => `• [${m.title}](/movies/${m.id}) (${m.genre}, ${m.rating}★)`).join('\n') +
      `\n\nEnjoy pure high-energy action! You can watch online or download directly in our [Telegram Channel](https://t.me/fiestaflix_movies).`;
  }

  if (lower.includes('junior') || lower.includes('giti')) {
    const gitiMovies = movieData.filter((m) => m.narrator?.toLowerCase().includes('junior'));
    return `😂 **Junior Giti Movies on Fiesta Flix**:\n\n` +
      gitiMovies.map((m) => `• [${m.title}](/movies/${m.id}) (${m.genre}, ${m.rating}★)`).join('\n') +
      `\n\nUnbeatable humor and witty punchlines! Stream now or grab them via our [Telegram Bot](https://t.me/FiestaFlixBot).`;
  }

  if (lower.includes('telegram') || lower.includes('download') || lower.includes('storage')) {
    return `⚡ **How to Download Movies via Telegram**:\n\n` +
      `1. **Join our Channel**: Open [t.me/fiestaflix_movies](https://t.me/fiestaflix_movies) to browse and download.\n` +
      `2. **Use our Bot**: Click [t.me/FiestaFlixBot](https://t.me/FiestaFlixBot) and receive full 1080p/4K files directly in your chat.\n` +
      `3. **No Limits**: Resumable downloads, zero ad redirects, and unlimited bandwidth!`;
  }

  if (lower.includes('recommend') || lower.includes('trending') || lower.includes('best')) {
    const top = movieData.slice(0, 3);
    return `🔥 **Top Recommended Movies Today**:\n\n` +
      top.map((m) => `• [${m.title}](/movies/${m.id}) - ${m.genre} (${m.narrator}) • ${m.rating}★`).join('\n') +
      `\n\nTap any title to watch online or download via Telegram!`;
  }

  return `Muraho! 👋 I am **Fiesta Bot**, your movie assistant. I can help you find blockbusters with Kinyarwanda narration (Rocky Kimomo, Junior Giti, Savimbi, Sankara), provide [Telegram download links](https://t.me/fiestaflix_movies), or recommend trending films based on your mood. What would you like to watch today?`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is available, call Gemini 3.8 Flash
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

        // Build conversation contents
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
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            topP: 0.95,
          },
        });

        const reply = response.text || getLocalFallbackResponse(message);
        return NextResponse.json({ reply });
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local assistant:', err);
        return NextResponse.json({ reply: getLocalFallbackResponse(message) });
      }
    }

    // Fallback if no key configured
    return NextResponse.json({ reply: getLocalFallbackResponse(message) });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
