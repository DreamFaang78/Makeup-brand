'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Luxury Cookie & Marketing Consent Banner
// Respects customer privacy preferences and synchronizes with Meta Ads Pixel
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { getMarketingConsent, setMarketingConsent } from '@/lib/metaPixel';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already chosen their preference
    const status = getMarketingConsent();
    if (status === 'undecided') {
      // Small delay for smooth entry after hydration
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Allow opening banner anytime (e.g. from footer link)
    const handleOpen = () => setIsVisible(true);
    window.addEventListener('lanan_open_cookie_banner', handleOpen);
    return () => window.removeEventListener('lanan_open_cookie_banner', handleOpen);
  }, []);

  const handleAccept = () => {
    setMarketingConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    setMarketingConsent(false);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          role="region"
          aria-label="Cookie consent banner"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 bg-obsidian/95 text-ivory backdrop-blur-md border border-gold/30 rounded-2xl shadow-luxury-lg p-5 sm:p-6"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 text-gold mt-0.5">
              <ShieldCheck size={18} />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="font-heading text-base font-medium tracking-wide text-ivory">
                  Privacy & Personalization
                </h3>
                <button
                  onClick={handleDecline}
                  className="text-ivory/50 hover:text-ivory transition-colors p-1"
                  aria-label="Dismiss cookie preferences"
                >
                  <X size={15} />
                </button>
              </div>

              <p className="font-body text-xs text-ivory/70 leading-relaxed mb-4">
                We use cookies and privacy-conscious analytics (Meta Ads Pixel) to optimize your
                skincare discovery ritual and enhance store security. We honor your choices under our{' '}
                <Link
                  href="/legal/privacy-policy"
                  className="text-gold underline hover:text-gold-light underline-offset-2 transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAccept}
                  className="px-4 py-2 rounded-pill bg-gold text-obsidian text-xs font-body font-semibold hover:bg-gold-light transition-all shadow-gold active:scale-95"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  className="px-4 py-2 rounded-pill border border-ivory/20 text-ivory/80 text-xs font-body font-medium hover:border-gold/50 hover:text-ivory transition-all active:scale-95"
                >
                  Essential Only
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
