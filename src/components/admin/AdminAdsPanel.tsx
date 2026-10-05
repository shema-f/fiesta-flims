'use client';

import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  ExternalLink, 
  Sparkles, 
  MousePointer, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { SiteAd, AdPlacement, INITIAL_ADS } from '@/lib/adsData';

const PLACEMENT_LABELS: Record<AdPlacement, string> = {
  HEADER_BANNER: '🔝 Header Banner (Top Strip)',
  HOME_INTERSTITIAL: '🏠 Home Interstitial (Mid-Page)',
  NEWS_IN_FEED: '📰 News Feed Banner',
  ARTICLE_IN_BODY: '📖 Article Mid-Body Sponsor',
  VIDEO_PLAYER_BANNER: '🎬 Video Player Sponsor Banner',
  FOOTER_PROMO: '🦶 Footer Promo Banner',
};

const PRESET_AD_IMAGES = [
  { label: 'Fiesta Plus / VIP', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Cinema Hall / Soundstage', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Cloud Tech / Telegram', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Audio / Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop' },
  { label: 'High Speed Fiber / Screen', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Smartphone App PWA', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop' },
];

export default function AdminAdsPanel() {
  const [ads, setAds] = useState<SiteAd[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    placement: 'HOME_INTERSTITIAL' as AdPlacement,
    headline: '',
    description: '',
    targetUrl: '',
    imageUrl: PRESET_AD_IMAGES[0].url,
    badgeText: 'Sponsored',
    ctaText: 'Learn More',
    isActive: true,
  });

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads?all=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.ads)) {
        setAds(data.ads);
      } else {
        setAds(INITIAL_ADS);
      }
    } catch {
      setAds(INITIAL_ADS);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleToggle = async (id: string) => {
    setAds((prev) =>
      prev.map((ad) => (ad.id === id ? { ...ad, isActive: !ad.isActive } : ad))
    );

    try {
      await fetch(`/api/ads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleActive: true }),
      });
      setActionFeedback('Ad active status updated');
      setTimeout(() => setActionFeedback(null), 2500);
    } catch {
      // silent
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete ad "${title}"?`)) return;

    setAds((prev) => prev.filter((ad) => ad.id !== id));
    try {
      await fetch(`/api/ads/${id}`, { method: 'DELETE' });
      setActionFeedback(`Deleted ad "${title}"`);
      setTimeout(() => setActionFeedback(null), 2500);
    } catch {
      // silent
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.headline || !formData.targetUrl) {
      alert('Please fill out the Title, Headline, and Target Link.');
      return;
    }

    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        fetchAds();
        setActionFeedback('New Ad campaign launched across webapp!');
        setTimeout(() => setActionFeedback(null), 3000);
        setFormData({
          title: '',
          placement: 'HOME_INTERSTITIAL',
          headline: '',
          description: '',
          targetUrl: '',
          imageUrl: PRESET_AD_IMAGES[0].url,
          badgeText: 'Sponsored',
          ctaText: 'Learn More',
          isActive: true,
        });
      }
    } catch (err: any) {
      alert('Failed to create ad: ' + err.message);
    }
  };

  const totalImpressions = ads.reduce((sum, a) => sum + a.impressions, 0);
  const totalClicks = ads.reduce((sum, a) => sum + a.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0';

  const filteredAds = ads.filter((ad) => {
    if (selectedPlacement !== 'all' && ad.placement !== selectedPlacement) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Ads & Sponsorships Management
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Create, place, and control advertising banners and partner promotions throughout the entire webapp.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white text-xs font-black shadow-lg shadow-primary/30 flex items-center gap-2 hover:scale-[1.02] active:scale-98 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Ad Campaign</span>
        </button>
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Ads Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">
            Total Campaigns
          </div>
          <div className="text-2xl font-black text-white">{ads.length}</div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            {ads.filter((a) => a.isActive).length} active now
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> Total Impressions
          </div>
          <div className="text-2xl font-black text-white">{totalImpressions.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Across all webapp placements</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <MousePointer className="w-3.5 h-3.5" /> Total Clicks
          </div>
          <div className="text-2xl font-black text-white">{totalClicks.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Direct destination visits</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Average CTR
          </div>
          <div className="text-2xl font-black text-primary">{avgCtr}%</div>
          <div className="text-[11px] text-zinc-500 mt-1">Click-through engagement rate</div>
        </div>
      </div>

      {/* Placement Filter */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        <button
          type="button"
          onClick={() => setSelectedPlacement('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedPlacement === 'all'
              ? 'bg-primary text-white shadow'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          All Placements ({ads.length})
        </button>
        {(Object.keys(PLACEMENT_LABELS) as AdPlacement[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setSelectedPlacement(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedPlacement === p
                ? 'bg-primary text-white shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {PLACEMENT_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Ads List Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 uppercase text-[10px] font-black tracking-wider">
                <th className="py-3 px-4">Ad Campaign</th>
                <th className="py-3 px-4">Placement Slot</th>
                <th className="py-3 px-4">Target URL</th>
                <th className="py-3 px-4">Performance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredAds.map((ad) => {
                const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0';
                return (
                  <tr key={ad.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white line-clamp-1">{ad.title}</div>
                          <div className="text-[11px] text-zinc-400 line-clamp-1">{ad.headline}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.2 rounded bg-primary/20 text-primary text-[9px] font-bold">
                            {ad.badgeText}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-zinc-300 font-medium">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold">
                        {PLACEMENT_LABELS[ad.placement] || ad.placement}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate">
                      <a
                        href={ad.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span className="truncate">{ad.targetUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px] text-zinc-300">
                        <div>{ad.impressions.toLocaleString()} views</div>
                        <div className="text-zinc-500 font-bold">{ad.clicks} clicks ({ctr}%)</div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggle(ad.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1.5 ${
                          ad.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${ad.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                        <span>{ad.isActive ? 'Active' : 'Paused'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(ad.id, ad.title)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Delete Ad"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE AD CAMPAIGN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                Launch New Ad Campaign
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Campaign Internal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Subscription Promo 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Target Placement Slot *</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value as AdPlacement })}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {(Object.keys(PLACEMENT_LABELS) as AdPlacement[]).map((p) => (
                      <option key={p} value={p}>
                        {PLACEMENT_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Badge Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Sponsored, Partner, Exclusive Deal"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Catchy Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Get Unlimited 4K Cinema Streaming & Fast Cloud Downloads"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Description / Subtitle</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Special bundle for movie fans with instant Telegram delivery..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Target Click URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /plus, https://t.me/..., or https://wa.me/..."
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Call To Action (CTA) Button</label>
                  <input
                    type="text"
                    placeholder="e.g. Check Offer, Join Channel, Download Now"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Image URL & Preset selector */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-3 py-2 text-white focus:outline-none mb-2"
                />
                <div className="flex flex-wrap gap-1">
                  {PRESET_AD_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        formData.imageUrl === preset.url
                          ? 'bg-primary/20 border-primary text-white font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white font-black text-xs shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-98 transition-all"
                >
                  Deploy Ad Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
