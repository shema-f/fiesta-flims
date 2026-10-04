'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Trash2,
  Minimize2, 
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

const QUICK_PROMPTS = [
  '🔥 Trending movies today',
  '🎤 Rocky Kimomo action movies',
  '😂 Junior Giti comedy movies',
  '⚡ Download 4K via Telegram',
  '🇷🇼 Top Rwandan Cinema',
];

/**
 * Format markdown links [text](url) and **bold** text into interactive UI
 */
function renderFormattedMessage(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: any[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      const label = match[1];
      const url = match[2];
      const isInternal = url.startsWith('/');
      parts.push(
        isInternal ? (
          <Link
            key={`l-${lineIdx}-${match.index}`}
            href={url}
            className="text-primary hover:text-orange-400 font-extrabold underline inline-flex items-center gap-0.5 mx-0.5 break-words"
          >
            {label}
          </Link>
        ) : (
          <a
            key={`l-${lineIdx}-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 font-extrabold underline inline-flex items-center gap-0.5 mx-0.5 break-words"
          >
            {label}
          </a>
        )
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    const formattedParts = parts.map((part, pIdx) => {
      if (typeof part !== 'string') return part;
      const boldRegex = /\*\*([^*]+)\*\*/g;
      const bParts: any[] = [];
      let bLastIdx = 0;
      let bMatch;
      while ((bMatch = boldRegex.exec(part)) !== null) {
        if (bMatch.index > bLastIdx) {
          bParts.push(part.substring(bLastIdx, bMatch.index));
        }
        bParts.push(
          <strong key={`b-${pIdx}-${bMatch.index}`} className="font-bold text-white">
            {bMatch[1]}
          </strong>
        );
        bLastIdx = bMatch.index + bMatch[0].length;
      }
      if (bLastIdx < part.length) {
        bParts.push(part.substring(bLastIdx));
      }
      return bParts;
    });

    return (
      <div key={`line-${lineIdx}`} className={line.trim() === '' ? 'h-2' : 'leading-relaxed'}>
        {formattedParts}
      </div>
    );
  });
}

export default function FiestaBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        'Muraho! 👋 I am **Fiesta Bot**, your AI movie concierge for Agasobanuye cinema.\n\nAsk me for movie recommendations, films narrated by **Rocky Kimomo** or **Junior Giti**, or learn how to download 4K movies via [Telegram](https://t.me/fiestaflix_movies)!',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Lock background body scroll on mobile when chat sheet is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Keep scrolled to bottom and focus input
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages, scrollToBottom]);

  // Adjust for visual viewport resizing on mobile devices (keyboard open/close)
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !window.visualViewport) return;
    const handleViewportChange = () => {
      scrollToBottom();
    };
    const viewport = window.visualViewport;
    viewport.addEventListener('resize', handleViewportChange);
    return () => {
      viewport.removeEventListener('resize', handleViewportChange);
    };
  }, [isOpen, scrollToBottom]);

  // Listen for global open event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-fiesta-bot', handleOpen);
    return () => window.removeEventListener('open-fiesta-bot', handleOpen);
  }, []);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const botReply =
        data.reply ||
        "I'm having trouble reaching the database right now. Please explore our trending movies or join our [Telegram Channel](https://t.me/fiestaflix_movies)!";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: botReply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content:
            "Sorry, could not connect right now. You can continue streaming directly on Fiesta Flix or download via our [Telegram Channel](https://t.me/fiestaflix_movies)!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        content:
          'Chat cleared! Muraho 👋 How can I help you discover Rwandan Agasobanuye movies, interpreters, or Telegram downloads today?',
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button - positioned above mobile bottom nav */}
      {!isOpen && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6 right-3 sm:right-6 z-40">
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-2xl shadow-primary/40 border border-white/20 touch-manipulation backdrop-blur"
            aria-label="Open Fiesta Bot AI Chat"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-zinc-950 animate-pulse" />
            </div>
            <span className="font-black tracking-wide text-xs sm:text-sm">
              Fiesta Bot
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] uppercase font-bold">
              AI
            </span>
          </motion.button>
        </div>
      )}

      {/* Chat Window Modal - Fully responsive mobile bottom sheet & desktop window */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-end justify-center sm:justify-end sm:p-6 pointer-events-none">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm pointer-events-auto sm:bg-black/50"
            />

            {/* Main Chat Sheet / Window */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="pointer-events-auto relative w-full sm:w-[440px] h-[92dvh] sm:h-[600px] sm:max-h-[85vh] bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black flex flex-col overflow-hidden overscroll-contain"
            >
              {/* Mobile Drag Indicator Bar */}
              <div 
                onClick={() => setIsOpen(false)}
                className="w-full pt-2 pb-1 flex justify-center cursor-pointer sm:hidden"
              >
                <div className="w-12 h-1.5 rounded-full bg-zinc-700/80 active:bg-primary transition-colors" />
              </div>

              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white shadow-md shadow-primary/30">
                    <Bot className="w-5 h-5" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-zinc-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      Fiesta Bot
                      <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary text-[9px] font-black uppercase">
                        AI Concierge
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online • Instant Agasobanuye Guide
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleClearChat}
                    title="Clear chat history"
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors touch-manipulation"
                    aria-label="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors touch-manipulation"
                    aria-label="Close chat"
                  >
                    <ChevronDown className="w-5 h-5 sm:hidden" />
                    <X className="w-5 h-5 hidden sm:inline" />
                  </button>
                </div>
              </div>

              {/* Messages Body with smooth mobile touch scrolling */}
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 text-xs sm:text-sm overscroll-contain">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[85%] rounded-2xl p-3 sm:p-3.5 leading-relaxed break-words ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-orange-500 text-white rounded-tr-none shadow-md shadow-primary/20 font-medium'
                          : 'bg-zinc-900/95 text-zinc-200 border border-zinc-800 rounded-tl-none space-y-1'
                      }`}
                    >
                      {renderFormattedMessage(msg.content)}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-[11px] text-zinc-400 font-medium">Fiesta Bot is thinking...</span>
                      <div className="flex gap-1 ml-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Touch-Friendly Horizontal Quick Action Chips */}
              <div className="px-3 py-2 border-t border-zinc-800/80 bg-zinc-950/70 overflow-x-auto touch-pan-x flex items-center gap-1.5 scrollbar-none shrink-0">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 pl-1">
                  Suggestions:
                </span>
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-zinc-900/90 active:bg-primary/20 hover:bg-zinc-800 text-[11px] font-semibold text-zinc-300 hover:text-white border border-zinc-800 transition-colors shrink-0 touch-manipulation"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar - With 16px font-size to prevent iOS Safari auto-zoom */}
              <div className="p-2.5 sm:p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-zinc-800 bg-zinc-950 flex items-center gap-2 shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about movies, narrators, 4K..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  // text-base on mobile prevents iOS Safari from automatically zooming into the field
                  className="flex-1 bg-zinc-900/95 border border-zinc-700/80 rounded-2xl px-4 py-2.5 text-base sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-md shadow-primary/30 shrink-0 touch-manipulation"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 -rotate-12 translate-x-px" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
