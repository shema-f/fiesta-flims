'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { Movie } from '@/lib/movieData';

interface FavoritesContextType {
  favorites: Movie[];
  favoriteIds: (string | number)[];
  isFavorite: (id: string | number) => boolean;
  toggleFavorite: (movie: Movie) => void;
  removeFavorite: (id: string | number) => void;
  userRatings: Record<string, number>;
  setUserRating: (id: string | number, rating: number) => void;
  getUserRating: (id: string | number) => number | undefined;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'fiesta_flix_favorites_v1';
const RATINGS_STORAGE_KEY = 'fiesta_flix_user_ratings_v1';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
      const storedRatings = localStorage.getItem(RATINGS_STORAGE_KEY);
      if (storedRatings) {
        setUserRatings(JSON.parse(storedRatings));
      }
    } catch (err) {
      console.error('Error loading favorites or ratings from storage', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = useCallback((newFavs: Movie[]) => {
    setFavorites(newFavs);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavs));
    } catch (err) {
      console.error('Failed to save favorites to localStorage', err);
    }
  }, []);

  // Save ratings to localStorage
  const saveRatings = useCallback((newRatings: Record<string, number>) => {
    setUserRatings(newRatings);
    try {
      localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(newRatings));
    } catch (err) {
      console.error('Failed to save ratings to localStorage', err);
    }
  }, []);

  const favoriteIds = useMemo(() => favorites.map((m) => m.id), [favorites]);

  const isFavorite = useCallback(
    (id: string | number) => {
      const strId = String(id);
      return favorites.some((m) => String(m.id) === strId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (movie: Movie) => {
      const strId = String(movie.id);
      const exists = favorites.some((m) => String(m.id) === strId);
      if (exists) {
        saveFavorites(favorites.filter((m) => String(m.id) !== strId));
      } else {
        saveFavorites([movie, ...favorites]);
      }
    },
    [favorites, saveFavorites]
  );

  const removeFavorite = useCallback(
    (id: string | number) => {
      const strId = String(id);
      saveFavorites(favorites.filter((m) => String(m.id) !== strId));
    },
    [favorites, saveFavorites]
  );

  const setUserRating = useCallback(
    (id: string | number, rating: number) => {
      const strId = String(id);
      const updated = { ...userRatings, [strId]: rating };
      saveRatings(updated);
    },
    [userRatings, saveRatings]
  );

  const getUserRating = useCallback(
    (id: string | number) => {
      return userRatings[String(id)];
    },
    [userRatings]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        userRatings,
        setUserRating,
        getUserRating,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
