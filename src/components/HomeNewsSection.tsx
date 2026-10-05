'use client';

import Link from 'next/link';
import { Newspaper, ArrowRight, Flame, Clock, Eye, Globe } from 'lucide-react';
import { INITIAL_CINEMA_NEWS } from '@/lib/cinemaNewsData';

export default function HomeNewsSection() {
  const topNews = INITIAL_CINEMA_NEWS.slice(0, 4);

  return (
    <section className="container-tight py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider mb-1">
            <Newspaper className="w-3.5 h-3.5" />
            Official News & Scoops
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            FiestaFlix <span className="text-primary">News</span>
          </h2>
        </div>

        <Link
          href="/news"
          className="text-xs sm:text-sm font-bold text-primary hover:text-orange-400 transition-colors flex items-center gap-1.5"
        >
          <span>Read All FiestaFlix News</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topNews.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group card-surface p-3.5 rounded-2xl flex flex-col justify-between hover:border-primary/40 transition-all hover:scale-[1.01]"
          >
            <div>
              <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-zinc-900">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-black uppercase text-white">
                    {article.category}
                  </span>
                  {article.isBreaking && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-[9px] font-black uppercase text-white flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" /> Hot
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1.5">
                {article.title}
              </h3>

              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                {article.excerpt}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
              <span className="font-semibold text-zinc-400">{article.region}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTime}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
