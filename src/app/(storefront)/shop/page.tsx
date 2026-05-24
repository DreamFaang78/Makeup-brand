'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Product Listing Page (PLP)
// Full featured with filters, sort, grid
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import { cn } from '@/lib/utils';
import type { SortOption, SkinType, SkinConcern } from '@/types/product';

const CATEGORIES = ['All', 'Serums', 'Moisturisers', 'Cleansers', 'Sunscreen', 'Eye Care', 'Masks', 'Toners'];
const SKIN_TYPES: SkinType[] = ['oily', 'dry', 'combination', 'sensitive', 'normal'];
const SKIN_CONCERNS: SkinConcern[] = ['pigmentation', 'acne', 'hydration', 'anti-aging', 'brightening', 'dark-circles', 'pores', 'sensitivity', 'uneven-tone'];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'bestselling', label: 'Bestselling' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTypes, setSelectedTypes] = useState<SkinType[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<SkinConcern[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('bestselling');
  const [priceMax, setPriceMax] = useState(2000);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleType = (t: SkinType) =>
    setSelectedTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const toggleConcern = (c: SkinConcern) =>
    setSelectedConcerns((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const filteredProducts = useMemo(() => {
    let products = [...DEMO_PRODUCTS];

    if (selectedCategory !== 'All') {
      products = products.filter((p) =>
        p.category?.name.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedTypes.length > 0) {
      products = products.filter((p) =>
        selectedTypes.some((t) => p.skin_types.includes(t) || p.skin_types.includes('all' as SkinType))
      );
    }

    if (selectedConcerns.length > 0) {
      products = products.filter((p) =>
        selectedConcerns.some((c) => p.skin_concerns.includes(c))
      );
    }

    products = products.filter((p) => (p.sale_price ?? p.base_price) <= priceMax);

    switch (sortBy) {
      case 'bestselling': products.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0)); break;
      case 'price-asc': products.sort((a, b) => (a.sale_price ?? a.base_price) - (b.sale_price ?? b.base_price)); break;
      case 'price-desc': products.sort((a, b) => (b.sale_price ?? b.base_price) - (a.sale_price ?? a.base_price)); break;
      case 'rating': products.sort((a, b) => b.rating_avg - a.rating_avg); break;
      default: break;
    }

    return products;
  }, [selectedCategory, selectedTypes, selectedConcerns, sortBy, priceMax]);

  const activeFilterCount = selectedTypes.length + selectedConcerns.length + (priceMax < 2000 ? 1 : 0);

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedConcerns([]);
    setPriceMax(2000);
  };

  return (
    <div className="min-h-screen bg-ivory">
      {/* Page Header */}
      <div className="bg-white border-b border-beige">
        <div className="container-lanan py-8">
          <nav className="text-xs font-body text-taupe mb-3">
            <span>Home</span> <span className="mx-2">›</span> <span className="text-obsidian">Shop</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl lg:text-4xl text-obsidian font-light">
                All Products
              </h1>
              <p className="text-sm font-body text-taupe mt-1">
                {filteredProducts.length} products
              </p>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-body text-taupe whitespace-nowrap">Sort by:</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="input-luxury text-xs py-2.5 pr-8 appearance-none cursor-pointer min-w-[160px]"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setFiltersOpen(true)}
                className={cn(
                  'lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-body font-medium transition-all',
                  activeFilterCount > 0 ? 'border-gold bg-gold/10 text-gold' : 'border-beige text-charcoal'
                )}
              >
                <SlidersHorizontal size={13} />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-5 overflow-x-auto scroll-hidden pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-pill text-xs font-body font-medium transition-all duration-200',
                  selectedCategory === cat
                    ? 'bg-obsidian text-ivory'
                    : 'bg-white border border-beige text-charcoal hover:border-gold hover:text-gold'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-lanan py-8">
        <div className="flex gap-8">

          {/* ── Desktop Filters Sidebar ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-28 space-y-6">

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-body font-medium text-gold">{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>
                  <button onClick={clearFilters} className="text-xs text-taupe hover:text-error-red transition-colors">Clear all</button>
                </div>
              )}

              {/* Skin Type */}
              <div>
                <h3 className="text-xs font-body font-semibold text-obsidian uppercase tracking-wider mb-3">Skin Type</h3>
                <div className="space-y-2">
                  {SKIN_TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                        className="w-3.5 h-3.5 accent-gold"
                      />
                      <span className={cn(
                        'text-xs font-body capitalize transition-colors',
                        selectedTypes.includes(type) ? 'text-gold font-medium' : 'text-charcoal group-hover:text-gold'
                      )}>
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skin Concern */}
              <div>
                <h3 className="text-xs font-body font-semibold text-obsidian uppercase tracking-wider mb-3">Skin Concern</h3>
                <div className="space-y-2">
                  {SKIN_CONCERNS.map((concern) => (
                    <label key={concern} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedConcerns.includes(concern)}
                        onChange={() => toggleConcern(concern)}
                        className="w-3.5 h-3.5 accent-gold"
                      />
                      <span className={cn(
                        'text-xs font-body capitalize transition-colors',
                        selectedConcerns.includes(concern) ? 'text-gold font-medium' : 'text-charcoal group-hover:text-gold'
                      )}>
                        {concern.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs font-body font-semibold text-obsidian uppercase tracking-wider mb-3">Price</h3>
                <input
                  type="range"
                  min={200}
                  max={2000}
                  step={50}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-gold"
                />
                <div className="flex justify-between text-xs font-mono text-taupe mt-1">
                  <span>₹200</span>
                  <span>Up to ₹{priceMax}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Products Grid ── */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <p className="font-heading text-2xl text-taupe mb-2">No products found</p>
                  <p className="text-sm font-body text-taupe/70 mb-6">Try adjusting your filters</p>
                  <button onClick={clearFilters} className="btn-gold">Clear Filters</button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5"
                >
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Mobile Filters Drawer ── */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-obsidian/30 z-50 lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="bottom-sheet p-6 z-50"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-xl">Filters</h2>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-taupe hover:text-error-red">Clear all</button>
                  )}
                  <button onClick={() => setFiltersOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-beige">
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Mobile filters content — same as desktop */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-body font-semibold uppercase tracking-wider mb-3">Skin Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={cn(
                          'px-3 py-1.5 rounded-pill text-xs font-body capitalize transition-all border',
                          selectedTypes.includes(type) ? 'bg-gold text-obsidian border-gold' : 'border-beige text-charcoal'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-body font-semibold uppercase tracking-wider mb-3">Skin Concern</h3>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_CONCERNS.map((concern) => (
                      <button
                        key={concern}
                        onClick={() => toggleConcern(concern)}
                        className={cn(
                          'px-3 py-1.5 rounded-pill text-xs font-body capitalize transition-all border',
                          selectedConcerns.includes(concern) ? 'bg-gold text-obsidian border-gold' : 'border-beige text-charcoal'
                        )}
                      >
                        {concern.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-body font-semibold uppercase tracking-wider mb-3">Price: Up to ₹{priceMax}</h3>
                  <input type="range" min={200} max={2000} step={50} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full accent-gold" />
                </div>
              </div>

              <button onClick={() => setFiltersOpen(false)} className="btn-gold w-full justify-center mt-6">
                View {filteredProducts.length} Products
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
