'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function UploadClipPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert('File too large! Maximum size is 100MB');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setThumbnail(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to upload a clip!');
      router.push('/login');
      return;
    }
    if (!selectedFile) {
      alert('Please select a video file!');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setStep(3);
            setIsUploading(false);
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-32 pb-16 flex items-center justify-center">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-3xl font-bold mb-4">Login Required</h1>
            <p className="text-muted mb-8">Please login to upload a clip</p>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-3 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Go to Login
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold mb-4">
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                  Upload a Clip
                </span>
              </h1>
              <p className="text-xl text-muted">
                Share your favorite movie moments with the community!
              </p>
            </div>

            <div className="flex items-center justify-center mb-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${
                    step > s ? 'bg-green-500 text-white' :
                    step === s ? 'bg-primary text-white' :
                    'bg-white/10 text-muted'
                  }`}>
                    {step > s ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-1 ${step > s ? 'bg-green-500' : 'bg-white/10'}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-card rounded-2xl p-8 border border-white/10">
              {step === 1 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Clip Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Epic Fight Scene - Rocky Style"
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell us about this clip..."
                      rows={3}
                      className="w-full px-4 py-3 bg-background rounded-lg border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Video File</label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer">
                      {!selectedFile ? (
                        <label className="cursor-pointer block">
                          <div className="text-5xl mb-4">🎬</div>
                          <p className="font-semibold mb-2">Click to upload or drag & drop</p>
                          <p className="text-muted text-sm mb-4">MP4, WebM (Max 100MB, up to 2 minutes)</p>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <span className="px-6 py-2 bg-primary text-white rounded-lg font-semibold inline-block">
                            Select File
                          </span>
                        </label>
                      ) : (
                        <div>
                          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                            {thumbnail && (
                              <video
                                src={thumbnail}
                                className="w-full h-full object-cover"
                                controls
                              />
                            )}
                          </div>
                          <p className="font-semibold mb-2">{selectedFile.name}</p>
                          <p className="text-muted text-sm mb-4">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setThumbnail(null);
                            }}
                            className="text-red-400 hover:text-red-300 font-semibold"
                          >
                            Change File
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="w-5 h-5 rounded border-white/20 bg-white/10"
                    />
                    <label htmlFor="terms" className="text-sm text-muted">
                      I confirm this clip doesn't violate any copyright or community guidelines
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => router.push('/community')}
                      className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedFile || isUploading}
                      className="flex-1 py-3 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : (
                        'Continue to Upload'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Uploading...</h2>
                  <div className="w-full bg-white/10 rounded-full h-3 mb-4">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all"
                      style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-muted">{Math.round(uploadProgress)}% Complete</p>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#22c55e">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Clip Uploaded!</h2>
                  <p className="text-muted mb-8">
                    Your clip has been uploaded and is now live on the community page!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => {
                        setStep(1);
                        setTitle('');
                        setDescription('');
                        setSelectedFile(null);
                        setThumbnail(null);
                      }}
                      className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
                    >
                      Upload Another Clip
                    </button>
                    <button
                      onClick={() => router.push('/community')}
                      className="px-8 py-3 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      View Community
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold mb-6 text-center">📋 Upload Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-green-400">
                    ✅
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Short & Sweet</h4>
                    <p className="text-muted text-sm">Clips should be under 2 minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-green-400">
                    ✅
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Original Content</h4>
                    <p className="text-muted text-sm">Only upload clips you have rights to</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-red-400">
                    ❌
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">No Full Movies</h4>
                    <p className="text-muted text-sm">Don't upload entire films</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-red-400">
                    ❌
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">No Explicit Content</h4>
                    <p className="text-muted text-sm">Keep it family-friendly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
