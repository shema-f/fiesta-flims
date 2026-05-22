'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

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
  },
  {
    id: 4,
    title: 'The Shawshank Redemption',
    user: 'Classic Movie Fan',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=classic%20film%20lover%20portrait&image_size=square',
    votes: 87,
    description: 'One of the greatest movies ever!',
    genre: 'Drama',
    narratorRequest: 'Gaheza',
  },
];

export default function RequestMoviePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    narratorRequest: '',
    description: '',
  });
  const [votedRequests, setVotedRequests] = useState<number[]>([]);

  const toggleVote = (id: number) => {
    setVotedRequests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Movie request submitted! We will review it soon.');
    setFormData({ title: '', genre: '', narratorRequest: '', description: '' });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-primary via-red-500 to-orange-400 bg-clip-text text-transparent">
                Request a Movie
              </span>
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Can't find a movie you want? Request it and vote for your favorites!
            </p>
          </div>

          <div className="text-center mb-10">
            <button
              onClick={() => {
                if (!user) {
                  router.push('/login');
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="px-8 py-4 bg-gradient-to-r from-primary to-orange-400 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all text-lg"
            >
              + Request a New Movie
            </button>
          </div>

          {showForm && (
            <div className="max-w-2xl mx-auto mb-12">
              <div className="bg-card rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold mb-6">Submit Your Request</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Movie Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Inception (2010)"
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Genre *</label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      placeholder="e.g., Action, Sci-Fi"
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Narrator</label>
                    <select
                      value={formData.narratorRequest}
                      onChange={(e) => setFormData({ ...formData, narratorRequest: e.target.value })}
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Any narrator is fine!</option>
                      <option value="Rocky">Rocky</option>
                      <option value="Junior Giti">Junior Giti</option>
                      <option value="Sankara">Sankara</option>
                      <option value="Gaheza">Gaheza</option>
                      <option value="Yanga">Yanga</option>
                      <option value="B The Great">B The Great</option>
                      <option value="Savimbi">Savimbi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Why do you want this movie?</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell us why this movie would be great with narration!"
                      rows={4}
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="bg-gradient-to-r from-red-500 to-orange-400 text-white px-3 py-1 rounded-full text-sm">
                🔥 Top Requests
              </span>
              Vote for your favorites!
            </h2>

            <div className="space-y-4 max-w-4xl mx-auto">
              {movieRequests.map((req) => {
                const isVoted = votedRequests.includes(req.id);
                const voteCount = isVoted ? req.votes + 1 : req.votes;

                return (
                  <div key={req.id} className="bg-card rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-start gap-4">
                      <img 
                        src={req.avatar} 
                        alt={req.user}
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-xl mb-1">{req.title}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted">Requested by {req.user}</span>
                              <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                                {req.genre}
                              </span>
                              {req.narratorRequest && (
                                <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                                  🎤 {req.narratorRequest}
                                </span>
                              )}
                            </div>
                            <p className="text-muted">{req.description}</p>
                          </div>
                          <button
                            onClick={() => {
                              if (!user) {
                                router.push('/login');
                              } else {
                                toggleVote(req.id);
                              }
                            }}
                            className={`flex flex-col items-center gap-1 px-6 py-3 rounded-lg transition-all ${
                              isVoted
                                ? 'bg-primary text-white'
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                          >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill={isVoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                              <polyline points="18 15 12 9 6 15" />
                            </svg>
                            <span className="font-bold text-xl">{voteCount}</span>
                            <span className="text-xs">votes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <section className="mt-12 pt-12 border-t border-white/10">
            <h2 className="text-2xl font-bold text-center mb-8">📋 How Requesting Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  1️⃣
                </div>
                <h3 className="font-bold text-lg mb-2">Submit a Request</h3>
                <p className="text-muted">Tell us which movie you want to see</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  2️⃣
                </div>
                <h3 className="font-bold text-lg mb-2">Vote & Share</h3>
                <p className="text-muted">Get others to vote for your request</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  3️⃣
                </div>
                <h3 className="font-bold text-lg mb-2">We Add It!</h3>
                <p className="text-muted">Top requests get narrated and added</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
