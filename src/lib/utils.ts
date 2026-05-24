// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price as Indian Rupees */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format price raw (without symbol) */
export function formatPriceRaw(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Calculate discount percentage */
export function discountPercent(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

/** Slugify a string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Generate a LANAN order number */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `LAN${year}${month}${random}`;
}

/** Truncate text */
export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '…';
}

/** Parse pincode — basic Indian format check */
export function isValidPincode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin);
}

/** Get star array for ratings */
export function getStars(rating: number): Array<'full' | 'half' | 'empty'> {
  const stars: Array<'full' | 'half' | 'empty'> = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push('full');
    else if (rating >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }
  return stars;
}

/** Delay promise */
export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Indian state list */
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
];

/** LANAN Business constants */
export const BRAND = {
  name: 'LANAN',
  fullName: 'Ma Tara Neelsarashwati',
  phone: '7630888521',
  email: 'hello@lanan.in',
  supportEmail: 'support@lanan.in',
  address: 'Plot No 36A, Arazi No 1800BA, Sundar Nagar, Panki, Kanpur, Uttar Pradesh - 208020',
  addressLines: [
    'Plot No 36A, Arazi No 1800BA',
    'Sundar Nagar, Panki',
    'Kanpur, Uttar Pradesh - 208020',
    'India',
  ],
  socialLinks: {
    instagram: 'https://instagram.com/lanan.in',
    facebook: 'https://facebook.com/lanan.in',
    youtube: 'https://youtube.com/@lanan.in',
  },
  freeShippingThreshold: 599,
  standardShipping: 79,
  gstRate: 18,
};
