'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';
import AppLogo from '@/components/AppLogo';

export default function Footer() {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const socialLinks = [
    {
      name: 'WhatsApp',
      url: 'https://wa.me/250780000000',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.494-.67-.503-.172-.009-.371-.009-.57-.009-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      color: '#25D366',
      animated: true,
    },
    {
      name: 'Telegram',
      url: 'https://t.me/fiestaflix_movies',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      color: '#0088cc',
      animated: false,
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@fiestaflix',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
      ),
      color: '#ffffff',
      animated: false,
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/fiestaflix',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: '#E4405F',
      animated: false,
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@fiestaflix',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      color: '#FF0000',
      animated: false,
    },
  ];

  return (
    <footer className="bg-[#050505] pt-20 pb-8 border-t border-white/10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Talk to Us Showcase */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <AppLogo size={32} glow />
                <h3 className="text-2xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                  Fiesta<span className="text-white">Flix</span>
                </h3>
              </div>
              <p className="text-zinc-400 text-sm max-w-sm">
                Your premier destination for streaming and downloading movies with authentic Kinyarwanda narration (*Agasobanuye*).
              </p>
            </div>
            
            {/* Social Icons with Glowing "Talk to us!" Indicator */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                    social.animated 
                      ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 scale-105 shadow-lg shadow-emerald-500/10' 
                      : 'bg-white/5 hover:bg-white/15 hover:-translate-y-1 border border-white/10'
                  }`}
                  style={{ color: social.color }}
                  aria-label={social.name}
                >
                  {social.icon}

                  {/* Modern Elevated "Talk to us!" Pill Badge */}
                  {social.animated && (
                    <span className="absolute -top-3.5 -right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[11px] font-black whitespace-nowrap shadow-lg shadow-emerald-500/40 border border-emerald-300/40 transform hover:scale-105 transition-transform">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>Talk to us!</span>
                    </span>
                  )}
                </a>
              ))}
            </div>

            {/* Dedicated "Talk to Us" Live Support Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-md space-y-3 max-w-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Talk to Us Directly
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Online 24/7
                </span>
              </div>
              
              <p className="text-xs text-zinc-300">
                Have a movie request, interpreter inquiry, or technical issue? Our Rwandan support team is always ready to chat.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href="https://wa.me/250780000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.02]"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </a>
                <a
                  href="https://t.me/FiestaFlixBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold border border-zinc-700 transition-all hover:scale-[1.02]"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>Telegram Bot</span>
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><Link href="/news" className="text-zinc-400 text-sm hover:text-primary transition-colors flex items-center gap-1.5 font-bold text-primary">📰 Cinema News & Blogs</Link></li>
              <li><Link href="/" className="text-zinc-400 text-sm hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/movies" className="text-zinc-400 text-sm hover:text-primary transition-colors">Movies Catalog</Link></li>
              <li><Link href="/favorites" className="text-zinc-400 text-sm hover:text-primary transition-colors">❤️ My Favorites</Link></li>
              <li><Link href="/rwandan-movies" className="text-zinc-400 text-sm hover:text-primary transition-colors">🇷🇼 Rwandan Movies</Link></li>
              <li><Link href="/#series" className="text-zinc-400 text-sm hover:text-primary transition-colors">TV Shows & Series</Link></li>
              <li><Link href="/interpreters" className="text-zinc-400 text-sm hover:text-primary transition-colors">Interpreters</Link></li>
              <li><Link href="/community" className="text-zinc-400 text-sm hover:text-primary transition-colors">Community Forum</Link></li>
              <li><Link href="/request-movie" className="text-zinc-400 text-sm hover:text-primary transition-colors">📋 Request Movie</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-bold text-white mb-4">Talk to Us & Support</h4>
            <ul className="space-y-2.5">
              <li>
                <a 
                  href="https://wa.me/250780000000" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-400 text-sm font-semibold hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Talk to Us on WhatsApp</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://t.me/fiestaflix_movies" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-400 text-sm hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>Telegram Movie Cloud</span>
                </a>
              </li>
              <li><Link href="/help#faq" className="text-zinc-400 text-sm hover:text-primary transition-colors">FAQ & Download Help</Link></li>
              <li><Link href="/help#4k" className="text-zinc-400 text-sm hover:text-primary transition-colors">How to Stream in 4K</Link></li>
              <li><Link href="/help#pwa" className="text-zinc-400 text-sm hover:text-primary transition-colors">Mobile App PWA</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-bold text-white mb-4">Legal & Privacy</h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-zinc-400 text-sm hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-zinc-400 text-sm hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/dmca" className="text-zinc-400 text-sm hover:text-primary transition-colors">DMCA Notice</Link></li>
              <li><Link href="/content-guidelines" className="text-zinc-400 text-sm hover:text-primary transition-colors">Content Guidelines</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            &copy; 2026 Fiesta Flix. All rights reserved. Made for Rwandan movie lovers worldwide.
          </p>
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Fast CDN Streaming • 100% Ad-Free Telegram Downloads</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
