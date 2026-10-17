// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Cart Store (Zustand)
// Persists to localStorage. Works for both guest and logged-in users.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/types/order';
import { trackAddToCart } from '@/lib/metaPixel';

export const FREE_SHIPPING_THRESHOLD = 599;
export const STANDARD_SHIPPING = 79;
export const GST_RATE = 0.18;

export function calcCart(items: CartItem[], couponDiscount: number) {
  const subtotal = items.reduce((s, i) => s + (Number(i.unit_price) || 0) * (Number(i.quantity) || 1), 0);
  const discounted = Math.max(subtotal - (Number(couponDiscount) || 0), 0);
  const shipping = subtotal === 0 ? 0 : (discounted >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING);
  // In Indian D2C pricing, prices are inclusive of GST.
  // The GST component is extracted from the price (18% inclusive):
  const gst = subtotal > 0 ? Math.round((discounted - (discounted / (1 + GST_RATE))) * 100) / 100 : 0;
  const total = discounted + shipping;
  return { subtotal, shipping, gst, total };
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  isOpen: boolean;

  // Computed
  itemCount: number;
  subtotal: number;
  shippingCharge: number;
  gstAmount: number;
  total: number;
  freeShippingProgress: number;  // 0-100

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQty: (productId: string, variantId: string | null | undefined, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  recalculate: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,
      isOpen: false,
      itemCount: 0,
      subtotal: 0,
      shippingCharge: STANDARD_SHIPPING,
      gstAmount: 0,
      total: 0,
      freeShippingProgress: 0,

      addItem: (newItem) => {
        const state = get();
        const key = `${newItem.product_id}::${newItem.variant_id ?? 'base'}`;

        const existing = state.items.find(
          (i) => `${i.product_id}::${i.variant_id ?? 'base'}` === key
        );

        let updated: CartItem[];
        if (existing) {
          updated = state.items.map((i) =>
            `${i.product_id}::${i.variant_id ?? 'base'}` === key
              ? { ...i, quantity: i.quantity + newItem.quantity }
              : i
          );
        } else {
          const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          updated = [...state.items, { ...newItem, id }];
        }

        const { subtotal, shipping, gst, total } = calcCart(updated, state.couponDiscount);
        const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

        set({
          items: updated,
          itemCount: updated.reduce((s, i) => s + i.quantity, 0),
          subtotal,
          shippingCharge: shipping,
          gstAmount: gst,
          total,
          freeShippingProgress: progress,
          isOpen: true,
        });

        // Track Meta Pixel AddToCart event
        trackAddToCart({
          id: newItem.product_id,
          name: newItem.product_name,
          price: Number(newItem.unit_price) || 0,
          quantity: Number(newItem.quantity) || 1,
          currency: 'INR',
          variant: newItem.variant_name,
        });
      },

      removeItem: (productId, variantId) => {
        const state = get();
        const key = `${productId}::${variantId ?? 'base'}`;
        const updated = state.items.filter(
          (i) => `${i.product_id}::${i.variant_id ?? 'base'}` !== key
        );
        const { subtotal, shipping, gst, total } = calcCart(updated, state.couponDiscount);
        const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
        set({
          items: updated,
          itemCount: updated.reduce((s, i) => s + i.quantity, 0),
          subtotal,
          shippingCharge: shipping,
          gstAmount: gst,
          total,
          freeShippingProgress: progress,
        });
      },

      updateQty: (productId, variantId, qty) => {
        const state = get();
        if (qty <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        const key = `${productId}::${variantId ?? 'base'}`;
        const updated = state.items.map((i) =>
          `${i.product_id}::${i.variant_id ?? 'base'}` === key ? { ...i, quantity: qty } : i
        );
        const { subtotal, shipping, gst, total } = calcCart(updated, state.couponDiscount);
        const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
        set({
          items: updated,
          itemCount: updated.reduce((s, i) => s + i.quantity, 0),
          subtotal,
          shippingCharge: shipping,
          gstAmount: gst,
          total,
          freeShippingProgress: progress,
        });
      },

      clearCart: () =>
        set({
          items: [],
          couponCode: null,
          couponDiscount: 0,
          itemCount: 0,
          subtotal: 0,
          shippingCharge: STANDARD_SHIPPING,
          gstAmount: 0,
          total: 0,
          freeShippingProgress: 0,
        }),

      applyCoupon: (code, discount) => {
        const state = get();
        const { subtotal, shipping, gst, total } = calcCart(state.items, discount);
        set({ couponCode: code, couponDiscount: discount, shippingCharge: shipping, gstAmount: gst, total });
      },

      removeCoupon: () => {
        const state = get();
        const { subtotal, shipping, gst, total } = calcCart(state.items, 0);
        set({ couponCode: null, couponDiscount: 0, shippingCharge: shipping, gstAmount: gst, total });
      },

      recalculate: () => {
        const state = get();
        const items = state.items || [];
        const discount = state.couponDiscount || 0;
        const { subtotal, shipping, gst, total } = calcCart(items, discount);
        const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
        set({
          subtotal,
          shippingCharge: shipping,
          gstAmount: gst,
          total,
          itemCount: items.reduce((s, i) => s + (i.quantity || 1), 0),
          freeShippingProgress: progress,
        });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: 'lanan-cart',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const items = state.items || [];
          const discount = state.couponDiscount || 0;
          const { subtotal, shipping, gst, total } = calcCart(items, discount);
          state.subtotal = subtotal;
          state.shippingCharge = shipping;
          state.gstAmount = gst;
          state.total = total;
          state.itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);
          state.freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
        }
      },
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
        subtotal: state.subtotal,
        shippingCharge: state.shippingCharge,
        gstAmount: state.gstAmount,
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
);
