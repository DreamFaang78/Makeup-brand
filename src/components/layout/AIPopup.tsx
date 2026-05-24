'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Sparkles, AlertCircle, Check } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function AIPopup() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'results'>('idle');
  const [skinConcern, setSkinConcern] = useState('pigmentation');
  const { popupVisible, showPopup, hidePopup } = useUIStore();

  useEffect(() => {
    // Show popup after 4 seconds delay
    const showTimer = setTimeout(() => {
      setVisible(true);
      showPopup('ai-skin-scanner');
      
      // Auto-hide popup after another 8 seconds (to avoid blocking mobile animations permanently)
      const hideTimer = setTimeout(() => {
        setVisible(false);
        hidePopup();
      }, 8000);
      
      return () => clearTimeout(hideTimer);
    }, 4000);

    return () => clearTimeout(showTimer);
  }, [showPopup, hidePopup]);

  const handleClosePopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    hidePopup();
  };

  const startScan = () => {
    setModalOpen(true);
    setScanStep('scanning');
    setVisible(false);
    hidePopup();
    
    // Simulate scan loading steps
    setTimeout(() => {
      setScanStep('results');
    }, 3500);
  };

  return (
    <>
      {/* ── Sticky Floating Popup Banner ── */}
      <AnimatePresence>
        {visible && popupVisible && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto mx-auto sm:mx-0 z-40 w-[calc(100%-2rem)] sm:w-[380px] max-w-sm sm:max-w-none bg-white border border-beige/60 shadow-luxury rounded-card overflow-hidden flex group cursor-pointer"
            onClick={startScan}
          >
            {/* Left side: Model photo with scanning SVG overlay */}
            <div className="w-28 sm:w-32 relative bg-beige/30 flex-shrink-0 overflow-hidden">
              <Image
                src="/Hero Banner Model.jpeg"
                alt="AI Skin Scanner Model"
                fill
                sizes="128px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-obsidian/20 group-hover:bg-obsidian/10 transition-colors" />
              
              {/* Scan SVG Element overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-16 h-16 text-gold/80" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 30 C20 30, 25 15, 50 15 C75 15, 80 30, 80 30 C80 30, 85 45, 80 65 C75 85, 50 90, 50 90 C50 90, 25 85, 20 65 C15 45, 20 30, 20 30 Z" className="stroke-gold animate-pulse" />
                  <path d="M35 45 Q50 35 65 45" className="stroke-gold/70" />
                  <path d="M40 65 Q50 72 60 65" className="stroke-gold/70" />
                  <line x1="15" y1="50" x2="85" y2="50" stroke="#C9A96E" strokeWidth="1.5" className="animate-[bounce_3s_infinite_ease-in-out]" />
                </svg>
              </div>
            </div>

            {/* Right side: Text details */}
            <div className="flex-1 p-4 pr-7 flex flex-col justify-center">
              {/* Close Button */}
              <button
                onClick={handleClosePopup}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-beige/40 text-taupe hover:text-obsidian transition-all"
                aria-label="Close banner"
              >
                <X size={14} />
              </button>

              <div className="inline-flex items-center gap-1 bg-gold/10 border border-gold/20 rounded-pill px-2.5 py-0.5 w-fit mb-2">
                <Sparkles size={9} className="text-gold" />
                <span className="text-gold text-[8px] font-body font-semibold tracking-wider uppercase">Free AI Analysis</span>
              </div>
              <h3 className="font-heading text-base text-obsidian leading-tight mb-1.5 font-medium">
                Know your skin Type free with AI
              </h3>
              <p className="text-[10px] font-body text-taupe leading-relaxed mb-3">
                Scan your profile to discover custom skincare rituals instantly.
              </p>
              <button className="btn-gold text-[10px] py-1.5 px-4 w-fit shadow-sm font-medium">
                Analyze Skin Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Interactive AI Scanner Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-card overflow-hidden shadow-luxury border border-beige/60 z-10"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-beige/40 hover:bg-beige/80 text-charcoal hover:text-obsidian transition-colors z-20"
              >
                <X size={15} />
              </button>

              {scanStep === 'scanning' && (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-4 border-gold/10 relative flex items-center justify-center mb-6 overflow-hidden bg-beige/10">
                    <Image
                      src="/Hero Banner Model.jpeg"
                      alt="AI Face Scan"
                      fill
                      className="object-cover opacity-60"
                    />
                    {/* Glowing Green Scanning Bar */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-gold shadow-glow-gold top-0 animate-[scan_2.5s_infinite_linear]" />
                    <div className="absolute inset-0 border-2 border-gold/40 rounded-full animate-ping opacity-25" />
                  </div>
                  <h3 className="font-heading text-xl text-obsidian mb-2">Analyzing Skin Profile</h3>
                  <p className="text-xs font-body text-taupe mb-4">Our AI is scanning pigment density, pores, and sebum levels...</p>
                  
                  {/* Status checklist */}
                  <div className="w-full max-w-xs space-y-2 mt-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-body text-charcoal">
                      <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                      <span>Calibrating facial vectors...</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-body text-charcoal">
                      <div className="w-2 h-2 rounded-full bg-beige" />
                      <span>Checking pigmentation score...</span>
                    </div>
                  </div>
                </div>
              )}

              {scanStep === 'results' && (
                <div>
                  {/* Header result */}
                  <div className="bg-gradient-hero p-6 border-b border-beige text-center">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold mx-auto mb-3">
                      <Check size={20} />
                    </div>
                    <h3 className="font-heading text-2xl text-obsidian font-light">Analysis Complete!</h3>
                    <p className="text-xs font-body text-taupe mt-1">Here is your customized Indian skin profile</p>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-ivory p-3.5 rounded-xl border border-beige/40">
                        <span className="text-[10px] font-body text-taupe uppercase tracking-wider block">Skin Type</span>
                        <span className="font-heading text-lg text-obsidian font-medium mt-1 block">Combination</span>
                        <span className="text-[9px] font-body text-taupe mt-0.5 block">Slightly oily T-zone</span>
                      </div>
                      <div className="bg-ivory p-3.5 rounded-xl border border-beige/40">
                        <span className="text-[10px] font-body text-taupe uppercase tracking-wider block">Primary Concern</span>
                        <span className="font-heading text-lg text-gold font-medium mt-1 block">Pigmentation</span>
                        <span className="text-[9px] font-body text-taupe mt-0.5 block">Uneven tone & sunspots</span>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="border border-gold/20 rounded-xl p-4 bg-gold/5 flex gap-3">
                      <AlertCircle size={18} className="text-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-body font-semibold text-obsidian">AI Recommended Routine</h4>
                        <p className="text-[11px] font-body text-taupe leading-relaxed mt-1">
                          Based on your concern score, we recommend the **Radiance Revival Serum** (with Saffron & Niacinamide) paired with the **Rose Dew SPF 40 Sunscreen**.
                        </p>
                      </div>
                    </div>

                    {/* Special Promo */}
                    <div className="bg-obsidian rounded-xl p-4 text-center text-ivory">
                      <p className="text-[10px] font-body text-gold uppercase tracking-widest font-semibold">Special AI Reward</p>
                      <h4 className="font-heading text-lg text-ivory font-light mt-1.5">Get 15% Off Your Routine</h4>
                      
                      {/* Coupon Box */}
                      <div className="my-3 py-2 px-4 rounded-lg bg-white/10 border border-white/15 border-dashed flex items-center justify-between">
                        <span className="font-mono text-sm tracking-wider font-semibold text-gold">LANANAI</span>
                        <span className="text-[9px] font-body text-ivory/60 uppercase">Code Copied</span>
                      </div>
                      
                      <Link
                        href="/shop"
                        onClick={() => setModalOpen(false)}
                        className="btn-gold w-full text-xs py-2.5 justify-center mt-1"
                      >
                        Shop Recommended Products
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
        }
      `}</style>
    </>
  );
}
