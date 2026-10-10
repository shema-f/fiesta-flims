'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Send, 
  Film, 
  Globe, 
  User, 
  Tag, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Eye, 
  Edit3,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_IMAGES = [
  { label: 'Sci-Fi / Space', url: '/fallback-poster.png' },
  { label: 'Cinema Hall / Festival', url: '/hero-cinema.jpg' },
  { label: 'Action / Desert Epic', url: '/fallback-poster.png' },
  { label: 'Film Camera / 70mm', url: '/hero-cinema.jpg' },
  { label: 'Anime / Fantasy', url: '/fallback-poster.png' },
  { label: 'African Cinema / Spotlight', url: '/hero-cinema.jpg' },
  { label: 'Kigali / Urban Night', url: '/hero-cinema.jpg' },
  { label: 'Studio Tech / Streaming', url: '/fallback-poster.png' },
];

const CATEGORIES = [
  'Hollywood',
  'Rwanda Cinema',
  'Agasobanuye',
  'African Cinema',
  'Asian Cinema',
  'Sci-Fi & Tech',
  'Festivals & Awards',
  'Box Office',
];

const REGIONS = [
  'Global',
  'East Africa',
  'Rwanda',
  'North America',
  'Asia',
  'West Africa',
  'Europe',
  'India / Bollywood',
];

export default function AddNewsModal({ isOpen, onClose, onSuccess }: AddNewsModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Hollywood',
    region: 'Global',
    excerpt: '',
    content: '',
    image: PRESET_IMAGES[0].url,
    authorName: 'Fiesta Cinema Desk',
    authorRole: 'Senior Entertainment Writer',
    readTime: '4 min read',
    tags: 'Cinema News, Hollywood, 4K Streaming',
    isBreaking: false,
    isFeatured: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleInsertHelper = (snippet: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content ? `${prev.content}\n\n${snippet}` : snippet,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      alert('Please fill out the Title, Summary Excerpt, and Article Body.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish cinema news');
      }

      setSuccessMessage('🎉 News article published to Fiesta Flix blogs successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
        if (onSuccess) onSuccess();
        if (data.article?.slug) {
          router.push(`/news/${data.article.slug}`);
        } else {
          router.push('/news');
        }
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Error publishing news article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[92vh] z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  Add Global Cinema News
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase">
                    Editorial Blog
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Publish scoops, festival updates, box office reports, or Agasobanuye news
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Switcher */}
              <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex items-center text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'editor'
                      ? 'bg-primary text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'bg-primary text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Live Preview
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="m-4 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm font-bold flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {activeTab === 'editor' ? (
              <form id="news-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Christopher Nolan Announces Next 70mm Epic for 2026..."
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                {/* Category & Region */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Region / Territory
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                    >
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Estimated Read Time
                    </label>
                    <input
                      type="text"
                      name="readTime"
                      value={formData.readTime}
                      onChange={handleChange}
                      placeholder="e.g. 4 min read"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Excerpt Summary */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Hook Excerpt (Summary displayed in cards) *
                  </label>
                  <textarea
                    name="excerpt"
                    required
                    rows={2}
                    value={formData.excerpt}
                    onChange={handleChange}
                    placeholder="Brief 1-2 sentence hook that explains what happened and why it matters to cinema fans..."
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>

                {/* Featured Image & Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                      Featured Cinema Image URL
                    </label>
                    <span className="text-[11px] text-zinc-500">Pick preset or paste custom URL</span>
                  </div>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="/fallback-poster.png"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none mb-2"
                  />

                  {/* Preset Image Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, image: preset.url }))}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          formData.image === preset.url
                            ? 'bg-primary/20 border-primary text-white font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Article Body */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Article Body (Markdown Supported) *
                    </label>
                    {/* Quick Markdown Inserts */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleInsertHelper('### New Chapter Subtitle')}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                      >
                        + Heading
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertHelper('> "Insert quotes from director, narrator or actor here..."')}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                      >
                        + Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertHelper('• Point 1: Key takeaway\n• Point 2: Streaming availability\n• Point 3: Release date')}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                      >
                        + Bullets
                      </button>
                    </div>
                  </div>
                  <textarea
                    name="content"
                    required
                    rows={8}
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Write the full cinema news story here. Use ### for subheadings, > for quotes, and bullet points for specs..."
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl p-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none font-mono leading-relaxed"
                  />
                </div>

                {/* Author & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Author Name
                    </label>
                    <input
                      type="text"
                      name="authorName"
                      value={formData.authorName}
                      onChange={handleChange}
                      placeholder="e.g. Christian Niyigena"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g. Hollywood, 4K Cinema, Sci-Fi"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Flags Checkboxes */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isBreaking"
                      checked={formData.isBreaking}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-primary focus:ring-primary bg-zinc-900 border-zinc-700"
                    />
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      Mark as Breaking News
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-primary focus:ring-primary bg-zinc-900 border-zinc-700"
                    />
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Spotlight on News Homepage
                    </span>
                  </label>
                </div>
              </form>
            ) : (
              /* Live Preview */
              <div className="space-y-4">
                <div className="relative h-60 w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                  <img
                    src={formData.image}
                    alt={formData.title || 'Preview'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[11px] font-black uppercase">
                        {formData.category}
                      </span>
                      {formData.isBreaking && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Breaking
                        </span>
                      )}
                      <span className="text-xs text-zinc-300">{formData.region}</span>
                    </div>
                    <h1 className="text-xl font-black text-white leading-tight">
                      {formData.title || 'Your Article Title Preview'}
                    </h1>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <p className="text-sm text-zinc-300 font-medium italic border-l-2 border-primary pl-3">
                    {formData.excerpt || 'Article summary excerpt will appear here.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {formData.content || 'Your full article content will render here in real-time...'}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="news-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-primary/30 flex items-center gap-2 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Publishing...' : 'Publish Cinema News Article'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
