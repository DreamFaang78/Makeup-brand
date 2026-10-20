'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Floating WhatsApp Concierge Support Button
// Accessible, responsive floating button that connects directly to LANAN WhatsApp
// ─────────────────────────────────────────────────────────────────────────────

import { BRAND } from '@/lib/utils';
import { motion } from 'framer-motion';

function SvgWhatsApp({ className = '' }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.56 20.15 9.11 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.6L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.05 20.15ZM16.57 14.36C16.32 14.24 15.1 13.64 14.87 13.56C14.64 13.48 14.48 13.44 14.31 13.69C14.15 13.93 13.68 14.49 13.53 14.65C13.39 14.81 13.25 14.83 13 14.71C12.75 14.59 11.95 14.32 11 13.48C10.26 12.82 9.76 12.01 9.62 11.76C9.48 11.52 9.6 11.39 9.73 11.26C9.84 11.15 9.98 10.97 10.1 10.83C10.22 10.69 10.26 10.59 10.34 10.43C10.42 10.26 10.38 10.12 10.32 10C10.26 9.88 9.77 8.68 9.57 8.18C9.37 7.7 9.17 7.76 9.02 7.76C8.88 7.75 8.72 7.75 8.56 7.75C8.4 7.75 8.13 7.81 7.91 8.05C7.68 8.3 7.04 8.9 7.04 10.12C7.04 11.34 7.93 12.52 8.05 12.68C8.17 12.84 9.8 15.35 12.28 16.42C12.87 16.67 13.33 16.83 13.69 16.94C14.28 17.13 14.82 17.1 15.25 17.04C15.73 16.97 16.72 16.44 16.93 15.86C17.13 15.27 17.13 14.77 17.07 14.67C17.01 14.56 16.82 14.49 16.57 14.36Z" />
    </svg>
  );
}

export default function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/91${BRAND.phone}?text=Hi%20LANAN%20Skincare%2C%20I%20have%20an%20inquiry%20regarding%20products%20and%20orders.`;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-40">
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with LANAN customer concierge on WhatsApp"
        className="flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-[#25D366] text-white shadow-luxury hover:bg-[#20bd5a] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 group"
        whileHover={{ y: -2 }}
        id="lanan-whatsapp-trigger"
      >
        <SvgWhatsApp className="text-white drop-shadow-xs" />
        <span className="hidden sm:inline font-body text-xs font-semibold tracking-wide text-white drop-shadow-xs">
          WhatsApp Support
        </span>
      </motion.a>
    </div>
  );
}
