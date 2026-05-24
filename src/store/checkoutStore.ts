// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Checkout Store (Zustand)
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import type { ShippingAddress, DeliveryMethod } from '@/types/order';

export type CheckoutStep = 'contact' | 'address' | 'delivery' | 'payment' | 'success';

interface ContactInfo {
  phone: string;
  name: string;
  email: string;
}

interface CheckoutState {
  step: CheckoutStep;
  contact: ContactInfo;
  address: ShippingAddress | null;
  deliveryMethod: DeliveryMethod;
  razorpayOrderId: string | null;
  confirmedOrderId: string | null;

  setStep: (step: CheckoutStep) => void;
  setContact: (info: ContactInfo) => void;
  setAddress: (addr: ShippingAddress) => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setRazorpayOrderId: (id: string) => void;
  setConfirmedOrderId: (id: string) => void;
  resetCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  step: 'contact',
  contact: { phone: '', name: '', email: '' },
  address: null,
  deliveryMethod: 'standard',
  razorpayOrderId: null,
  confirmedOrderId: null,

  setStep: (step) => set({ step }),
  setContact: (info) => set({ contact: info }),
  setAddress: (addr) => set({ address: addr }),
  setDeliveryMethod: (method) => set({ deliveryMethod: method }),
  setRazorpayOrderId: (id) => set({ razorpayOrderId: id }),
  setConfirmedOrderId: (id) => set({ confirmedOrderId: id }),
  resetCheckout: () =>
    set({
      step: 'contact',
      contact: { phone: '', name: '', email: '' },
      address: null,
      deliveryMethod: 'standard',
      razorpayOrderId: null,
      confirmedOrderId: null,
    }),
}));
