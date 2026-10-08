'use client';

import { useState } from 'react';
import { Users, Sparkles, Award } from 'lucide-react';
import type { CastMember } from '@/lib/movieCastData';

interface CastSectionProps {
  cast: CastMember[];
  title: string;
}

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop';

function CastCard({ member }: { member: CastMember }) {
  const [imgSrc, setImgSrc] = useState(member.profileUrl);

  return (
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left group shrink-0 w-28 sm:w-36">
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-primary/50 transition-all duration-300 shadow-lg group-hover:shadow-primary/20 group-hover:scale-105 mb-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={member.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgSrc(FALLBACK_AVATAR)}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <p className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors">
        {member.name}
      </p>
      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
        {member.character}
      </p>
    </div>
  );
}

export default function CastSection({ cast, title }: CastSectionProps) {
  if (!cast || cast.length === 0) return null;

  return (
    <section className="container mx-auto px-4 sm:px-6 my-10">
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Official TMDB Cast
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Starring in &ldquo;{title}&rdquo;
              </h3>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            Verified Credits
          </div>
        </div>

        {/* Scrollable Cast Horizontal Strip */}
        <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
          {cast.map((member) => (
            <CastCard key={`${member.id}-${member.order}`} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
