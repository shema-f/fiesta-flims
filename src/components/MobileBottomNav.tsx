'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Heart, Send, Sparkles } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { motion } from 'motion/react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { favorites } = useFavorites();
  const favCount = favorites.length;

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/movies', label: 'Movies', icon: Film },
    { href: '/favorites', label: 'My List', icon: Heart, badge: favCount },
    {
      href: 'https://t.me/fiestaflix_movies',
      label: 'Telegram',
      icon: Send,
      external: true,
      color: 'text-[#229ED9]',
    },
    { href: '/request-movie', label: 'Request', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-2 safe-area-pb shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-1 px-3 text-zinc-400 hover:text-[#229ED9] transition-colors relative group"
              >
                <div className="relative">
                  <Icon className="w-5 h-5 -rotate-12 text-[#229ED9]" />
                </div>
                <span className="text-[10px] font-bold text-[#229ED9] mt-1">{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 relative transition-all ${
                isActive ? 'text-primary' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-rose-500/50"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </motion.span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="w-1 h-1 rounded-full bg-primary mt-0.5"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
