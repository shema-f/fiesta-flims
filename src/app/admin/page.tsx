'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { movieData } from '@/lib/movieData';
import { narratorsData } from '@/lib/narratorData';
import StoragePanel from '@/components/admin/StoragePanel';
import MediaJobsPanel from '@/components/admin/MediaJobsPanel';
import AdminNewsPanel from '@/components/admin/AdminNewsPanel';
import AdminAdsPanel from '@/components/admin/AdminAdsPanel';
import AdminCatalogReportPanel from '@/components/admin/AdminCatalogReportPanel';

const movieRequests = [
  {
    id: 1,
    title: 'Inception (2010)',
    user: 'Movie Fanatic',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20lover%20african%20portrait&image_size=square',
    votes: 145,
    description: 'Would love to see this with Rocky narration!',
    genre: 'Sci-Fi, Action',
    narratorRequest: 'Rocky',
    date: '2024-05-15',
  },
  {
    id: 2,
    title: 'The Dark Knight',
    user: 'Cinema Lover',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=film%20enthusiast%20african%20man&image_size=square',
    votes: 123,
    description: 'Please add this classic!',
    genre: 'Action, Drama',
    narratorRequest: 'Junior Giti',
    date: '2024-05-16',
  },
  {
    id: 3,
    title: 'Interstellar',
    user: 'Sci-Fi Fan',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=science%20fiction%20fan%20young%20african&image_size=square',
    votes: 98,
    description: 'Amazing sci-fi movie!',
    genre: 'Sci-Fi, Adventure',
    narratorRequest: 'Sankara',
    date: '2024-05-17',
  },
];

const fanClips = [
  {
    id: 1,
    title: 'Epic Fight Scene - Rocky Style',
    user: 'Jean Pierre',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20african%20man%20portrait%20headshot&image_size=square',
    thumbnail: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=epic%20movie%20fight%20scene%20cinematic&image_size=square',
    duration: '1:45',
    likes: 342,
    comments: 45,
    status: 'approved',
    date: '2024-05-15',
  },
  {
    id: 2,
    title: 'Funny Moment Compilation',
    user: 'Marie Claire',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20african%20woman%20portrait%20headshot&image_size=square',
    thumbnail: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=comedy%20movie%20scene%20funny%20moment&image_size=square',
    duration: '2:15',
    likes: 521,
    comments: 78,
    status: 'pending',
    date: '2024-05-17',
  },
  {
    id: 3,
    title: 'Junior Giti Impression',
    user: 'Sarah Uwimana',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=young%20african%20woman%20portrait%20happy&image_size=square',
    thumbnail: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=impersonation%20comedy%20scene%20entertainment&image_size=square',
    duration: '0:55',
    likes: 892,
    comments: 124,
    status: 'approved',
    date: '2024-05-16',
  },
];

const usersData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'FAN', joined: '2024-01-15', status: 'active', moviesWatched: 45, clipsUploaded: 12 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'FAN', joined: '2024-02-20', status: 'active', moviesWatched: 32, clipsUploaded: 8 },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'FAN', joined: '2024-03-10', status: 'inactive', moviesWatched: 15, clipsUploaded: 3 },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'ADMIN', joined: '2023-12-01', status: 'active', moviesWatched: 89, clipsUploaded: 0 },
  { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'FAN', joined: '2024-04-05', status: 'active', moviesWatched: 28, clipsUploaded: 5 },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    year: '',
    genre: '',
    narrator: '',
    type: 'Movie',
    youtubeId: '',
    duration: '2h 15m',
    sendNotification: true,
  });
  const [seriesSeason, setSeriesSeason] = useState(1);
  const [seriesEpisodes, setSeriesEpisodes] = useState<Array<{
    episodeNumber: number;
    seasonNumber: number;
    title: string;
    duration: string;
    youtubeId: string;
    narrator: string;
  }>>([
    { episodeNumber: 1, seasonNumber: 1, title: 'Episode 1: Pilot & Arrival', duration: '45m', youtubeId: '', narrator: '' },
    { episodeNumber: 2, seasonNumber: 1, title: 'Episode 2: Shadows of Kigali', duration: '48m', youtubeId: '', narrator: '' },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAddEpisode = () => {
    const nextNum = seriesEpisodes.length + 1;
    setSeriesEpisodes((prev) => [
      ...prev,
      {
        episodeNumber: nextNum,
        seasonNumber: seriesSeason,
        title: `Episode ${nextNum}: Title`,
        duration: '45m',
        youtubeId: '',
        narrator: uploadForm.narrator || '',
      },
    ]);
  };

  const handleRemoveEpisode = (index: number) => {
    if (seriesEpisodes.length <= 1) return;
    setSeriesEpisodes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEpisodeChange = (index: number, field: string, val: string | number) => {
    setSeriesEpisodes((prev) =>
      prev.map((ep, i) => (i === index ? { ...ep, [field]: val } : ep))
    );
  };

  const stats = {
    totalMovies: movieData.length,
    totalInterpreters: narratorsData.length,
    totalUsers: 1247,
    activeUsers: 892,
    totalViews: 45234,
    totalDownloads: 12847,
    pendingRequests: movieRequests.length,
    pendingClips: fanClips.filter(c => c.status === 'pending').length,
  };

  const handleApproveClip = (id: number) => {
    setUploadFeedback({ type: 'success', message: 'Clip approved and published!' });
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const handleRejectClip = (id: number) => {
    setUploadFeedback({ type: 'error', message: 'Clip rejected.' });
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const handleApproveRequest = (id: number) => {
    setUploadFeedback({ type: 'success', message: 'Movie request approved! Notification scheduled.' });
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const handleUploadMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const isSeries = uploadForm.type === 'Series';

    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title,
          releaseYear: parseInt(uploadForm.year, 10) || new Date().getFullYear(),
          genre: uploadForm.genre,
          narrator: uploadForm.narrator,
          rating: 8.8,
          youtubeId: uploadForm.youtubeId,
          type: uploadForm.type,
          seasonsCount: isSeries ? seriesSeason : undefined,
          episodesCount: isSeries ? seriesEpisodes.length : undefined,
          episodes: isSeries
            ? seriesEpisodes.map((ep) => ({
                ...ep,
                narrator: ep.narrator || uploadForm.narrator || 'Rocky Kimomo',
                directStreamUrl: ep.youtubeId
                  ? `https://www.youtube.com/watch?v=${ep.youtubeId}`
                  : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              }))
            : undefined,
          thumbnailUrl: isSeries
            ? 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=900&auto=format&fit=crop',
        }),
      });

      const json = await res.json();
      if (json.success) {
        if (json.data?.notification) {
          window.dispatchEvent(
            new CustomEvent('fiesta-movie-uploaded', { detail: json.data.notification })
          );
        }
        setUploadFeedback({
          type: 'success',
          message: isSeries
            ? `📺 Series "${uploadForm.title}" (Season ${seriesSeason}, ${seriesEpisodes.length} Episodes) uploaded! Notification sent to all users.`
            : `🎬 "${uploadForm.title}" uploaded! Notification sent to all users.`,
        });
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          year: '',
          genre: '',
          narrator: '',
          type: 'Movie',
          youtubeId: '',
          duration: '2h 15m',
          sendNotification: true,
        });
      } else {
        setUploadFeedback({
          type: 'error',
          message: json.error || 'Failed to upload movie/series',
        });
      }
    } catch {
      setUploadFeedback({
        type: 'error',
        message: 'Network error uploading movie/series.',
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadFeedback(null), 6000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {uploadFeedback && (
            <div
              className={`mb-6 p-4 rounded-xl border flex items-center justify-between text-sm font-bold shadow-lg animate-fadeIn ${
                uploadFeedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              <span>{uploadFeedback.message}</span>
              <button
                onClick={() => setUploadFeedback(null)}
                className="text-xs px-2 py-1 bg-white/10 rounded hover:bg-white/20"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-card rounded-2xl p-6 border border-white/10 sticky top-24">
                <h2 className="font-bold text-lg mb-6">Admin Dashboard</h2>
                <nav className="space-y-2">
                  {[
                    { id: 'dashboard', label: '📊 Dashboard' },
                    { id: 'catalog-report', label: '📑 Catalog & Import Report' },
                    { id: 'news', label: '📰 FiestaFlix News' },
                    { id: 'ads', label: '📢 Ads & Banners' },
                    { id: 'movies', label: '🎬 Movies' },
                    { id: 'rwandan-movies', label: '🇷🇼 Rwandan Movies' },
                    { id: 'interpreters', label: '🎤 Interpreters' },
                    { id: 'requests', label: '📋 Movie Requests' },
                    { id: 'clips', label: '🎥 Fan Clips' },
                    { id: 'users', label: '👥 Users' },
                    { id: 'storage', label: '🗄️ Storage' },
                    { id: 'media', label: '⚙️ Media Jobs' },
                    { id: 'analytics', label: '📈 Analytics' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-muted hover:bg-white/10'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="flex-1">
              {activeTab === 'dashboard' && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                    <div className="text-sm text-muted">Last updated: Today, 2:30 PM</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: 'Total Movies', value: stats.totalMovies, icon: '🎬', color: 'from-blue-500 to-cyan-400' },
                      { label: 'Interpreters', value: stats.totalInterpreters, icon: '🎤', color: 'from-purple-500 to-pink-400' },
                      { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: '👥', color: 'from-green-500 to-emerald-400' },
                      { label: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: '🟢', color: 'from-orange-500 to-red-400' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-card rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-3xl">{stat.icon}</span>
                          <span className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            {stat.value}
                          </span>
                        </div>
                        <p className="text-muted">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-card rounded-2xl p-6 border border-white/10">
                      <h3 className="font-bold text-xl mb-6">Recent Activity</h3>
                      <div className="space-y-4">
                        {[
                          { action: 'New user registered', user: 'John Doe', time: '2 min ago' },
                          { action: 'Movie downloaded', user: 'Jane Smith', time: '15 min ago' },
                          { action: 'Clip uploaded', user: 'Jean Pierre', time: '1 hour ago' },
                          { action: 'Movie request submitted', user: 'Movie Fan', time: '2 hours ago' },
                        ].map((activity, i) => (
                          <div key={i} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                            <div>
                              <p className="font-medium">{activity.action}</p>
                              <p className="text-xs text-muted">{activity.user}</p>
                            </div>
                            <span className="text-xs text-muted">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-card rounded-2xl p-6 border border-white/10">
                      <h3 className="font-bold text-xl mb-6">Quick Stats</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Total Views', value: stats.totalViews.toLocaleString() },
                          { label: 'Total Downloads', value: stats.totalDownloads.toLocaleString() },
                          { label: 'Pending Requests', value: stats.pendingRequests },
                          { label: 'Pending Clips', value: stats.pendingClips },
                        ].map((stat, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-muted">{stat.label}</span>
                            <span className="font-bold text-xl">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rwandan-movies' && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">🇷🇼 Rwandan Movies</h1>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                    >
                      + Upload Movie
                    </button>
                  </div>

                  <div className="bg-card rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold">Movie</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Type</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Narrator</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Year</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: 101, title: 'Karahanyuze: The Beginning', type: 'Movie', narrator: 'Rocky', year: 2024 },
                          { id: 102, title: 'Urukundo: Love Story', type: 'Movie', narrator: 'Junior Giti', year: 2023 },
                          { id: 104, title: 'Ibanga: The Secret', type: 'Series', narrator: 'Gaheza', year: 2023 },
                        ].map((movie) => (
                          <tr key={movie.id} className="border-t border-white/10 hover:bg-white/5">
                            <td className="px-6 py-4 font-medium">{movie.title}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                movie.type === 'Series' 
                                  ? 'bg-purple-500/20 text-purple-400' 
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {movie.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted">{movie.narrator}</td>
                            <td className="px-6 py-4 text-muted">{movie.year}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button className="text-primary hover:text-primary/80 text-sm font-medium">Edit</button>
                                <button className="text-red-400 hover:text-red-300 text-sm font-medium">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'interpreters' && (
                <div>
                  <h1 className="text-3xl font-bold mb-8">🎤 Interpreters Management</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {narratorsData.slice(0, 6).map((narrator) => (
                      <div key={narrator.id} className="bg-card rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                          <img 
                            src={narrator.image} 
                            alt={narrator.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-bold text-lg">{narrator.name}</h3>
                            <div className="flex items-center gap-1">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffe66d">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              <span className="font-bold text-sm">{narrator.rating}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted mb-4 line-clamp-2">{narrator.bio}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted">{narrator.moviesCount} movies</span>
                          <div className="flex gap-2">
                            <button className="text-primary hover:text-primary/80 text-sm font-medium">Edit</button>
                            <button className="text-red-400 hover:text-red-300 text-sm font-medium">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'requests' && (
                <div>
                  <h1 className="text-3xl font-bold mb-8">📋 Movie Requests</h1>
                  
                  <div className="space-y-4">
                    {movieRequests.map((req) => (
                      <div key={req.id} className="bg-card rounded-xl p-6 border border-white/10">
                        <div className="flex items-start gap-4">
                          <img 
                            src={req.avatar} 
                            alt={req.user}
                            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-bold text-xl mb-1">{req.title}</h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs text-muted">Requested by {req.user} • {req.date}</span>
                                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">{req.genre}</span>
                                  {req.narratorRequest && (
                                    <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">🎤 {req.narratorRequest}</span>
                                  )}
                                </div>
                                <p className="text-muted">{req.description}</p>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <div className="text-center">
                                  <div className="text-2xl font-bold">{req.votes}</div>
                                  <div className="text-xs text-muted">votes</div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveRequest(req.id)}
                                    className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-all"
                                  >
                                    Approve
                                  </button>
                                  <button className="px-4 py-2 bg-white/10 text-white text-sm font-bold rounded-lg hover:bg-white/20 transition-all">
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'clips' && (
                <div>
                  <h1 className="text-3xl font-bold mb-8">🎥 Fan Clips Moderation</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fanClips.map((clip) => (
                      <div key={clip.id} className="bg-card rounded-2xl overflow-hidden border border-white/10">
                        <div className="relative aspect-video">
                          <img 
                            src={clip.thumbnail} 
                            alt={clip.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-medium">
                            {clip.duration}
                          </div>
                          <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-bold ${
                            clip.status === 'approved' 
                              ? 'bg-green-500/90 text-white' 
                              : 'bg-yellow-500/90 text-black'
                          }`}>
                            {clip.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg mb-2">{clip.title}</h3>
                          <div className="flex items-center gap-3 mb-4">
                            <img 
                              src={clip.avatar} 
                              alt={clip.user}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium">{clip.user}</p>
                              <p className="text-xs text-muted">{clip.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted mb-4">
                            <span>❤️ {clip.likes}</span>
                            <span>💬 {clip.comments}</span>
                          </div>
                          {clip.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveClip(clip.id)}
                                className="flex-1 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectClip(clip.id)}
                                className="flex-1 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {clip.status === 'approved' && (
                            <button className="w-full py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all">
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <h1 className="text-3xl font-bold mb-8">👥 Users Management</h1>
                  
                  <div className="bg-card rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold">User</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Role</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Movies Watched</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Clips</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersData.map((user) => (
                          <tr key={user.id} className="border-t border-white/10 hover:bg-white/5">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center font-bold">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-xs text-muted">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                user.role === 'ADMIN' 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                user.status === 'active' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted">{user.moviesWatched}</td>
                            <td className="px-6 py-4 text-muted">{user.clipsUploaded}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button className="text-primary hover:text-primary/80 text-sm font-medium">Edit</button>
                                <button className="text-red-400 hover:text-red-300 text-sm font-medium">Ban</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'storage' && <StoragePanel />}

              {activeTab === 'catalog-report' && <AdminCatalogReportPanel />}

              {activeTab === 'media' && <MediaJobsPanel />}

              {activeTab === 'analytics' && (
                <div>
                  <h1 className="text-3xl font-bold mb-8">📈 Analytics</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: 'Total Views', value: '45,234', change: '+12%', color: 'from-blue-500 to-cyan-400' },
                      { label: 'Total Downloads', value: '12,847', change: '+8%', color: 'from-green-500 to-emerald-400' },
                      { label: 'New Users', value: '234', change: '+15%', color: 'from-purple-500 to-pink-400' },
                      { label: 'Active Sessions', value: '567', change: '+5%', color: 'from-orange-500 to-red-400' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-card rounded-2xl p-6 border border-white/10">
                        <div className="text-3xl font-bold mb-2">{stat.value}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted">{stat.label}</span>
                          <span className="text-green-400 text-sm font-bold">{stat.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-2xl p-6 border border-white/10">
                      <h3 className="font-bold text-xl mb-6">Top Movies</h3>
                      <div className="space-y-4">
                        {movieData.slice(0, 5).map((movie, i) => (
                          <div key={movie.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-muted">#{i + 1}</span>
                              <div>
                                <p className="font-medium">{movie.title}</p>
                                <p className="text-xs text-muted">{movie.narrator}</p>
                              </div>
                            </div>
                            <span className="font-bold">{(1234 + i * 234).toLocaleString()} views</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-card rounded-2xl p-6 border border-white/10">
                      <h3 className="font-bold text-xl mb-6">Top Interpreters</h3>
                      <div className="space-y-4">
                        {narratorsData.slice(0, 5).map((narrator, i) => (
                          <div key={narrator.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                            <div className="flex items-center gap-3">
                              <img 
                                src={narrator.image} 
                                alt={narrator.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium">{narrator.name}</p>
                                <p className="text-xs text-muted">{narrator.moviesCount} movies</p>
                              </div>
                            </div>
                            <span className="font-bold">{(5678 + i * 345).toLocaleString()} views</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'news' && <AdminNewsPanel />}
              {activeTab === 'ads' && <AdminAdsPanel />}
            </div>
          </div>
        </div>
      </main>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {uploadForm.type === 'Series' ? '📺 Upload Series & Episodes' : '🎬 Upload Movie'}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {uploadForm.type === 'Series'
                      ? 'Add a complete episodic show with multiple seasons and episodes.'
                      : 'Add a full feature-length cinema title.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUploadMovie} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {uploadForm.type === 'Series' ? 'Series Title *' : 'Movie Title *'}
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder={uploadForm.type === 'Series' ? 'e.g., City of Dreams: Kigali' : 'e.g., Karahanyuze: The Beginning'}
                    className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Release Year *</label>
                    <input
                      type="number"
                      value={uploadForm.year}
                      onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}
                      placeholder="2025"
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Content Type *</label>
                    <select
                      value={uploadForm.type}
                      onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none font-bold text-primary"
                    >
                      <option value="Movie">🎬 Movie (Feature Film)</option>
                      <option value="Series">📺 Series (Episodic Show)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Genre *</label>
                    <input
                      type="text"
                      value={uploadForm.genre}
                      onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}
                      placeholder="Drama, Action, Sci-Fi"
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Narrator *</label>
                    <select
                      value={uploadForm.narrator}
                      onChange={(e) => setUploadForm({ ...uploadForm, narrator: e.target.value })}
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                      required
                    >
                      <option value="">Select narrator</option>
                      {narratorsData.slice(0, 10).map((n) => (
                        <option key={n.id} value={n.name}>{n.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CONDITIONAL: MOVIE FIELDS VS SERIES EPISODES BUILDER */}
                {uploadForm.type === 'Movie' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">YouTube Video ID / Stream Key</label>
                    <input
                      type="text"
                      value={uploadForm.youtubeId}
                      onChange={(e) => setUploadForm({ ...uploadForm, youtubeId: e.target.value })}
                      placeholder="dQw4w9WgXcQ or video source URL"
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-purple-500/30 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <div>
                        <h4 className="font-bold text-sm text-purple-300 flex items-center gap-1.5">
                          <span>📺 Series Episodes Manager</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          {seriesEpisodes.length} episodes configured for Season {seriesSeason}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-zinc-400">Season:</label>
                        <select
                          value={seriesSeason}
                          onChange={(e) => setSeriesSeason(Number(e.target.value))}
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white"
                        >
                          <option value={1}>Season 1</option>
                          <option value={2}>Season 2</option>
                          <option value={3}>Season 3</option>
                        </select>
                      </div>
                    </div>

                    {/* Episodes List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {seriesEpisodes.map((ep, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded bg-purple-600/30 text-purple-300 font-mono text-[10px] font-bold">
                              EP {ep.episodeNumber}
                            </span>
                            <input
                              type="text"
                              value={ep.title}
                              onChange={(e) => handleEpisodeChange(idx, 'title', e.target.value)}
                              placeholder={`Episode ${ep.episodeNumber} Title`}
                              className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-primary"
                              required
                            />
                            {seriesEpisodes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveEpisode(idx)}
                                className="text-rose-400 hover:text-rose-300 text-xs px-1.5 py-1 rounded bg-rose-500/10"
                                title="Remove episode"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={ep.youtubeId}
                              onChange={(e) => handleEpisodeChange(idx, 'youtubeId', e.target.value)}
                              placeholder="YouTube ID / Stream Link"
                              className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-[11px] text-white focus:outline-none"
                            />
                            <input
                              type="text"
                              value={ep.duration}
                              onChange={(e) => handleEpisodeChange(idx, 'duration', e.target.value)}
                              placeholder="Runtime (e.g. 45m)"
                              className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-[11px] text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddEpisode}
                      className="w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>+ Add Another Episode</span>
                    </button>
                  </div>
                )}

                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sendNotificationCheckbox"
                    checked={uploadForm.sendNotification}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, sendNotification: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  <label
                    htmlFor="sendNotificationCheckbox"
                    className="text-xs font-semibold text-zinc-200 cursor-pointer select-none"
                  >
                    🔔 Broadcast in-app & push notification to all users immediately upon upload
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    disabled={isUploading}
                    className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Publishing & Notifying…</span>
                      </>
                    ) : (
                      <span>Upload & Broadcast</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
