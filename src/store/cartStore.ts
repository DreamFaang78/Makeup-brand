// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Cart Store (Zustand)
// Persists to localStorage. Works for both guest and logged-in users.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/types/order';

const FREE_SHIPPING_THRESHOLD = 599;
const STANDARD_SHIPPING = 79;
const GST_RATE = 0.18;

function calcCart(items: CartItem[], couponDiscount: number) {
  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const discounted = Math.max(subtotal - couponDiscount, 0);
  const shipping = discounted >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const gst = Math.round(discounted * GST_RATE * 100) / 100;
  const total = discounted + shipping + gst;
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

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: 'lanan-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
      }),
    }
  )
);
