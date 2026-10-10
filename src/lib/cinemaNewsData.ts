export interface NewsAuthor {
  name: string;
  role: string;
  avatar: string;
}

export const FIESTAFLIX_NEWS_DESK: NewsAuthor = {
  name: "FiestaFlix News",
  role: "Official News Desk",
  avatar: "/fallback-poster.png",
};

export interface CinemaNewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  region: string;
  author: NewsAuthor;
  publishedAt: string;
  readTime: string;
  image: string;
  backdrop?: string;
  tags: string[];
  views: number;
  likes: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  relatedMovieId?: string;
}

export const INITIAL_CINEMA_NEWS: CinemaNewsArticle[] = [
  {
    id: 'news-1',
    slug: 'james-cameron-avatar-fire-and-ash-biome',
    title: "James Cameron Reveals First Glimpse of 'Avatar: Fire and Ash' Volcanic Biome in 4K",
    excerpt: "The legendary filmmaker unveils the nomadic Ash People of Pandora, revolutionary underwater flame visuals, and ultra-high-frame-rate tech scheduled for 2026.",
    category: 'Hollywood',
    region: 'North America',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-10-04T14:30:00Z',
    readTime: '4 min read',
    image: '/fallback-poster.png',
    backdrop: '/fallback-poster.png',
    tags: ['Avatar 3', 'James Cameron', '4K IMAX', 'Sci-Fi', 'Pandora'],
    views: 4520,
    likes: 312,
    isBreaking: true,
    isFeatured: true,
    content: `
### Pandora Expands into Volcanic Frontiers

Academy Award-winning director **James Cameron** has unveiled the first exclusive technical breakdowns and production stills for ***Avatar: Fire and Ash***, the highly anticipated third installment in the cinematic franchise.

Speaking at a private global presentation, Cameron confirmed that the film will introduce audiences to the **"Munkwan" or Ash People** — a fire-dwelling clan of Na'vi living around volcanic rifts who challenge the traditional spiritual harmony seen in previous films.

> "In the first two films, we explored water and forests, showcasing the beauty and fragility of nature," Cameron explained. "With Fire and Ash, we confront darker, fiercely survivalist instincts. Fire destroys, but it also purifies and re-forges."

#### Revolutionary New Visual Tech
The production features groundbreaking stereoscopic camera systems capable of shooting at native 120fps with HDR thermal lighting. Digital effects house Wētā FX has developed proprietary algorithmic fluid-fire simulations designed to react organically with digital skin textures.

#### Global Release and Agasobanuye Narration
The film will hit theaters in late 2026 before its exclusive digital arrival. Rwandan film enthusiasts can look forward to custom local narration sessions, with rumors swirling that Rocky Kimomo is preparing an extended commentary cut for local release.
    `.trim(),
  },
  {
    id: 'news-2',
    slug: 'kigali-hosts-2026-east-african-film-and-agasobanuye-summit',
    title: "Rwandan Cinema Renaissance: Kigali Hosts 2026 East African Film & Agasobanuye Summit",
    excerpt: "Over 500 directors, voice artists, translators, and streaming innovators gather at Kigali Convention Centre to celebrate the booming voice-over industry.",
    category: 'Rwanda Cinema',
    region: 'East Africa',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-10-04T11:00:00Z',
    readTime: '3 min read',
    image: '/fallback-poster.png',
    backdrop: '/fallback-poster.png',
    tags: ['Kigali', 'Agasobanuye', 'Rocky Kimomo', 'Junior Giti', 'East Africa'],
    views: 3890,
    likes: 425,
    isBreaking: true,
    isFeatured: true,
    content: `
### Kigali Sets the Stage for African Voice Cinema

The city of Kigali is officially hosting the landmark **2026 East African Film & Agasobanuye Summit** at the Kigali Convention Centre. The three-day event brings together cinema producers, audio engineers, legal copyright experts, and renowned voice-over masters.

The summit highlights how the unique Rwandan tradition of **Agasobanuye** (live-interpreted cinema) has evolved from neighborhood video halls into a multi-million-dollar digital entertainment ecosystem embraced across the diaspora.

#### Voice Masters on the Main Stage
Industry icons **Rocky Kimomo**, **Junior Giti**, **Savimbi**, and **Sankara** hosted an energetic panel on cultural localization, explaining how voice cadence, spontaneous humor, and emotional cues transform global blockbusters into intimate community experiences.

> "Agasobanuye is not just translation; it is oral storytelling at the highest artistic frequency," said Junior Giti during his keynote address.

#### Fiesta Flix Digital Innovation
Fiesta Flix was spotlighted at the summit for its zero-latency 4K streaming pipeline and direct cloud delivery via Telegram channels, setting a benchmark for bandwidth-efficient streaming across Africa.
    `.trim(),
  },
  {
    id: 'news-3',
    slug: 'denis-villeneuve-dune-messiah-imax-cameras',
    title: "Denis Villeneuve Confirms 'Dune: Messiah' Filming Schedule with Custom Next-Gen IMAX Rigs",
    excerpt: "Timothée Chalamet and Zendaya return as Villeneuve wraps the Arrakis trilogy with unprecedented large-format desert cinematography.",
    category: 'Hollywood',
    region: 'North America',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-10-03T18:15:00Z',
    readTime: '5 min read',
    image: '/fallback-poster.png',
    backdrop: '/fallback-poster.png',
    tags: ['Dune', 'Denis Villeneuve', 'IMAX', 'Sci-Fi', 'Paul Atreides'],
    views: 3120,
    likes: 278,
    isBreaking: false,
    content: `
### The Holy War of Paul Atreides Reaches Its Climax

Director **Denis Villeneuve** has finalized pre-production on ***Dune: Messiah***, the definitive concluding chapter of Paul Atreides' saga on Arrakis.

Principal photography begins this autumn across Jordan, Abu Dhabi, and custom soundstages in Budapest. Villeneuve confirmed that cinematographer Greig Fraser will employ new custom IMAX digital sensors designed to capture both the blinding daylight of the desert dunes and the obsidian interiors of the imperial throne room.

#### Timothée Chalamet's Darkest Turn
Chalamet returns to embody an older, tormented Emperor Paul Muad'Dib grappling with the uncontrollable religious jihad raging across the cosmos in his name.

Villeneuve emphasized:
> "Messiah is Frank Herbert's warning about charismatic leaders. It is tragic, operatic, and deeply philosophical. We are crafting a conclusion that will resonate for generations."
    `.trim(),
  },
  {
    id: 'news-4',
    slug: 'nollywood-record-streaming-telegram-epic-release',
    title: "Nollywood Sets New Global Streaming Record with High-Budget Historical Epic",
    excerpt: "Lagos-produced epic 'The Warrior Queen of Benin' captures 20 million views in its opening week across global platforms and Telegram movie channels.",
    category: 'African Cinema',
    region: 'West Africa',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-10-03T09:40:00Z',
    readTime: '3 min read',
    image: '/fallback-poster.png',
    backdrop: '/fallback-poster.png',
    tags: ['Nollywood', 'African Cinema', 'Historical Epic', 'Lagos', 'Streaming'],
    views: 2840,
    likes: 195,
    isBreaking: false,
    content: `
### Nigerian Cinema Reaches Record Worldwide Heights

The Nigerian film industry has achieved an astonishing milestone with the international debut of ***The Warrior Queen of Benin***, directed by celebrated auteur Kemi Adetiba.

Budgeted at over $4.5 million — the highest in modern Nollywood history — the film features jaw-dropping traditional armor choreography, hand-carved bronze sets, and a soundtrack recorded with the Lagos Philharmonic Orchestra.

Within seven days of its simultaneous launch across global streaming platforms and high-speed Telegram cinema networks, the production surpassed 20 million views across Europe, North America, and Sub-Saharan Africa.
    `.trim(),
  },
  {
    id: 'news-5',
    slug: 'christopher-nolan-secret-epic-70mm-worldwide-release',
    title: "Christopher Nolan's Upcoming Secret Epic Movie Secures 70mm Worldwide Release",
    excerpt: "Universal Pictures locks summer dates for Nolan's mysterious next project, promising full-scale analog 70mm prints across 50 global cities.",
    category: 'Hollywood',
    region: 'Global',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-10-02T16:20:00Z',
    readTime: '4 min read',
    image: '/fallback-poster.png',
    tags: ['Christopher Nolan', '70mm IMAX', 'Oppenheimer', 'Universal Pictures'],
    views: 5120,
    likes: 540,
    isBreaking: false,
    isFeatured: true,
    content: `
### Nolan Doubles Down on Pure Celluloid Magic

Fresh off the sweeping awards triumph of *Oppenheimer*, filmmaker **Christopher Nolan** has locked in theater distribution agreements for his highly guarded upcoming feature.

While plot details remain shrouded in extreme confidentiality, sources close to Syncopy reveal that Nolan is utilizing brand-new 70mm color infrared film stocks developed exclusively by Kodak to capture dynamic nocturnal lighting conditions.

Cinemas worldwide are already servicing their analog mechanical projectors to support the monumental roadshow rollout.
    `.trim(),
  },
  {
    id: 'news-6',
    slug: 'demon-slayer-infinity-castle-anime-box-office-record',
    title: "Anime Box Office Phenomenon: 'Demon Slayer: Infinity Castle' Dominates Global Theaters",
    excerpt: "Ufotable's cinematic trilogy opener shatters opening weekend records across Tokyo, Seoul, London, and New York with mind-bending CGI animation.",
    category: 'Asian Cinema',
    region: 'Asia',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-10-02T12:00:00Z',
    readTime: '3 min read',
    image: '/fallback-poster.png',
    tags: ['Anime', 'Demon Slayer', 'Ufotable', 'Box Office', 'Tokyo'],
    views: 4180,
    likes: 490,
    isBreaking: false,
    content: `
### The Infinity Castle Sets the Global Box Office on Fire

Animation studio Ufotable has officially rewritten box office history with the premiere of ***Demon Slayer: Kimetsu no Yaiba – The Infinity Castle (Part 1)***.

Audiences packed theaters in over 85 countries to witness the gravitational spatial warfare between the Demon Slayer Corps and the Upper Rank demons within Muzan Kibutsuji's folding labyrinth.

Film analysts project the first film of the trilogy could easily surpass $600 million globally, reinforcing anime's status as a dominant theatrical powerhouse.
    `.trim(),
  },
  {
    id: 'news-7',
    slug: 'rocky-kimomo-10-million-streams-milestone',
    title: "Rocky Kimomo Breaks Milestone: Over 10 Million Total Streams Across Agasobanuye Blockbusters",
    excerpt: "The beloved Rwandan action interpreter celebrates a monumental digital milestone with fans in Kigali, announcing a free celebration screening event.",
    category: 'Agasobanuye',
    region: 'Rwanda',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-10-01T20:10:00Z',
    readTime: '3 min read',
    image: '/fallback-poster.png',
    tags: ['Rocky Kimomo', 'Agasobanuye', 'Fiesta Flix', 'Kigali', 'Milestone'],
    views: 6300,
    likes: 810,
    isBreaking: true,
    content: `
### A Legendary Voice Crowns a Decade of Impact

Rwandan film icon **Rocky Kimomo** has officially crossed **10,000,000 verified online streams** across his narrated movie releases, cementing his status as one of East Africa's most influential cultural voices.

Known for his electrifying battle calls, witty punchlines, and deep emotional resonance, Rocky has narrated over 250 Hollywood and international blockbusters over the past decade.

> "When I step into the recording booth, I am not just reading lines," Rocky told fans during an Instagram Live session. "I am standing right next to the audience, sweating with the hero and laughing at the comedy. This milestone belongs to every fan in Rwanda and across the world."

To celebrate, Fiesta Flix is hosting a special Rocky Kimomo action festival featuring 4K remasters of his most acclaimed titles.
    `.trim(),
  },
  {
    id: 'news-8',
    slug: 'marvel-studios-avengers-doomsday-concept-teasers',
    title: "Marvel Studios Unveils 'Avengers: Doomsday' Concept Teasers Featuring Doctor Doom's Return",
    excerpt: "Robert Downey Jr.'s shocking transformation into Victor Von Doom takes center stage as the Russo brothers unveil initial multiversal plot threads.",
    category: 'Hollywood',
    region: 'North America',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-10-01T15:00:00Z',
    readTime: '4 min read',
    image: '/fallback-poster.png',
    tags: ['Marvel', 'Avengers Doomsday', 'Doctor Doom', 'Robert Downey Jr', 'MCU'],
    views: 4890,
    likes: 620,
    isBreaking: false,
    content: `
### The Marvel Cinematic Universe Prepares for Doom

Marvel Studios has released the first official concept art and behind-the-scenes glimpses of ***Avengers: Doomsday***, directed by Joe and Anthony Russo.

The visuals reveal a catastrophic collision of alternate realities, with Doctor Victor Von Doom ruling over Latveria with an iron fist, wielding a combination of sorcery and vibranium tech that threatens the entire multiverse.

The film is slated to film simultaneously with *Avengers: Secret Wars*, promising the grandest ensemble cast ever assembled in cinema history.
    `.trim(),
  },
  {
    id: 'news-9',
    slug: 'cannes-film-festival-african-cinema-showcase-2026',
    title: "Cannes Film Festival 2026 Announces Groundbreaking African Cinema Showcase",
    excerpt: "Eight features from Rwanda, Senegal, Kenya, and Nigeria earn Competition slots on the Croisette, marking an unprecedented milestone for African cinema.",
    category: 'Festivals & Awards',
    region: 'Europe / Global',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-09-30T17:30:00Z',
    readTime: '4 min read',
    image: '/fallback-poster.png',
    tags: ['Cannes', 'African Cinema', 'Film Festival', 'Awards', 'France'],
    views: 2310,
    likes: 180,
    isBreaking: false,
    content: `
### The Croisette Celebrates the Vibrant Vision of African Auteurs

The Cannes Film Festival organizing committee has unveiled its official selection for the 2026 festival, featuring a record-breaking presence of films hailing from the African continent.

From Rwandan poetic docudramas exploring youth culture in Musanze to Senegalese neo-noir thrillers set in Dakar, the selection highlights the rich narrative diversity and technical sophistication emerging from African film schools and independent production houses.
    `.trim(),
  },
  {
    id: 'news-10',
    slug: 'junior-giti-comedy-voiceover-tour-2026',
    title: "Junior Giti Announces Exclusive Voice-Over Comedy Tour and Digital Premiere Series",
    excerpt: "The master of Rwandan comedy narration prepares a live theater tour where fans can watch him perform real-time improvisations on screen.",
    category: 'Agasobanuye',
    region: 'Rwanda',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-09-30T10:15:00Z',
    readTime: '3 min read',
    image: '/fallback-poster.png',
    tags: ['Junior Giti', 'Comedy', 'Agasobanuye', 'Live Tour', 'Kigali'],
    views: 3450,
    likes: 390,
    isBreaking: false,
    content: `
### Live Agasobanuye Takes to the Theater Stage

In a groundbreaking cultural move, **Junior Giti** has revealed plans for the **"Giti Live Comedy Cinema Tour 2026"**, stopping at venues in Kigali, Rubavu, Huye, and Kampala.

During each live performance, Giti will sit before a massive 4K LED screen and deliver his signature comedic commentary live before a packed audience, blending film scenes with spontaneous social commentary and crowd banter.

"People usually hear me through speakers in their living room. Experiencing that shared laughter in a room of 2,000 fans is going to be electric," Giti smiled.
    `.trim(),
  },
  {
    id: 'news-11',
    slug: 'bong-joon-ho-mickey-17-robert-pattinson-trailer',
    title: "Bong Joon-ho's Sci-Fi Thriller 'Mickey 17' Starring Robert Pattinson Drops Spectacular Final Trailer",
    excerpt: "The Oscar-winning 'Parasite' director delivers an absurd, existential deep-space thriller about an expendable employee who refuses to stay dead.",
    category: 'Sci-Fi & Tech',
    region: 'Global',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-09-29T14:45:00Z',
    readTime: '3 min read',
    image: '/fallback-poster.png',
    tags: ['Bong Joon-ho', 'Mickey 17', 'Robert Pattinson', 'Warner Bros', 'Sci-Fi'],
    views: 3740,
    likes: 330,
    isBreaking: false,
    content: `
### Bong Joon-ho's High-Concept Space Satire

Warner Bros. has unveiled the final theatrical trailer for ***Mickey 17***, adapted from Edward Ashton's novel by Korean visionary Bong Joon-ho.

Robert Pattinson portrays Mickey Barnes, an "Expendable" on a human expedition sent to colonize the ice world of Niflheim. Whenever Mickey dies on a hazardous task, a new body is cloned with most of his memories intact. Trouble begins when Mickey 17 unexpectedly survives a suicide mission, only to find Mickey 18 already walking in his boots.

Bong Joon-ho blends slapstick humor with razor-sharp corporate critique in what critics are predicting will be one of the defining sci-fi movies of the decade.
    `.trim(),
  },
  {
    id: 'news-12',
    slug: 'telegram-movie-channels-4k-streaming-revolution',
    title: "The Rise of Telegram Channels as Direct-to-Consumer 4K Movie Hubs in Emerging Markets",
    excerpt: "How cloud messaging platforms are transforming content distribution across Africa, Asia, and Latin America with zero ads and resumable high-speed downloads.",
    category: 'Sci-Fi & Tech',
    region: 'Global',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-09-28T19:00:00Z',
    readTime: '5 min read',
    image: '/fallback-poster.png',
    tags: ['Telegram', 'Cloud Storage', 'Streaming Tech', '4K Cinema', 'Fast Downloads'],
    views: 5600,
    likes: 670,
    isBreaking: false,
    isFeatured: true,
    content: `
### Messaging Apps: The Modern Movie Cloud

While traditional Western streaming giants battle subscription fatigue and price hikes, an entirely different distribution revolution has quietly taken over emerging markets: **direct Telegram channel streaming**.

With Telegram's 4GB file transfer limit, decentralized caching servers, and native video player capabilities, services like **Fiesta Flix** have pioneered automated bot networks (such as *@FiestaFlixBot*) that deliver 4K HEVC encoded movies directly into user devices without buffering or spam redirects.

This bandwidth-friendly, ad-free model has democratized high-fidelity cinema access for millions across Rwanda and beyond.
    `.trim(),
  },
  {
    id: 'news-13',
    slug: 'tom-cruise-mission-impossible-final-reckoning-stunt',
    title: "Tom Cruise Performs Highest Freefall Stunt for 'Mission: Impossible — Final Reckoning'",
    excerpt: "At 64 years old, the action cinema icon straps into a vintage biplane and performs a terrifying zero-parachute aerial swap in South Africa.",
    category: 'Hollywood',
    region: 'North America / Africa',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-09-27T16:00:00Z',
    readTime: '3 min read',
    image: '/fallback-poster.png',
    tags: ['Tom Cruise', 'Mission Impossible', 'Stunts', 'Action Cinema', 'Paramount'],
    views: 4420,
    likes: 512,
    isBreaking: false,
    content: `
### Pure Adrenaline: Tom Cruise Defies Gravity Once More

Paramount Pictures has confirmed details regarding the climactic action set-piece in ***Mission: Impossible – The Final Reckoning***, filmed over the Blyde River Canyon in South Africa.

Tom Cruise, playing IMF operative Ethan Hunt, piloted a 1943 Boeing-Stearman biplane before executing an inverted aerial leap onto another aircraft mid-flight without green screens or digital doubles.

Director Christopher McQuarrie stated:
> "Tom pushes himself because he believes the audience can subconsciously feel real physics, real wind, and genuine danger. That honesty is what cinema was built on."
    `.trim(),
  },
  {
    id: 'news-14',
    slug: 'south-korean-zombie-thriller-shatters-streaming-charts',
    title: "South Korean Cinema Strikes Again: High-Octane Zombie Thriller Shatters Global Streaming Charts",
    excerpt: "Seoul's latest adrenaline-pumping survival horror 'Train to Busan: Outbreak' sets new viewing records across 90 countries.",
    category: 'Asian Cinema',
    region: 'Asia',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-09-26T11:20:00Z',
    readTime: '3 min read',
    image: '/fallback-poster.png',
    tags: ['Korean Cinema', 'Horror', 'Zombie', 'K-Movie', 'Thriller'],
    views: 3190,
    likes: 290,
    isBreaking: false,
    content: `
### K-Cinema Continues Its Unstoppable Momentum

Following in the footsteps of *Train to Busan* and *All of Us Are Dead*, South Korea's newest horror spectacle ***Outbreak*** has captured the #1 streaming position worldwide.

Featuring breakneck pacing, intense hand-to-hand combat in subway tunnels, and poignant family drama, the film demonstrates why Korean genre filmmaking remains in a league of its own.
    `.trim(),
  },
  {
    id: 'news-15',
    slug: 'savimbi-2026-martial-arts-narration-lineup',
    title: "Savimbi Unveils His 2026 Martial Arts Narration Lineup Featuring Classic Kung Fu Remasters",
    excerpt: "The legendary narrator of Shaolin classics and Donnie Yen epics promises 50 restored 4K martial arts titles for Rwandan viewers.",
    category: 'Agasobanuye',
    region: 'Rwanda',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-09-25T13:40:00Z',
    readTime: '3 min read',
    image: '/fallback-poster.png',
    tags: ['Savimbi', 'Martial Arts', 'Kung Fu', 'Agasobanuye', 'Rwanda'],
    views: 2980,
    likes: 310,
    isBreaking: false,
    content: `
### The Voice of Wing Chun and Drunken Boxing Returns

Interpreter **Savimbi**, renowned for narrating the fiercest martial arts cinema in Kinyarwanda, has partnered with international restoration studios to release a 50-film collection of classic kung fu and wuxia epics in 4K resolution.

From vintage Bruce Lee restorations to modern Donnie Yen blockbusters, Savimbi's rhythmic, precise blow-by-blow narration brings timeless combat choreography alive for a new generation of Rwandan film lovers.
    `.trim(),
  },
  {
    id: 'news-16',
    slug: 'oscars-introduces-best-stunt-design-category',
    title: "Oscars 2026 Introduces New Best Stunt Design Category After Decades of Filmmaker Campaigns",
    excerpt: "The Academy of Motion Picture Arts and Sciences officially adds an award celebrating stunt performers, coordinators, and safety innovators.",
    category: 'Festivals & Awards',
    region: 'Global',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-09-24T17:00:00Z',
    readTime: '3 min read',
    image: '/fallback-poster.png',
    tags: ['Oscars', 'Academy Awards', 'Stunt Design', 'Hollywood', 'Film History'],
    views: 2650,
    likes: 245,
    isBreaking: false,
    content: `
### Long-Overdue Recognition for Cinema's Bravest Artists

The Academy of Motion Picture Arts and Sciences (AMPAS) has voted to establish an official competitive Academy Award for **Best Stunt Design**, starting with the upcoming 98th Oscars ceremony.

The historic decision follows years of lobbying from legendary filmmakers including Chad Stahelski (*John Wick*), David Leitch (*The Fall Guy*), and Steven Spielberg, who argued that stunt teams are as integral to cinema storytelling as cinematographers, costumers, and editors.
    `.trim(),
  },
  {
    id: 'news-17',
    slug: 'bollywood-war-2-brahmastra-2-budgets-record',
    title: "Bollywood's 'War 2' and 'Brahmastra Part Two' Set Unprecedented Multi-Lingual Budgets",
    excerpt: "Indian studio powerhouses invest over $120 million in high-tech VFX and pan-world distribution to rival Hollywood event cinema.",
    category: 'Asian Cinema',
    region: 'India / Asia',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-09-23T14:10:00Z',
    readTime: '3 min read',
    image: '/fallback-poster.png',
    tags: ['Bollywood', 'War 2', 'Indian Cinema', 'VFX', 'Hrithik Roshan'],
    views: 3100,
    likes: 315,
    isBreaking: false,
    content: `
### The Indian Film Spectacle Expands Worldwide

The Yash Raj Spy Universe and Dharma Productions have greenlit budgets that shatter historical ceilings for Indian cinema.

Featuring Hrithik Roshan and Jr. NTR in an explosive multi-national espionage showdown, *War 2* combines Hollywood stunt coordinators with expansive musical set-pieces, targeting day-and-date theatrical releases in over 110 countries.
    `.trim(),
  },
  {
    id: 'news-18',
    slug: 'ai-in-film-production-historic-digital-replica-standards',
    title: "AI in Film Production: Hollywood Unions and Studios Establish Historic Standards on Digital Replicas",
    excerpt: "Landmark multilateral accords mandate explicit consent, fair compensation, and human oversight for generative synthetic actors and background voices.",
    category: 'Sci-Fi & Tech',
    region: 'North America / Global',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-09-22T19:30:00Z',
    readTime: '4 min read',
    image: '/fallback-poster.png',
    tags: ['AI Cinema', 'SAG-AFTRA', 'Hollywood', 'Ethics', 'Tech News'],
    views: 3890,
    likes: 410,
    isBreaking: false,
    content: `
### Defining the Human Core of Cinema in the AI Era

In a milestone agreement shaping the future of creative arts, major film studios and international talent guilds have ratified comprehensive ethical standards governing the use of Generative AI in filmmaking.

The regulations establish that no actor's likeness or voice may be digitally cloned without clear per-project contracts and ongoing residuals. Furthermore, scripts written entirely by machine algorithms cannot receive official writing credits.

The move has been lauded by voice artists worldwide, including Rwandan Agasobanuye performers whose unique vocal inflections remain irreplaceable by synthetic text-to-speech tools.
    `.trim(),
  },
  {
    id: 'news-19',
    slug: 'guillermo-del-toro-frankenstein-wraps-production',
    title: "Guillermo del Toro's 'Frankenstein' Wraps Production Featuring Star-Studded Gothic Cast",
    excerpt: "Oscar winner Guillermo del Toro finishes his life-long passion project starring Oscar Isaac, Jacob Elordi, and Mia Goth with practical makeup wizardry.",
    category: 'Hollywood',
    region: 'Europe / North America',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-09-21T15:20:00Z',
    readTime: '4 min read',
    image: '/fallback-poster.png',
    tags: ['Frankenstein', 'Guillermo del Toro', 'Oscar Isaac', 'Gothic Horror', 'Netflix'],
    views: 2950,
    likes: 275,
    isBreaking: false,
    content: `
### A Gothic Masterpiece Fifty Years in the Making

Filmmaker **Guillermo del Toro** has officially wrapped principal photography on Mary Shelley's ***Frankenstein***, a film he has dreamed of adapting since childhood.

Shot across misty Scottish highlands and meticulously constructed Victorian lab sets in Toronto, the film stars Oscar Isaac as Victor Frankenstein and Jacob Elordi as the Creature. Del Toro opted for hand-applied prosthetics and practical lightning arcs over green-screen CGI, ensuring visceral, tragic emotional depth.
    `.trim(),
  },
  {
    id: 'news-20',
    slug: 'sankara-rwandan-sci-fi-cyberpunk-short-film-anthology',
    title: "Sankara Teams Up with Rwandan Sci-Fi Enthusiasts for Cyberpunk Short Film Anthology",
    excerpt: "The master of cyberpunk Agasobanuye partners with young Kigali animators and VFX artists to produce 'Kigali 2088', blending tradition with neon futurity.",
    category: 'Rwanda Cinema',
    region: 'Rwanda',
    author: FIESTAFLIX_NEWS_DESK,
    publishedAt: '2026-09-20T12:00:00Z',
    readTime: '3 min read',
    image: '/fallback-poster.png',
    tags: ['Sankara', 'Cyberpunk', 'Kigali 2088', 'African Sci-Fi', 'Agasobanuye'],
    views: 3720,
    likes: 480,
    isBreaking: false,
    content: `
### Neon Kigali: The Birth of African Cyberpunk

Beloved Rwandan interpreter **Sankara**, celebrated for his robotic and futuristic narrative style on films like *The Matrix* and *Cyberpunk 2077*, has launched an original storytelling project titled ***Kigali 2088***.

The three-part animated short anthology imagines a future East African metropolis governed by clean solar towers, drone traffic along Nyarugenge hills, and cybernetic detectives speaking a blend of futuristic Kinyarwanda slang.

The project premieres exclusively on Fiesta Flix and its Telegram cloud community.
    `.trim(),
  },
];

// Global in-memory news store for dynamic additions across Next.js bundle chunks
const globalNewsStore = globalThis as unknown as {
  __CINEMA_NEWS_STORE__?: CinemaNewsArticle[];
};

if (!globalNewsStore.__CINEMA_NEWS_STORE__) {
  globalNewsStore.__CINEMA_NEWS_STORE__ = [...INITIAL_CINEMA_NEWS];
}

export function getAllCinemaNews(): CinemaNewsArticle[] {
  return globalNewsStore.__CINEMA_NEWS_STORE__ || INITIAL_CINEMA_NEWS;
}

export function getCinemaNewsBySlug(slug: string): CinemaNewsArticle | undefined {
  const store = getAllCinemaNews();
  return store.find((n) => n.slug === slug || n.id === slug);
}

export function addCinemaNews(newsData: Omit<CinemaNewsArticle, 'id' | 'views' | 'likes' | 'publishedAt'>): CinemaNewsArticle {
  const newArticle: CinemaNewsArticle = {
    ...newsData,
    id: `news-${Date.now()}`,
    views: 1,
    likes: 0,
    publishedAt: new Date().toISOString(),
  };

  if (!globalNewsStore.__CINEMA_NEWS_STORE__) {
    globalNewsStore.__CINEMA_NEWS_STORE__ = [...INITIAL_CINEMA_NEWS];
  }

  globalNewsStore.__CINEMA_NEWS_STORE__ = [newArticle, ...globalNewsStore.__CINEMA_NEWS_STORE__];
  return newArticle;
}

export function incrementNewsViews(slug: string): CinemaNewsArticle | undefined {
  const article = getCinemaNewsBySlug(slug);
  if (article) {
    article.views += 1;
  }
  return article;
}

export function toggleNewsLike(slug: string): { likes: number } {
  const article = getCinemaNewsBySlug(slug);
  if (article) {
    article.likes += 1;
    return { likes: article.likes };
  }
  return { likes: 0 };
}
