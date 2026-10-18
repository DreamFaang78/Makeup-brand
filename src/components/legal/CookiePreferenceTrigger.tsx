'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Interactive Cookie Preference Trigger for Legal & Policy Pages
// ─────────────────────────────────────────────────────────────────────────────

import { Sliders } from 'lucide-react';

interface CookiePreferenceTriggerProps {
  className?: string;
  label?: string;
}

export default function CookiePreferenceTrigger({
  className = '',
  label = 'Manage Cookie Preferences',
}: CookiePreferenceTriggerProps) {
  const handleOpen = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lanan_open_cookie_banner'));
    }
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C9A45D] text-[#090807] text-xs font-body font-semibold hover:bg-[#DFBF7E] transition-all shadow-md active:scale-95 cursor-pointer ${className}`}
    >
      <Sliders size={14} />
      <span>{label}</span>
    </button>
  );
}
