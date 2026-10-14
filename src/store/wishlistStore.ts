// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Wishlist Store (Zustand + LocalStorage Persistence)
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistState {
  items: string[]; // List of product IDs or slugs
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (id) => {
        const current = get().items;
        if (!current.includes(id)) {
          set({ items: [...current, id] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item !== id) });
      },

      toggleItem: (id) => {
        const current = get().items;
        if (current.includes(id)) {
          set({ items: current.filter((item) => item !== id) });
        } else {
          set({ items: [...current, id] });
        }
      },

      isInWishlist: (id) => {
        return get().items.includes(id);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'lanan-wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
