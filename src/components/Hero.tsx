import Image from 'next/image';

export default function Hero() {
  return (
    <section id="home" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=epic%20cinematic%20movie%20theater%20background%20dark%20atmosphere%20dramatic%20lighting&image_size=landscape_16_9"
          alt="Hero Background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/95"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center pt-20">
        <div className="max-w-3xl mx-auto animate-fadeInUp">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
            Discover Amazing Movies
          </h1>
          <p className="text-lg md:text-xl text-muted mb-10">
            Stream and download your favorite movies in HD quality
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-semibold text-lg shadow-lg shadow-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/60 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch Now
            </button>
            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 text-white font-semibold text-lg border border-white/20 hover:bg-white/20 hover:-translate-y-1 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              Learn More
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce-custom">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14" />
          <path d="M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
