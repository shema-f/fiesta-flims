'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const fanClips = [
  {
    id: 1,
    title: 'Epic Fight Scene - Rocky Style',
    user: 'Jean Pierre',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20african%20man%20portrait%20headshot&image_size=square',
    thumbnail: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=epic%20movie%20fight%20scene%20cinematic&image_size=square',
    duration: '1:45',
    likes: 342,
    comments: [
      { id: 1, user: 'John Doe', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=casual%20african%20man%20portrait&image_size=square', text: 'Hahaha this is amazing! 😂', time: '2h ago' },
      { id: 2, user: 'Jane Smith', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20african%20woman%20portrait&image_size=square', text: 'Rocky never disappoints! 🔥', time: '3h ago' },
    ],
    shares: 67,
  },
  {
    id: 2,
    title: 'Funny Moment Compilation',
    user: 'Marie Claire',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20african%20woman%20portrait%20headshot&image_size=square',
    thumbnail: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=comedy%20movie%20scene%20funny%20moment&image_size=square',
    duration: '2:15',
    likes: 521,
    comments: [
      { id: 1, user: 'Paul Rwigara', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=young%20african%20man%20portrait%20smiling&image_size=square', text: 'I laughed so hard! 😂😂', time: '1h ago' },
    ],
    shares: 89,
  },
  {
    id: 3,
    title: 'Best Romantic Scene',
    user: 'Paul Rwigara',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=young%20african%20man%20portrait%20smiling&image_size=square',
    thumbnail: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=romantic%20movie%20scene%20cinematic%20moment&image_size=square',
    duration: '1:30',
    likes: 287,
    comments: [
      { id: 1, user: 'Sarah Uwimana', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=young%20african%20woman%20portrait%20happy&image_size=square', text: 'So beautiful! 💕', time: '4h ago' },
      { id: 2, user: 'Jean Pierre', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20african%20man%20portrait%20headshot&image_size=square', text: 'Junior Giti did amazing!', time: '5h ago' },
    ],
    shares: 45,
  },
  {
    id: 4,
    title: 'Junior Giti Impression',
    user: 'Sarah Uwimana',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=young%20african%20woman%20portrait%20happy&image_size=square',
    thumbnail: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=impersonation%20comedy%20scene%20entertainment&image_size=square',
    duration: '0:55',
    likes: 892,
    comments: [
      { id: 1, user: 'Marie Claire', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20african%20woman%20portrait%20headshot&image_size=square', text: 'This is perfect! You nailed it! 👏', time: '30m ago' },
    ],
    shares: 156,
  },
];

const movieRequests = [
  {
    id: 1,
    title: 'Inception (2010)',
    user: 'Movie Fanatic',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20lover%20african%20portrait&image_size=square',
    votes: 145,
    description: 'Would love to see this with Rocky narration!',
  },
  {
    id: 2,
    title: 'The Dark Knight',
    user: 'Cinema Lover',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=film%20enthusiast%20african%20man&image_size=square',
    votes: 123,
    description: 'Please add this classic!',
  },
  {
    id: 3,
    title: 'Interstellar',
    user: 'Sci-Fi Fan',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=science%20fiction%20fan%20young%20african&image_size=square',
    votes: 98,
    description: 'Amazing sci-fi movie!',
  },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('clips');
  const [likedClips, setLikedClips] = useState<number[]>([]);
  const [votedRequests, setVotedRequests] = useState<number[]>([]);
  const [expandedClip, setExpandedClip] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  const toggleLike = (id: number) => {
    setLikedClips(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleVote = (id: number) => {
    setVotedRequests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleShare = (clipId: number, title: string) => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: 'Check out this funny clip on Fiesta Flix!',
        url: window.location.href,
      });
    } else {
      alert('Share feature not available, but you can copy the link!');
    }
  };

  const handleCommentSubmit = (clipId: number) => {
    const comment = commentInputs[clipId];
    if (comment?.trim() && user) {
      alert(`Comment added! "${comment}"`);
      setCommentInputs(prev => ({ ...prev, [clipId]: '' }));
    } else if (!user) {
      alert('Please login to comment!');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-primary via-red-500 to-orange-400 bg-clip-text text-transparent">
                Fan Community
              </span>
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Share your favorite moments, request movies, and connect with other movie lovers!
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-card rounded-full p-1">
              <button
                onClick={() => setActiveTab('clips')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeTab === 'clips'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-muted hover:text-white'
                }`}
              >
                🎥 Fan Clips
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeTab === 'requests'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-muted hover:text-white'
                }`}
              >
                📋 Movie Requests
              </button>
            </div>
          </div>

          {activeTab === 'clips' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Popular Fan Clips</h2>
                <Link href="/upload-clip" className="px-6 py-3 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                  + Upload Clip
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {fanClips.map((clip) => {
                  const isLiked = likedClips.includes(clip.id);
                  const isExpanded = expandedClip === clip.id;
                  const likeCount = isLiked ? clip.likes + 1 : clip.likes;

                  return (
                    <div key={clip.id} className="bg-card rounded-2xl overflow-hidden border border-white/10 hover:-translate-y-1 hover:shadow-xl transition-all">
                      <div className="relative aspect-video cursor-pointer" onClick={() => setExpandedClip(isExpanded ? null : clip.id)}>
                        <img 
                          src={clip.thumbnail} 
                          alt={clip.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-sm font-medium">
                          {clip.duration}
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-3 truncate">{clip.title}</h3>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <img 
                            src={clip.avatar} 
                            alt={clip.user}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="text-sm text-muted">{clip.user}</span>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(clip.id);
                            }}
                            className={`flex items-center gap-2 text-sm font-semibold transition-all ${
                              isLiked ? 'text-primary' : 'text-muted hover:text-primary'
                            }`}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span>{likeCount.toLocaleString()}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedClip(isExpanded ? null : clip.id);
                            }}
                            className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-white transition-all"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>{clip.comments.length}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(clip.id, clip.title);
                            }}
                            className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-white transition-all"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="18" cy="5" r="3" />
                              <circle cx="6" cy="12" r="3" />
                              <circle cx="18" cy="19" r="3" />
                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            <span>{clip.shares}</span>
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-white/10 pt-4 mt-4">
                            <div className="space-y-4 mb-4">
                              {clip.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                  <img 
                                    src={comment.avatar} 
                                    alt={comment.user}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 bg-white/5 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-sm">{comment.user}</span>
                                      <span className="text-xs text-muted">{comment.time}</span>
                                    </div>
                                    <p className="text-sm">{comment.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex gap-3">
                              <img 
                                src={user?.avatar || 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=default%20user%20avatar%20portrait&image_size=square'} 
                                alt="Your avatar"
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  value={commentInputs[clip.id] || ''}
                                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [clip.id]: e.target.value }))}
                                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCommentSubmit(clip.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleCommentSubmit(clip.id)}
                                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/80 transition-all"
                                >
                                  Post
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Movie Requests</h2>
                <button className="px-6 py-3 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                  + Request Movie
                </button>
              </div>

              <div className="space-y-4 max-w-3xl mx-auto">
                {movieRequests.map((req) => {
                  const isVoted = votedRequests.includes(req.id);
                  const voteCount = isVoted ? req.votes + 1 : req.votes;

                  return (
                    <div key={req.id} className="bg-card rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
                      <div className="flex items-start gap-4">
                        <img 
                          src={req.avatar} 
                          alt={req.user}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-xl mb-1">{req.title}</h3>
                              <p className="text-muted text-sm mb-2">Requested by {req.user}</p>
                              <p className="text-muted">{req.description}</p>
                            </div>
                            <button
                              onClick={() => toggleVote(req.id)}
                              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-lg transition-all ${
                                isVoted
                                  ? 'bg-primary text-white'
                                  : 'bg-white/10 hover:bg-white/20'
                              }`}
                            >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill={isVoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                <polyline points="18 15 12 9 6 15" />
                              </svg>
                              <span className="font-bold text-lg">{voteCount}</span>
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
          )}

          <section className="mt-16 pt-12 border-t border-white/10">
            <h2 className="text-2xl font-bold text-center mb-8">🎯 How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-orange-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  🎥
                </div>
                <h3 className="font-bold text-lg mb-2">Upload Clips</h3>
                <p className="text-muted">Share your favorite movie moments (up to 2 minutes)</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  ❤️
                </div>
                <h3 className="font-bold text-lg mb-2">Like & Comment</h3>
                <p className="text-muted">Interact with other fans and their clips</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  📋
                </div>
                <h3 className="font-bold text-lg mb-2">Request Movies</h3>
                <p className="text-muted">Vote for movies you want to see narrated</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
