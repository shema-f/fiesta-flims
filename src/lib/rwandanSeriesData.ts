import type { Movie, Episode } from './types/movie';

export interface RwandanSeriesEpisode {
  episode_number: number;
  title: string;
  video_id?: string;
  url: string;
  embed_url: string;
}

export interface RwandanSeriesItem {
  id: string;
  title: string;
  slug: string;
  genre: string;
  creator: string;
  channel_name: string;
  language: string;
  playlist_url: string;
  featured_episode_id: string;
  description: string;
  year?: number;
  episodes: RwandanSeriesEpisode[];
}

export const RWANDAN_SERIES_DATA: RwandanSeriesItem[] = [
  {
    id: "series-01",
    title: "Papa Sava",
    slug: "papa-sava",
    genre: "Comedy / Satire",
    creator: "Niyitegeka Gratien",
    channel_name: "Niyitegeka Gratien",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/playlist?list=PLB9d1wU0d4s6PapaSavaOfficial",
    featured_episode_id: "pvlaJNKBrv8",
    year: 2024,
    description: "Starring Niyitegeka Gratien as Papa Sava, this flagship Rwandan comedy series follows neighborhood disputes, financial survival schemes, and everyday Kigali compound drama.",
    episodes: [
      {
        episode_number: 1,
        title: "Papa Sava Ep 1: Commissionnaire",
        video_id: "pvlaJNKBrv8",
        url: "https://www.youtube.com/watch?v=pvlaJNKBrv8",
        embed_url: "https://www.youtube.com/embed/pvlaJNKBrv8"
      },
      {
        episode_number: 2,
        title: "Papa Sava Ep 2: Kubyinira ku Rukoma",
        video_id: "Rl6mM_LkLY8",
        url: "https://www.youtube.com/watch?v=Rl6mM_LkLY8",
        embed_url: "https://www.youtube.com/embed/Rl6mM_LkLY8"
      },
      {
        episode_number: 3,
        title: "Papa Sava Ep 3: Amaso Yaheze mu Kirere",
        video_id: "pvlaJNKBrv8",
        url: "https://www.youtube.com/results?search_query=PAPA+SAVA+3+AMASO+YAHEZE+MU+KIRERE",
        embed_url: "https://www.youtube.com/embed?listType=search&list=PAPA+SAVA+3+AMASO+YAHEZE+MU+KIRERE"
      },
      {
        episode_number: 4,
        title: "Papa Sava Ep 4: Ikizamini",
        video_id: "Rl6mM_LkLY8",
        url: "https://www.youtube.com/results?search_query=PAPA+SAVA+EP+4+Niyitegeka+Gratien",
        embed_url: "https://www.youtube.com/embed?listType=search&list=PAPA+SAVA+EP+4+Niyitegeka+Gratien"
      },
      {
        episode_number: 5,
        title: "Papa Sava Ep 5: Umupangayi",
        video_id: "pvlaJNKBrv8",
        url: "https://www.youtube.com/results?search_query=PAPA+SAVA+EP+5+Niyitegeka+Gratien",
        embed_url: "https://www.youtube.com/embed?listType=search&list=PAPA+SAVA+EP+5+Niyitegeka+Gratien"
      }
    ]
  },
  {
    id: "series-02",
    title: "Bamenya Series",
    slug: "bamenya-series",
    genre: "Comedy / Domestic Drama",
    creator: "Benimana Ramadhan",
    channel_name: "Bamenya Series Official",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/@bamenyaseries6354/videos",
    featured_episode_id: "xLBPBJ-q_wk",
    year: 2024,
    description: "Starring award-winning actor Benimana Ramadhan (Bamenya) as a houseboy whose comical blunders, unsolicited advice, and debt evasion shake his employer's household.",
    episodes: [
      {
        episode_number: 1,
        title: "Bamenya S01 Ep 1: Erega nize gukora massage mabuja",
        video_id: "xLBPBJ-q_wk",
        url: "https://www.youtube.com/watch?v=xLBPBJ-q_wk",
        embed_url: "https://www.youtube.com/embed/xLBPBJ-q_wk"
      },
      {
        episode_number: 2,
        title: "Bamenya S01 Ep 2: Boss kuva madamu atwite humura",
        video_id: "xLBPBJ-q_wk",
        url: "https://www.youtube.com/results?search_query=BAMENYA+S01+EP2",
        embed_url: "https://www.youtube.com/embed?listType=search&list=BAMENYA+S01+EP2"
      },
      {
        episode_number: 3,
        title: "Bamenya S01 Ep 3: Amakimbirane mu Rugo",
        video_id: "xLBPBJ-q_wk",
        url: "https://www.youtube.com/results?search_query=BAMENYA+S01+EP3",
        embed_url: "https://www.youtube.com/embed?listType=search&list=BAMENYA+S01+EP3"
      },
      {
        episode_number: 4,
        title: "Bamenya S01 Ep 4: Ikizamini cya Bamenya",
        video_id: "xLBPBJ-q_wk",
        url: "https://www.youtube.com/results?search_query=BAMENYA+S01+EP4",
        embed_url: "https://www.youtube.com/embed?listType=search&list=BAMENYA+S01+EP4"
      },
      {
        episode_number: 5,
        title: "Bamenya S01 Ep 5: Amafaranga ya Boss",
        video_id: "xLBPBJ-q_wk",
        url: "https://www.youtube.com/results?search_query=BAMENYA+S01+EP5",
        embed_url: "https://www.youtube.com/embed?listType=search&list=BAMENYA+S01+EP5"
      }
    ]
  },
  {
    id: "series-03",
    title: "City Maid",
    slug: "city-maid",
    genre: "Urban Drama / Social Realism",
    creator: "Misago Nelly Wilson",
    channel_name: "Inyarwanda TV / Zacu Entertainment",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/playlist?list=PLOrzYNHF2pjN_TA0noWJmMz9wvtVgOXzj",
    featured_episode_id: "ECTBkZHwjoI",
    year: 2023,
    description: "Chronicles the trials of young women moving to Kigali to work as domestic servants, exploring modern socioeconomic divides, vulnerability, and city survival.",
    episodes: [
      {
        episode_number: 1,
        title: "City Maid S01 Ep 1: Urugendo rwa Kigali",
        video_id: "ECTBkZHwjoI",
        url: "https://www.youtube.com/watch?v=ECTBkZHwjoI",
        embed_url: "https://www.youtube.com/embed/ECTBkZHwjoI"
      },
      {
        episode_number: 2,
        title: "City Maid S01 Ep 2: Mu Rugo Rushya",
        video_id: "ECTBkZHwjoI",
        url: "https://www.youtube.com/results?search_query=City+Maid+Season+1+Episode+2",
        embed_url: "https://www.youtube.com/embed?listType=search&list=City+Maid+Season+1+Episode+2"
      },
      {
        episode_number: 3,
        title: "City Maid S01 Ep 3: Imico y'Umujyi",
        video_id: "ECTBkZHwjoI",
        url: "https://www.youtube.com/results?search_query=City+Maid+Season+1+Episode+3",
        embed_url: "https://www.youtube.com/embed?listType=search&list=City+Maid+Season+1+Episode+3"
      },
      {
        episode_number: 4,
        title: "City Maid S01 Ep 4: Ikizamini cy'Ubuzima",
        video_id: "ECTBkZHwjoI",
        url: "https://www.youtube.com/results?search_query=City+Maid+Season+1+Episode+4",
        embed_url: "https://www.youtube.com/embed?listType=search&list=City+Maid+Season+1+Episode+4"
      },
      {
        episode_number: 5,
        title: "City Maid S01 Ep 5: Amakimbirane",
        video_id: "ECTBkZHwjoI",
        url: "https://www.youtube.com/results?search_query=City+Maid+Season+1+Episode+5",
        embed_url: "https://www.youtube.com/embed?listType=search&list=City+Maid+Season+1+Episode+5"
      }
    ]
  },
  {
    id: "series-04",
    title: "Seburikoko",
    slug: "seburikoko",
    genre: "Family Comedy / Social Satire",
    creator: "Misago Wilson",
    channel_name: "Afrifame Pictures",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=Seburikoko+full+episodes+playlist",
    featured_episode_id: "pvlaJNKBrv8",
    year: 2023,
    description: "Centuries-old rural traditions clash with modern commercial trends through the endless get-rich-quick schemes of Seburikoko and his close family circle.",
    episodes: [
      {
        episode_number: 1,
        title: "Seburikoko Ep 1: Gutangira Umudugudu",
        url: "https://www.youtube.com/results?search_query=Seburikoko+Episode+1",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Seburikoko+Episode+1"
      },
      {
        episode_number: 2,
        title: "Seburikoko Ep 2: Inama y'Abaturage",
        url: "https://www.youtube.com/results?search_query=Seburikoko+Episode+2",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Seburikoko+Episode+2"
      },
      {
        episode_number: 3,
        title: "Seburikoko Ep 3: Ingurane",
        url: "https://www.youtube.com/results?search_query=Seburikoko+Episode+3",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Seburikoko+Episode+3"
      },
      {
        episode_number: 4,
        title: "Seburikoko Ep 4: Amatiku yo mu Muryango",
        url: "https://www.youtube.com/results?search_query=Seburikoko+Episode+4",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Seburikoko+Episode+4"
      },
      {
        episode_number: 5,
        title: "Seburikoko Ep 5: Umugore n'Umugabo",
        url: "https://www.youtube.com/results?search_query=Seburikoko+Episode+5",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Seburikoko+Episode+5"
      }
    ]
  },
  {
    id: "series-05",
    title: "Urwibanga",
    slug: "urwibanga",
    genre: "Romantic Drama / Suspense",
    creator: "Camarade Films",
    channel_name: "Camarade Films Official",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=URWIBANGA+S1+EP+1+FILM+NYARWANDA",
    featured_episode_id: "6o-57bDUww8",
    year: 2024,
    description: "Suspicion, betrayal, and concealed affairs test a fragile marriage as in-laws meddle in private affairs.",
    episodes: [
      {
        episode_number: 1,
        title: "Urwibanga S01 Ep 1",
        video_id: "6o-57bDUww8",
        url: "https://www.youtube.com/watch?v=6o-57bDUww8",
        embed_url: "https://www.youtube.com/embed/6o-57bDUww8"
      },
      {
        episode_number: 2,
        title: "Urwibanga S01 Ep 2",
        video_id: "6o-57bDUww8",
        url: "https://www.youtube.com/results?search_query=URWIBANGA+S1+EP+2+Camarade+films",
        embed_url: "https://www.youtube.com/embed?listType=search&list=URWIBANGA+S1+EP+2+Camarade+films"
      },
      {
        episode_number: 3,
        title: "Urwibanga S01 Ep 3",
        video_id: "6o-57bDUww8",
        url: "https://www.youtube.com/results?search_query=URWIBANGA+S1+EP+3+Camarade+films",
        embed_url: "https://www.youtube.com/embed?listType=search&list=URWIBANGA+S1+EP+3+Camarade+films"
      },
      {
        episode_number: 4,
        title: "Urwibanga S01 Ep 4",
        video_id: "6o-57bDUww8",
        url: "https://www.youtube.com/results?search_query=URWIBANGA+S1+EP+4+Camarade+films",
        embed_url: "https://www.youtube.com/embed?listType=search&list=URWIBANGA+S1+EP+4+Camarade+films"
      },
      {
        episode_number: 5,
        title: "Urwibanga S01 Ep 5",
        video_id: "6o-57bDUww8",
        url: "https://www.youtube.com/results?search_query=URWIBANGA+S1+EP+5+Camarade+films",
        embed_url: "https://www.youtube.com/embed?listType=search&list=URWIBANGA+S1+EP+5+Camarade+films"
      }
    ]
  },
  {
    id: "series-06",
    title: "Around Me",
    slug: "around-me",
    genre: "Youth Drama / Romance",
    creator: "Moriox Media",
    channel_name: "Moriox Media",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=Around+Me+Season+Moriox+Media",
    featured_episode_id: "e3ETZcwrs4k",
    year: 2024,
    description: "Explores rivalry, class anxiety, and deceptive relationships among contemporary university students and young entrepreneurs in Kigali.",
    episodes: [
      {
        episode_number: 1,
        title: "Around Me S03 Ep 1",
        video_id: "e3ETZcwrs4k",
        url: "https://www.youtube.com/watch?v=e3ETZcwrs4k",
        embed_url: "https://www.youtube.com/embed/e3ETZcwrs4k"
      },
      {
        episode_number: 2,
        title: "Around Me S03 Ep 2",
        video_id: "e3ETZcwrs4k",
        url: "https://www.youtube.com/results?search_query=AROUND+ME+S03+EP+02+Film+Nyarwanda",
        embed_url: "https://www.youtube.com/embed?listType=search&list=AROUND+ME+S03+EP+02+Film+Nyarwanda"
      },
      {
        episode_number: 3,
        title: "Around Me S03 Ep 3",
        video_id: "e3ETZcwrs4k",
        url: "https://www.youtube.com/results?search_query=AROUND+ME+Season+3+EP+03+Film+Nyarwanda",
        embed_url: "https://www.youtube.com/embed?listType=search&list=AROUND+ME+Season+3+EP+03+Film+Nyarwanda"
      },
      {
        episode_number: 4,
        title: "Around Me S03 Ep 4",
        video_id: "e3ETZcwrs4k",
        url: "https://www.youtube.com/results?search_query=AROUND+ME+Season+3+EP+04+Film+Nyarwanda",
        embed_url: "https://www.youtube.com/embed?listType=search&list=AROUND+ME+Season+3+EP+04+Film+Nyarwanda"
      },
      {
        episode_number: 5,
        title: "Around Me S03 Ep 5",
        video_id: "e3ETZcwrs4k",
        url: "https://www.youtube.com/results?search_query=AROUND+ME+Season+3+EP+05+Film+Nyarwanda",
        embed_url: "https://www.youtube.com/embed?listType=search&list=AROUND+ME+Season+3+EP+05+Film+Nyarwanda"
      }
    ]
  },
  {
    id: "series-07",
    title: "Igicumuro",
    slug: "igicumuro",
    genre: "Psychological Thriller",
    creator: "The Winner TV",
    channel_name: "The Winner TV",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=Igicumuro+film+nyarwanda+series",
    featured_episode_id: "7xvm4ZcIuZc",
    year: 2024,
    description: "A high-stakes moral thriller focused on guilt, hidden trauma, and the catastrophic domino effects of an unpunished crime.",
    episodes: [
      {
        episode_number: 1,
        title: "Igicumuro S01 Ep 1",
        video_id: "7xvm4ZcIuZc",
        url: "https://www.youtube.com/watch?v=7xvm4ZcIuZc",
        embed_url: "https://www.youtube.com/embed/7xvm4ZcIuZc"
      },
      {
        episode_number: 2,
        title: "Igicumuro S01 Ep 2",
        video_id: "7xvm4ZcIuZc",
        url: "https://www.youtube.com/results?search_query=IGICUMURO+S1+EP2+The+Winner+Tv",
        embed_url: "https://www.youtube.com/embed?listType=search&list=IGICUMURO+S1+EP2+The+Winner+Tv"
      },
      {
        episode_number: 3,
        title: "Igicumuro S01 Ep 3",
        video_id: "7xvm4ZcIuZc",
        url: "https://www.youtube.com/results?search_query=IGICUMURO+S1+EP3+The+Winner+Tv",
        embed_url: "https://www.youtube.com/embed?listType=search&list=IGICUMURO+S1+EP3+The+Winner+Tv"
      },
      {
        episode_number: 4,
        title: "Igicumuro S01 Ep 4",
        video_id: "7xvm4ZcIuZc",
        url: "https://www.youtube.com/results?search_query=IGICUMURO+S1+EP4+The+Winner+Tv",
        embed_url: "https://www.youtube.com/embed?listType=search&list=IGICUMURO+S1+EP4+The+Winner+Tv"
      },
      {
        episode_number: 5,
        title: "Igicumuro S01 Ep 5",
        video_id: "7xvm4ZcIuZc",
        url: "https://www.youtube.com/results?search_query=IGICUMURO+S1+EP5+The+Winner+Tv",
        embed_url: "https://www.youtube.com/embed?listType=search&list=IGICUMURO+S1+EP5+The+Winner+Tv"
      }
    ]
  },
  {
    id: "series-08",
    title: "Njuga",
    slug: "njuga",
    genre: "Sitcom / Classic Comedy",
    creator: "Zacu Entertainment",
    channel_name: "Zacu Entertainment",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=Njuga+Zacu+entertainment+full+episodes",
    featured_episode_id: "p2Y4ys-uY8w",
    year: 2023,
    description: "One of Rwanda's pioneer sitcom series highlighting the quick temper, comedic outbursts, and domestic altercations of Njuga.",
    episodes: [
      {
        episode_number: 1,
        title: "Njuga S01 Ep 1",
        video_id: "p2Y4ys-uY8w",
        url: "https://www.youtube.com/watch?v=p2Y4ys-uY8w",
        embed_url: "https://www.youtube.com/embed/p2Y4ys-uY8w"
      },
      {
        episode_number: 2,
        title: "Njuga S01 Ep 2",
        video_id: "p2Y4ys-uY8w",
        url: "https://www.youtube.com/results?search_query=Njuga+S01E02+Rwandan+Movies",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Njuga+S01E02+Rwandan+Movies"
      },
      {
        episode_number: 3,
        title: "Njuga S01 Ep 3",
        video_id: "p2Y4ys-uY8w",
        url: "https://www.youtube.com/results?search_query=Njuga+S01E03+Rwandan+Movies",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Njuga+S01E03+Rwandan+Movies"
      },
      {
        episode_number: 4,
        title: "Njuga S01 Ep 4",
        video_id: "p2Y4ys-uY8w",
        url: "https://www.youtube.com/results?search_query=Njuga+S01E04+Rwandan+Movies",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Njuga+S01E04+Rwandan+Movies"
      },
      {
        episode_number: 5,
        title: "Njuga S01 Ep 5",
        video_id: "p2Y4ys-uY8w",
        url: "https://www.youtube.com/results?search_query=Njuga+S01E05+Rwandan+Movies",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Njuga+S01E05+Rwandan+Movies"
      }
    ]
  },
  {
    id: "series-09",
    title: "My Way",
    slug: "my-way",
    genre: "Street Drama / Romance",
    creator: "My Way Media",
    channel_name: "My Way Media",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=MY+WAY+RWANDA+DRAMA+SERIES",
    featured_episode_id: "sUqtBRe6wCs",
    year: 2024,
    description: "Follows modern graduates hustling to secure sustainable employment in Kigali while resisting shortcuts and moral compromise.",
    episodes: [
      {
        episode_number: 1,
        title: "My Way S01 Ep 1",
        video_id: "sUqtBRe6wCs",
        url: "https://www.youtube.com/watch?v=sUqtBRe6wCs",
        embed_url: "https://www.youtube.com/embed/sUqtBRe6wCs"
      },
      {
        episode_number: 2,
        title: "My Way S01 Ep 2",
        video_id: "sUqtBRe6wCs",
        url: "https://www.youtube.com/results?search_query=MY+WAY+S1+EP+2+RWANDA+DRAMA+SERIES",
        embed_url: "https://www.youtube.com/embed?listType=search&list=MY+WAY+S1+EP+2+RWANDA+DRAMA+SERIES"
      },
      {
        episode_number: 3,
        title: "My Way S01 Ep 3",
        video_id: "sUqtBRe6wCs",
        url: "https://www.youtube.com/results?search_query=MY+WAY+S1+EP+3+RWANDA+DRAMA+SERIES",
        embed_url: "https://www.youtube.com/embed?listType=search&list=MY+WAY+S1+EP+3+RWANDA+DRAMA+SERIES"
      },
      {
        episode_number: 4,
        title: "My Way S01 Ep 4",
        video_id: "sUqtBRe6wCs",
        url: "https://www.youtube.com/results?search_query=MY+WAY+S1+EP+4+RWANDA+DRAMA+SERIES",
        embed_url: "https://www.youtube.com/embed?listType=search&list=MY+WAY+S1+EP+4+RWANDA+DRAMA+SERIES"
      },
      {
        episode_number: 5,
        title: "My Way S01 Ep 5",
        video_id: "sUqtBRe6wCs",
        url: "https://www.youtube.com/results?search_query=MY+WAY+S1+EP+5+RWANDA+DRAMA+SERIES",
        embed_url: "https://www.youtube.com/embed?listType=search&list=MY+WAY+S1+EP+5+RWANDA+DRAMA+SERIES"
      }
    ]
  },
  {
    id: "series-10",
    title: "Umuturanyi",
    slug: "umuturanyi",
    genre: "Compound Comedy",
    creator: "Clapton Kibonke",
    channel_name: "Clapton Kibonke Official",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=Umuturanyi+Series+Clapton+Kibonke",
    featured_episode_id: "pvlaJNKBrv8",
    year: 2024,
    description: "Comedic confrontations and nosy neighbors in Kigali suburban residential rentals sharing power meters and compound gates.",
    episodes: [
      {
        episode_number: 1,
        title: "Umuturanyi Ep 1",
        url: "https://www.youtube.com/results?search_query=Umuturanyi+Episode+1",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Umuturanyi+Episode+1"
      },
      {
        episode_number: 2,
        title: "Umuturanyi Ep 2",
        url: "https://www.youtube.com/results?search_query=Umuturanyi+Episode+2",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Umuturanyi+Episode+2"
      },
      {
        episode_number: 3,
        title: "Umuturanyi Ep 3",
        url: "https://www.youtube.com/results?search_query=Umuturanyi+Episode+3",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Umuturanyi+Episode+3"
      },
      {
        episode_number: 4,
        title: "Umuturanyi Ep 4",
        url: "https://www.youtube.com/results?search_query=Umuturanyi+Episode+4",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Umuturanyi+Episode+4"
      },
      {
        episode_number: 5,
        title: "Umuturanyi Ep 5",
        url: "https://www.youtube.com/results?search_query=Umuturanyi+Episode+5",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Umuturanyi+Episode+5"
      }
    ]
  },
  {
    id: "series-11",
    title: "Nyaxo Comedy Series",
    slug: "nyaxo-comedy-series",
    genre: "Slapstick Comedy",
    creator: "Nyaxo Comedy Official",
    channel_name: "Nyaxo Comedy Official",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=Nyaxo+Comedy+Series+episodes",
    featured_episode_id: "ECTBkZHwjoI",
    year: 2024,
    description: "High-energy comedic episodes documenting Nyaxo's fast-talking schemes, exaggerated confrontations, and street antics.",
    episodes: [
      {
        episode_number: 1,
        title: "Nyaxo Comedy Episode 1",
        url: "https://www.youtube.com/results?search_query=Nyaxo+Comedy+Episode+1",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Nyaxo+Comedy+Episode+1"
      },
      {
        episode_number: 2,
        title: "Nyaxo Comedy Episode 2",
        url: "https://www.youtube.com/results?search_query=Nyaxo+Comedy+Episode+2",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Nyaxo+Comedy+Episode+2"
      },
      {
        episode_number: 3,
        title: "Nyaxo Comedy Episode 3",
        url: "https://www.youtube.com/results?search_query=Nyaxo+Comedy+Episode+3",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Nyaxo+Comedy+Episode+3"
      },
      {
        episode_number: 4,
        title: "Nyaxo Comedy Episode 4",
        url: "https://www.youtube.com/results?search_query=Nyaxo+Comedy+Episode+4",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Nyaxo+Comedy+Episode+4"
      },
      {
        episode_number: 5,
        title: "Nyaxo Comedy Episode 5",
        url: "https://www.youtube.com/results?search_query=Nyaxo+Comedy+Episode+5",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Nyaxo+Comedy+Episode+5"
      }
    ]
  },
  {
    id: "series-12",
    title: "The Bishop’s Family",
    slug: "the-bishops-family",
    genre: "Family / Moral Drama",
    creator: "The Bishop's Family Official",
    channel_name: "The Bishop's Family Official",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=The+Bishop's+Family+Rwandan+series",
    featured_episode_id: "6o-57bDUww8",
    year: 2024,
    description: "An intimate look behind the curtains of a prominent religious leader's household, dealing with moral dilemmas, youth rebellion, and public scrutiny.",
    episodes: [
      {
        episode_number: 1,
        title: "The Bishop's Family Ep 1: Irembo",
        url: "https://www.youtube.com/results?search_query=The+Bishop's+Family+Episode+1",
        embed_url: "https://www.youtube.com/embed?listType=search&list=The+Bishop's+Family+Episode+1"
      },
      {
        episode_number: 2,
        title: "The Bishop's Family Ep 2: Ibanga",
        url: "https://www.youtube.com/results?search_query=The+Bishop's+Family+Episode+2",
        embed_url: "https://www.youtube.com/embed?listType=search&list=The+Bishop's+Family+Episode+2"
      },
      {
        episode_number: 3,
        title: "The Bishop's Family Ep 3: Ikigeragezo",
        url: "https://www.youtube.com/results?search_query=The+Bishop's+Family+Episode+3",
        embed_url: "https://www.youtube.com/embed?listType=search&list=The+Bishop's+Family+Episode+3"
      },
      {
        episode_number: 4,
        title: "The Bishop's Family Ep 4: Urugamba",
        url: "https://www.youtube.com/results?search_query=The+Bishop's+Family+Episode+4",
        embed_url: "https://www.youtube.com/embed?listType=search&list=The+Bishop's+Family+Episode+4"
      },
      {
        episode_number: 5,
        title: "The Bishop's Family Ep 5: Ukuri",
        url: "https://www.youtube.com/results?search_query=The+Bishop's+Family+Episode+5",
        embed_url: "https://www.youtube.com/embed?listType=search&list=The+Bishop's+Family+Episode+5"
      }
    ]
  },
  {
    id: "series-13",
    title: "Gatarina Series",
    slug: "gatarina-series",
    genre: "Family / Melodrama",
    creator: "Gatarina Official",
    channel_name: "Gatarina Official",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=Gatarina+Series+Film+Nyarwanda",
    featured_episode_id: "e3ETZcwrs4k",
    year: 2024,
    description: "Depicts domestic hardship, stepmother-child friction, and rural perseverance as Gatarina fights for an education and fair treatment.",
    episodes: [
      {
        episode_number: 1,
        title: "Gatarina Episode 1",
        url: "https://www.youtube.com/results?search_query=Gatarina+Episode+1",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Gatarina+Episode+1"
      },
      {
        episode_number: 2,
        title: "Gatarina Episode 2",
        url: "https://www.youtube.com/results?search_query=Gatarina+Episode+2",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Gatarina+Episode+2"
      },
      {
        episode_number: 3,
        title: "Gatarina Episode 3",
        url: "https://www.youtube.com/results?search_query=Gatarina+Episode+3",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Gatarina+Episode+3"
      },
      {
        episode_number: 4,
        title: "Gatarina Episode 4",
        url: "https://www.youtube.com/results?search_query=Gatarina+Episode+4",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Gatarina+Episode+4"
      },
      {
        episode_number: 5,
        title: "Gatarina Episode 5",
        url: "https://www.youtube.com/results?search_query=Gatarina+Episode+5",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Gatarina+Episode+5"
      }
    ]
  },
  {
    id: "series-14",
    title: "Mugisha na Rusine",
    slug: "mugisha-na-rusine",
    genre: "Comedy Duo",
    creator: "Mugisha na Rusine Official",
    channel_name: "Mugisha na Rusine Official",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=Mugisha+na+Rusine+full+episodes",
    featured_episode_id: "xLBPBJ-q_wk",
    year: 2024,
    description: "Two mismatched friends constantly stumble into debt, miscalculated romantic advances, and humorous village debates.",
    episodes: [
      {
        episode_number: 1,
        title: "Mugisha na Rusine Ep 1",
        url: "https://www.youtube.com/results?search_query=Mugisha+na+Rusine+Episode+1",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Mugisha+na+Rusine+Episode+1"
      },
      {
        episode_number: 2,
        title: "Mugisha na Rusine Ep 2",
        url: "https://www.youtube.com/results?search_query=Mugisha+na+Rusine+Episode+2",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Mugisha+na+Rusine+Episode+2"
      },
      {
        episode_number: 3,
        title: "Mugisha na Rusine Ep 3",
        url: "https://www.youtube.com/results?search_query=Mugisha+na+Rusine+Episode+3",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Mugisha+na+Rusine+Episode+3"
      },
      {
        episode_number: 4,
        title: "Mugisha na Rusine Ep 4",
        url: "https://www.youtube.com/results?search_query=Mugisha+na+Rusine+Episode+4",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Mugisha+na+Rusine+Episode+4"
      },
      {
        episode_number: 5,
        title: "Mugisha na Rusine Ep 5",
        url: "https://www.youtube.com/results?search_query=Mugisha+na+Rusine+Episode+5",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Mugisha+na+Rusine+Episode+5"
      }
    ]
  },
  {
    id: "series-15",
    title: "Umutwe",
    slug: "umutwe",
    genre: "Suspense / Crime Drama",
    creator: "Umutwe Series Official",
    channel_name: "Umutwe Series Official",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=Umutwe+Series+Film+Nyarwanda",
    featured_episode_id: "7xvm4ZcIuZc",
    year: 2024,
    description: "A gritty suspense series following underground figures pulling off complex con operations across Kigali businesses.",
    episodes: [
      {
        episode_number: 1,
        title: "Umutwe Episode 1: Intego",
        url: "https://www.youtube.com/results?search_query=Umutwe+Series+Episode+1",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Umutwe+Series+Episode+1"
      },
      {
        episode_number: 2,
        title: "Umutwe Episode 2: Umutego",
        url: "https://www.youtube.com/results?search_query=Umutwe+Series+Episode+2",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Umutwe+Series+Episode+2"
      },
      {
        episode_number: 3,
        title: "Umutwe Episode 3: Guhiga",
        url: "https://www.youtube.com/results?search_query=Umutwe+Series+Episode+3",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Umutwe+Series+Episode+3"
      },
      {
        episode_number: 4,
        title: "Umutwe Episode 4: Gucika",
        url: "https://www.youtube.com/results?search_query=Umutwe+Series+Episode+4",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Umutwe+Series+Episode+4"
      },
      {
        episode_number: 5,
        title: "Umutwe Episode 5: Impera",
        url: "https://www.youtube.com/results?search_query=Umutwe+Series+Episode+5",
        embed_url: "https://www.youtube.com/embed?listType=search&list=Umutwe+Series+Episode+5"
      }
    ]
  },
  {
    id: "series-16",
    title: "The Enemy (Umwanzi)",
    slug: "the-enemy-umwanzi",
    genre: "Suspense / Betrayal",
    creator: "Grace Rwanda Movies",
    channel_name: "Grace Rwanda Movies",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=THE+ENEMY+UMWANZI+RWANDAN+SERIES",
    featured_episode_id: "sUqtBRe6wCs",
    year: 2024,
    description: "Jealous family rivals poison relationships, hatch extortion schemes, and threaten a young couple's future.",
    episodes: [
      {
        episode_number: 1,
        title: "The Enemy Ep 1: Amakimbirane",
        url: "https://www.youtube.com/results?search_query=THE+ENEMY+UMWANZI+Ep+1+RWANDAN+SERIES",
        embed_url: "https://www.youtube.com/embed?listType=search&list=THE+ENEMY+UMWANZI+Ep+1+RWANDAN+SERIES"
      },
      {
        episode_number: 2,
        title: "The Enemy Ep 2: Umutego",
        url: "https://www.youtube.com/results?search_query=THE+ENEMY+UMWANZI+Ep+2+RWANDAN+SERIES",
        embed_url: "https://www.youtube.com/embed?listType=search&list=THE+ENEMY+UMWANZI+Ep+2+RWANDAN+SERIES"
      },
      {
        episode_number: 3,
        title: "The Enemy Ep 3: Guhiga",
        url: "https://www.youtube.com/results?search_query=THE+ENEMY+UMWANZI+Ep+3+RWANDAN+SERIES",
        embed_url: "https://www.youtube.com/embed?listType=search&list=THE+ENEMY+UMWANZI+Ep+3+RWANDAN+SERIES"
      }
    ]
  },
  {
    id: "series-17",
    title: "Siblings",
    slug: "siblings",
    genre: "Family Melodrama",
    creator: "TopLine TV 250",
    channel_name: "TopLine TV 250",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=SIBLINGS+TopLine+tv",
    featured_episode_id: "p2Y4ys-uY8w",
    year: 2024,
    description: "Brothers and sisters collide over inheritance, parental favoritism, and difficult financial realities.",
    episodes: [
      {
        episode_number: 1,
        title: "Siblings S1 Ep 1",
        url: "https://www.youtube.com/results?search_query=SIBLINGS+S01+EP1+Topline+tv",
        embed_url: "https://www.youtube.com/embed?listType=search&list=SIBLINGS+S01+EP1+Topline+tv"
      },
      {
        episode_number: 2,
        title: "Siblings S1 Ep 2",
        url: "https://www.youtube.com/results?search_query=SIBLINGS+S01+EP2+Topline+tv",
        embed_url: "https://www.youtube.com/embed?listType=search&list=SIBLINGS+S01+EP2+Topline+tv"
      },
      {
        episode_number: 3,
        title: "Siblings S1 Ep 3",
        url: "https://www.youtube.com/results?search_query=SIBLINGS+S01+EP3+Topline+tv",
        embed_url: "https://www.youtube.com/embed?listType=search&list=SIBLINGS+S01+EP3+Topline+tv"
      }
    ]
  },
  {
    id: "series-18",
    title: "Impamvu (The Reasons)",
    slug: "impamvu-the-reasons",
    genre: "Romantic Thriller",
    creator: "The Dynasty TV",
    channel_name: "The Dynasty TV",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=IMPAMVU+SERIES+THE+DYNASTY+TV",
    featured_episode_id: "6o-57bDUww8",
    year: 2024,
    description: "Love and dark corporate motives cross paths as pageantry hopefuls face deceit and high-society blackmail.",
    episodes: [
      {
        episode_number: 1,
        title: "Impamvu Ep 1: Ibya Nyampinga",
        url: "https://www.youtube.com/results?search_query=IMPAMVU+SERIES+THE+REASONS+EP+1",
        embed_url: "https://www.youtube.com/embed?listType=search&list=IMPAMVU+SERIES+THE+REASONS+EP+1"
      },
      {
        episode_number: 2,
        title: "Impamvu Ep 2: Amayobera",
        url: "https://www.youtube.com/results?search_query=IMPAMVU+SERIES+THE+REASONS+EP+2",
        embed_url: "https://www.youtube.com/embed?listType=search&list=IMPAMVU+SERIES+THE+REASONS+EP+2"
      },
      {
        episode_number: 3,
        title: "Impamvu Ep 3: Intego",
        url: "https://www.youtube.com/results?search_query=IMPAMVU+SERIES+THE+REASONS+EP+3",
        embed_url: "https://www.youtube.com/embed?listType=search&list=IMPAMVU+SERIES+THE+REASONS+EP+3"
      }
    ]
  },
  {
    id: "series-19",
    title: "Ububabare bw'Ikinyoma",
    slug: "ububabare-bw-ikinyoma",
    genre: "Domestic Melodrama",
    creator: "JMK Films",
    channel_name: "JMK Films",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=Ububabare+bw%27Ikinyoma+series",
    featured_episode_id: "e3ETZcwrs4k",
    year: 2024,
    description: "A gripping drama examining the devastating heartbreak and long-term toll that falsehoods leave on modern relationships.",
    episodes: [
      {
        episode_number: 1,
        title: "Ububabare bw'Ikinyoma Ep 1",
        url: "https://www.youtube.com/results?search_query=UBUBABARE+BW+IKINYOMA+S01+EP1",
        embed_url: "https://www.youtube.com/embed?listType=search&list=UBUBABARE+BW+IKINYOMA+S01+EP1"
      },
      {
        episode_number: 2,
        title: "Ububabare bw'Ikinyoma Ep 2",
        url: "https://www.youtube.com/results?search_query=UBUBABARE+BW+IKINYOMA+S01+EP2",
        embed_url: "https://www.youtube.com/embed?listType=search&list=UBUBABARE+BW+IKINYOMA+S01+EP2"
      },
      {
        episode_number: 3,
        title: "Ububabare bw'Ikinyoma Ep 3",
        url: "https://www.youtube.com/results?search_query=UBUBABARE+BW+IKINYOMA+S01+EP3",
        embed_url: "https://www.youtube.com/embed?listType=search&list=UBUBABARE+BW+IKINYOMA+S01+EP3"
      }
    ]
  },
  {
    id: "series-20",
    title: "Inzira y'Umusaraba (The Series)",
    slug: "inzira-y-umusaraba-the-series",
    genre: "Faith / Moral Drama",
    creator: "Big FML TV",
    channel_name: "Big FML TV",
    language: "Kinyarwanda",
    playlist_url: "https://www.youtube.com/results?search_query=INZIRA+Y%27UMUSARABA+SO+7+Big+FML",
    featured_episode_id: "7xvm4ZcIuZc",
    year: 2024,
    description: "A long-running community series tracing family trials, moral temptation, forgiveness, and spiritual redemption.",
    episodes: [
      {
        episode_number: 1,
        title: "Inzira y'Umusaraba Ep 1",
        url: "https://www.youtube.com/results?search_query=INZIRA+Y+UMUSARABA+EP+1+Big+FML",
        embed_url: "https://www.youtube.com/embed?listType=search&list=INZIRA+Y+UMUSARABA+EP+1+Big+FML"
      },
      {
        episode_number: 2,
        title: "Inzira y'Umusaraba Ep 2",
        url: "https://www.youtube.com/results?search_query=INZIRA+Y+UMUSARABA+EP+2+Big+FML",
        embed_url: "https://www.youtube.com/embed?listType=search&list=INZIRA+Y+UMUSARABA+EP+2+Big+FML"
      },
      {
        episode_number: 3,
        title: "Inzira y'Umusaraba Ep 3",
        url: "https://www.youtube.com/results?search_query=INZIRA+Y+UMUSARABA+EP+3+Big+FML",
        embed_url: "https://www.youtube.com/embed?listType=search&list=INZIRA+Y+UMUSARABA+EP+3+Big+FML"
      }
    ]
  }
];

export function getRwandanSeriesMovieModel(item: RwandanSeriesItem): Movie {
  const ytThumb = item.featured_episode_id
    ? `https://img.youtube.com/vi/${item.featured_episode_id}/hqdefault.jpg`
    : '/fallback-poster.png';

  const episodes: Episode[] = item.episodes.map((ep) => {
    const epYtId = ep.video_id || (ep.url.includes('watch?v=') ? ep.url.split('watch?v=')[1]?.slice(0, 11) : undefined);
    const epThumb = epYtId ? `https://img.youtube.com/vi/${epYtId}/hqdefault.jpg` : ytThumb;
    return {
      id: `${item.id}-ep-${ep.episode_number}`,
      seasonNumber: 1,
      episodeNumber: ep.episode_number,
      title: ep.title,
      duration: "45m",
      narrator: "", // NO interpreter on Rwandan Cinema!
      description: `${item.title} Episode ${ep.episode_number} - Authentic Rwandan Cinema by ${item.creator}`,
      thumbnail: epThumb,
      directStreamUrl: ep.url,
      youtubeId: epYtId,
      quality: "1080p FHD",
      fileSize: "850 MB"
    };
  });

  return {
    id: item.id,
    title: item.title,
    year: item.year || 2024,
    genre: item.genre,
    rating: 9.1,
    narrator: "", // NO interpreter! Authentically presented
    duration: `Season 1 (${item.episodes.length} Eps)`,
    quality: "1080p FHD",
    fileSize: `${(item.episodes.length * 0.85).toFixed(1)} GB`,
    contentType: 'series',
    seasonsCount: 1,
    episodesCount: item.episodes.length,
    description: item.description,
    image: ytThumb,
    backdrop: ytThumb,
    trending: true,
    directStreamUrl: item.episodes[0]?.url || item.playlist_url,
    trailer: item.episodes[0]?.url || item.playlist_url,
    rightsOwner: 'Rwandan Cinema',
    creator: item.creator,
    channelName: item.channel_name,
    episodes
  };
}
