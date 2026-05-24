// ─────────────────────────────────────────────────────────────────────────────
// LANAN — UI Store (Zustand)
// Manages global UI state: modals, popups, auth state, etc.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';

interface UIState {
  // Auth drawer/modal
  authModalOpen: boolean;
  authMode: 'login' | 'register';

  // Search
  searchOpen: boolean;
  searchQuery: string;

  // Popup tracking
  popupShown: string | null; // popup id that has been shown this session
  popupVisible: boolean;

  // Mobile menu
  mobileMenuOpen: boolean;

  // Announcement bar
  announcementVisible: boolean;

  // Toast messages (managed by sonner, but track here)
  lastToast: string | null;

  // Actions
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  toggleSearch: () => void;
  setSearchQuery: (q: string) => void;
  showPopup: (id: string) => void;
  hidePopup: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  hideAnnouncement: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  authModalOpen: false,
  authMode: 'login',
  searchOpen: false,
  searchQuery: '',
  popupShown: null,
  popupVisible: false,
  mobileMenuOpen: false,
  announcementVisible: true,
  lastToast: null,

  openAuthModal: (mode = 'login') => set({ authModalOpen: true, authMode: mode }),
  closeAuthModal: () => set({ authModalOpen: false }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen, searchQuery: '' })),
  setSearchQuery: (q) => set({ searchQuery: q }),
  showPopup: (id) => set({ popupShown: id, popupVisible: true }),
  hidePopup: () => set({ popupVisible: false }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  hideAnnouncement: () => set({ announcementVisible: false }),
}));
