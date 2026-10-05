'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Newspaper, 
  Plus, 
  Trash2, 
  Eye, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  Clock, 
  Calendar,
  Filter
} from 'lucide-react';
import { CinemaNewsArticle, getAllCinemaNews } from '@/lib/cinemaNewsData';
import AddNewsModal from '@/components/AddNewsModal';

export default function AdminNewsPanel() {
  const [news, setNews] = useState<CinemaNewsArticle[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news?limit=100');
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        setNews(data.articles);
      } else {
        setNews(getAllCinemaNews());
      }
    } catch {
      setNews(getAllCinemaNews());
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    // Filter out locally
    setNews((prev) => prev.filter((item) => item.id !== id && item.slug !== id));
    setActionFeedback(`Deleted "${title}"`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleToggleBreaking = (slug: string) => {
    setNews((prev) =>
      prev.map((item) =>
        item.slug === slug ? { ...item, isBreaking: !item.isBreaking } : item
      )
    );
    setActionFeedback('Updated breaking news status');
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const filteredNews = news.filter((item) => {
    if (selectedCategory !== 'all' && item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" />
            FiestaFlix News & Cinema Blogs Management
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Publish scoops, breaking movie announcements, Agasobanuye milestones, and manage all site news articles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/news"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <span>View Public News Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white text-xs font-black shadow-lg shadow-primary/30 flex items-center gap-2 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Article</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search news by title, category, or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All Categories ({news.length})</option>
            <option value="Hollywood">Hollywood</option>
            <option value="Rwanda Cinema">Rwanda Cinema</option>
            <option value="Agasobanuye">Agasobanuye</option>
            <option value="African Cinema">African Cinema</option>
            <option value="Asian Cinema">Asian Cinema</option>
            <option value="Sci-Fi & Tech">Sci-Fi & Tech</option>
            <option value="Festivals & Awards">Festivals & Awards</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 uppercase text-[10px] font-black tracking-wider">
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Stats</th>
                <th className="py-3 px-4">Breaking</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredNews.map((article) => (
                <tr key={article.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-4 max-w-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/news/${article.slug}`}
                          target="_blank"
                          className="font-bold text-white hover:text-primary transition-colors line-clamp-1"
                        >
                          {article.title}
                        </Link>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(article.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase">
                      {article.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-zinc-300 font-medium">
                    {article.region}
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-zinc-300 text-[11px]">
                      <div>{article.views.toLocaleString()} reads</div>
                      <div className="text-zinc-500">{article.likes} likes</div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleBreaking(article.slug)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all flex items-center gap-1 ${
                        article.isBreaking
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      {article.isBreaking ? 'Breaking' : 'Standard'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/news/${article.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="View Public Story"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(article.id, article.title)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Delete Article"
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

      {/* Add News Modal */}
      <AddNewsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchNews();
          setActionFeedback('Article published to FiestaFlix News successfully!');
          setTimeout(() => setActionFeedback(null), 4000);
        }}
      />
    </div>
  );
}
