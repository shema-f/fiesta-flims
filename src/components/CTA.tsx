export default function CTA() {
  return (
    <section className="py-25 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-radial-gradient from-primary/10 to-transparent animate-rotate"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Start Watching?
          </h2>
          <p className="text-lg text-muted mb-8">
            Join millions of users streaming movies today
          </p>
          <button className="inline-flex items-center gap-2 px-12 py-5 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-semibold text-xl shadow-lg shadow-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/60 transition-all">
            Get Started Free
          </button>
        </div>
      </div>
    </section>
  );
}
