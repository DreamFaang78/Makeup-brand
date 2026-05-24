'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Admin Topbar
// ─────────────────────────────────────────────────────────────────────────────

import { Bell, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminTopbar() {
  return (
    <header className="bg-white border-b border-beige px-6 py-3 flex items-center gap-4 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
        <input
          type="text"
          placeholder="Search orders, products..."
          className="w-full pl-9 pr-4 py-2 bg-ivory border border-beige rounded-xl text-xs font-body text-charcoal placeholder:text-taupe/60 focus:outline-none focus:border-gold transition-colors"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* View Store */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs font-body text-taupe hover:text-gold transition-colors"
        >
          <ExternalLink size={13} />
          View Store
        </Link>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-beige transition-colors text-taupe hover:text-obsidian">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error-red" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-obsidian text-xs font-bold cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}
