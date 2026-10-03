export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string;
  rating: number;
  image: string;
  trending?: boolean;
  narrator?: string;
}

export const movieData: Movie[] = [
  {
    id: 1,
    title: "Echoes of Tomorrow",
    year: 2025,
    genre: "Sci-Fi",
    rating: 8.9,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=epic%20sci-fi%20movie%20poster%20futuristic%20city%20dark%20atmosphere&image_size=portrait_4_3",
    trending: true
  },
  {
    id: 2,
    title: "Midnight Shadows",
    year: 2024,
    genre: "Thriller",
    rating: 8.5,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=thriller%20movie%20poster%20dark%20mysterious%20atmosphere&image_size=portrait_4_3",
    trending: true
  },
  {
    id: 3,
    title: "Ocean's Heart",
    year: 2025,
    genre: "Adventure",
    rating: 9.1,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=adventure%20movie%20poster%20ocean%20exploration%20epic%20journey&image_size=portrait_4_3",
    trending: true
  },
  {
    id: 4,
    title: "Love in Paris",
    year: 2024,
    genre: "Romance",
    rating: 7.8,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=romantic%20movie%20poster%20paris%20eiffel%20tower%20beautiful%20couple&image_size=portrait_4_3",
    trending: false
  },
  {
    id: 5,
    title: "Neon Nights",
    year: 2025,
    genre: "Action",
    rating: 8.7,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=action%20movie%20poster%20cyberpunk%20neon%20lights%20hero&image_size=portrait_4_3",
    trending: true
  },
  {
    id: 6,
    title: "Forest of Secrets",
    year: 2024,
    genre: "Fantasy",
    rating: 8.3,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=fantasy%20movie%20poster%20magical%20forest%20mystical%20creatures&image_size=portrait_4_3",
    trending: false
  },
  {
    id: 7,
    title: "Space Odyssey",
    year: 2025,
    genre: "Sci-Fi",
    rating: 9.0,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=space%20movie%20poster%20astronaut%20galaxy%20stars&image_size=portrait_4_3",
    trending: true
  },
  {
    id: 8,
    title: "The Last Laugh",
    year: 2024,
    genre: "Comedy",
    rating: 7.5,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=comedy%20movie%20poster%20funny%20characters%20vibrant%20colors&image_size=portrait_4_3",
    trending: false
  },
  {
    id: 9,
    title: "Mountain Peak",
    year: 2025,
    genre: "Drama",
    rating: 8.6,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=drama%20movie%20poster%20mountain%20adventure%20inspirational&image_size=portrait_4_3",
    trending: false
  },
  {
    id: 10,
    title: "Ghost Protocol",
    year: 2024,
    genre: "Horror",
    rating: 8.2,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=horror%20movie%20poster%20scary%20ghost%20dark%20atmosphere&image_size=portrait_4_3",
    trending: false
  },
  {
    id: 11,
    title: "Cyber Warrior",
    year: 2025,
    genre: "Action",
    rating: 8.8,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk%20action%20movie%20poster%20warrior%20neon%20city&image_size=portrait_4_3",
    trending: true
  },
  {
    id: 12,
    title: "Ancient Mysteries",
    year: 2024,
    genre: "Documentary",
    rating: 8.0,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=documentary%20movie%20poster%20ancient%20ruins%20historical&image_size=portrait_4_3",
    trending: false
  }
];

export const tvShowsData: Movie[] = [
  {
    id: 101,
    title: "Dark Realms",
    year: 2025,
    genre: "Fantasy",
    rating: 9.2,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=fantasy%20tv%20show%20poster%20epic%20world%20dragons%20magic&image_size=portrait_4_3"
  },
  {
    id: 102,
    title: "City of Dreams",
    year: 2024,
    genre: "Drama",
    rating: 8.4,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=drama%20tv%20show%20poster%20city%20night%20drama&image_size=portrait_4_3"
  },
  {
    id: 103,
    title: "Future Cop",
    year: 2025,
    genre: "Sci-Fi",
    rating: 8.9,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=sci-fi%20tv%20show%20poster%20future%20police%20cyberpunk&image_size=portrait_4_3"
  },
  {
    id: 104,
    title: "Family Ties",
    year: 2024,
    genre: "Comedy",
    rating: 7.9,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=comedy%20tv%20show%20poster%20family%20funny%20moments&image_size=portrait_4_3"
  },
  {
    id: 105,
    title: "Spy Games",
    year: 2025,
    genre: "Thriller",
    rating: 8.7,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=thriller%20tv%20show%20poster%20spy%20espionage%20secret%20agent&image_size=portrait_4_3"
  },
  {
    id: 106,
    title: "Wild Nature",
    year: 2024,
    genre: "Documentary",
    rating: 9.0,
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=wildlife%20documentary%20tv%20show%20poster%20animals%20nature&image_size=portrait_4_3"
  }
];
