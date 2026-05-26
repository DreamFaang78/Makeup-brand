'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Navbar
// Premium sticky navigation with cart, search, mobile menu
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Heart, User, Menu, X, ChevronDown,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

const NAV_LINKS = [
  {
    label: 'Shop',
    href: '/shop',
    children: [
      { label: 'All Products', href: '/shop' },
      { label: 'Serums', href: '/shop?category=serums' },
      { label: 'Moisturisers', href: '/shop?category=moisturisers' },
      { label: 'Cleansers', href: '/shop?category=cleansers' },
      { label: 'Sunscreen', href: '/shop?category=sunscreen' },
      { label: 'Eye Care', href: '/shop?category=eye-care' },
      { label: 'Masks', href: '/shop?category=masks' },
    ],
  },
  { label: 'Rituals', href: '/rituals' },
  { label: 'Trends', href: '/trends' },
  { label: 'Ingredients', href: '/ingredients' },
  { label: 'About', href: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [userSegment, setUserSegment] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { itemCount, toggleCart } = useCartStore();
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu, openAuthModal } = useUIStore();

  useEffect(() => {
    const checkUser = async () => {
      const mockUserStr = localStorage.getItem('mock_user');
      if (mockUserStr) {
        try {
          const mockUser = JSON.parse(mockUserStr);
          setUser(mockUser);
          // If the mock user is the admin, set segment to admin
          if (mockUser.email === 'admin@lanan.in') {
            setUserSegment('admin');
          } else {
            setUserSegment('new');
          }
          return;
        } catch (e) {}
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Fetch user segment from customers table
      if (session?.user?.id) {
        try {
          const { data } = await supabase
            .from('customers')
            .select('segment, email')
            .eq('id', session.user.id)
            .single();
          
          if (data?.email === 'admin@lanan.in') {
            setUserSegment('admin');
          } else {
            setUserSegment(data?.segment || null);
          }
        } catch (e) {
          console.error('Failed to fetch user segment:', e);
        }
      }
    };

    checkUser();

    // Listen to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser();
    });

    // Listen to local mock auth changes
    window.addEventListener('auth-state-change', checkUser);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth-state-change', checkUser);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <>
      {/* ── Fixed Header Wrapper ── */}
      <div className="fixed top-0 left-0 right-0 z-40 w-full flex flex-col">
        {/* Announcement Bar (permanent static ticker) */}
        <div
          className="bg-obsidian overflow-hidden flex items-center border-b border-gold/10 h-9 opacity-100"
        >
          <div className="flex animate-ticker whitespace-nowrap py-1" style={{ width: 'max-content' }}>
            {[
              '✦ Free shipping on orders above ₹599',
              '✦ Premium Indian skincare crafted for you',
              '✦ Secure payments via Razorpay',
              '✦ 100% cruelty-free & dermatologist tested',
              '✦ Free shipping on orders above ₹599',
              '✦ Premium Indian skincare crafted for you',
              '✦ Secure payments via Razorpay',
              '✦ 100% cruelty-free & dermatologist tested',
            ].map((text, i) => (
              <span key={i} className="text-gold text-[10px] sm:text-xs font-body font-medium tracking-[0.15em] mx-8 uppercase">
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* ── Main Navbar ── */}
        <header
          className={cn(
            'w-full transition-all duration-500 z-40',
            // Laptop floating premium style
            'lg:max-w-7xl lg:mx-auto lg:mt-3 lg:rounded-xl2 lg:border',
            scrolled
              ? 'bg-white/95 backdrop-blur-xl border-beige/40 lg:border-gold/30 shadow-luxury-lg'
              : 'bg-transparent border-transparent lg:bg-white/40 lg:backdrop-blur-md lg:border-gold/15'
          )}
        >
        <div className="container-lanan">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" onClick={closeMobileMenu}>
              <div className="relative w-9 h-9 lg:w-11 lg:h-11">
                <Image
                  src="/lanan logo.png"
                  alt="LANAN Logo"
                  fill
                  sizes="44px"
                  className="object-contain"
                  priority
                />
              </div>
              <span
                className={cn(
                  'font-heading font-medium tracking-[0.15em] text-xl lg:text-2xl transition-colors duration-300',
                  scrolled ? 'text-obsidian' : 'text-obsidian'
                )}
              >
                LANAN
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-8" ref={dropdownRef}>
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative">
                    <button
                      className="nav-link flex items-center gap-1"
                      onMouseEnter={() => setActiveDropdown(link.label)}
                      onMouseLeave={() => setActiveDropdown(null)}
                      aria-expanded={activeDropdown === link.label}
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        className={cn(
                          'transition-transform duration-200',
                          activeDropdown === link.label ? 'rotate-180' : ''
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl2 shadow-luxury border border-beige/60 py-2 z-50"
                          onMouseEnter={() => setActiveDropdown(link.label)}
                          onMouseLeave={() => setActiveDropdown(null)}
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2.5 text-sm font-body text-charcoal hover:text-gold hover:bg-ivory transition-colors duration-150"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link key={link.label} href={link.href} className="nav-link">
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Search */}
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-beige/60 transition-colors text-charcoal hover:text-gold"
                aria-label="Search products"
              >
                <Search size={18} />
              </button>

              {/* Wishlist (desktop) */}
              <Link
                href="/account/wishlist"
                className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full hover:bg-beige/60 transition-colors text-charcoal hover:text-gold"
                aria-label="Wishlist"
              >
                <Heart size={18} />
              </Link>

              {/* Account Dropdown */}
              <div className="relative flex-shrink-0" ref={userMenuRef}>
                {user ? (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full bg-gold/10 border border-gold/30 hover:bg-gold/20 transition-colors text-gold"
                    aria-label="User menu"
                  >
                    <span className="text-xs font-semibold uppercase font-mono">
                      {user.user_metadata?.full_name ? user.user_metadata.full_name.slice(0, 2) : 'LN'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => openAuthModal('login')}
                    className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full hover:bg-beige/60 transition-colors text-charcoal hover:text-gold"
                    aria-label="My account"
                  >
                    <User size={18} />
                  </button>
                )}

                <AnimatePresence>
                  {userMenuOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl2 shadow-luxury border border-beige/60 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-beige/40">
                        <p className="text-xs text-taupe font-body">Signed in as</p>
                        <p className="text-xs font-semibold font-body text-obsidian truncate mt-0.5">
                          {user.user_metadata?.full_name || user.email || user.phone || 'Lanan Customer'}
                        </p>
                      </div>
                      
                      <Link
                        href={userSegment === 'new' || userSegment === 'repeat' ? '/account/orders' : '/admin/dashboard'}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs font-body text-charcoal hover:text-gold hover:bg-ivory transition-colors"
                      >
                        {userSegment === 'new' || userSegment === 'repeat' ? 'My Orders' : 'Dashboard'}
                      </Link>

                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          localStorage.removeItem('mock_user');
                          document.cookie = "mock-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                          await supabase.auth.signOut();
                          setUser(null);
                          window.dispatchEvent(new Event('auth-state-change'));
                          toast.success('Signed out successfully!');
                        }}
                        className="w-full text-left block px-4 py-2 text-xs font-body text-error-red hover:bg-error-red/5 transition-colors border-t border-beige/40 mt-1 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative flex items-center gap-2 h-9 px-3 rounded-pill bg-obsidian text-ivory hover:bg-charcoal transition-colors duration-200"
                aria-label={`Cart with ${itemCount} items`}
              >
                <ShoppingBag size={15} />
                <span className="text-xs font-body font-medium">{itemCount}</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold rounded-full flex items-center justify-center text-[9px] font-bold text-obsidian">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-beige/60 transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-obsidian/30 z-30 lg:hidden"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white z-40 lg:hidden shadow-luxury-lg overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <span className="font-heading text-xl tracking-widest text-obsidian">LANAN</span>
                  <button onClick={closeMobileMenu} className="w-8 h-8 flex items-center justify-center rounded-full bg-beige hover:bg-beige-dark transition-colors">
                    <X size={16} />
                  </button>
                </div>

                {/* Nav Items */}
                <nav className="space-y-1">

                  {/* ── Shop accordion ── */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0 }}
                  >
                    <button
                      onClick={() => setMobileShopOpen((o) => !o)}
                      className="w-full flex items-center justify-between py-3.5 px-4 rounded-xl font-body text-sm font-medium text-charcoal hover:text-gold hover:bg-ivory transition-all duration-200"
                    >
                      <span>Shop</span>
                      <motion.span
                        animate={{ rotate: mobileShopOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown size={15} className="text-taupe" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {mobileShopOpen && (
                        <motion.div
                          key="shop-panel"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="mx-1 mb-3 rounded-2xl border border-gold/20 bg-ivory overflow-hidden">
                            {/* Panel header */}
                            <div className="px-4 pt-3 pb-2 border-b border-beige/70 flex items-center justify-between">
                              <span className="text-[10px] font-body font-semibold tracking-widest uppercase text-gold">All Categories</span>
                              <Link
                                href="/shop"
                                onClick={closeMobileMenu}
                                className="text-[10px] font-body text-taupe hover:text-gold underline underline-offset-2 transition-colors"
                              >
                                View all
                              </Link>
                            </div>

                            {/* Category grid */}
                            <div className="grid grid-cols-2 gap-px bg-beige/40">
                              {[
                                { label: 'All Products', href: '/shop', emoji: '✦' },
                                { label: 'Serums', href: '/shop?category=serums', emoji: '💧' },
                                { label: 'Moisturisers', href: '/shop?category=moisturisers', emoji: '🫧' },
                                { label: 'Cleansers', href: '/shop?category=cleansers', emoji: '🌿' },
                                { label: 'Sunscreen', href: '/shop?category=sunscreen', emoji: '☀️' },
                                { label: 'Eye Care', href: '/shop?category=eye-care', emoji: '👁️' },
                                { label: 'Masks', href: '/shop?category=masks', emoji: '✨' },
                              ].map((cat) => (
                                <Link
                                  key={cat.href}
                                  href={cat.href}
                                  onClick={closeMobileMenu}
                                  className="flex items-center gap-2.5 px-4 py-3 bg-white hover:bg-gold/5 hover:text-gold transition-all duration-150 group"
                                >
                                  <span className="text-base leading-none">{cat.emoji}</span>
                                  <span className="text-xs font-body font-medium text-charcoal group-hover:text-gold transition-colors">{cat.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* ── Other nav links ── */}
                  {NAV_LINKS.filter((l) => !l.children).map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (i + 1) * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMobileMenu}
                        className="block py-3.5 px-4 rounded-xl font-body text-sm font-medium text-charcoal hover:text-gold hover:bg-ivory transition-all duration-200"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Divider */}
                <div className="border-t border-beige my-6" />

                {/* Account */}
                <div className="space-y-2">
                  {user ? (
                    <>
                      <div className="px-4 py-2.5 bg-ivory rounded-xl border border-beige/40">
                        <p className="text-[10px] text-taupe font-body">Signed in as</p>
                        <p className="text-xs font-semibold font-body text-obsidian truncate mt-0.5">
                          {user.user_metadata?.full_name || user.email || user.phone || 'Lanan Customer'}
                        </p>
                      </div>
                      <Link
                        href={userSegment === 'new' || userSegment === 'repeat' ? '/account/orders' : '/admin/dashboard'}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-body text-charcoal hover:bg-ivory hover:text-gold transition-all"
                      >
                        <User size={16} />
                        {userSegment === 'new' || userSegment === 'repeat' ? 'My Orders' : 'Dashboard'}
                      </Link>
                      <button
                        onClick={async () => {
                          closeMobileMenu();
                          localStorage.removeItem('mock_user');
                          document.cookie = "mock-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                          await supabase.auth.signOut();
                          setUser(null);
                          window.dispatchEvent(new Event('auth-state-change'));
                          toast.success('Signed out successfully!');
                        }}
                        className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-body text-error-red hover:bg-error-red/5 transition-all text-left cursor-pointer"
                      >
                        <User size={16} className="text-error-red opacity-80" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { openAuthModal('login'); closeMobileMenu(); }}
                      className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-body text-charcoal hover:bg-ivory hover:text-gold transition-all"
                    >
                      <User size={16} />
                      My Account
                    </button>
                  )}
                  <Link href="/account/wishlist" onClick={closeMobileMenu}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-body text-charcoal hover:bg-ivory hover:text-gold transition-all"
                  >
                    <Heart size={16} />
                    Wishlist
                  </Link>
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <Link href="/shop" onClick={closeMobileMenu} className="btn-gold w-full justify-center">
                    Shop Now
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
