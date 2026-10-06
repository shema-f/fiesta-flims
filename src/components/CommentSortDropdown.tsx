'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Clock, Calendar, Flame, Check, ArrowUpDown } from 'lucide-react';

export type CommentSortOption = 'Newest' | 'Oldest' | 'Most Liked';

interface CommentSortDropdownProps {
  value: CommentSortOption;
  onChange: (sort: CommentSortOption) => void;
  className?: string;
}

const SORT_OPTIONS: Array<{
  value: CommentSortOption;
  label: string;
  description: string;
  icon: typeof Clock;
}> = [
  {
    value: 'Newest',
    label: 'Newest',
    description: 'Most recent reactions first',
    icon: Clock,
  },
  {
    value: 'Oldest',
    label: 'Oldest',
    description: 'Earliest reactions first',
    icon: Calendar,
  },
  {
    value: 'Most Liked',
    label: 'Most Liked',
    description: 'Highest reader upvotes first',
    icon: Flame,
  },
];

export default function CommentSortDropdown({
  value,
  onChange,
  className = '',
}: CommentSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentOption = SORT_OPTIONS.find((opt) => opt.value === value) || SORT_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Sort comments: currently ${value}`}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-all text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
        <span className="text-zinc-400 font-normal">Sort:</span>
        <span className="text-white font-bold flex items-center gap-1.5">
          <CurrentIcon className="w-3 h-3 text-primary" />
          {currentOption.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute right-0 mt-2 w-56 sm:w-64 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right focus:outline-none"
        >
          <div className="px-3 py-1.5 border-b border-zinc-900 text-[10px] font-black uppercase tracking-wider text-zinc-500">
            Sort Reader Reactions
          </div>

          <div className="py-1 space-y-0.5">
            {SORT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-start gap-3 transition-colors ${
                    isSelected
                      ? 'bg-primary/10 text-white'
                      : 'hover:bg-zinc-900/80 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm shadow-primary/40'
                        : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-white'}`}>
                        {option.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 font-normal leading-tight mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
