'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Film,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Tv,
  X,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Play,
  Volume2,
  Calendar,
  Star,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { ApiMovie } from '@/lib/apiTypes';

const POPULAR_NARRATORS = [
  'Rocky Kimomo',
  'Junior Giti',
  'Sankara da Premier',
  'Original Rwandan Cast (Nyarwanda)',
  'Gaheza Simba',
  'Savimbi',
  'Yanga',
  'Genius',
  'Didier',
  'Dylan Kabaka',
  'Master P',
  'PK',
  'Skov',
  'Misago Wilson',
  '5K Etienne',
];

const GENRES = [
  'Filime Nyarwanda',
  'Comedy Nyarwanda',
  'Drama Nyarwanda',
  'Romance Nyarwanda',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
  'Documentary',
];

export const RWANDAN_MOVIE_PRESETS = [
  {
    title: "Ikigeragezo cy'Ubuzima",
    releaseYear: 2021,
    genre: 'Filime Nyarwanda',
    narrator: 'Original Rwandan Cast (Nyarwanda)',
    description: 'Filime yerekana ubuzima busharira bwa buri munsi, ibigeragezo n\'urukundo mu muryango nyarwanda.',
    poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1280&auto=format&fit=crop',
    rating: 9.2,
    type: 'Movie' as const,
  },
  {
    title: 'Seburikoko',
    releaseYear: 2023,
    genre: 'Comedy Nyarwanda',
    narrator: 'Original Rwandan Cast (Nyarwanda)',
    description: 'Urugendo rwa Seburikoko na Siperansiya mu gutebya no kwerekana imibereho n\'umuco nyarwanda.',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1280&auto=format&fit=crop',
    rating: 9.4,
    type: 'Series' as const,
    seasonsCount: 5,
  },
  {
    title: 'Bamenya Series',
    releaseYear: 2024,
    genre: 'Drama Nyarwanda',
    narrator: 'Original Rwandan Cast (Nyarwanda)',
    description: 'Filime ikunzwe cyane mu Rwanda yakinwe na Bamenya (Denis Nsanzamahoro), Kezia na 5K.',
    poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=1280&auto=format&fit=crop',
    rating: 9.5,
    type: 'Series' as const,
    seasonsCount: 4,
  },
  {
    title: 'City Maid',
    releaseYear: 2022,
    genre: 'Drama Nyarwanda',
    narrator: 'Original Rwandan Cast (Nyarwanda)',
    description: 'Urugendo rw\'umukobwa Nikuze uvuye mu cyaro akaza i Kigali gushaka ubuzima n\'ibyo ahura nabyo.',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1280&auto=format&fit=crop',
    rating: 9.1,
    type: 'Series' as const,
    seasonsCount: 8,
  },
  {
    title: 'Papa Sava',
    releaseYear: 2023,
    genre: 'Comedy Nyarwanda',
    narrator: 'Original Rwandan Cast (Nyarwanda)',
    description: 'Guseka bidasanzwe hamwe na Papa Sava, Kibonke na Niyitegeka Gratien mu gace gakunzwe.',
    poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1280&auto=format&fit=crop',
    rating: 9.3,
    type: 'Series' as const,
    seasonsCount: 6,
  },
  {
    title: 'Rwasa',
    releaseYear: 2020,
    genre: 'Filime Nyarwanda',
    narrator: 'Original Rwandan Cast (Nyarwanda)',
    description: 'Filime y\'ubutwari n\'akaga yakinwe na Denis Nsanzamahoro akina ari Rwasa.',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=1280&auto=format&fit=crop',
    rating: 8.9,
    type: 'Movie' as const,
  },
];

interface EpisodeEditItem {
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  duration?: string;
  directStreamUrl?: string;
  youtubeId?: string;
  narrator?: string;
}

export default function AdminMoviesManager() {
  const [movies, setMovies] = useState<ApiMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNarrator, setFilterNarrator] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<ApiMovie | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingTmdb, setFetchingTmdb] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    releaseYear: new Date().getFullYear(),
    genre: 'Action',
    narrator: 'Rocky Kimomo',
    description: '',
    rating: 8.5,
    type: 'Movie' as 'Movie' | 'Series',
    poster: '',
    backdrop: '',
    fileUrl: '',
    trailer: '',
    seasonsCount: 1,
    episodes: [] as EpisodeEditItem[],
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/movies?limit=300');
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (json.data?.movies || []);
        setMovies(list);
      }
    } catch {
      showToast('Failed to load movies from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTmdb = async () => {
    if (!form.title.trim()) {
      showToast('Enter a movie title to search on TMDB', 'error');
      return;
    }
    setFetchingTmdb(true);
    try {
      const res = await fetch(`/api/tmdb/movie?title=${encodeURIComponent(form.title)}`);
      const data = await res.json();
      if (data.success && (data.poster || data.title || data.overview)) {
        setForm((prev) => ({
          ...prev,
          title: data.title || prev.title,
          poster: data.poster || prev.poster,
          backdrop: data.backdrop || prev.backdrop,
          description: data.overview || prev.description,
          releaseYear: data.releaseYear || prev.releaseYear,
          rating: data.voteAverage ? parseFloat(data.voteAverage.toFixed(1)) : prev.rating,
          type: data.mediaType === 'tv' ? 'Series' : prev.type,
        }));
        showToast(`Loaded metadata for "${data.title || form.title}" from TMDB!`);
      } else {
        showToast('No TMDB match found. You can fill details manually.', 'error');
      }
    } catch {
      showToast('Failed to connect to TMDB', 'error');
    } finally {
      setFetchingTmdb(false);
    }
  };

  const handleApplyRwandanPreset = (preset: typeof RWANDAN_MOVIE_PRESETS[number]) => {
    setForm((prev) => ({
      ...prev,
      title: preset.title,
      releaseYear: preset.releaseYear,
      genre: preset.genre,
      narrator: preset.narrator,
      description: preset.description,
      poster: preset.poster,
      backdrop: preset.backdrop,
      rating: preset.rating,
      type: preset.type,
      seasonsCount: (preset as any).seasonsCount || 1,
    }));
    showToast(`Loaded Rwandan Cinema preset: "${preset.title}"!`);
  };

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingMovie(null);
    setForm({
      title: '',
      releaseYear: new Date().getFullYear(),
      genre: 'Action',
      narrator: 'Rocky Kimomo',
      description: '',
      rating: 8.8,
      type: 'Movie',
      poster: '',
      backdrop: '',
      fileUrl: '',
      trailer: '',
      seasonsCount: 1,
      episodes: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (m: ApiMovie) => {
    setEditingMovie(m);
    const isSeries = m.contentType === 'series' || (m.episodes && m.episodes.length > 0);
    setForm({
      title: m.title,
      releaseYear: m.year || m.releaseYear || new Date().getFullYear(),
      genre: m.genre || 'Action',
      narrator: m.narrator || 'Rocky Kimomo',
      description: m.description || m.synopsis || '',
      rating: m.rating || 8.5,
      type: isSeries ? 'Series' : 'Movie',
      poster: m.poster || m.thumbnailUrl || m.image || '',
      backdrop: m.backdrop || '',
      fileUrl: m.fileUrl || '',
      trailer: m.trailer || m.trailerUrl || '',
      seasonsCount: m.seasonsCount || 1,
      episodes: (m.episodes || []).map((ep: any, idx: number) => ({
        episodeNumber: ep.episodeNumber || idx + 1,
        seasonNumber: ep.seasonNumber || 1,
        title: ep.title || `Episode ${idx + 1}`,
        duration: ep.duration || '45m',
        directStreamUrl: ep.directStreamUrl || ep.fileUrl || '',
        youtubeId: ep.youtubeId || '',
        narrator: ep.narrator || m.narrator || 'Rocky Kimomo',
      })),
    });
    setIsModalOpen(true);
  };

  const handleAddEpisode = () => {
    const nextNum = form.episodes.length + 1;
    setForm((prev) => ({
      ...prev,
      episodes: [
        ...prev.episodes,
        {
          episodeNumber: nextNum,
          seasonNumber: 1,
          title: `Episode ${nextNum}`,
          duration: '45m',
          directStreamUrl: '',
          youtubeId: '',
          narrator: prev.narrator,
        },
      ],
    }));
  };

  const handleRemoveEpisode = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      episodes: prev.episodes.filter((_, i) => i !== idx),
    }));
  };

  const handleEpisodeChange = (idx: number, field: keyof EpisodeEditItem, val: any) => {
    setForm((prev) => ({
      ...prev,
      episodes: prev.episodes.map((ep, i) => (i === idx ? { ...ep, [field]: val } : ep)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMovie) {
        // UPDATE EXISTING MOVIE
        const res = await fetch(`/api/movies/${editingMovie.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            releaseYear: form.releaseYear,
            genre: form.genre,
            narrator: form.narrator,
            description: form.description,
            rating: form.rating,
            poster: form.poster,
            thumbnailUrl: form.poster,
            backdrop: form.backdrop || form.poster,
            fileUrl: form.fileUrl,
            trailer: form.trailer,
            type: form.type,
            seasonsCount: form.type === 'Series' ? form.seasonsCount : undefined,
            episodesCount: form.type === 'Series' ? form.episodes.length : undefined,
            episodes: form.type === 'Series' ? form.episodes : undefined,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          showToast(`"${form.title}" updated successfully!`);
          setMovies((prev) =>
            prev.map((m) =>
              m.id === editingMovie.id
                ? {
                    ...m,
                    ...json.data,
                    title: form.title,
                    year: form.releaseYear,
                    releaseYear: form.releaseYear,
                    genre: form.genre,
                    narrator: form.narrator,
                    description: form.description,
                    poster: form.poster || m.poster,
                    image: form.poster || m.image,
                    rating: form.rating,
                    contentType: form.type === 'Series' ? 'series' : 'movie',
                    episodes: form.type === 'Series' ? form.episodes : undefined,
                  }
                : m
            )
          );
          setIsModalOpen(false);
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(errData.error || 'Failed to update movie', 'error');
        }
      } else {
        // CREATE NEW MOVIE
        const res = await fetch('/api/movies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            releaseYear: form.releaseYear,
            genre: form.genre,
            narrator: form.narrator,
            description: form.description,
            rating: form.rating,
            poster: form.poster,
            thumbnailUrl: form.poster,
            backdrop: form.backdrop || form.poster,
            fileUrl: form.fileUrl,
            trailer: form.trailer,
            type: form.type,
            seasonsCount: form.type === 'Series' ? form.seasonsCount : undefined,
            episodesCount: form.type === 'Series' ? form.episodes.length : undefined,
            episodes: form.type === 'Series' ? form.episodes : undefined,
          }),
        });

        if (res.ok) {
          showToast(`"${form.title}" uploaded and published successfully!`);
          setIsModalOpen(false);
          fetchMovies();
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(errData.error || 'Failed to upload movie', 'error');
        }
      }
    } catch {
      showToast('An unexpected network error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete or archive "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/movies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`"${title}" deleted successfully`);
        setMovies((prev) => prev.filter((m) => m.id !== id));
      } else {
        showToast('Failed to delete movie', 'error');
      }
    } catch {
      showToast('Network error while deleting movie', 'error');
    }
  };

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const matchesSearch =
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.narrator && m.narrator.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.genre && m.genre.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesNarrator =
        filterNarrator === 'all' ||
        (m.narrator && m.narrator.toLowerCase().includes(filterNarrator.toLowerCase()));

      const isSeries = m.contentType === 'series' || (m.episodes && m.episodes.length > 0);
      const isRwandan =
        (m.genre && m.genre.toLowerCase().includes('nyarwanda')) ||
        (m.narrator && m.narrator.toLowerCase().includes('rwandan')) ||
        (m.description && m.description.toLowerCase().includes('kinyarwanda')) ||
        (m.title && RWANDAN_MOVIE_PRESETS.some((p) => p.title.toLowerCase() === m.title.toLowerCase()));

      const matchesType =
        filterType === 'all' ||
        (filterType === 'rwandan' && isRwandan) ||
        (filterType === 'series' && isSeries) ||
        (filterType === 'movie' && !isSeries);

      return matchesSearch && matchesNarrator && matchesType;
    });
  }, [movies, searchQuery, filterNarrator, filterType]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-sm font-bold shadow-xl transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            Manage Catalog Movies & Series
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Total in database: <span className="text-white font-bold">{movies.length}</span> titles.
            Upload, edit metadata, update streaming links, or manage episodes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchMovies}
            disabled={loading}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg shadow-primary/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Title</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, narrator or genre..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterNarrator}
            onChange={(e) => setFilterNarrator(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Narrators</option>
            {POPULAR_NARRATORS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="movie">Movies</option>
            <option value="series">Series</option>
            <option value="rwandan">Filime Nyarwanda 🇷🇼</option>
          </select>
        </div>
      </div>

      {/* Movies Table / List */}
      <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-xs">Loading catalog from database...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <Film className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
            <p className="text-sm font-semibold text-zinc-400">No movies found matching filters</p>
            <p className="text-xs text-zinc-600 mt-1">Try resetting search or upload a new movie</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Poster & Title</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Narrator</th>
                  <th className="px-4 py-3.5">Year & Genre</th>
                  <th className="px-4 py-3.5">Rating</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredMovies.map((m) => {
                  const isSeries = m.contentType === 'series' || (m.episodes && m.episodes.length > 0);
                  const isRwandan =
                    (m.genre && m.genre.toLowerCase().includes('nyarwanda')) ||
                    (m.narrator && m.narrator.toLowerCase().includes('rwandan')) ||
                    (m.description && m.description.toLowerCase().includes('kinyarwanda')) ||
                    RWANDAN_MOVIE_PRESETS.some((p) => p.title.toLowerCase() === m.title.toLowerCase());
                  const posterUrl = m.poster || m.thumbnailUrl || m.image;

                  return (
                    <tr key={m.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded-lg bg-zinc-900 overflow-hidden shrink-0 border border-zinc-800">
                            {posterUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={posterUrl}
                                alt={m.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <Film className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                {m.title}
                              </p>
                              {isRwandan && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                  🇷🇼 Nyarwanda
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                              ID: {m.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            isSeries
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isSeries ? `Series (${m.episodes?.length || 1} Eps)` : 'Movie'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          {m.narrator || 'Rocky Kimomo'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-zinc-400">
                        <div>{m.year || m.releaseYear || 2024}</div>
                        <div className="text-[11px] text-zinc-500">{m.genre || 'Action'}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {(m.rating || 8.5).toFixed(1)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`/movies/${m.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            title="Preview live page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
                            title="Edit movie"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.title)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            title="Delete movie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] uppercase font-black text-primary tracking-widest">
                {editingMovie ? 'Edit Catalog Title' : 'New Cinema Release'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                {editingMovie ? `Edit "${editingMovie.title}"` : 'Upload & Publish Movie'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="flex items-center gap-3 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: 'Movie' }))}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-colors ${
                    form.type === 'Movie'
                      ? 'bg-primary text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Single Movie
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: 'Series' }))}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-colors ${
                    form.type === 'Series'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Episodic Series
                </button>
              </div>

              {/* RWANDAN CINEMA QUICK PRESETS */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold flex items-center gap-1.5 text-xs">
                    <span>🇷🇼 Filime Nyarwanda Presets</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black uppercase">
                      One-Click Fill
                    </span>
                  </span>
                  <span className="text-[11px] text-zinc-400">Click to autofill popular Rwandan movies</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RWANDAN_MOVIE_PRESETS.map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => handleApplyRwandanPreset(p)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-300 font-semibold text-[11px] border border-zinc-700/80 transition-all flex items-center gap-1"
                    >
                      <span>🇷🇼</span>
                      <span>{p.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Year + TMDB Sync */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-bold">Movie Title *</label>
                  <button
                    type="button"
                    onClick={handleFetchTmdb}
                    disabled={fetchingTmdb}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-bold transition-colors"
                    title="Fetch official TMDB poster, backdrop, overview and cast"
                  >
                    {fetchingTmdb ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Fetch TMDB Poster & Cast</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Prison Break, Seburikoko, Outer Banks..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={form.releaseYear}
                      onChange={(e) => setForm((p) => ({ ...p, releaseYear: parseInt(e.target.value, 10) || 2024 }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Narrator & Genre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Interpreter / Narrator</label>
                  <select
                    value={form.narrator}
                    onChange={(e) => setForm((p) => ({ ...p, narrator: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-primary"
                  >
                    {POPULAR_NARRATORS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Genre</label>
                  <select
                    value={form.genre}
                    onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-primary"
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Poster Image URL */}
              <div className="space-y-1">
                <label className="text-zinc-300 font-bold">Poster / Thumbnail Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={form.poster}
                    onChange={(e) => setForm((p) => ({ ...p, poster: e.target.value }))}
                    placeholder="https://images.unsplash.com/... or media image"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                  />
                  {form.poster && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.poster}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=900&auto=format&fit=crop';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Streaming Video URL & Trailer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Direct Streaming / File URL</label>
                  <input
                    type="text"
                    value={form.fileUrl}
                    onChange={(e) => setForm((p) => ({ ...p, fileUrl: e.target.value }))}
                    placeholder="https://... direct mp4, hls or MediaFire link"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Trailer URL / YouTube ID</label>
                  <input
                    type="text"
                    value={form.trailer}
                    onChange={(e) => setForm((p) => ({ ...p, trailer: e.target.value }))}
                    placeholder="YouTube ID or trailer video URL"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-zinc-300 font-bold">Description / Synopsis</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Kinyarwanda commentary details, plot summary..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Series Episodes Builder (if type === Series) */}
              {form.type === 'Series' && (
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Tv className="w-4 h-4 text-purple-400" />
                      Episodes List ({form.episodes.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddEpisode}
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Episode
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {form.episodes.map((ep, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2"
                      >
                        <span className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 font-black text-[10px] flex items-center justify-center shrink-0">
                          {ep.episodeNumber}
                        </span>
                        <input
                          type="text"
                          value={ep.title}
                          onChange={(e) => handleEpisodeChange(idx, 'title', e.target.value)}
                          placeholder="Title"
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-white text-[11px]"
                        />
                        <input
                          type="text"
                          value={ep.directStreamUrl || ''}
                          onChange={(e) => handleEpisodeChange(idx, 'directStreamUrl', e.target.value)}
                          placeholder="Direct Video/Mediafire URL"
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-white text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEpisode(idx)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingMovie ? 'Save Changes' : 'Upload & Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
