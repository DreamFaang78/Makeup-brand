'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Luxury Cookie & Privacy Preferences System
// Obsidian & Champagne Gold Design System, Compliant with Indian DPDP & IT Rules
// Synchronized with Meta Ads Pixel and Headless Shopify Architecture
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  X,
  Sliders,
  Lock,
  BarChart3,
  Sparkles,
  Check,
  ArrowRight,
} from 'lucide-react';
import {
  getMarketingConsent,
  getCookiePreferences,
  saveCookiePreferences,
} from '@/lib/metaPixel';
import { toast } from 'sonner';

export default function CookieConsent() {
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Load stored preferences on mount
  useEffect(() => {
    const prefs = getCookiePreferences();
    setAnalyticsConsent(prefs.analytics);
    setMarketingConsent(prefs.marketing);

    const status = getMarketingConsent();
    if (status === 'undecided') {
      const timer = setTimeout(() => setIsBannerVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Open modal anytime via window event (e.g. from footer link or privacy policy)
  useEffect(() => {
    const handleOpen = () => {
      const prefs = getCookiePreferences();
      setAnalyticsConsent(prefs.analytics);
      setMarketingConsent(prefs.marketing);
      setIsBannerVisible(false);
      setIsModalVisible(true);
    };

    window.addEventListener('lanan_open_cookie_banner', handleOpen);
    return () => window.removeEventListener('lanan_open_cookie_banner', handleOpen);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalVisible) {
        setIsModalVisible(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalVisible]);

  const handleAcceptAll = useCallback(() => {
    setAnalyticsConsent(true);
    setMarketingConsent(true);
    saveCookiePreferences({ analytics: true, marketing: true });
    setIsBannerVisible(false);
    setIsModalVisible(false);
    toast.success('All preferences saved. Thank you for customizing your ritual.');
  }, []);

  const handleRejectOptional = useCallback(() => {
    setAnalyticsConsent(false);
    setMarketingConsent(false);
    saveCookiePreferences({ analytics: false, marketing: false });
    setIsBannerVisible(false);
    setIsModalVisible(false);
    toast.info('Optional tracking disabled. Essential shopping features remain active.');
  }, []);

  const handleSavePreferences = useCallback(() => {
    saveCookiePreferences({
      analytics: analyticsConsent,
      marketing: marketingConsent,
    });
    setIsBannerVisible(false);
    setIsModalVisible(false);
    toast.success('Your cookie preferences have been successfully updated.');
  }, [analyticsConsent, marketingConsent]);

  const openCustomizeModal = useCallback(() => {
    const prefs = getCookiePreferences();
    setAnalyticsConsent(prefs.analytics);
    setMarketingConsent(prefs.marketing);
    setIsBannerVisible(false);
    setIsModalVisible(true);
  }, []);

  return (
    <>
      {/* ── 1. Floating First-Visit Consent Banner ── */}
      <AnimatePresence>
        {isBannerVisible && !isModalVisible && (
          <motion.aside
            role="region"
            aria-label="Cookie consent banner"
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 bg-[#090807]/95 text-[#F7F0E7] backdrop-blur-xl border border-[#C9A45D]/35 rounded-2xl shadow-2xl p-5 sm:p-6"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#C9A45D]/15 border border-[#C9A45D]/30 flex items-center justify-center flex-shrink-0 text-[#C9A45D] mt-0.5">
                <ShieldCheck size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-heading text-base font-medium tracking-wide text-[#F7F0E7]">
                    Privacy & Skincare Discovery
                  </h3>
                  <button
                    onClick={handleRejectOptional}
                    className="text-[#F7F0E7]/40 hover:text-[#F7F0E7] transition-colors p-1"
                    aria-label="Dismiss and use essential cookies only"
                  >
                    <X size={15} />
                  </button>
                </div>

                <p className="font-body text-xs text-[#F7F0E7]/70 leading-relaxed mb-4">
                  LANAN uses essential cookies to ensure safe checkout, bag persistence, and store
                  security. With your permission, we also use analytics and Meta Pixel for
                  personalized skincare rituals. Read our{' '}
                  <Link
                    href="/legal/privacy-policy"
                    className="text-[#C9A45D] underline hover:text-[#DFBF7E] underline-offset-2 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="px-4 py-2 rounded-full bg-[#C9A45D] text-[#090807] text-xs font-body font-semibold hover:bg-[#DFBF7E] transition-all shadow-md active:scale-95"
                  >
                    Accept All
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectOptional}
                    className="px-3.5 py-2 rounded-full border border-[#F7F0E7]/25 text-[#F7F0E7]/80 text-xs font-body font-medium hover:border-[#C9A45D]/60 hover:text-[#F7F0E7] transition-all active:scale-95"
                  >
                    Reject Optional
                  </button>
                  <button
                    type="button"
                    onClick={openCustomizeModal}
                    className="px-3 py-2 text-xs font-body text-[#C9A45D] hover:text-[#DFBF7E] inline-flex items-center gap-1.5 transition-colors ml-auto sm:ml-0"
                  >
                    <Sliders size={13} />
                    Customize
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── 2. Full Granular Cookie Preferences Modal ── */}
      <AnimatePresence>
        {isModalVisible && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsModalVisible(false)}
              className="fixed inset-0 bg-[#090807]/80 backdrop-blur-md"
            />

            {/* Modal Dialog Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-[#090807] text-[#F7F0E7] border border-[#C9A45D]/30 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#C9A45D]/15 bg-[#090807]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#C9A45D]/15 border border-[#C9A45D]/30 flex items-center justify-center text-[#C9A45D]">
                    <Sliders size={17} />
                  </div>
                  <div>
                    <h2
                      id="cookie-preferences-title"
                      className="font-heading text-xl font-light text-[#F7F0E7] tracking-wide"
                    >
                      Cookie & Consent Preferences
                    </h2>
                    <p className="font-body text-[11px] text-[#F7F0E7]/60">
                      Configure how LANAN uses data to tailor your experience.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalVisible(false)}
                  className="w-8 h-8 rounded-full border border-[#F7F0E7]/15 flex items-center justify-center text-[#F7F0E7]/50 hover:text-[#F7F0E7] hover:border-[#C9A45D]/50 transition-colors"
                  aria-label="Close preferences modal"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Scrollable Preference Categories */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <p className="font-body text-xs text-[#F7F0E7]/70 leading-relaxed mb-4">
                  We respect your right to privacy under Indian e-commerce and data protection
                  principles. You can choose which cookies you permit below. Strictly essential cookies
                  are necessary for website operations and cannot be disabled.
                </p>

                {/* Category 1: Strictly Essential */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-[#F7F0E7]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock size={14} className="text-[#C9A45D]" />
                      <h4 className="font-body text-sm font-semibold text-[#F7F0E7]">
                        Strictly Essential Cookies
                      </h4>
                    </div>
                    <p className="font-body text-xs text-[#F7F0E7]/60 leading-relaxed">
                      Required for secure navigation, shopping bag persistence, security tokens, and
                      order checkout handoff to Shopify. Always active to ensure core functionality.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-[#C9A45D]/15 border border-[#C9A45D]/30 text-[10px] font-body font-semibold text-[#C9A45D] flex items-center gap-1">
                      <Check size={11} className="stroke-[3]" /> Always Active
                    </span>
                  </div>
                </div>

                {/* Category 2: Performance & Analytics */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-[#F7F0E7]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 size={14} className="text-[#C9A45D]" />
                      <h4 className="font-body text-sm font-semibold text-[#F7F0E7]">
                        Analytics & Performance
                      </h4>
                    </div>
                    <p className="font-body text-xs text-[#F7F0E7]/60 leading-relaxed">
                      Collects anonymous telemetry regarding page load times, device compatibility, and
                      browsing patterns so we can continuously elevate store speed and user experience.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={analyticsConsent}
                      onClick={() => setAnalyticsConsent((prev) => !prev)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        analyticsConsent ? 'bg-[#C9A45D]' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          analyticsConsent ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Category 3: Marketing & Meta Pixel */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-[#F7F0E7]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={14} className="text-[#C9A45D]" />
                      <h4 className="font-body text-sm font-semibold text-[#F7F0E7]">
                        Personalization & Meta Ads Pixel
                      </h4>
                    </div>
                    <p className="font-body text-xs text-[#F7F0E7]/60 leading-relaxed">
                      Synchronizes with our Meta Ads Pixel to recommend tailored skincare rituals and
                      measure ad campaign reach. If revoked, marketing tracking is immediately paused.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={marketingConsent}
                      onClick={() => setMarketingConsent((prev) => !prev)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        marketingConsent ? 'bg-[#C9A45D]' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          marketingConsent ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Policy reference */}
                <div className="pt-2 text-center">
                  <Link
                    href="/legal/privacy-policy"
                    className="text-[11px] font-body text-[#C9A45D]/80 hover:text-[#DFBF7E] underline underline-offset-4 inline-flex items-center gap-1"
                  >
                    Review LANAN Full Privacy Policy <ArrowRight size={11} />
                  </Link>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-[#C9A45D]/15 bg-[#090807]/90 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="px-4 py-2.5 rounded-full border border-[#F7F0E7]/20 text-[#F7F0E7]/70 text-xs font-body font-medium hover:text-[#F7F0E7] hover:border-[#F7F0E7]/40 transition-all text-center"
                >
                  Reject Optional
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full border border-[#C9A45D]/40 text-[#C9A45D] text-xs font-body font-semibold hover:bg-[#C9A45D]/10 transition-all text-center"
                  >
                    Accept All
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-[#C9A45D] text-[#090807] text-xs font-body font-semibold hover:bg-[#DFBF7E] transition-all shadow-md text-center"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
