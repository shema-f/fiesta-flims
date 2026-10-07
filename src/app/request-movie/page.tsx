'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Film,
  Flame,
  Layers,
  Mic,
  Play,
  Plus,
  Search,
  Send,
  ThumbsUp,
  TrendingUp,
  Tv,
} from 'lucide-react';

interface MissingMovieItem {
  id: string;
  title: string;
  genre: string;
  narratorRequest: string;
  description: string;
  votesCount: number;
  user: string;
  status: string;
  date: string;
}

interface AvailableMovieItem {
  id: string;
  title: string;
  slug: string;
  narrator: string;
  genre: string;
  year: number;
  episodesCount: number;
  image?: string;
}

export default function RequestMoviePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'missing' | 'available'>('missing');
  const [missingMovies, setMissingMovies] = useState<MissingMovieItem[]>([]);
  const [availableMovies, setAvailableMovies] = useState<AvailableMovieItem[]>([]);
  const [totalDbMovies, setTotalDbMovies] = useState<number>(138);
  const [totalDbEpisodes, setTotalDbEpisodes] = useState<number>(616);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    narratorRequest: 'Rocky Kimomo',
    description: '',
  });

  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: 'success' | 'existing' | 'error';
    message: string;
    movie?: any;
  } | null>(null);

  const fetchTrackerData = async () => {
    try {
      const res = await fetch('/api/movies/requests');
      const json = await res.json();
      if (json.success && json.data) {
        setMissingMovies(json.data.missingFromDb || []);
        setAvailableMovies(json.data.availableInDb || []);
        if (json.data.totalDbMovies) setTotalDbMovies(json.data.totalDbMovies);
        if (json.data.totalDbEpisodes) setTotalDbEpisodes(json.data.totalDbEpisodes);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
  }, []);

  const handleVote = (id: string) => {
    setVotedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    setMissingMovies((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isVoted = votedIds.includes(id);
          return {
            ...item,
            votesCount: isVoted ? item.votesCount - 1 : item.votesCount + 1,
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    setSubmitFeedback(null);

    try {
      const res = await fetch('/api/movies/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          genre: formData.genre,
          narratorRequest: formData.narratorRequest,
          description: formData.description,
          userEmail: user?.email || 'Guest Member',
        }),
      });

      const json = await res.json();

      if (json.inDatabase) {
        setSubmitFeedback({
          type: 'existing',
          message: json.message,
          movie: json.movie,
        });
      } else if (json.success) {
        setSubmitFeedback({
          type: 'success',
          message:
            json.message ||
            'Movie request successfully logged as [NOT IN DATABASE YET] and report sent to Admin!',
        });
        setFormData({
          title: '',
          genre: '',
          narratorRequest: 'Rocky Kimomo',
          description: '',
        });
        setShowForm(false);
        fetchTrackerData();
      } else {
        setSubmitFeedback({
          type: 'error',
          message: json.error || 'Failed to submit movie request.',
        });
      }
    } catch {
      setSubmitFeedback({
        type: 'error',
        message: 'Network error. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMissing = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return missingMovies;
    return missingMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.narratorRequest.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q)
    );
  }, [missingMovies, searchQuery]);

  const filteredAvailable = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return availableMovies;
    return availableMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.narrator.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q)
    );
  }, [availableMovies, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          {/* Hero Banner */}
          <section className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              Movie Updates & Catalog Tracker
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Catalog Updates &{' '}
              <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-400 bg-clip-text text-transparent">
                What&apos;s Not There Yet
              </span>
            </h1>
            <p className="text-muted text-sm sm:text-base max-w-2xl mx-auto">
              Check what movies are verified in our database ({totalDbMovies} titles, {totalDbEpisodes} episodes), see which popular titles are not there yet, and report missing movies directly so the Admin receives the report!
            </p>

            {/* Quick KPI Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto mt-6">
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-emerald-500/30">
                <p className="text-xl sm:text-2xl font-black text-emerald-400">{totalDbMovies}</p>
                <p className="text-[11px] uppercase tracking-wide text-zinc-400 font-semibold">
                  In Database (Ready)
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-amber-500/30">
                <p className="text-xl sm:text-2xl font-black text-amber-400">{missingMovies.length}</p>
                <p className="text-[11px] uppercase tracking-wide text-zinc-400 font-semibold">
                  Not in Database Yet
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-primary/30 col-span-2 sm:col-span-1">
                <p className="text-xl sm:text-2xl font-black text-primary">{totalDbEpisodes}</p>
                <p className="text-[11px] uppercase tracking-wide text-zinc-400 font-semibold">
                  Direct Stream Files
                </p>
              </div>
            </div>
          </section>

          {/* Feedback Alert */}
          {submitFeedback && (
            <div
              className={`mb-8 p-5 rounded-2xl border flex items-start gap-3.5 ${
                submitFeedback.type === 'existing'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : submitFeedback.type === 'success'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}
            >
              {submitFeedback.type === 'existing' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : submitFeedback.type === 'success' ? (
                <Send className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-sm">
                <p className="font-bold">{submitFeedback.message}</p>
                {submitFeedback.movie && (
                  <div className="mt-3">
                    <Link
                      href={`/movies/${submitFeedback.movie.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch & Download &quot;{submitFeedback.movie.title}&quot; Now</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Controls Bar: Search & Request Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, interpreters or genres..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-primary/20 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Report Missing Movie to Admin</span>
              </button>
            </div>
          </div>

          {/* Form Modal / Dropdown */}
          {showForm && (
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-white/10 mb-8 shadow-2xl relative">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span>Report a Movie That Is Not There Yet</span>
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Submitting this form immediately adds the title to the missing list and sends an official report to the Admin!
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-zinc-400 hover:text-white text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-800"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Movie / Series Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Inception, Gladiator II, Squid Game S02..."
                      required
                      className="w-full px-3.5 py-2.5 bg-background border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Genre (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      placeholder="e.g. Action, Sci-Fi, Romance..."
                      className="w-full px-3.5 py-2.5 bg-background border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Requested Agasobanuye Interpreter *
                    </label>
                    <select
                      value={formData.narratorRequest}
                      onChange={(e) => setFormData({ ...formData, narratorRequest: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-background border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                    >
                      <option value="Rocky Kimomo">Rocky Kimomo</option>
                      <option value="Junior Giti">Junior Giti</option>
                      <option value="Sankara da Premier">Sankara da Premier</option>
                      <option value="Savimbi">Savimbi</option>
                      <option value="Gaheza Simba">Gaheza Simba</option>
                      <option value="Yanga">Yanga (Classic)</option>
                      <option value="Dylan Kabaka">Dylan Kabaka</option>
                      <option value="B The Great">B The Great</option>
                      <option value="Saga">Saga</option>
                      <option value="P.K">P.K</option>
                      <option value="Master P">Master P</option>
                      <option value="Genius">Genius</option>
                      <option value="Community Choice">Any Umusobanuzi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Why should this be added? (Notes for Admin)
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. High demand in Kigali video halls, great action scenes..."
                      className="w-full px-3.5 py-2.5 bg-background border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-primary/20 transition-all"
                  >
                    {submitting ? (
                      <span>Dispatching to Admin...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Report to Admin</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Primary View Switcher: Missing vs Available */}
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
            <button
              onClick={() => setActiveTab('missing')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'missing'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Not in Database Yet ({filteredMissing.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'available'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Available in Database ({totalDbMovies})</span>
            </button>
          </div>

          {/* TAB 1: NOT IN DATABASE YET */}
          {activeTab === 'missing' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    The titles below are <strong>NOT in the database yet</strong>. They are in the sourcing and translation request queue. Admin receives real-time reports of demand.
                  </span>
                </div>
                <span className="font-bold shrink-0 text-amber-400">
                  {filteredMissing.length} Missing Titles Tracked
                </span>
              </div>

              {loading ? (
                <div className="py-20 text-center text-zinc-400 text-sm">
                  Loading catalog update registry...
                </div>
              ) : filteredMissing.length === 0 ? (
                <div className="py-16 text-center text-muted bg-card rounded-2xl border border-white/5">
                  <p className="text-sm font-semibold">No missing titles matching your query.</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Have a movie in mind? Click &quot;Report Missing Movie to Admin&quot; above!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMissing.map((item) => {
                    const isVoted = votedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className="bg-card rounded-2xl p-5 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <span className="inline-block px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-[10px] uppercase tracking-wide mb-1.5">
                                ⚠️ NOT IN DATABASE YET
                              </span>
                              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                                {item.title}
                              </h3>
                            </div>
                            <button
                              onClick={() => handleVote(item.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                isVoted
                                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              }`}
                              title="Vote to prioritize this movie"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{item.votesCount}</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted mb-3">
                            <span className="text-zinc-400">{item.genre}</span>
                            <span>•</span>
                            <span className="text-primary font-semibold flex items-center gap-1">
                              <Mic className="w-3 h-3" />
                              Requested: {item.narratorRequest}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Reported by {item.user} ({item.date})
                          </span>
                          <span className="text-emerald-400 font-semibold">
                            Admin Report: Logged
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IN DATABASE & RECENTLY UPDATED */}
          {activeTab === 'available' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    These titles are <strong>already in our database</strong> with verified video files, direct downloads, and Kinyarwanda translations!
                  </span>
                </div>
                <span className="font-bold shrink-0 text-emerald-400">
                  {totalDbMovies} Titles • {totalDbEpisodes} Episodes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAvailable.map((m) => (
                  <div
                    key={m.id}
                    className="bg-card rounded-2xl p-4 border border-white/10 hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                          ✓ IN DATABASE
                        </span>
                        {m.episodesCount > 1 ? (
                          <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-[10px] flex items-center gap-1">
                            <Tv className="w-3 h-3" />
                            Series ({m.episodesCount} eps)
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <Film className="w-3 h-3" />
                            Movie
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-white text-sm mb-1 truncate">{m.title}</h4>
                      <p className="text-xs text-amber-300 font-medium mb-1">
                        Translated by: {m.narrator}
                      </p>
                      <p className="text-xs text-zinc-400">{m.genre}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{m.year}</span>
                      <Link
                        href={`/movies/${m.id}`}
                        className="px-3 py-1.5 rounded-xl bg-primary hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Stream & Download</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
