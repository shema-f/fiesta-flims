'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Popcorn, Clapperboard, Heart, Send, Rocket } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { motion } from 'motion/react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { favorites } = useFavorites();
  const favCount = favorites.length;

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Popcorn,
      iconBg: 'bg-amber-500/20 text-amber-400 border-amber-400/30',
    },
    {
      href: '/movies',
      label: 'Movies',
      icon: Clapperboard,
      iconBg: 'bg-violet-500/20 text-violet-400 border-violet-400/30',
    },
    {
      href: '/favorites',
      label: 'My List',
      icon: Heart,
      iconBg: 'bg-rose-500/20 text-rose-400 border-rose-400/30',
      badge: favCount,
    },
    {
      href: 'https://t.me/fiestaflix_movies',
      label: 'Telegram',
      icon: Send,
      iconBg: 'bg-[#229ED9]/20 text-[#229ED9] border-[#229ED9]/30',
      external: true,
      color: 'text-[#229ED9]',
    },
    {
      href: '/request-movie',
      label: 'Request',
      icon: Rocket,
      iconBg: 'bg-orange-500/20 text-orange-400 border-orange-400/30',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-1.5 safe-area-pb shadow-2xl">
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
                className="flex flex-col items-center justify-center py-1 px-2.5 text-zinc-400 hover:text-[#229ED9] transition-colors relative group"
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-115 ${item.iconBg}`}
                >
                  <Icon className="w-4 h-4 -rotate-12" />
                </div>
                <span className="text-[10px] font-bold text-[#229ED9] mt-0.5">{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 relative transition-all group ${
                isActive ? 'text-primary' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center border shadow-xs transition-transform duration-300 group-hover:scale-115 ${
                    item.iconBg
                  } ${isActive ? 'scale-110 shadow-[0_0_10px_rgba(249,115,22,0.4)]' : ''}`}
                >
                  <Icon className={`w-3.5 h-3.5 stroke-[2.3]`} />
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-rose-500/50"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </motion.span>
                )}
              </div>

              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold text-white' : 'font-medium'}`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5"
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
