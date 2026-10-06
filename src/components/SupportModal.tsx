'use client';

import { useState, useEffect } from 'react';
import { 
  Heart, 
  X, 
  Copy, 
  Check, 
  Phone, 
  Sparkles, 
  Coffee, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Flame, 
  Crown, 
  Award,
  ExternalLink,
  ChevronRight,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SupporterEntry {
  id: string;
  name: string;
  amount: number;
  currency: string;
  method: 'MTN MoMo' | 'Airtel Money' | 'Buy Me a Coffee' | 'Card / PayPal';
  message?: string;
  date: string;
  badge?: string;
}

const PRESET_AMOUNTS = [
  { amount: 500, label: '500 RWF', icon: Coffee, desc: 'A Cup of Coffee ☕', note: 'Covers 50 movie streams bandwidth' },
  { amount: 1000, label: '1,000 RWF', icon: Flame, desc: 'Popcorn & Soda 🍿', note: 'Powers daily CDN cloud cache' },
  { amount: 2000, label: '2,000 RWF', icon: Sparkles, desc: 'Server Booster ⚡', note: 'Keeps 4K streams super fast' },
  { amount: 5000, label: '5,000 RWF', icon: Award, desc: 'Cloud Patron 🚀', note: 'Sponsors 20 fresh movie uploads' },
  { amount: 10000, label: '10,000 RWF', icon: Crown, desc: 'Cinema Champion 👑', note: 'Agasobanuye preservation hero' },
];

export const MOMO_USSD = '*182*8*1*554210#';
export const MOMO_MERCHANT = '554210';
export const MOMO_PHONE = '0788 123 456';
export const AIRTEL_PHONE = '0733 987 654';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
}

export default function SupportModal({ isOpen, onClose, defaultAmount = 2000 }: SupportModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'momo' | 'airtel' | 'coffee' | 'card'>('momo');
  const [selectedAmount, setSelectedAmount] = useState<number>(defaultAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [supporterName, setSupporterName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [supporterMessage, setSupporterMessage] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Reset states when opening
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
    }
  }, [isOpen]);

  const effectiveAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;

  const handleCopy = (text: string, key: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleConfirmSupport = (e: React.FormEvent) => {
    e.preventDefault();

    const name = isAnonymous ? 'Generous Movie Fan' : (supporterName.trim() || 'Movie Lover');
    const methodLabel = 
      selectedMethod === 'momo' ? 'MTN MoMo' :
      selectedMethod === 'airtel' ? 'Airtel Money' :
      selectedMethod === 'coffee' ? 'Buy Me a Coffee' : 'Card / PayPal';

    const newSupporter: SupporterEntry = {
      id: `sup-${Date.now()}`,
      name,
      amount: effectiveAmount || 2000,
      currency: 'RWF',
      method: methodLabel,
      message: supporterMessage.trim() || 'Keep Agasobanuye movies 100% free! ❤️',
      date: 'Just now',
      badge: (effectiveAmount >= 10000 ? '👑 Champion' : effectiveAmount >= 5000 ? '🚀 Patron' : '❤️ Hero'),
    };

    try {
      const existing = localStorage.getItem('fiesta_supporters');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newSupporter);
      localStorage.setItem('fiesta_supporters', JSON.stringify(list.slice(0, 50)));
    } catch {
      // storage unavailable
    }

    setIsSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 sm:p-8 z-10 my-8 overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Cosmic ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-20"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSubmitted ? (
            <div className="overflow-y-auto pr-1 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Free Forever • Ku Buntu</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Support Fiesta<span className="text-primary">Flix</span> Optionally
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Watching and downloading is <strong>always 100% free</strong> for everyone. 
                  If you love what we do, you can optionally contribute to help pay for high-speed cloud bandwidth and Agasobanuye voice archiving!
                </p>
              </div>

              {/* Payment Method Selector Tabs */}
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Choose How to Support:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('momo')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'momo'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-500/30 font-bold'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-xs shadow-md">
                      MoMo
                    </div>
                    <span className="text-xs font-bold">MTN MoMo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('airtel')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'airtel'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 ring-2 ring-rose-500/30 font-bold'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-xs shadow-md">
                      Air
                    </div>
                    <span className="text-xs font-bold">Airtel Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('coffee')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'coffee'
                        ? 'bg-orange-500/20 border-orange-400 text-orange-300 ring-2 ring-orange-500/30 font-bold'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FFDD00] text-black font-black flex items-center justify-center text-xs shadow-md">
                      ☕
                    </div>
                    <span className="text-xs font-bold">Buy a Coffee</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'card'
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300 ring-2 ring-blue-500/30 font-bold'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-md">
                      💳
                    </div>
                    <span className="text-xs font-bold">Card / PayPal</span>
                  </button>
                </div>
              </div>

              {/* Method Details Box */}
              <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 space-y-4">
                {selectedMethod === 'momo' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          MTN Mobile Money (Rwanda)
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-medium">Merchant: FiestaFlix</span>
                    </div>

                    {/* Direct USSD Box */}
                    <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-zinc-400 uppercase font-semibold">Direct MoMo Pay Code</p>
                        <p className="text-lg font-black text-amber-400 font-mono tracking-wider">{MOMO_USSD}</p>
                        <p className="text-[10px] text-zinc-500">Merchant Code: <strong>{MOMO_MERCHANT}</strong></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${encodeURIComponent(MOMO_USSD)}`}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-amber-500/20"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Dial</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy(MOMO_USSD, 'ussd')}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1 border border-zinc-700"
                        >
                          {copiedKey === 'ussd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'ussd' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Or Phone Number */}
                    <div className="flex items-center justify-between text-xs text-zinc-300 pt-1">
                      <span>Direct Support Number: <strong className="text-white font-mono">{MOMO_PHONE}</strong></span>
                      <button
                        type="button"
                        onClick={() => handleCopy(MOMO_PHONE, 'momo-phone')}
                        className="text-amber-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'momo-phone' ? 'Copied!' : 'Copy Number'}
                      </button>
                    </div>
                  </div>
                )}

                {selectedMethod === 'airtel' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                          Airtel Money (Rwanda)
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-medium">Recipient: FiestaFlix Support</span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/60 border border-rose-500/30 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-zinc-400 uppercase font-semibold">Airtel Money Number</p>
                        <p className="text-lg font-black text-rose-400 font-mono tracking-wider">{AIRTEL_PHONE}</p>
                        <p className="text-[10px] text-zinc-500">Dial *182# and send to this number</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${encodeURIComponent(AIRTEL_PHONE)}`}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-rose-600/20"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy(AIRTEL_PHONE, 'airtel-phone')}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1 border border-zinc-700"
                        >
                          {copiedKey === 'airtel-phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'airtel-phone' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === 'coffee' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">☕</span>
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Buy Me a Coffee / Global
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-medium">International Friendly</span>
                    </div>

                    <p className="text-xs text-zinc-300">
                      Support us with coffee cups from anywhere in the world using Google Pay, Apple Pay, or credit card.
                    </p>

                    <a
                      href="https://buymeacoffee.com/fiestaflix"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-[#FFDD00] hover:bg-[#ffea40] text-black font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 hover:scale-[1.02]"
                    >
                      <Coffee className="w-4 h-4" />
                      <span>Open Buy Me a Coffee (fiestaflix)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {selectedMethod === 'card' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          Visa, Mastercard, & PayPal
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-medium">Secure Checkout</span>
                    </div>

                    <p className="text-xs text-zinc-300">
                      Card and PayPal support is processed securely with zero mandatory subscriptions. 
                      You can enter your voluntary support details below.
                    </p>
                  </div>
                )}
              </div>

              {/* Optional Amount Preset Buttons */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Select Optional Amount:
                  </p>
                  <span className="text-xs text-emerald-400 font-semibold">100% Voluntary</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((tier) => {
                    const Icon = tier.icon;
                    const isSelected = !customAmount && selectedAmount === tier.amount;

                    return (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(tier.amount);
                          setCustomAmount('');
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                          isSelected
                            ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/20 ring-1 ring-primary/40'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                          <span className="text-xs font-black text-white">{tier.label}</span>
                        </div>
                        <p className="text-[11px] font-bold text-zinc-200 mt-1">{tier.desc}</p>
                        <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{tier.note}</p>
                      </button>
                    );
                  })}

                  {/* Custom Amount Box */}
                  <div className="p-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-center">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Custom (RWF)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 3000"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Supporter Shoutout Form */}
              <form onSubmit={handleConfirmSupport} className="space-y-3 pt-1 border-t border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Your Name or Nickname
                    </label>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      placeholder="e.g. Eric from Kigali"
                      value={supporterName}
                      onChange={(e) => setSupporterName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary disabled:opacity-40"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="anonCheck"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="anonCheck" className="text-xs text-zinc-300 cursor-pointer">
                      Keep my support anonymous
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Optional Message / Shoutout
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Thank you for the Rocky Kimomo movies in 4K!"
                    value={supporterMessage}
                    onChange={(e) => setSupporterMessage(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Submit Confirmation CTA */}
                <button
                  type="submit"
                  className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/95 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-primary/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-current animate-pulse text-white" />
                  <span>I Sent {effectiveAmount ? `${effectiveAmount.toLocaleString()} RWF` : 'Optional Support'} — Record My Contribution</span>
                </button>
              </form>
            </div>
          ) : (
            /* Celebration Success Screen */
            <div className="py-8 text-center space-y-4 my-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30"
              >
                <Heart className="w-10 h-10 fill-current text-rose-500 animate-bounce" />
              </motion.div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Murakoze Cyane! Thank You!
                </span>
                <h4 className="text-2xl sm:text-3xl font-black text-white">
                  Your Support Keeps FiestaFlix Free!
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Every Rwandan Franc goes directly toward fast cloud servers, CDN bandwidth, and archiving authentic Agasobanuye cinema for thousands of fans worldwide.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 max-w-sm mx-auto text-left space-y-1.5 text-xs text-zinc-300">
                <p className="font-bold text-white flex items-center justify-between">
                  <span>Supporter Recognition:</span>
                  <span className="text-emerald-400 font-extrabold">{effectiveAmount.toLocaleString()} RWF</span>
                </p>
                <p className="text-zinc-400">
                  Name: <strong className="text-zinc-200">{isAnonymous ? 'Generous Movie Fan' : (supporterName || 'Movie Lover')}</strong>
                </p>
                {supporterMessage && (
                  <p className="text-zinc-400 italic">
                    &ldquo;{supporterMessage}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg shadow-primary/30 transition-all hover:scale-105"
                >
                  Back to Watching Movies
                </button>
                <a
                  href="/support"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-colors"
                >
                  View Supporters Wall
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
