'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Film, 
  Volume2, 
  Minimize2, 
  MessageSquare,
  Flame,
  CornerDownLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

const QUICK_PROMPTS = [
  '🔥 Top trending movies today',
  '🎤 Best Rocky Kimomo action movies',
  '😂 Funniest Junior Giti comedy',
  '⚡ How to download via Telegram',
];

export default function FiestaBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        'Muraho! 👋 I am **Fiesta Bot**, your AI movie assistant. Ask me for recommendations, find films narrated by **Rocky Kimomo** or **Junior Giti**, or learn how to download 4K movies via Telegram!',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

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
      const botReply = data.reply || "I'm having trouble connecting right now. Please check out our trending movies or Telegram channel!";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: botReply,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: "Sorry, I couldn't reach the server. You can still browse all movies on the main page!",
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

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white font-bold text-sm shadow-2xl shadow-primary/40 border border-white/20 touch-manipulation backdrop-blur"
          aria-label="Open Fiesta Bot Chat"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-zinc-950 animate-pulse" />
          </div>
          <span className="hidden sm:inline-block font-extrabold tracking-wide">
            Fiesta Bot
          </span>
          <span className="sm:hidden font-bold text-xs">AI Chat</span>
        </motion.button>
      </div>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 flex items-end sm:items-auto justify-center sm:justify-end p-0 sm:p-0">
            {/* Mobile dark backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm sm:hidden -z-10"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full sm:w-[420px] h-[85vh] sm:h-[580px] bg-zinc-950/95 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden backdrop-blur-xl"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white shadow-md shadow-primary/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      Fiesta Bot
                      <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-extrabold uppercase">
                        AI
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Agasobanuye & Telegram Concierge
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Close chat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs sm:text-sm">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 sm:p-3.5 leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-orange-500 text-white rounded-tr-none shadow-md shadow-primary/20 font-medium'
                          : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-tl-none space-y-1.5'
                      }`}
                    >
                      {/* Simple formatted text */}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 border-t border-zinc-850/80 bg-zinc-950/40 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-[11px] text-zinc-300 hover:text-white border border-zinc-800 transition-colors shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask Fiesta Bot about movies, narrators..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/30"
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
