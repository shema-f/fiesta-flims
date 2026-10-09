'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StoragePanel from '@/components/admin/StoragePanel';
import MediaJobsPanel from '@/components/admin/MediaJobsPanel';
import AdminNewsPanel from '@/components/admin/AdminNewsPanel';
import AdminAdsPanel from '@/components/admin/AdminAdsPanel';
import AdminCatalogReportPanel from '@/components/admin/AdminCatalogReportPanel';
import AdminMoviesManager from '@/components/admin/AdminMoviesManager';
import {
  Film,
  Users,
  Mic2,
  BarChart3,
  TrendingUp,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Plus,
  Shield,
  Star,
  X,
  Loader2,
  Smartphone,
  Clapperboard,
} from 'lucide-react';

interface LiveStats {
  totalMovies: number;
  seriesCount: number;
  singleMoviesCount: number;
  totalInterpreters: number;
  totalUsers: number;
  activeUsers: number;
  totalViews: number;
  totalDownloads: number;
  pendingRequests: number;
  pendingClips: number;
  recentActivity: Array<{ id: string; action: string; user: string; time: string; type: string }>;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'FAN';
  image?: string;
  joined: string;
  status: string;
  moviesWatched: number;
  favoritesCount: number;
  downloadsCount: number;
  requestsCount: number;
}

interface InterpreterItem {
  id?: string;
  name: string;
  slug: string;
  bio?: string;
  image?: string;
  rating?: number;
  moviesCount?: number;
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'movies', label: 'Movies & Series', icon: Film },
  { id: 'interpreters', label: 'Interpreters', icon: Mic2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'catalog-report', label: 'Catalog Report', icon: Clapperboard },
  { id: 'news', label: 'Fiesta News', icon: TrendingUp },
  { id: 'ads', label: 'Ads & Banners', icon: Smartphone },
  { id: 'storage', label: 'Storage Health', icon: Download },
  { id: 'media', label: 'Media Jobs', icon: RefreshCw },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState<LiveStats>({
    totalMovies: 138,
    seriesCount: 42,
    singleMoviesCount: 96,
    totalInterpreters: 70,
    totalUsers: 1,
    activeUsers: 1,
    totalViews: 58400,
    totalDownloads: 24800,
    pendingRequests: 0,
    pendingClips: 0,
    recentActivity: [],
  });

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [interpreters, setInterpreters] = useState<InterpreterItem[]>([]);
  const [loadingInterpreters, setLoadingInterpreters] = useState(false);

  // Edit Interpreter Modal
  const [editingInterpreter, setEditingInterpreter] = useState<InterpreterItem | null>(null);
  const [interpreterForm, setInterpreterForm] = useState({
    name: '',
    bio: '',
    image: '',
    rating: 9.0,
    moviesCount: 0,
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.data) setStats(json.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      }
    } catch {
      showToast('Failed to load users from database', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchInterpreters = async () => {
    setLoadingInterpreters(true);
    try {
      const res = await fetch('/api/admin/interpreters');
      if (res.ok) {
        const json = await res.json();
        setInterpreters(json.data || []);
      }
    } catch {
      showToast('Failed to load interpreters', 'error');
    } finally {
      setLoadingInterpreters(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchInterpreters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleUserRole = async (userId: string, currentRole: 'ADMIN' | 'FAN') => {
    const newRole = currentRole === 'ADMIN' ? 'FAN' : 'ADMIN';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      if (res.ok) {
        showToast(`User role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        showToast('Failed to update user role', 'error');
      }
    } catch {
      showToast('Network error updating user', 'error');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`User "${userName}" deleted`);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        showToast('Failed to delete user', 'error');
      }
    } catch {
      showToast('Network error deleting user', 'error');
    }
  };

  const openEditInterpreter = (item: InterpreterItem) => {
    setEditingInterpreter(item);
    setInterpreterForm({
      name: item.name,
      bio: item.bio || '',
      image: item.image || '/interpreters/Rocky Kimomo.png',
      rating: item.rating || 9.0,
      moviesCount: item.moviesCount || 0,
    });
  };

  const handleSaveInterpreter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInterpreter) return;

    try {
      const res = await fetch('/api/admin/interpreters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingInterpreter.id,
          slug: editingInterpreter.slug,
          name: interpreterForm.name,
          bio: interpreterForm.bio,
          image: interpreterForm.image,
          rating: interpreterForm.rating,
          moviesCount: interpreterForm.moviesCount,
        }),
      });

      if (res.ok) {
        showToast(`Interpreter "${interpreterForm.name}" updated!`);
        setInterpreters((prev) =>
          prev.map((it) =>
            it.slug === editingInterpreter.slug
              ? { ...it, ...interpreterForm }
              : it
          )
        );
        setEditingInterpreter(null);
      } else {
        showToast('Failed to update interpreter', 'error');
      }
    } catch {
      showToast('Network error saving interpreter', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-20 sm:pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Toast Notification */}
          {toast && (
            <div
              className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-bold shadow-xl animate-fadeIn ${
                toast.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              <span>{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="text-xs px-2 py-1 bg-white/10 rounded-lg hover:bg-white/20"
              >
                ✕
              </button>
            </div>
          )}

          {/* MOBILE HORIZONTAL TABS STRIP (Visible on mobile/tablet) */}
          <div className="lg:hidden mb-6 overflow-x-auto no-scrollbar -mx-4 px-4 flex items-center gap-2 pb-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* DESKTOP SIDEBAR NAVIGATION */}
            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-3xl p-5 sticky top-24 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-zinc-800/80">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-black text-sm text-white">Admin Studio</h2>
                    <p className="text-[10px] text-zinc-500">Live PostgreSQL Backend</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                          isActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0">
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white">Dashboard Overview</h1>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Real-time status synchronized with live database.
                      </p>
                    </div>
                    <button
                      onClick={fetchStats}
                      disabled={loadingStats}
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-2 w-fit"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
                      <span>Refresh Backend Data</span>
                    </button>
                  </div>

                  {/* STATS CARDS */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400 font-bold">Catalog Titles</span>
                        <Film className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white">
                        {stats.totalMovies}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        {stats.seriesCount} Series • {stats.singleMoviesCount} Movies
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400 font-bold">Interpreters</span>
                        <Mic2 className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white">
                        {stats.totalInterpreters}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        All Rwandan voice artists
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400 font-bold">Registered Users</span>
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white">
                        {stats.totalUsers}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        Real accounts in PostgreSQL
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400 font-bold">Total Downloads</span>
                        <Download className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white">
                        {stats.totalDownloads.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        Direct & Telegram downloads
                      </div>
                    </div>
                  </div>

                  {/* RECENT ACTIVITY & QUICK ACTIONS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80">
                      <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Live Backend Activity
                      </h3>
                      <div className="space-y-3">
                        {stats.recentActivity.length === 0 ? (
                          <p className="text-xs text-zinc-500 py-4">No recent activity logs.</p>
                        ) : (
                          stats.recentActivity.map((act) => (
                            <div
                              key={act.id}
                              className="flex items-center justify-between py-2 border-b border-zinc-900 last:border-0 text-xs"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-bold text-white truncate">{act.action}</p>
                                <p className="text-[11px] text-zinc-400 truncate">{act.user}</p>
                              </div>
                              <span className="text-[10px] text-zinc-500 shrink-0">{act.time}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80">
                      <h3 className="font-bold text-base text-white mb-4">Quick Navigation</h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <button
                          onClick={() => setActiveTab('movies')}
                          className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 text-left transition-colors"
                        >
                          <Film className="w-4 h-4 text-primary mb-2" />
                          <p className="font-bold text-white">Manage Movies</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Upload or edit titles</p>
                        </button>
                        <button
                          onClick={() => setActiveTab('interpreters')}
                          className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 text-left transition-colors"
                        >
                          <Mic2 className="w-4 h-4 text-amber-400 mb-2" />
                          <p className="font-bold text-white">Interpreters</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Edit bio & ratings</p>
                        </button>
                        <button
                          onClick={() => setActiveTab('users')}
                          className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 text-left transition-colors"
                        >
                          <Users className="w-4 h-4 text-emerald-400 mb-2" />
                          <p className="font-bold text-white">Manage Users</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Roles & permissions</p>
                        </button>
                        <button
                          onClick={() => setActiveTab('storage')}
                          className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 text-left transition-colors"
                        >
                          <Download className="w-4 h-4 text-purple-400 mb-2" />
                          <p className="font-bold text-white">Storage Health</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Providers & servers</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE MOVIES & SERIES MANAGEMENT */}
              {activeTab === 'movies' && <AdminMoviesManager />}

              {/* TAB 3: REAL INTERPRETERS MANAGEMENT */}
              {activeTab === 'interpreters' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-black text-white flex items-center gap-2">
                        <Mic2 className="w-6 h-6 text-amber-400" />
                        Manage Rwandan Interpreters
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        All {interpreters.length} interpreters loaded from database with authentic translated movie counts.
                      </p>
                    </div>
                    <button
                      onClick={fetchInterpreters}
                      disabled={loadingInterpreters}
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-2 w-fit"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingInterpreters ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {loadingInterpreters ? (
                    <div className="py-20 text-center text-zinc-500">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-xs">Loading interpreters...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {interpreters.map((item) => (
                        <div
                          key={item.slug}
                          className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between group hover:border-zinc-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.image || '/interpreters/Rocky Kimomo.png'}
                                alt={item.name}
                                className="w-12 h-12 rounded-full object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    {item.rating || 9.0}
                                  </span>
                                  <span className="text-[11px] text-primary font-bold">
                                    {item.moviesCount || 0} movies
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                              {item.bio || 'Authentic Kinyarwanda commentary and translation.'}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                              /{item.slug}
                            </span>
                            <button
                              onClick={() => openEditInterpreter(item)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: REAL USERS MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-black text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-emerald-400" />
                        Live Users Management
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Active registered accounts in PostgreSQL database ({users.length} total).
                      </p>
                    </div>
                    <button
                      onClick={fetchUsers}
                      disabled={loadingUsers}
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-2 w-fit"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {loadingUsers ? (
                    <div className="py-20 text-center text-zinc-500">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-xs">Loading database users...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="py-16 text-center text-zinc-500">
                      <Users className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                      <p className="text-sm font-semibold text-zinc-400">No users found</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="px-4 py-3.5">User</th>
                              <th className="px-4 py-3.5">Role</th>
                              <th className="px-4 py-3.5">Joined</th>
                              <th className="px-4 py-3.5">Activity</th>
                              <th className="px-4 py-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900">
                            {users.map((u) => (
                              <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs shrink-0">
                                      {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-white text-xs truncate">{u.name}</p>
                                      <p className="text-[11px] text-zinc-500 truncate">{u.email}</p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                      u.role === 'ADMIN'
                                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    }`}
                                  >
                                    {u.role}
                                  </span>
                                </td>

                                <td className="px-4 py-3 text-zinc-400">{u.joined}</td>

                                <td className="px-4 py-3 text-zinc-400">
                                  <span>{u.favoritesCount} favs</span> •{' '}
                                  <span>{u.downloadsCount} dls</span>
                                </td>

                                <td className="px-4 py-3 text-right">
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      onClick={() => handleToggleUserRole(u.id, u.role)}
                                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-bold border border-zinc-800 transition-colors"
                                      title="Toggle Admin role"
                                    >
                                      {u.role === 'ADMIN' ? 'Make Fan' : 'Make Admin'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u.id, u.name)}
                                      className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                      title="Delete user"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: CATALOG & IMPORT REPORT */}
              {activeTab === 'catalog-report' && <AdminCatalogReportPanel />}

              {/* TAB 6: NEWS */}
              {activeTab === 'news' && <AdminNewsPanel />}

              {/* TAB 7: ADS */}
              {activeTab === 'ads' && <AdminAdsPanel />}

              {/* TAB 8: STORAGE HEALTH */}
              {activeTab === 'storage' && <StoragePanel />}

              {/* TAB 9: MEDIA JOBS */}
              {activeTab === 'media' && <MediaJobsPanel />}
            </div>
          </div>
        </div>
      </main>

      {/* EDIT INTERPRETER MODAL */}
      {editingInterpreter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setEditingInterpreter(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-4">
              Edit Interpreter: {editingInterpreter.name}
            </h3>

            <form onSubmit={handleSaveInterpreter} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-bold">Display Name</label>
                <input
                  type="text"
                  required
                  value={interpreterForm.name}
                  onChange={(e) =>
                    setInterpreterForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Rating (out of 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={interpreterForm.rating}
                    onChange={(e) =>
                      setInterpreterForm((p) => ({
                        ...p,
                        rating: parseFloat(e.target.value) || 9.0,
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Movies Count</label>
                  <input
                    type="number"
                    min="0"
                    value={interpreterForm.moviesCount}
                    onChange={(e) =>
                      setInterpreterForm((p) => ({
                        ...p,
                        moviesCount: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-bold">Avatar / Photo URL</label>
                <input
                  type="text"
                  value={interpreterForm.image}
                  onChange={(e) =>
                    setInterpreterForm((p) => ({ ...p, image: e.target.value }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-bold">Biography & Style</label>
                <textarea
                  rows={3}
                  value={interpreterForm.bio}
                  onChange={(e) =>
                    setInterpreterForm((p) => ({ ...p, bio: e.target.value }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setEditingInterpreter(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
