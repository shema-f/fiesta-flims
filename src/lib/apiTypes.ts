import type { Movie } from '@prisma/client';

/**
 * A movie as returned by /api/movies and /api/movies/[id].
 * The list endpoint includes the uploader summary; the single-movie
 * endpoint matches the same shape.
 */
export type ApiMovie = Movie & {
  uploader?: { id: string; name: string } | null;
};

export interface ApiListResponse<T> {
  success: boolean;
  data?: T[];
  error?: string;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
