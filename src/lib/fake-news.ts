const NOW = new Date();
const D = (daysAgo: number, hoursAgo = 0) => {
  const d = new Date(NOW.getTime() - daysAgo * 86400000 - hoursAgo * 3600000);
  return d.toISOString().slice(0, 10).replace(/-/g, '/').replace(/\//, ' ').slice(4) + ', ' + new Date().getFullYear().toString();
};

export interface FakeNewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  region: string;
  readTime: string;
  publishedAt: string;
  views: number;
  likes: number;
  isFeatured: boolean;
  isBreaking: boolean;
  tags: string[];
}

// Deterministic seed content — not dynamically generated per request.
export const FAKE_NEWS: FakeNewsArticle[] = [
  {
    id: '1',
    slug: 'james-cameron-avatar-fire-and-ash-biome',
    title: "James Cameron Reveals First Glimpse of 'Avatar: Fire and Ash' Volcanic Biome in 4K",
    excerpt: "The legendary filmmaker unveils the nomadic Ash People of Pandora, revolutionary underwater flame visuals, and ultra-high-frame-rate tech scheduled for 2026.",
    content: `### A world shaped by flame

James Cameron has shared the first official look at the volcanic ecosystem that anchors *Avatar: Fire and Ash*, the third chapter in the *Avatar* saga. The reveal focuses on a remote band of Pandoran natives called the Ash People, who have adapted to a landscape defined by slow-moving lava flows, glass forests, and geysers that vent superheated vapour.

In the newly released 4K clip, the biome is shown at a scale rarely attempted in the franchise: entire ridges glow in thermal orange while bioluminescent ash drifts through the air like living embers. Cameron described the sequence as "a place where beauty and danger are inseparable," adding that the production built new rendering pipelines to handle the interaction between fire, water vapour, and the planet's native flora.

### Underwater fire and new camera tech

Perhaps the most striking element of the debut is a sequence that pairs molten rock with underwater environments — a technical challenge the team says required a combination of practical effects, virtual production, and updated simulation tools. Cameron confirmed that *Avatar: Fire and Ash* will experiment with higher frame-rate capture in select sequences, though he stressed that the final mix is designed to be viewed in a cinema first and at home second.

The Ash People themselves are presented not as victims of the volcano but as stewards of it. Their dwellings are carved into cooled lava tubes, their tools are forged from obsidian-like minerals, and their relationships with local wildlife appear to be based on heat and scent rather than sound. That design choice, several concept artists noted, was meant to keep the Pandoran cultures visually distinct from one another rather than repeating the aesthetic of earlier films.

### What this means for the 2026 release window

The footage arrives with the film targeting a 2026 wide release, and Cameron's comments suggest the production has moved well past early pre-visualisation. The teaser text accompanying the clip hints at conflict: a civilisation that thrives in a hostile environment is almost always a civilisation under pressure, and the Ash People's relationship with Pandora's more familiar forests is likely to be a central dramatic question.

For audiences, the immediate takeaway is that the film is continuing to push the franchise toward environments that feel physically plausible rather than purely decorative. If the first two movies used Pandora to explore ecology and connection, the third appears to be using it to explore adaptation under extreme conditions — and Cameron's latest preview makes that ambition visible.

### Leading the conversation

Avatar 3 lands at a moment when the series has already reshaped expectations around world-building in mainstream cinema. The new biome reveal is less a traditional teaser and more a statement of intent: the franchise is not repeating itself, and the Ash People are the clearest sign yet that the next chapter will ask different questions about survival, culture, and what "home" means on a living planet.`,
    image: '/fallback-poster.png',
    category: 'Hollywood',
    region: 'North America',
    readTime: '4 min read',
    publishedAt: D(2, 3),
    views: 4520,
    likes: 187,
    isFeatured: true,
    isBreaking: true,
    tags: ['Avatar 3', 'James Cameron', '4K IMAX', 'Sci-Fi', 'Pandora'],
  },
  {
    id: '2',
    slug: 'kigali-hosts-2026-east-african-film-and-agasobanuye-summit',
    title: 'Rwandan Cinema Renaissance: Kigali Hosts 2026 East African Film & Agasobanuye Summit',
    excerpt: 'Kigali becomes the hub for East African cinema as filmmakers, narrators, and festival programmers gather to champion local storytelling and the Agasobanuye tradition.',
    content: `### Kigali at the centre of a regional shift

This year Kigali is hosting the East African Film & Agasobanuye Summit, a gathering that brings together directors, documentary makers, video-hall narrators, festival programmers, and streaming producers from across the region. The signal is clear: East African cinema is no longer waiting for outside approval — it is building its own platforms, languages, and audiences.

The summit's agenda reflects that change. Rather than treating African film as a single category, the panels are organised around craft: voice acting in local-language dubs, sound design for mobile-first viewers, documentary ethics, and the economics of releasing a film in multiple markets at once. The Agasobanuye sessions are especially strong, with veteran narrators, younger dubbing artists, and a few producers experimenting with hybrid releases that pair a film with a live or recorded commentary track.

### Why the tradition still matters

In a streaming environment, it is easy to assume that localised commentary is a nostalgia act. The summit suggests the opposite. For many viewers, a foreign film becomes watchable not because the subtitles are perfect but because a trusted voice translates tone, humour, and cultural context in real time. That is exactly what the best Agasobanuye practitioners have done for years: they do not just translate words, they translate experience.

Several panels focused on how that tradition can travel. A documentary programme linked older Kigali video-hall culture to newer creator-led channels. A workshop on audio description and accessible narration drew a full house. There was also genuine interest from neighbouring markets in learning how Rwandan narrators build rhythm, timing, and personality without taking over the film itself.

### A festival moment for local stories

The summit is paired with a small but purposeful festival strand, featuring Rwandan shorts, regional co-productions, and a handful of features that use local languages as first-class storytelling tools rather than decorative ones. The common thread is restraint: the strongest films here are confident without being loud, and specific without needing to explain themselves to an imagined foreign audience.

That is what makes the gathering significant. It is not just celebrating East African cinema; it is arguing, in practical terms, that the region has enough actors, filmmakers, narrators, and audiences to sustain its own conversation. If the summit holds its shape beyond this year, it could become one of the places where East African film stops asking for a seat and starts setting the table.`,
    image: '/fallback-poster.png',
    category: 'Rwanda Cinema',
    region: 'East Africa',
    readTime: '5 min read',
    publishedAt: D(5, 1),
    views: 3840,
    likes: 251,
    isFeatured: true,
    isBreaking: false,
    tags: ['Rwanda', 'Agasobanuye', 'Kigali', 'African Cinema', 'Festivals'],
  },
  {
    id: '3',
    slug: 'denis-villeneuve-dune-messiah-imax-cameras',
    title: "Denis Villeneuve Confirms 'Dune: Messiah' Filming Schedule with Custom Next-Gen IMAX Rigs",
    excerpt: 'The director behind Dune has locked the shooting plan for the follow-up and is once again pushing the boundaries of large-format image capture.',
    content: `### A schedule, and a statement about scale

Denis Villeneuve has confirmed the filming schedule for *Dune: Messiah*, and the announcement carries a familiar refrain: large-format cameras are not a bonus for this project, they are part of the story. The filmmaker and his team have been working with updated IMAX-certified rigs designed to capture more of the frame in higher resolution, a choice that fits the Dune films' long-standing obsession with scale, distance, and the weight of landscape.

What stands out is not simply that another epic is getting a large-format treatment, but that Villeneuve keeps returning to the same technical philosophy. For him, the expanded frame is not about spectacle alone. It is a way of asking the audience to feel the size of the world they are looking at, and to notice how small human decisions become when placed against desert, politics, and prophecy.

### Why the camera choice matters

Large-format capture changes more than the final image. It affects how scenes are blocked, how far actors must be placed from one another, and how much detail the production has to get right on the day rather than in post. That is one reason the Dune films have always felt unusually deliberate in their compositions: the frame is wide enough that every object in it has to earn its place.

The new rigs are also a reminder that "next-gen" does not always mean glossy or digital in a generic sense. In practice, it often means more flexibility in how a shot is built, more latitude for lighting, and more control over the relationship between foreground and horizon. For a story like Dune, that matters because the environment is a character as much as any person on screen.

### The next chapter in context

*Messiah* arrives after a pair of films that turned a dense literary saga into a blockbuster with classical ambitions. The first two movies were patient, almost ceremonial at times, and that patience is part of what made them work. If the confirmed schedule is any indication, Villeneuve is not rushing to turn the saga into a faster or louder product. He is continuing a slow, careful build toward a conclusion that has to resolve political, religious, and personal stakes all at once.

That is a difficult balance, and the safest prediction is that the film will be judged not just on action but on whether it can sustain the same sense of scale without losing emotional friction. Large-format cameras will help with the first half of that equation. The rest will depend on whether the story can keep its convictions.

### What to watch for

If the pattern holds, the most interesting moments may be the ones that use scale in service of tension rather than awe alone: a closed chamber that feels enormous because of what is outside it, a confrontation that depends on distance, a quiet shot that suddenly reveals how vast the surrounding world really is. Villeneuve has earned the right to make those choices. *Messiah* will be judged on whether he uses them as well as he hopes.`,
    image: '/fallback-poster.png',
    category: 'Hollywood',
    region: 'North America',
    readTime: '4 min read',
    publishedAt: D(7, 6),
    views: 5120,
    likes: 304,
    isFeatured: false,
    isBreaking: false,
    tags: ['Dune Messiah', 'Denis Villeneuve', 'IMAX', 'Sci-Fi', 'Cinema Tech'],
  },
  {
    id: '4',
    slug: 'nollywood-record-streaming-telegram-epic-release',
    title: 'Nollywood Sets New Global Streaming Record with High-Budget Historical Epic',
    excerpt: "A sprawling Nigerian historical production has become one of the most-watched African originals of the year, proving that homegrown storytelling can compete on a global stage.",
    content: `### A milestone for a homegrown production

A high-budget Nigerian historical epic has logged what distributors are calling a record-breaking global streaming run for an African original, with strong numbers across multiple regions in the opening weeks. The film's performance is notable not only for the volume of viewers but for where they came from: significant audiences appeared well beyond the diaspora, suggesting that the story traveled on its own terms rather than as a niche release.

The production itself is ambitious by local-industry standards, with a scope that blends political drama, family saga, and period detail. It is the kind of project that historically might have been treated as too large, too long, or too culturally specific for international release. Instead, it has become one of the most discussed African titles of the year.

### Why this one broke through

Several factors are driving the response. The story is rooted in a recognizable Nigerian landscape without requiring the viewer to already know the history. The performances carry emotional continuity across a big narrative, which helps when the plot moves between eras or social worlds. And the production design gives the film a sense of scale that feels earned rather than decorative.

Just as important, the release strategy appears to have been built for today's viewing habits. A film like this benefits from word of mouth, playlist placement, and shareable moments that work on mobile screens as well as televisions. The result is a release pattern that feels less like a single opening weekend and more like a rolling conversation.

### What it says about the industry

This is the sort of result that changes how people think about Nollywood's ceiling. For years, the industry has been admired for volume, energy, and ingenuity. Now it is increasingly showing that it can also deliver prestige-scale storytelling with international reach. That does not mean every project needs to be a historical epic. It means the ecosystem is expanding enough to support different kinds of ambitious films at once.

There is still work to be done, of course: financing, distribution, and local exhibition all remain complicated. But a hit of this size can open doors for more experimental projects, more regional collaborations, and more stories that assume a worldwide audience from the start. The record itself is impressive. The longer-term significance may be what it encourages next.`,
    image: '/fallback-poster.png',
    category: 'African Cinema',
    region: 'West Africa',
    readTime: '4 min read',
    publishedAt: D(9, 2),
    views: 6230,
    likes: 412,
    isFeatured: false,
    isBreaking: false,
    tags: ['Nollywood', 'African Cinema', 'Streaming', 'Nigerian Film', 'Box Office'],
  },
  {
    id: '5',
    slug: 'christopher-nolan-secret-epic-70mm-worldwide-release',
    title: "Christopher Nolan's Upcoming Secret Epic Movie Secures 70mm Worldwide Release",
    excerpt: 'The director known for practical scale and theatrical presentation has set a global 70mm rollout for his next project, sharpening expectations for a return to big-screen storytelling.',
    content: `### A release format that matters

Christopher Nolan's next film is set for a worldwide 70mm release, a decision that immediately signals how seriously the project treats the theatrical experience. In an era where many blockbusters are designed first for home viewing and second for the cinema, a commitment to large-format film is a deliberate statement: this is a movie that wants to be seen on a big screen, with the image and sound carrying as much meaning as the plot.

Nolan has built a career on that kind of conviction. His films have consistently argued that spectacle is most powerful when it is physical, that scale works best when it is earned, and that audiences will show up for an event if the event feels worth the trip. A 70mm rollout fits that philosophy almost perfectly.

### Why 70mm still gets attention

70mm is not a nostalgia keyword here so much as a production choice with real consequences. Shooting or printing on a larger format gives the image more presence on a properly equipped screen, and it forces a kind of discipline that digital pipelines can sometimes obscure. Every frame has to be composed with intention because the image is not going to be hidden by sameness.

For audiences, the appeal is simple: a rare chance to see a major film in a format that still feels exceptional. For Nolan, it is another extension of his longstanding belief that cinema should offer something you cannot fully replicate at home. That may sound old-fashioned in the abstract, but in practice it is what keeps certain films from collapsing into content.

### Building anticipation without spoilers

Because the project has been kept deliberately secretive, much of the excitement comes from the circumstances around it rather than the plot. That is a risky strategy, but Nolan has often made it work by giving audiences just enough to understand the tone and scale without revealing the story itself. A worldwide 70mm announcement does exactly that: it tells people this is not a small film pretending to be big, and it tells them where to go if they want the fullest version.

The mystery element also helps the release stand out in a crowded market. In a year packed with franchises and sequels, a large-scale film with no clutter around it can become an event simply by virtue of being different.

### What to expect

The safest assumption is that the film will be built around practical scale, deliberate pacing, and an emphasis on the cinema itself as part of the experience. If that sounds familiar, it should. Nolan's signature has never been about novelty for its own sake. It has been about using old-school discipline in service of modern blockbuster storytelling. A 70mm worldwide release is the latest, and perhaps the most direct, expression of that idea.`,
    image: '/fallback-poster.png',
    category: 'Hollywood',
    region: 'North America',
    readTime: '4 min read',
    publishedAt: D(12, 8),
    views: 7010,
    likes: 488,
    isFeatured: false,
    isBreaking: false,
    tags: ['Christopher Nolan', '70mm', 'Film Format', 'Cinema', 'Secret Film'],
  },
  {
    id: '6',
    slug: 'demon-slayer-infinity-castle-anime-box-office-record',
    title: "Anime Box Office Phenomenon: 'Demon Slayer: Infinity Castle' Dominates Global Theaters",
    excerpt: 'The latest chapter in the Demon Slayer saga has become one of the biggest anime theatrical events in recent memory, drawing record turnout across multiple markets.',
    content: `### A theatrical moment for anime

*Demon Slayer: Infinity Castle* has turned into a genuine box office event, with strong opening numbers across several territories and the kind of audience turnout that anime rarely sees outside its biggest franchises. What makes the result especially notable is that it did not depend on a single region or a single demographic. The film has performed as a broad theatrical draw, which is still uncommon for animated Japanese cinema at this scale.

Part of the appeal is obvious: Demon Slayer has spent years building one of the most loyal followings in modern anime, with a story that blends emotional stakes, action choreography, and a clear sense of escalation. By the time a film reaches this point in a saga, viewers are not just watching a movie; they are witnessing a payoff they have prepared for.

### Why this release worked

The film benefits from the fact that the series has already done the hard work of making its world feel large and consequential. Audiences know the characters, the cost of the conflict, and the emotional weight behind the battles. That kind of investment turns a theatrical run into something closer to a collective verdict on a long narrative arc.

The action is also a major factor. Infinity Castle is positioned as a climax, and the studio has clearly aimed for scale and clarity rather than pure speed. In a genre where fight scenes can become noisy and abstract, the film seems to understand that the most effective moments are the ones that let the audience track the human cost of the spectacle.

### A wider turning point

More broadly, the success reinforces a shift that has been underway for some time: top-tier anime is no longer an alternative market. It is a mainstream attraction that can anchor a weekend, fill an IMAX-style audience pattern, and generate conversation far beyond the core fan base. That does not mean every anime film can replicate this result, but it does mean the ceiling is higher than it used to be.

The lesson from Infinity Castle is not simply that a popular series can have a successful movie. It is that a well-built franchise, released at the right moment with the right theatrical support, can behave like a cultural event rather than a niche release. For anime, that is a significant milestone.`,
    image: '/fallback-poster.png',
    category: 'Asian Cinema',
    region: 'Asia',
    readTime: '4 min read',
    publishedAt: D(3, 10),
    views: 8140,
    likes: 523,
    isFeatured: false,
    isBreaking: false,
    tags: ['Demon Slayer', 'Anime', 'Box Office', 'Japanese Cinema', 'Theatrical'],
  },
  {
    id: '7',
    slug: 'nollywood-record-streaming-telegram-epic-release-2',
    title: 'Nollywood Sets New Global Streaming Record with High-Budget Historical Epic',
    excerpt: "A sprawling Nigerian historical production has become one of the most-watched African originals of the year, proving that homegrown storytelling can compete on a global stage.",
    content: `### A milestone for a homegrown production

A high-budget Nigerian historical epic has logged what distributors are calling a record-breaking global streaming run for an African original, with strong numbers across multiple regions in the opening weeks. The film's performance is notable not only for the volume of viewers but for where they came from: significant audiences appeared well beyond the diaspora, suggesting that the story traveled on its own terms rather than as a niche release.

The production itself is ambitious by local-industry standards, with a scope that blends political drama, family saga, and period detail. It is the kind of project that historically might have been treated as too large, too long, or too culturally specific for international release. Instead, it has become one of the most discussed African titles of the year.

### Why this one broke through

Several factors are driving the response. The story is rooted in a recognizable Nigerian landscape without requiring the viewer to already know the history. The performances carry emotional continuity across a big narrative, which helps when the plot moves between eras or social worlds. And the production design gives the film a sense of scale that feels earned rather than decorative.

Just as important, the release strategy appears to have been built for today's viewing habits. A film like this benefits from word of mouth, playlist placement, and shareable moments that work on mobile screens as well as televisions. The result is a release pattern that feels less like a single opening weekend and more like a rolling conversation.

### What it says about the industry

This is the sort of result that changes how people think about Nollywood's ceiling. For years, the industry has been admired for volume, energy, and ingenuity. Now it is increasingly showing that it can also deliver prestige-scale storytelling with international reach. That does not mean every project needs to be a historical epic. It means the ecosystem is expanding enough to support different kinds of ambitious films at once.

There is still work to be done, of course: financing, distribution, and local exhibition all remain complicated. But a hit of this size can open doors for more experimental projects, more regional collaborations, and more stories that assume a worldwide audience from the start. The record itself is impressive. The longer-term significance may be what it encourages next.`,
    image: '/fallback-poster.png',
    category: 'African Cinema',
    region: 'West Africa',
    readTime: '4 min read',
    publishedAt: D(15, 0),
    views: 3020,
    likes: 198,
    isFeatured: false,
    isBreaking: false,
    tags: ['Nollywood', 'African Cinema', 'Streaming', 'Nigerian Film', 'Box Office'],
  },
];
