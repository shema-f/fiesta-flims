export interface Episode {
  id: string | number;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  duration?: string;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
  youtubeId?: string;
  directStreamUrl?: string;
  downloadUrl?: string;
  quality?: string;
  fileSize?: string;
  narrator?: string;
}

export interface Movie {
  id: number | string;
  title: string;
  year: number;
  genre: string;
  rating: number;
  image: string; // High-resolution portrait poster (2:3 aspect ratio)
  backdrop?: string; // High-resolution widescreen backdrop (16:9 aspect ratio)
  trending?: boolean;
  narrator?: string;
  duration?: string;
  quality?: string;
  fileSize?: string;
  description?: string;
  telegramChannelPost?: string;
  telegramBotLink?: string;
  telegramStreamUrl?: string;
  directStreamUrl?: string;
  contentType?: 'movie' | 'series';
  seasonsCount?: number;
  episodesCount?: number;
  episodes?: Episode[];
  trailer?: string;
}
