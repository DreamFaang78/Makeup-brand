'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Luxury Price Display Component
// Consistent hierarchy: ~~Original~~ -> Bold Sale -> SAVE X% badge
// With continuous loop pulse/glow animation (1.2s active, 2.0s rest)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface PriceTagProps {
  basePrice?: number | null;
  salePrice?: number | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  animate?: boolean;
  className?: string;
  badgeClassName?: string;
}

export function PriceTag({
  basePrice,
  salePrice,
  size = 'md',
  showBadge = true,
  animate = true,
  className,
  badgeClassName,
}: PriceTagProps) {
  const base = typeof basePrice === 'number' && !isNaN(basePrice) ? basePrice : 0;
  const sale = typeof salePrice === 'number' && !isNaN(salePrice) ? salePrice : null;

  // Strict pricing logic:
  // Only valid sale if sale is strictly lower than base and both are positive numbers
  const hasSale = Boolean(sale !== null && sale > 0 && base > 0 && sale < base);
  const displayPrice = hasSale ? (sale as number) : (sale && sale > 0 ? sale : base);
  const originalPrice = base;
  const discount = hasSale && base > 0 ? Math.round(((base - (sale as number)) / base) * 100) : 0;

  // Size variations
  const sizeStyles = {
    sm: {
      container: 'gap-x-1.5 gap-y-1',
      base: 'text-[11px] font-sans tabular-nums text-taupe/75 line-through font-normal',
      sale: 'text-sm font-sans tabular-nums font-bold text-obsidian tracking-tight',
      badge: 'px-1.5 py-0.5 text-[9px]',
    },
    md: {
      container: 'gap-x-2 gap-y-1',
      base: 'text-xs lg:text-sm font-sans tabular-nums text-taupe/80 line-through font-normal',
      sale: 'text-base lg:text-lg font-sans tabular-nums font-bold text-obsidian tracking-tight',
      badge: 'px-2 py-0.5 text-[10px]',
    },
    lg: {
      container: 'gap-x-2.5 gap-y-1.5',
      base: 'text-sm lg:text-base font-sans tabular-nums text-taupe/80 line-through font-normal',
      sale: 'text-xl lg:text-2xl font-sans tabular-nums font-bold text-obsidian tracking-tight',
      badge: 'px-2.5 py-0.5 text-[11px]',
    },
    xl: {
      container: 'gap-x-3.5 gap-y-2',
      base: 'text-base lg:text-xl font-sans tabular-nums text-taupe/80 line-through font-normal',
      sale: 'text-3xl lg:text-4xl font-sans tabular-nums font-bold text-obsidian tracking-tight',
      badge: 'px-3 py-1 text-xs',
    },
  }[size];

  if (!hasSale) {
    return (
      <div className={cn('inline-flex items-baseline', className)}>
        <span className={cn('font-sans tabular-nums font-bold text-obsidian', sizeStyles.sale)}>
          {formatPrice(displayPrice)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-baseline flex-wrap', sizeStyles.container, className)}>
      {/* 1. Base / Original Price (Strikethrough) */}
      <span className={sizeStyles.base}>
        {formatPrice(originalPrice)}
      </span>

      {/* 2. Sale Price (Prominent, Bold, with soft gold glow loop) */}
      <span
        className={cn(
          sizeStyles.sale,
          animate && 'lanan-sale-price-glow'
        )}
      >
        {formatPrice(displayPrice)}
      </span>

      {/* 3. Discount Badge (SAVE X%, Luxury Burgundy + Gold border with gentle scale loop) */}
      {showBadge && discount > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full font-body font-bold uppercase tracking-wider',
            'bg-[#5B1924] text-[#F7F1EA] border border-[#C9A96E]/40 shadow-xs',
            sizeStyles.badge,
            animate && 'lanan-sale-badge-pulse',
            badgeClassName
          )}
        >
          SAVE {discount}%
        </span>
      )}
    </div>
  );
}

export default PriceTag;
