'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Luxury Price Display Component
// Visual hierarchy: [Discounted Price] -> [~~Original Price~~] -> [SAVE 16% Badge]
// Designed for luxury skincare aesthetics: obsidian black, warm ivory, champagne gold & burgundy.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { calculateProductPrice } from '@/lib/pricing';
import { formatPrice, cn } from '@/lib/utils';

export interface PriceTagProps {
  basePrice?: number | null;
  salePrice?: number | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  showSavingsDetails?: boolean;
  animate?: boolean;
  className?: string;
  badgeClassName?: string;
}

export function PriceTag({
  basePrice,
  salePrice,
  size = 'md',
  showBadge = true,
  showSavingsDetails = false,
  animate = true,
  className,
  badgeClassName,
}: PriceTagProps) {
  let effectiveBase = basePrice;
  let effectiveSale = salePrice;

  // If only a single price is provided without a sale price, check if it matches a known LANAN selling price
  if (effectiveSale === null || effectiveSale === undefined || Number(effectiveSale) >= (Number(effectiveBase) || 0)) {
    const num = Math.round(Number(effectiveBase) || 0);
    if (num === 755) {
      effectiveBase = 899;
      effectiveSale = 755;
    } else if (num === 503) {
      effectiveBase = 599;
      effectiveSale = 503;
    } else if (num === 419) {
      effectiveBase = 499;
      effectiveSale = 419;
    }
  }

  const pricing = calculateProductPrice(effectiveBase, effectiveSale);

  // Size styling tokens
  const sizeStyles = {
    sm: {
      container: 'gap-x-1.5 gap-y-1',
      sale: 'text-sm font-sans tabular-nums font-bold text-obsidian tracking-tight',
      base: 'text-[11px] font-sans tabular-nums text-taupe/70 line-through font-normal',
      badge: 'px-1.5 py-0.5 text-[9px]',
      details: 'text-[10px]',
    },
    md: {
      container: 'gap-x-2 gap-y-1',
      sale: 'text-base sm:text-lg font-sans tabular-nums font-bold text-obsidian tracking-tight',
      base: 'text-xs sm:text-sm font-sans tabular-nums text-taupe/70 line-through font-normal',
      badge: 'px-2 py-0.5 text-[10px]',
      details: 'text-[11px]',
    },
    lg: {
      container: 'gap-x-3 gap-y-1.5',
      sale: 'text-2xl sm:text-3xl lg:text-4xl font-sans tabular-nums font-bold text-obsidian tracking-tight',
      base: 'text-sm sm:text-base lg:text-lg font-sans tabular-nums text-taupe/70 line-through font-normal',
      badge: 'px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs',
      details: 'text-xs',
    },
    xl: {
      container: 'gap-x-3.5 gap-y-2',
      sale: 'text-3xl sm:text-4xl lg:text-5xl font-sans tabular-nums font-bold text-obsidian tracking-tight',
      base: 'text-base sm:text-lg lg:text-xl font-sans tabular-nums text-taupe/70 line-through font-normal',
      badge: 'px-3 py-1 text-xs',
      details: 'text-xs sm:text-sm',
    },
  }[size];

  if (!pricing.hasDiscount) {
    return (
      <div className={cn('inline-flex flex-col', className)}>
        <span className={cn('font-sans tabular-nums font-bold text-obsidian', sizeStyles.sale)}>
          {formatPrice(pricing.discountedPrice || pricing.originalPrice)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex flex-col', className)}>
      {/* Primary Price Row: Prominent Discounted -> Strikethrough Original -> SAVE 16% */}
      <div className={cn('inline-flex items-baseline flex-wrap', sizeStyles.container)}>
        {/* 1. Large, bold discounted price (Most visually prominent) */}
        <span
          className={cn(
            sizeStyles.sale,
            animate && 'lanan-sale-price-glow'
          )}
        >
          {pricing.formattedDiscounted}
        </span>

        {/* 2. Original price smaller and crossed out */}
        <span className={sizeStyles.base}>
          {pricing.formattedOriginal}
        </span>

        {/* 3. Luxury Burgundy & Champagne Gold Savings Badge */}
        {showBadge && pricing.discountPercent > 0 && (
          <span
            className={cn(
              'inline-flex items-center rounded-full font-body font-bold uppercase tracking-wider',
              'bg-[#5B1924] text-[#F7F1EA] border border-[#C9A45D]/40 shadow-xs select-none',
              sizeStyles.badge,
              animate && 'lanan-sale-badge-pulse',
              badgeClassName
            )}
          >
            {pricing.badgeText}
          </span>
        )}
      </div>

      {/* Optional: Helpful luxury tax & savings line (used on PDP) */}
      {showSavingsDetails && pricing.savings > 0 && (
        <p className={cn('font-body text-taupe flex items-center gap-1.5 mt-1 sm:mt-1.5', sizeStyles.details)}>
          <span>Inclusive of all taxes</span>
          <span className="text-gold/60">•</span>
          <span className="text-success-green font-semibold">
            You save {pricing.formattedSavings} ({pricing.discountPercent}% off)
          </span>
        </p>
      )}
    </div>
  );
}

export default PriceTag;
