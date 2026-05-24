'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Cart Drawer
// Slide-in cart with items, coupon, free shipping bar, checkout CTA
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, Tag, ChevronRight, ShoppingBag, Gift } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 599;

export default function CartDrawer() {
  const {
    isOpen, closeCart, items, removeItem, updateQty,
    subtotal, shippingCharge, total, gstAmount, couponCode,
    couponDiscount, applyCoupon, removeCoupon, freeShippingProgress,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    // Demo coupons
    const DEMO_COUPONS: Record<string, number> = {
      'LANAN10': subtotal * 0.1,
      'WELCOME20': subtotal * 0.2,
      'FLAT100': 100,
      'FIRSTORDER': 150,
    };

    const discount = DEMO_COUPONS[couponInput.toUpperCase()];
    if (discount) {
      applyCoupon(couponInput.toUpperCase(), Math.round(discount));
      setCouponInput('');
      toast.success(`Coupon applied! You saved ${formatPrice(Math.round(discount))}`);
    } else {
      toast.error('Invalid coupon code');
    }
    setCouponLoading(false);
  }

  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-obsidian/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-luxury-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-beige">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-gold" />
                <h2 className="font-heading text-lg text-obsidian">
                  Your Cart <span className="font-body text-sm text-taupe font-normal">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-beige transition-colors"
                aria-label="Close cart"
              >
                <X size={16} />
              </button>
            </div>

            {/* Free Shipping Bar */}
            <div className="px-5 py-3 bg-ivory border-b border-beige/50">
              {remaining > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-body text-taupe">
                    Add <span className="font-semibold text-obsidian">{formatPrice(remaining)}</span> more for free shipping
                  </p>
                  <div className="h-1.5 bg-beige rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-gold rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-success-green">
                  <Gift size={14} />
                  <p className="text-xs font-body font-semibold">You've unlocked free shipping! 🎉</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-3 scroll-hidden">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-beige/60 flex items-center justify-center">
                    <ShoppingBag size={24} className="text-taupe" />
                  </div>
                  <div>
                    <p className="font-heading text-lg text-obsidian mb-1">Your cart is empty</p>
                    <p className="text-sm text-taupe font-body">Discover our premium skincare rituals</p>
                  </div>
                  <button onClick={closeCart} className="btn-gold mt-2">
                    Shop Now
                  </button>
                </div>
              ) : (
                <ul className="space-y-0 divide-y divide-beige/40">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3 px-5 py-4">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-beige flex-shrink-0">
                        <Image
                          src={item.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=120&auto=format&fit=crop'}
                          alt={item.product_name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product_slug}`} onClick={closeCart}>
                          <h3 className="text-sm font-body font-medium text-obsidian line-clamp-2 hover:text-gold transition-colors">
                            {item.product_name}
                          </h3>
                        </Link>
                        {item.variant_name && (
                          <p className="text-xs text-taupe mt-0.5">{item.variant_name}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          {/* Qty Controls */}
                          <div className="flex items-center gap-1 border border-beige rounded-lg">
                            <button
                              onClick={() => updateQty(item.product_id, item.variant_id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-beige transition-colors rounded-l-lg"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-mono font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.product_id, item.variant_id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-beige transition-colors rounded-r-lg"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          {/* Price */}
                          <span className="font-mono text-sm font-medium text-obsidian">
                            {formatPrice(item.unit_price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => { removeItem(item.product_id, item.variant_id); toast.success('Item removed'); }}
                        className="flex-shrink-0 text-beige-dark hover:text-error-red transition-colors mt-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Bottom — Coupon + Summary + CTA */}
            {items.length > 0 && (
              <div className="border-t border-beige">
                {/* Coupon */}
                <div className="px-5 py-4 border-b border-beige/50">
                  {couponCode ? (
                    <div className="flex items-center justify-between bg-success-green/10 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2 text-success-green">
                        <Tag size={14} />
                        <span className="text-xs font-body font-semibold">{couponCode} — {formatPrice(couponDiscount)} off</span>
                      </div>
                      <button onClick={removeCoupon} className="text-xs text-taupe hover:text-error-red transition-colors">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          placeholder="Coupon code"
                          className="input-luxury pl-9 text-xs py-2.5"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className={cn(
                          'px-4 rounded-xl text-xs font-body font-semibold transition-all',
                          'bg-obsidian text-ivory hover:bg-charcoal',
                          couponLoading && 'opacity-60 cursor-not-allowed'
                        )}
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="px-5 py-3 space-y-2">
                  <div className="flex justify-between text-xs font-body text-taupe">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatPrice(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-xs font-body text-success-green">
                      <span>Coupon Discount</span>
                      <span className="font-mono">-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-body text-taupe">
                    <span>Shipping</span>
                    <span className="font-mono">
                      {shippingCharge === 0 ? (
                        <span className="text-success-green font-semibold">FREE</span>
                      ) : formatPrice(shippingCharge)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-body text-taupe">
                    <span>GST (included)</span>
                    <span className="font-mono">{formatPrice(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-body font-semibold text-obsidian pt-2 border-t border-beige">
                    <span>Total</span>
                    <span className="font-mono">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <div className="px-5 pb-5 pt-1">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="btn-gold w-full justify-center text-center py-4 text-sm"
                  >
                    Proceed to Checkout
                    <ChevronRight size={16} />
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full text-center text-xs font-body text-taupe hover:text-gold transition-colors mt-2 py-1"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
