'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const rwandanMovies = [
  {
    id: 101,
    title: 'Karahanyuze: The Beginning',
    year: 2024,
    genre: 'Drama, Rwandan',
    rating: 9.2,
    narrator: 'Rocky',
    type: 'Movie',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=rwandan%20movie%20poster%20african%20cinema%20professional&image_size=square_hd',
    description: 'A powerful story about Rwandan culture and traditions.',
    duration: 125,
    youtubeId: 'dQw4w9WgXcQ',
    downloadUrl: '#',
  },
  {
    id: 102,
    title: 'Urukundo: Love Story',
    year: 2023,
    genre: 'Romance, Drama',
    rating: 8.8,
    narrator: 'Junior Giti',
    type: 'Movie',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=rwandan%20romantic%20movie%20poster%20african%20love%20story&image_size=square_hd',
    description: 'A beautiful love story set in the heart of Rwanda.',
    duration: 115,
    youtubeId: 'dQw4w9WgXcQ',
    downloadUrl: '#',
  },
  {
    id: 103,
    title: 'Umurage: Legacy',
    year: 2024,
    genre: 'Action, History',
    rating: 9.0,
    narrator: 'Sankara',
    type: 'Movie',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=rwandan%20action%20movie%20poster%20epic%20historical%20film&image_size=square_hd',
    description: 'An epic tale of Rwandan history and heritage.',
    duration: 135,
    youtubeId: 'dQw4w9WgXcQ',
    downloadUrl: '#',
  },
  {
    id: 104,
    title: 'Ibanga: The Secret',
    year: 2023,
    genre: 'Thriller, Mystery',
    rating: 8.7,
    narrator: 'Gaheza',
    type: 'Series',
    typeBadge: 'Season 1',
    episodes: 12,
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=rwandan%20thriller%20movie%20poster%20mystery%20suspense%20film&image_size=square_hd',
    description: 'A gripping mystery set in contemporary Rwanda.',
    duration: 110,
    youtubeId: 'dQw4w9WgXcQ',
    downloadUrl: '#',
  },
  {
    id: 105,
    title: 'Amakuru: News from Home',
    year: 2024,
    genre: 'Comedy, Family',
    rating: 8.5,
    narrator: 'Yanga',
    type: 'Movie',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=rwandan%20comedy%20movie%20poster%20family%20fun%20african&image_size=square_hd',
    description: 'A heartwarming comedy about Rwandan family life.',
    duration: 105,
    youtubeId: 'dQw4w9WgXcQ',
    downloadUrl: '#',
  },
  {
    id: 106,
    title: 'Intore: The Warriors',
    year: 2023,
    genre: 'Action, Adventure',
    rating: 9.1,
    narrator: 'Rocky',
    type: 'Series',
    typeBadge: 'Complete Series',
    episodes: 8,
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=rwandan%20warrior%20movie%20poster%20epic%20battle%20african&image_size=square_hd',
    description: 'Epic story of Rwandan warriors and their courage.',
    duration: 140,
    youtubeId: 'dQw4w9WgXcQ',
    downloadUrl: '#',
  },
  {
    id: 107,
    title: 'Nyampinga: The Queen',
    year: 2024,
    genre: 'Drama, Historical',
    rating: 8.9,
    narrator: 'B The Great',
    type: 'Movie',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=rwandan%20queen%20movie%20poster%20royal%20african%20drama&image_size=square_hd',
    description: 'The inspiring story of Rwandan royalty.',
    duration: 130,
    youtubeId: 'dQw4w9WgXcQ',
    downloadUrl: '#',
  },
  {
    id: 108,
    title: 'Icyumba: The Hut',
    year: 2023,
    genre: 'Drama, Cultural',
    rating: 8.6,
    narrator: 'Savimbi',
    type: 'Movie',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=rwandan%20cultural%20movie%20poster%20traditional%20village%20life&image_size=square_hd',
    description: 'A beautiful portrayal of traditional Rwandan life.',
    duration: 118,
    youtubeId: 'dQw4w9WgXcQ',
    downloadUrl: '#',
  },
];

export default function RwandanMoviesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedMovie, setSelectedMovie] = useState<typeof rwandanMovies[0] | null>(null);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'Movie', label: '🎬 Movies' },
    { id: 'Series', label: '📺 Series' },
    { id: 'drama', label: 'Drama' },
    { id: 'action', label: 'Action' },
    { id: 'comedy', label: 'Comedy' },
    { id: 'romance', label: 'Romance' },
  ];

  const filteredMovies = activeCategory === 'all' 
    ? rwandanMovies 
    : activeCategory === 'Movie' || activeCategory === 'Series'
      ? rwandanMovies.filter(movie => movie.type === activeCategory)
      : rwandanMovies.filter(movie => 
          movie.genre.toLowerCase().includes(activeCategory.toLowerCase())
        );

  const handleDownload = (movie: typeof rwandanMovies[0]) => {
    alert(`Downloading "${movie.title}"...\n\nNote: In production, this would download the video with Fiesta Flix watermark.`);
  };

  const handleWatch = (movie: typeof rwandanMovies[0]) => {
    setSelectedMovie(movie);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full px-6 py-2">
                <span className="text-white font-bold text-sm">🇷🇼 RWANDA</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-green-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
                Karahanyuze
              </span>
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Discover amazing Rwandan movies with authentic Kinyarwanda narration. 
              Watch on YouTube or download with Fiesta Flix watermark!
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white/10 text-muted hover:bg-white/20'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {selectedMovie && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          selectedMovie.type === 'Series' 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {selectedMovie.type === 'Series' ? `📺 ${selectedMovie.typeBadge || 'Series'}` : '🎬 Movie'}
                        </span>
                        {selectedMovie.episodes && (
                          <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">
                            {selectedMovie.episodes} Episodes
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold">{selectedMovie.title}</h2>
                    </div>
                    <button
                      onClick={() => setSelectedMovie(null)}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="aspect-video bg-black rounded-xl mb-6 overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedMovie.youtubeId}?autoplay=1`}
                      title={selectedMovie.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleDownload(selectedMovie)}
                      className="flex-1 min-w-[140px] py-3 bg-gradient-to-r from-green-500 to-emerald-400 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={() => setSelectedMovie(null)}
                      className="flex-1 min-w-[140px] py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-16">
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="bg-card rounded-2xl overflow-hidden border border-white/10 hover:-translate-y-1 hover:shadow-xl transition-all">
                <div className="relative aspect-[2/3]">
                  <img 
                    src={movie.image} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      movie.type === 'Series' 
                        ? 'bg-purple-500/90 text-white' 
                        : 'bg-blue-500/90 text-white'
                    }`}>
                      {movie.type === 'Series' ? '📺 Series' : '🎬 Movie'}
                    </span>
                    {movie.typeBadge && (
                      <span className="text-xs px-2 py-1 bg-orange-500/90 text-white rounded-full">
                        {movie.typeBadge}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all flex flex-col justify-end p-4">
                    <button
                      onClick={() => handleWatch(movie)}
                      className="w-full py-3 bg-gradient-to-r from-primary to-orange-400 text-white font-bold rounded-lg mb-2 flex items-center justify-center gap-2"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Watch Now
                    </button>
                    <button
                      onClick={() => handleDownload(movie)}
                      className="w-full py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg flex items-center justify-center gap-2 text-sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download
                    </button>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded text-xs font-medium">
                    {movie.duration} min
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{movie.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted">{movie.year}</span>
                    <span className="text-muted">•</span>
                    <span className="text-xs text-muted">{movie.genre}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="text-sm font-semibold">{movie.rating}</span>
                    </div>
                    <span className="text-xs text-primary font-semibold">🎤 {movie.narrator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <section className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-8 md:p-12 mb-12 border border-white/10">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Why Rwandan Movies?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                <div>
                  <div className="text-4xl mb-3">🎭</div>
                  <h3 className="text-xl font-bold mb-2">Authentic Stories</h3>
                  <p className="text-muted">Real Rwandan stories told with passion and authenticity.</p>
                </div>
                <div>
                  <div className="text-4xl mb-3">🗣️</div>
                  <h3 className="text-xl font-bold mb-2">Kinyarwanda Narration</h3>
                  <p className="text-muted">Professional narration in beautiful Kinyarwanda language.</p>
                </div>
                <div>
                  <div className="text-4xl mb-3">💧</div>
                  <h3 className="text-xl font-bold mb-2">Fiesta Flix Watermark</h3>
                  <p className="text-muted">All downloads come with official Fiesta Flix watermark.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Featured Narrators</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['Rocky', 'Junior Giti', 'Sankara', 'Gaheza', 'Yanga'].map((narrator, i) => (
                <Link
                  key={i}
                  href="/interpreters"
                  className="px-6 py-3 bg-card rounded-full border border-white/10 hover:bg-white/10 hover:-translate-y-1 transition-all font-semibold"
                >
                  {narrator}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
