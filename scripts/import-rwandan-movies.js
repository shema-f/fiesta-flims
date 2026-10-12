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
  ['rw-51', 'Umutima Ureba', 'Romantic Drama', 2025, 'https://www.youtube.com/watch?v=y9NjOEMkNbc', 'An emotional story about unconditional love centered on a young blind woman overcoming rejection.', 'y9NjOEMkNbc'],
  ['rw-52', 'No Return (Part 1)', 'Action / Street Drama', 2024, 'https://www.youtube.com/watch?v=Cuhr59DifFE', 'A high-tension neighborhood rivalry erupts into street chaos and irreversible consequences.', 'Cuhr59DifFE'],
  ['rw-53', "Umurozi W'Umwana", 'Social Thriller', 2024, 'https://www.youtube.com/watch?v=fGJdZR980Es', 'A dark family drama where superstitious jealousy threatens an innocent child in the compound.', 'fGJdZR980Es'],
  ['rw-54', "Don't Give Up", 'Motivational Drama', 2024, 'https://www.youtube.com/watch?v=V1fl2Ph4Zfc', 'Starring Nyambo and Pelly, navigating domestic mistreatment, determination, and resilience.', 'V1fl2Ph4Zfc'],
  ['rw-55', 'Nyirabayazana', 'Classic Family Drama', 2020, 'https://www.youtube.com/results?search_query=Nyirabayazana+Rwandan+film', 'A foundational Rwandan classic exploring the root instigators of domestic friction and division.'],
  ['rw-56', 'Bazirunge', 'Moral Drama', 2019, 'https://www.youtube.com/results?search_query=Bazirunge+Rwandan+movie', 'A community narrative about accountability and confronting the repercussions of past misdeeds.'],
  ['rw-57', 'Agahugu Katagira Umuco', 'Cultural Drama', 2020, 'https://www.youtube.com/results?search_query=Agahugu+katagira+umuco+Film+nyarwanda', 'Highlights the tension between unguided modern lifestyles and traditional Rwandan cultural values.'],
  ['rw-58', 'The Apology', 'Crime / Drama', 2026, 'https://www.youtube.com/results?search_query=The+Apology+film+nyarwanda+nshyashya+2026', 'A criminal plot is unmasked when an extortionist inside the family circle is finally caught.'],
  ['rw-59', "Nyuma Y'Impeta", 'Marriage Drama', 2025, 'https://www.youtube.com/results?search_query=NYUMA+Y+IMPETA+RWANDA+BURUNDI+FULLMOVIE', 'A collaborative Rwandan-Burundian production detailing marital discord caused by laziness and betrayal.'],
  ['rw-60', 'Urugo Rwanjye Rwacitsemo Kabiri', 'Family Melodrama', 2025, 'https://www.youtube.com/results?search_query=URUGO+RWANJYE+RWACITSEMO+KABIRI+RWANDAN+FULL+MOVIE', 'Tensions push a desperate couple toward a contentious divorce as relatives take sides.'],
  ['rw-61', 'Go To Hell', 'Crime Action', 2024, 'https://www.youtube.com/results?search_query=RWANDAN+FULL+MOVIE+GO+TO+HELL+BIGMIND+EMPIRE', 'A fast-paced local crime saga full of double-crosses and underground gang rivalries.'],
  ['rw-62', "General's Wife", 'Political / Military Drama', 2024, 'https://www.youtube.com/results?search_query=RWANDAN+FULL+MOVIE+GENERAL+S+WIFE+PART+1', "Behind-the-scenes family secrets unravel within a powerful commander's household."],
  ['rw-63', 'Believe', 'Inspirational', 2024, 'https://www.youtube.com/results?search_query=RWANDAN+FULL+MOVIE+BELIEVE+BIGMIND+EMPIRE', 'An uplifting story centered around faith, personal endurance, and overcoming sudden poverty.'],
  ['rw-64', 'The Punisher Woman', 'Action / Vigilante', 2024, 'https://www.youtube.com/results?search_query=RWANDAN+FULL+MOVIE+THE+PUNISHER+WOMAN', 'A wronged woman embarks on a retribution campaign against neighborhood crime bosses.'],
  ['rw-65', "Ingo Z'Ubu", 'Domestic Drama', 2024, 'https://www.youtube.com/results?search_query=RWANDAN+FULL+MOVIE+INGO+ZUBU+PART+1', 'A realistic portrayal of modern urban household dilemmas and marital misunderstandings.'],
  ['rw-66', 'Fake Love', 'Romantic Thriller', 2026, 'https://www.youtube.com/results?search_query=FAKE+LOVE+RWANDAN+FULL+MOVIE+2026', 'A calculating suitor courts an older matriarch strictly for estate access and wealth.'],
  ['rw-67', 'Umuhemu', 'Tragedy / Melodrama', 2025, 'https://www.youtube.com/results?search_query=UMUHEMU+Part+1+Abel+Nduwayo+Official', 'A husband introduces a second wife into the household, only to spark mutual deceit and heartbreak.'],
  ['rw-68', 'Captain Nsabi', 'Action Comedy', 2024, 'https://www.youtube.com/results?search_query=CAPTAIN+NSABI+1+DOGITERI+NSABI+AGARUTSE', 'Comic clashes unfold when Dogiteri Nsabi takes on self-assigned security leadership.'],
  ['rw-69', 'Nyiragahinda', 'Classic Tragedy', 2022, 'https://www.youtube.com/results?search_query=FILM+NYIRAGAHINDA+PART+1', "A sorrowful narrative tracing an orphan girl's battle against hardship and exploitation."],
  ['rw-70', "Agahinda K'Umugabo", 'Social Drama', 2025, 'https://www.youtube.com/results?search_query=AGAHINDA+K+UMUGABO+PART+1+UMUNTUNZI+TV', 'Addresses the severe emotional distress of unemployment and self-worth challenges in a modern family.'],
  ['rw-71', 'Ibyiyisi', 'Street Drama', 2024, 'https://www.youtube.com/results?search_query=IBYIYISI+SE+01+Film+Nyarwanda', 'Explores the harsh lessons and unpredictable encounters of everyday street survival.'],
  ['rw-72', "Urukundo Rw'Ihishe", 'Romance', 2025, 'https://www.youtube.com/results?search_query=URUKUNDO+RW+IHISHE+yakunze+umukene+ataziko+aru+mukire', 'A secret romance blossoms between an undercover affluent worker and a market seller.'],
  ['rw-73', 'Gukanura', 'Suspense Drama', 2024, 'https://www.youtube.com/results?search_query=GUKAZANURA+Film+Nyarwanda+Nshyashya', 'Suspense builds as concealed motives behind a family inheritance threaten to turn violent.'],
  ['rw-74', 'Icyishi', 'Psychological Drama', 2025, 'https://www.youtube.com/results?search_query=ICYISHI+Film+nyarwanda+Rwanda+Movie', 'Depicts the psychological burden and paranoia following an unpunished crime.'],
  ['rw-75', 'Ibyingo', 'Family Melodrama', 2023, 'https://www.youtube.com/results?search_query=IBYINGO+Film+Nyarwanda+Nshyashya', 'Focuses on the unspoken boundaries and deep wounds that emerge within household relationships.'],
  ['rw-76', 'Kamari', 'Drama', 2026, 'https://www.youtube.com/results?search_query=KAMARI+AJE+GUSHAKA+YOHANA+I+KIGALI', 'A rural brother ventures into Kigali to hunt down a relative who absconded with ancestral property.'],
  ['rw-77', "Nd'Igabo", 'Romantic Drama', 2024, 'https://www.youtube.com/results?search_query=ND+IGABO+Film+DETTE+ABESHYWE+URUKUNDO', 'A heartbreaking love tale of young partners deceived by false marriage promises.'],
  ['rw-78', 'Love and Pain', 'Romance / Melodrama', 2026, 'https://www.youtube.com/results?search_query=LOVE+AND+PAIN+UMUKIRE+WIGIZE+UMUNYONZI', 'A wealthy man acts as a bicycle taxi rider to court a girl, only to discover a heartbreaking truth.'],
  ['rw-79', 'Amaraso Yanjye', 'Family Revenge', 2024, 'https://www.youtube.com/results?search_query=AMARASO+YANJYE+RWANDAN+MOVIE', 'A long-lost heir returns home to reclaim family dignity and rightful ownership.'],
  ['rw-80', "Ibanga Ry'Urugo", 'Domestic Drama', 2024, 'https://www.youtube.com/results?search_query=IBANGA+RY+URUGO+RWANDAN+MOVIE', 'Explores secrets kept hidden behind closed doors and the social price of domestic appearances.'],
  ['rw-81', 'Mwenedata', 'Brotherhood Drama', 2024, 'https://www.youtube.com/results?search_query=MWENEDATA+FILM+NYARWANDA', 'Two estranged brothers find themselves on opposite sides of a community legal dispute.'],
  ['rw-82', 'Icyumba Cyanjye', 'Suburban Melodrama', 2024, 'https://www.youtube.com/results?search_query=ICYUMBA+CYANJYE+AGMI+TV+SHOW', "A young tenant's modest room becomes the center of neighborhood secrets and interference."],
  ['rw-83', "Isezerano Ry'Ikinyoma", 'Suspense / Romance', 2024, 'https://www.youtube.com/results?search_query=ISEZERANO+RY+IKINYOMA+MICKY+TV', 'A web of forged promises threatens to derail an upcoming high-profile wedding.'],
  ['rw-84', 'Landlord', 'Urban Comedy', 2024, 'https://www.youtube.com/results?search_query=LANDLORD+RWANDAN+MOVIE+IBIHU+TV', 'Tenants and an eccentric landlord spar over rent deadlines, power outages, and funny living rules.'],
  ['rw-85', 'Kwiyenza', 'Community Drama', 2024, 'https://www.youtube.com/results?search_query=KWIYENZA+DOGITERI+NSABI+MUDUGUDU', 'Neighborhood village leaders face community dissent during an escalating leadership dispute.'],
  ['rw-86', "Ubuzima Bw'Ishuri", 'Youth / Campus Drama', 2022, 'https://www.youtube.com/results?search_query=UBUZIMA+BW+ISHURI+SERIES+DREAMS+TV', 'Follows boarding school students tackling academic stress, peer influence, and romance.'],
  ['rw-87', 'Inkovu', 'Social Drama', 2026, 'https://www.youtube.com/results?search_query=INKOVU+FILM+NYARWANDA+NSHYASHYA', 'A dramatic reflection on emotional scars, past regrets, and attempts at reconciliation.'],
  ['rw-88', "Umukobwa W'Umukire", 'Romance', 2025, 'https://www.youtube.com/results?search_query=UMUKOBWA+WUMUKiRE+UTEYE+NEZA+YiKUNDiYE+UMUSORE', 'An affluent heiress falls for a street vendor, sparking fierce family pushback.'],
  ['rw-89', "Umusore W'Umusabirizi", 'Moral Drama', 2025, 'https://www.youtube.com/results?search_query=UMUSORE+W+UMUSABiRiZi+YARi+AFUNZWE', 'A penniless youth wrongly accused of street theft gets bailed out by a kind benefactor.'],
  ['rw-90', 'Umugore Aroze Umugabo We', 'Domestic Thriller', 2025, 'https://www.youtube.com/results?search_query=UMUGORE+AROZE+UMUGABO+WE+RWANDAN+FULL+MOVIE', 'A domestic helper risks everything to protect a master from a covert household poisoning plot.'],
  ['rw-91', "Isezerano Ry'Urukundo", 'Romance', 2025, 'https://www.youtube.com/results?search_query=ISEZERANO+RY+URUKUNDO+PART+1+Moovi+Flix', 'Two young partners prove that genuine affection outlasts financial poverty.'],
  ['rw-92', "Umugenzi Nyuma Y'Ubukwe", 'Domestic Drama', 2024, 'https://www.youtube.com/results?search_query=UMUGENi+NYUMA+YUBUKWE+UMUGABO+AMUTEGETSE+KUJYA+YAMBARA+MASK', 'Strange marital restrictions surface after a wedding, unveiling unexpected psychological trauma.'],
  ['rw-93', 'Bijyiyobijya', 'Crime Comedy', 2024, 'https://www.youtube.com/results?search_query=BIJYIYOBIJYA+RWANDAN+FULL+MOVIE', 'A chaotic local personality gets caught red-handed, sparking a neighborhood chase.'],
  ['rw-94', 'Mama Sava', 'Comedy / Drama', 2023, 'https://www.youtube.com/results?search_query=MAMA+SAVA+FILM+NYARWANDA', 'A sharp-witted matriarch defends her household against comical scheming neighbors.'],
  ['rw-95', 'Mitsutsu', 'Action Comedy', 2024, 'https://www.youtube.com/results?search_query=MITSUTSU+RWANDAN+MOVIE', 'Slapstick street combat and chaotic local policing in an eccentric Kigali suburb.'],
  ['rw-96', 'Si Kosa', 'Moral Drama', 2025, 'https://www.youtube.com/results?search_query=SI+KOSA+FILM+NYARWANDA', 'Addresses human error, societal redemption, and the courage needed to forgive.'],
  ['rw-97', 'Big Mind', 'Street Thriller', 2024, 'https://www.youtube.com/results?search_query=BIG+MIND+EMPIRE+RWANDAN+FULL+MOVIE', 'Youth navigate urban hustles, local gangs, and the drive to secure a better future.'],
  ['rw-98', 'My Heart', 'Romance', 2025, 'https://www.youtube.com/results?search_query=MY+HEART+RWANDAN+FULL+MOVIE', 'A heart-wrenching romantic drama testing relationship endurance across distance and rumors.'],
  ['rw-99', 'Killaman', 'Action', 2024, 'https://www.youtube.com/results?search_query=KILLAMAN+RWANDAN+FULL+MOVIE', 'Action-packed suburban showdown featuring martial arts routines and neighborhood defense.'],
  ['rw-100', 'Nyaxo Comedy (The Movie)', 'Comedy', 2025, 'https://www.youtube.com/results?search_query=NYAXO+COMEDY+RWANDAN+FULL+MOVIE', "Feature-length situational comedy driven by Nyaxo's witty, chaotic village pranks."],
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
