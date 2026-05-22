'use client';

import Image from 'next/image';
import { Narrator } from '@/lib/narratorData';

interface NarratorCardProps {
  narrator: Narrator;
  onSelect?: (narrator: Narrator) => void;
}

export default function NarratorCard({ narrator, onSelect }: NarratorCardProps) {
  return (
    <div 
      className="bg-card rounded-2xl overflow-hidden transition-all duration-400 cursor-pointer hover:-translate-y-2 hover:shadow-2xl group"
      onClick={() => onSelect && onSelect(narrator)}
    >
      <div className="relative">
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={narrator.image}
            alt={narrator.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
            <button className="w-full py-3 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-semibold hover:scale-105 transition-transform">
              View Profile
            </button>
          </div>
        </div>
        {narrator.featured && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-orange-400 px-3 py-1.5 rounded-full text-xs font-semibold">
            ⭐ Featured
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2">{narrator.name}</h3>
        <p className="text-muted text-sm mb-4 line-clamp-2">{narrator.bio}</p>
        
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffe66d">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="font-semibold">{narrator.rating}</span>
          </div>
          <div className="text-muted">
            <span className="font-semibold text-white">{narrator.moviesCount}</span> movies
          </div>
          <div className="text-muted">
            <span className="font-semibold text-white">{narrator.followers}</span> followers
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {narrator.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-white/10 rounded-full text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
