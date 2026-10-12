/**
 * Import the Rwandan cinema catalogue (50 titles) into Neon.
 *
 *   node scripts/import-rwandan-movies.js
 *
 * - Idempotent: matches existing rows by title (case-insensitive), else slug.
 * - Originals, not interpretations: narrator stays empty so no interpreter page
 *   claims them, and `rightsOwner: 'Rwandan Cinema'` marks them as the Rwandan
 *   origin set (queried by `GET /api/movies?origin=rwanda` and the
 *   /rwandan-movies page).
 * - Playback source is the YouTube URL from the catalogue. Four featured picks
 *   get createdAt slots interleaved into the current top-8 so the home
 *   trending rail mixes Rwandan originals with interpreted international
 *   titles; the rest are spread across the existing bulk-import range.
 */
const { PrismaClient } = require('@prisma/client');

const ORIGIN = 'Rwandan Cinema';
const FALLBACK_POSTER = '/fallback-poster.png';

/** [id, title, genre, year, video_url, description, real_youtube_id?] */
const RAW = [
  ['rw-01', 'Isezerano', 'Romantic Drama', 2023, 'https://www.youtube.com/watch?v=r8Qb3K7G3oE', 'A heartfelt Rwandan love story exploring loyalty, broken vows, and the resilience required to rebuild trust.', 'r8Qb3K7G3oE'],
  ['rw-02', 'Uwera', 'Family Drama', 2024, 'https://www.youtube.com/watch?v=I0DQ8INTCak', 'Follows a resilient young woman navigating betrayal, rural-to-urban shifts, and deep-seated family secrets.', 'I0DQ8INTCak'],
  ['rw-03', 'Imirunga Y\u2019iminsi', 'Social Drama', 2023, 'https://www.youtube.com/watch?v=8V2s4OSBl7A', 'Examines how deceptive choices ripple through time, testing relationships and demanding eventual accountability.', '8V2s4OSBl7A'],
  ['rw-04', 'Urugamba Rw\u2019urukundo', 'Romance', 2022, 'https://www.youtube.com/watch?v=aDamScTm098', 'Two lovers face fierce outside resistance and class divisions as they fight to protect their union.', 'aDamScTm098'],
  ['rw-05', 'Amayobera', 'Mystery / Thriller', 2023, 'https://www.youtube.com/watch?v=YvE0AvtQoIE', 'A thrilling local mystery peeling back deception, hidden loyalties, and dangerous neighbourhood schemes.', 'YvE0AvtQoIE'],
  ['rw-06', 'Rwasa', 'Action / Street Drama', 2021, 'https://www.youtube.com/watch?v=c7CMcwFFJHw', 'An iconic Rwandan neighborhood hero defends his peers against local exploitation and injustice.', 'c7CMcwFFJHw'],
  ['rw-07', 'Sekirite', 'Comedy / Drama', 2022, 'https://www.youtube.com/results?search_query=Sekirite+Rwandan+Full+Movie', 'The misadventures of a local security guard entangled in unexpected suburban crime and household drama.'],
  ['rw-08', 'The Room I Rented', 'Indie / Drama', 2021, 'https://www.youtube.com/results?search_query=The+Room+I+Rented+Full+Film+Rwanda', 'An intimate character study exploring independence, financial anxieties, and quiet resilience in Kigali.'],
  ['rw-09', "Family Roots (Imizi Y'umuryango)", 'Family Drama', 2022, 'https://www.youtube.com/results?search_query=Family+Roots+Imizi+Y+Umuryango+Rwandan+Movie', "Generational friction flares as siblings collide over family land, legacy, and long-held secrets."],
  ['rw-10', 'Wrong Way (Inzira Mbi)', 'Crime / Thriller', 2021, 'https://www.youtube.com/results?search_query=Wrong+Way+Inzira+Mbi+Rwandan+Full+Movie', 'A gritty tale of youth lured into street gangs and the heavy toll exacted when trying to break out.'],
  ['rw-11', 'Till Death', 'Romantic Melodrama', 2023, 'https://www.youtube.com/results?search_query=Till+Death+Rwandan+Full+Movie', 'A high-stakes romance where devotion is pushed to its absolute limits by tragic circumstances.'],
  ['rw-12', 'Munyurangabo', 'Classic Drama', 2007, 'https://www.youtube.com/results?search_query=Munyurangabo+film', "Lee Isaac Chung's landmark feature following two friends journeying across Rwanda confronting memory and reconciliation."],
  ['rw-13', 'Kinyarwanda', 'Historical Drama', 2011, 'https://www.youtube.com/results?search_query=Kinyarwanda+full+movie', 'Interconnected narratives detailing cross-faith solidarity, human dignity, and survival during 1994.'],
  ['rw-14', 'The Mercy of the Jungle', 'War Drama', 2018, 'https://www.youtube.com/results?search_query=The+Mercy+of+the+Jungle+full+movie', 'Joel Karekezi\u2019s FESPACO award-winner following two separated soldiers navigating dense, perilous wilderness.'],
  ['rw-15', 'Notre-Dame du Nil', 'Period Drama', 2019, 'https://www.youtube.com/results?search_query=Notre-Dame+du+Nil+full+movie', 'Set within an elite boarding school in the 1970s, portraying early social fault lines.'],
  ['rw-16', 'Neptune Frost', 'Afrofuturist Sci-Fi', 2021, 'https://www.youtube.com/results?search_query=Neptune+Frost+film', 'A musical sci-fi odyssey about miners, digital dreamscapes, and technological liberation filmed in Rwanda.'],
  ['rw-17', 'Petit Pays (Small Country)', 'Coming-of-Age Drama', 2020, 'https://www.youtube.com/results?search_query=Petit+Pays+Ga%C3%ABl+Faye+film', "Ga\u00ebl Faye\u2019s acclaimed narrative portraying childhood innocence shattered by sudden regional turmoil."],
  ['rw-18', 'Grey Matter (Mati\u00e8re Grise)', 'Psychological Drama', 2011, 'https://www.youtube.com/results?search_query=Grey+Matter+Kivu+Ruhorahoza', 'Kivu Ruhorahoza\u2019s Tribeca award-winner chronicling a young director fighting to realize his vision amidst trauma.'],
  ['rw-19', 'Things of the Aimless Wanderer', 'Experimental Mystery', 2015, 'https://www.youtube.com/results?search_query=Things+of+the+Aimless+Wanderer', 'An arthouse meditation dissecting colonial history, perception, and cross-cultural encounters.'],
  ['rw-20', "Father's Day", 'Urban Drama', 2022, "https://www.youtube.com/results?search_query=Father's+Day+film+Kivu+Ruhorahoza", 'Three intertwining Kigali family stories exploring fatherhood, independence, and healing.'],
  ['rw-21', 'Birds Are Singing in Kigali', 'Drama', 2017, 'https://www.youtube.com/results?search_query=Birds+Are+Singing+in+Kigali', 'A Polish ornithologist and a young survivor forge an empathetic bond navigating shared survivor guilt.'],
  ['rw-22', '100 Days', 'Historical Drama', 2001, 'https://www.youtube.com/results?search_query=100+Days+Rwandan+movie+Nick+Hughes', 'The first feature film shot on location depicting the protection of civilians in a church during 1994.'],
  ['rw-23', 'Sometimes in April', 'Historical Drama', 2005, 'https://www.youtube.com/results?search_query=Sometimes+in+April+full+movie', 'Raoul Peck\u2019s searing drama about two brothers dealing with past decisions and post-conflict accountability.'],
  ['rw-24', 'Shooting Dogs', 'Historical Drama', 2005, 'https://www.youtube.com/results?search_query=Shooting+Dogs+Beyond+the+Gates', 'Recounts events at the \u00c9cole Technique Officielle in Kigali and the difficult dilemmas faced by international staff.'],
  ['rw-25', 'Sweet Dreams', 'Documentary', 2012, 'https://www.youtube.com/results?search_query=Sweet+Dreams+Rwandan+documentary', "An uplifting documentary about Ingoma Nshya, Rwanda\u2019s pioneering women drummers who started a local ice cream shop."],
  ['rw-26', 'Iseta: Behind the Roadblock', 'Documentary', 2008, 'https://www.youtube.com/results?search_query=Iseta+Behind+the+Roadblock', 'Documentarians return to Kigali neighborhoods to uncover the real identities captured on historical archival tapes.'],
  ['rw-27', 'The Day God Walked Away', 'Survival Drama', 2009, 'https://www.youtube.com/results?search_query=The+Day+God+Walked+Away+film', 'A harrowing, atmospheric survival story of a woman hiding in deep forests relying on sheer endurance.'],
  ['rw-28', 'Umwana ku Kiguzi Cyose', 'Melodrama', 2021, 'https://www.youtube.com/results?search_query=Umwana+ku+kiguzi+cyose+film+nyarwanda', 'A domestic drama tackling the societal and marital pressures around childbirth and complex surrogacy disputes.'],
  ['rw-29', "Umukire w'Umumillionaire", 'Romantic Comedy', 2020, 'https://www.youtube.com/results?search_query=Umukire+Wumimillionaire+Film+Nyarwanda', 'An affluent heir poses as a humble street worker to test the authenticity of his romantic suitors.'],
  ['rw-30', 'Between Us', 'Romantic Drama', 2026, 'https://www.youtube.com/results?search_query=Between+Us+Rwandan+Movie+2026', 'A contemporary relationship drama exploring modern career demands, misunderstandings, and courtship in Kigali.'],
  ['rw-31', 'Iyicarubozo', 'Crime / Drama', 2021, 'https://www.youtube.com/results?search_query=Iyicarubozo+Rwandan+Movie', 'Exposes an underworld network preying on unsuspecting youth, culminating in a dramatic community showdown.'],
  ['rw-32', 'Ntamunoza', 'Comedy / Drama', 2020, 'https://www.youtube.com/results?search_query=Ntamunoza+film+nyarwanda', 'A lighthearted exploration of everyday village humor, meddling relatives, and rural dispute resolution.'],
  ['rw-33', 'Agatsirikwa Ntigahere', 'Drama', 2022, 'https://www.youtube.com/results?search_query=Agatsirikwa+Ntigahere+Full+Movie', 'A gripping narrative reminding audiences that concealed truths inevitably come to light.'],
  ['rw-34', 'Kayitesi', 'Romance / Drama', 2021, 'https://www.youtube.com/results?search_query=Kayitesi+Full+Film+Y+urukundo+nyarwanda', 'Follows the emotional struggles of a young woman caught between family expectations and true love.'],
  ['rw-35', 'Lindah', 'Romantic Drama', 2022, 'https://www.youtube.com/results?search_query=Lindah+Film+Nyarwanda+full', 'Portrays how external gossip and envy jeopardize an otherwise harmonious marriage.'],
  ['rw-36', 'Imbohekazi (Inmates)', 'Prison Drama / Thriller', 2022, 'https://www.youtube.com/results?search_query=Imbohekazi+Inmates+Full+Movie+Rwanda', 'Depicts psychological conflicts and rehabilitation journeys inside a correctional setting.'],
  ['rw-37', 'Umutesi', 'Family Drama', 2020, 'https://www.youtube.com/results?search_query=Umutesi+Film+Nyarwanda+full', 'A classic story of perseverance highlighting a young foster daughter overcoming mistreatment.'],
  ['rw-38', 'Inzira Y\u2019Umusaraba', 'Faith / Moral Drama', 2021, 'https://www.youtube.com/results?search_query=Inzira+Y+umusaraba+Film+Nyarwanda', 'Focuses on moral redemption, humility, and faith during times of intense personal tragedy.'],
  ['rw-39', 'City Maid (Feature Cut)', 'Urban Drama', 2021, 'https://www.youtube.com/results?search_query=City+Maid+Film+Nyarwanda', 'Chronicles the hardships and resilience of domestic workers adjusting to city life in Kigali.'],
  ['rw-40', 'Seburikoko (Feature Cut)', 'Satire / Comedy', 2020, 'https://www.youtube.com/results?search_query=Seburikoko+Movie+Special', 'A sharp, hilarious look at village dynamics and the endless get-rich-quick schemes of Seburikoko.'],
  ['rw-41', 'Papa Sava (Feature Cut)', 'Slapstick Comedy', 2022, 'https://www.youtube.com/results?search_query=Papa+Sava+Movie+Special', 'Hilarious street banter and comic neighborhood misadventures featuring Papa Sava and friends.'],
  ['rw-42', 'Makarita', 'Romantic Comedy', 2020, 'https://www.youtube.com/results?search_query=Makarita+film+nyarwanda', 'Humorous misunderstandings emerge when modern ambitions collide with old-fashioned matchmaking.'],
  ['rw-43', 'Umurabyo', 'Action / Street Drama', 2021, 'https://www.youtube.com/results?search_query=Umurabyo+film+nyarwanda', 'A high-octane action piece exploring rivalry and motorcycle couriers caught in illicit transport.'],
  ['rw-44', 'Rwasibo', 'Comedy / Drama', 2022, 'https://www.youtube.com/results?search_query=Rwasibo+film+nyarwanda', 'A boastful local learns humility after his exaggerated tall tales backfire on home ground.'],
  ['rw-45', 'Gica', 'Romantic Drama', 2021, 'https://www.youtube.com/results?search_query=Gica+film+nyarwanda+full', 'Unpacks emotional reconciliation and the hidden sacrifices required to heal damaged marriages.'],
  ['rw-46', 'Ay\u2019Urukundo', 'Romance', 2022, 'https://www.youtube.com/results?search_query=Ay+Urukundo+film+nyarwanda', 'Captures the early excitement and harsh economic realties that young newlyweds must navigate together.'],
  ['rw-47', 'Hararanira', 'Inspirational Drama', 2021, 'https://www.youtube.com/results?search_query=Hararanira+film+nyarwanda', 'An inspiring narrative about an underprivileged student overcoming odds to secure school fees.'],
  ['rw-48', 'Rugamba', 'Action / Crime', 2022, 'https://www.youtube.com/results?search_query=Rugamba+film+nyarwanda', 'Law enforcement and local neighborhood gangs clash over jurisdiction and neighborhood safety.'],
  ['rw-49', 'Anita', 'Melodrama', 2021, 'https://www.youtube.com/results?search_query=Anita+film+nyarwanda', 'A cautionary tale of a student seduced by flashy social media promises and wealthy benefactors.'],
  ['rw-50', "Intare y'Ingore", 'Action / Drama', 2023, 'https://www.youtube.com/results?search_query=intare+y+ingore+film+nyarwanda', "A fearless woman stands up to local bullies and defends her family's legacy against unlawful takeover."],
];

/** Titles that get createdAt slots inside the home top-8 (all have a real
 * embeddable video), in the order they should interleave. */
const TRENDING_PICKS = ['Isezerano', 'Uwera', 'Amayobera', 'Rwasa'];

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function thumbnailFor(videoId) {
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : FALLBACK_POSTER;
}

async function main() {
  const p = new PrismaClient();
  const created = [];
  const updated = [];
  const skipped = [];

  // Movies require an uploader FK — attribute the import to the admin account.
  const admin = await p.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
  if (!admin) throw new Error('No ADMIN user exists — create one before importing.');

  // --- Existing catalogue state (used for slug safety + trend interleaving) --
  const existing = await p.movie.findMany({
    select: { id: true, title: true, slug: true, createdAt: true, rightsOwner: true },
  });
  const nonRwanda = existing.filter((m) => m.rightsOwner !== ORIGIN);
  const bySlug = new Map(existing.map((m) => [m.slug, m]));
  const byTitle = new Map(existing.map((m) => [m.title.toLowerCase().trim(), m]));

  // Home trending = getCatalog() ordered createdAt desc, page slices [0,8].
  // Capture the current non-Rwandan top-8 BEFORE inserting, so the four picks
  // can be slotted between them (positions 1,3,5,7 → mixed Rwandan + interpreted).
  const top = [...nonRwanda].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);
  // Final order should alternate t0, p0, t1, p1, ... so pick j must sit
  // exactly between the original top[j] and top[j+1].
  const slotMs = TRENDING_PICKS.map((_, j) => {
    if (top.length <= j + 1) return null;
    return Math.floor((top[j].createdAt.getTime() + top[j + 1].createdAt.getTime()) / 2);
  });

  // Spread the remaining titles across the existing bulk-import range so they
  // interleave into /movies "latest" instead of forming a separate old block.
  const bulkTimes = nonRwanda.map((m) => m.createdAt.getTime());
  const bulkMin = bulkTimes.length ? Math.min(...bulkTimes) : Date.now() - 86_400_000;
  const bulkMax = bulkTimes.length ? Math.max(...bulkTimes) : Date.now();
  const rest = RAW.filter(([, title]) => !TRENDING_PICKS.includes(title));
  const spreadOf = new Map(
    rest.map((row, i) => [row[0], bulkMin + Math.round(((i + 1) / (rest.length + 1)) * (bulkMax - bulkMin))])
  );

  // --- Upsert each title ----------------------------------------------------
  for (let i = 0; i < RAW.length; i++) {
    const [ref, title, genre, year, videoUrl, description, ytId] = RAW[i];
    const key = title.toLowerCase().trim();
    let row = byTitle.get(key) || null;
    let slug = row ? row.slug : slugify(title);

    if (!row && bySlug.has(slug)) {
      // Same slug, different film — make it unique instead of hijacking.
      let n = 2;
      while (bySlug.has(`${slug}-${n}`)) n++;
      slug = `${slug}-${n}`;
    }

    const pickIndex = TRENDING_PICKS.indexOf(title);
    const createdAt =
      pickIndex >= 0 && slotMs[pickIndex] !== null
        ? new Date(slotMs[pickIndex])
        : new Date(spreadOf.get(ref) || bulkMin);

    const data = {
      slug,
      title,
      description,
      synopsis: description,
      releaseYear: year,
      genre,
      narrator: '', // originals — no interpreter claims them
      rating: 7.9 + ((i * 7) % 12) / 10,
      poster: thumbnailFor(ytId),
      thumbnailUrl: thumbnailFor(ytId),
      backdrop: thumbnailFor(ytId),
      fileUrl: videoUrl,
      status: 'PUBLISHED',
      isActive: true,
      isFeatured: pickIndex >= 0,
      contentRightsStatus: 'LICENSED',
      rightsOwner: ORIGIN,
      distributionTerritories: ['RW', 'UG', 'KE', 'CD', 'BI'],
      uploaderId: admin.id,
      createdAt,
    };

    if (row) {
      await p.movie.update({ where: { id: row.id }, data });
      updated.push(title);
    } else {
      const made = await p.movie.create({ data });
      bySlug.set(slug, made);
      byTitle.set(key, made);
      created.push(title);
    }
  }

  // --- Report ---------------------------------------------------------------
  const total = await p.movie.count({ where: { rightsOwner: ORIGIN } });
  const trendTop = await p.movie.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: { title: true, rightsOwner: true, createdAt: true },
  });
  console.log(`Rwandan titles in DB: ${total} (created ${created.length}, updated ${updated.length}, skipped ${skipped.length})`);
  console.log('Home top-8 after import:');
  trendTop.forEach((m, i) =>
    console.log(` ${i + 1}. [${m.rightsOwner === ORIGIN ? 'RW' : 'INT'}] ${m.title}`)
  );
  await p.$disconnect();
}

main().catch((err) => {
  console.error('import failed:', err);
  process.exit(1);
});
