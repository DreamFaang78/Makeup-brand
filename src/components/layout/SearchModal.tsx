'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Luxury Search Modal
// Fast real-time formulation and skin concern search
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import PriceTag from '@/components/products/PriceTag';
import type { ProductCardData } from '@/types/product';
import { trackSearch } from '@/lib/metaPixel';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  'Glutathione Face Serum',
  'Sunscreen SPF 50',
  'Pigmentation',
  'Hydration',
  'Salicylic Acid Face Wash',
  'Acne & Pores',
];

export default function SearchModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
      // Load products
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          } else {
            setProducts(DEMO_PRODUCTS);
          }
        })
        .catch(() => setProducts(DEMO_PRODUCTS));
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filtered = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.tagline?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.ingredients?.toLowerCase().includes(q) ||
          p.skin_concerns?.some((c) => c.toLowerCase().includes(q))
        );
      })
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    trackSearch(cleanQuery);
    onClose();
    router.push(`/shop?q=${encodeURIComponent(cleanQuery)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-luxury-lg border border-gold/30 overflow-hidden z-10"
          >
            {/* Header / Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-beige px-6 py-4">
              <Search size={20} className="text-gold flex-shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rituals, ingredients, or skin concerns..."
                className="w-full bg-transparent text-base font-body text-obsidian placeholder-taupe/60 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-taupe hover:text-obsidian mr-2"
                  aria-label="Clear query"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-beige transition-colors text-taupe hover:text-obsidian"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </form>

            {/* Results / Suggestions */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {query.trim() === '' ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-gold" />
                    <span className="text-xs font-body font-semibold text-taupe uppercase tracking-wider">
                      Popular Searches
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="px-3.5 py-1.5 rounded-pill border border-beige hover:border-gold/40 text-xs font-body text-charcoal hover:bg-ivory transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-beige/60">
                    <p className="text-xs font-body font-semibold text-taupe uppercase tracking-wider mb-3">
                      Need a personalized diagnosis?
                    </p>
                    <Link
                      href="/skin-analysis"
                      onClick={onClose}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-ivory/60 border border-gold/25 hover:border-gold transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-gold">
                          <Sparkles size={15} />
                        </div>
                        <div>
                          <p className="text-xs font-body font-semibold text-obsidian">Free AI Skin Analysis</p>
                          <p className="text-[11px] font-body text-taupe">Upload 4 photos to reveal your exact profile</p>
                        </div>
                      </div>
                      <ArrowRight size={15} className="text-gold group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ) : filtered.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-body text-taupe mb-2">
                    Found {filtered.length} formulation{filtered.length !== 1 ? 's' : ''}
                  </p>
                  {filtered.map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-ivory/70 transition-colors group border border-transparent hover:border-beige"
                    >
                      <div className="relative w-12 h-12 rounded-lg bg-ivory overflow-hidden flex-shrink-0 border border-beige/40">
                        <Image
                          src={item.images[0]?.url || '/serum-bottle.jpeg'}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-body font-semibold text-obsidian group-hover:text-gold transition-colors truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] font-body text-taupe truncate mt-0.5">
                          {item.tagline || item.description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <PriceTag
                          basePrice={item.base_price}
                          salePrice={item.sale_price}
                          size="sm"
                          showBadge={true}
                        />
                      </div>
                    </Link>
                  ))}
                  <div className="pt-3 text-center">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-xs font-body text-gold hover:text-gold-dark font-medium underline inline-flex items-center gap-1"
                    >
                      View all results for &ldquo;{query}&rdquo;
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-heading text-lg text-obsidian font-light">No formulations found</p>
                  <p className="text-xs font-body text-taupe mt-1 mb-4">
                    We couldn&apos;t find any products matching &ldquo;{query}&rdquo;.
                  </p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="btn-outline-gold text-xs px-5 py-2 inline-flex"
                  >
                    Browse All Products
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
