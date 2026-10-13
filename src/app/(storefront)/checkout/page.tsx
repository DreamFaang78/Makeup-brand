'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Full Checkout Page (Multi-Step)
// Contact → Address → Delivery → Payment (COD) → Success
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Shield,
  Phone,
  MapPin,
  Truck,
  CreditCard,
  Banknote,
  Sparkles,
  ShoppingBag,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { formatPrice, INDIAN_STATES, cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

/* ── Step config ── */
const STEPS = [
  { key: 'contact', label: 'Contact', icon: <Phone size={14} /> },
  { key: 'address', label: 'Address', icon: <MapPin size={14} /> },
  { key: 'delivery', label: 'Delivery', icon: <Truck size={14} /> },
  { key: 'payment', label: 'Payment', icon: <CreditCard size={14} /> },
];

/* ── Step Indicator ── */
function StepIndicator({ currentStep }: { currentStep: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-semibold transition-all duration-300',
                i < currentIndex
                  ? 'bg-success-green text-white shadow-xs'
                  : i === currentIndex
                  ? 'bg-gold text-obsidian shadow-gold font-bold'
                  : 'bg-beige text-taupe'
              )}
            >
              {i < currentIndex ? <Check size={12} /> : i + 1}
            </div>
            <span
              className={cn(
                'text-[10px] font-body whitespace-nowrap',
                i === currentIndex ? 'text-gold font-bold' : 'text-taupe'
              )}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                'w-12 sm:w-20 h-px mx-1 mb-4 transition-all duration-500',
                i < currentIndex ? 'bg-success-green' : 'bg-beige'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Order Summary Sidebar ── */
function OrderSummary() {
  const { items, couponDiscount, recalculate } = useCartStore();

  useEffect(() => {
    recalculate();
  }, [items, recalculate]);

  // Derive robust values so they never show 0 when items are present
  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (Number(item.unit_price) || 0) * (Number(item.quantity) || 1),
      0
    );
  }, [items]);

  const discount = Math.min(Number(couponDiscount) || 0, subtotal);
  const discounted = Math.max(subtotal - discount, 0);
  const shippingCharge = subtotal === 0 ? 0 : discounted >= 599 ? 0 : 79;
  const gstAmount = subtotal > 0 ? Math.round((discounted - discounted / 1.18) * 100) / 100 : 0;
  const total = discounted + shippingCharge;

  return (
    <div className="bg-ivory rounded-card p-5 sticky top-28 border border-beige/60 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg text-obsidian font-medium">Order Summary</h3>
        <span className="text-xs font-body text-taupe font-medium">
          {items.reduce((acc, i) => acc + (i.quantity || 1), 0)} items
        </span>
      </div>

      {/* Items list */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto scroll-hidden divide-y divide-beige/40">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 items-center pt-2.5 first:pt-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-ivory flex-shrink-0 border border-beige/60 flex items-center justify-center aspect-square">
              <Image
                src={item.image_url || '/serum-bottle.jpeg'}
                alt={item.product_name}
                width={48}
                height={48}
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-body font-semibold text-obsidian line-clamp-1">{item.product_name}</p>
              {item.variant_name && <p className="text-[10px] text-taupe">{item.variant_name}</p>}
              <p className="text-xs font-sans tabular-nums text-taupe">Qty: {item.quantity}</p>
            </div>
            <div className="text-right flex flex-col items-end flex-shrink-0">
              {item.base_price && item.base_price > item.unit_price && (
                <span className="font-sans tabular-nums text-[10px] text-taupe/70 line-through">
                  {formatPrice(item.base_price * item.quantity)}
                </span>
              )}
              <span className="text-xs font-sans tabular-nums font-bold text-obsidian">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Calculations */}
      <div className="border-t border-beige pt-3 space-y-2">
        <div className="flex justify-between text-xs font-body text-taupe">
          <span>Subtotal</span>
          <span className="font-sans tabular-nums font-semibold text-obsidian">{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-xs font-body text-success-green">
            <span>Coupon Discount</span>
            <span className="font-sans tabular-nums font-semibold">-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs font-body text-taupe">
          <span>Shipping</span>
          <span className="font-sans tabular-nums">
            {shippingCharge === 0 ? (
              <span className="text-success-green font-semibold">FREE</span>
            ) : (
              <span className="font-semibold text-obsidian">{formatPrice(shippingCharge)}</span>
            )}
          </span>
        </div>

        <div className="flex justify-between text-xs font-body text-taupe">
          <span>GST (Included in price)</span>
          <span className="font-sans tabular-nums font-medium text-taupe">{formatPrice(gstAmount)}</span>
        </div>

        {(() => {
          const productSavings = items.reduce(
            (acc, i) =>
              acc +
              (i.base_price && i.base_price > i.unit_price
                ? (i.base_price - i.unit_price) * i.quantity
                : 0),
            0
          );
          const totalSavings = productSavings + discount;
          if (totalSavings <= 0) return null;
          return (
            <div className="flex justify-between items-center text-xs font-body py-1.5 px-2.5 rounded-lg bg-[#5B1924]/10 border border-[#5B1924]/20 text-[#5B1924]">
              <span className="font-semibold">Total Savings</span>
              <span className="font-sans tabular-nums font-bold">-{formatPrice(totalSavings)}</span>
            </div>
          );
        })()}

        <div className="flex justify-between text-sm font-semibold font-body text-obsidian pt-2.5 border-t border-beige">
          <span>Total Payable</span>
          <span className="font-sans tabular-nums font-bold text-obsidian text-base">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-beige/40 flex items-center gap-1.5 text-[11px] font-body text-taupe">
        <Shield size={13} className="text-gold flex-shrink-0" />
        <span>Cash on Delivery Available • Verified Order Guarantee</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN CHECKOUT COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function CheckoutPage() {
  const { step, setStep, contact, setContact, address, setAddress, deliveryMethod, setDeliveryMethod } =
    useCheckoutStore();
  const { items, couponDiscount, clearCart, recalculate } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    number: string;
    total: number;
    paymentMethod: string;
    customerName: string;
    city: string;
    state: string;
    pincode: string;
  } | null>(null);

  // Recalculate on mount
  useEffect(() => {
    recalculate();
  }, [recalculate]);

  // Derived price calculation for rock-solid consistency
  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (Number(item.unit_price) || 0) * (Number(item.quantity) || 1),
      0
    );
  }, [items]);

  const discount = Math.min(Number(couponDiscount) || 0, subtotal);
  const discounted = Math.max(subtotal - discount, 0);
  const shippingCharge = subtotal === 0 ? 0 : discounted >= 599 ? 0 : 79;
  const gstAmount = subtotal > 0 ? Math.round((discounted - discounted / 1.18) * 100) / 100 : 0;
  const total = discounted + shippingCharge;

  // ── Contact Inputs ──
  const [phoneInput, setPhoneInput] = useState(contact?.phone || '');
  const [nameInput, setNameInput] = useState(contact?.name || '');
  const [emailInput, setEmailInput] = useState(contact?.email || '');

  // ── Address State ──
  const [addrState, setAddrState] = useState({
    line1: address?.line1 || '',
    line2: address?.line2 || '',
    city: address?.city || '',
    state: address?.state || 'Uttar Pradesh',
    pincode: address?.pincode || '',
    landmark: address?.landmark || '',
  });

  const handleContactNext = () => {
    const cleanedPhone = phoneInput.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!nameInput.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    setContact({ phone: cleanedPhone, name: nameInput.trim(), email: emailInput.trim() });
    setStep('address');
  };

  const handleAddressNext = () => {
    if (!addrState.line1.trim()) {
      toast.error('Please enter your street address / flat number');
      return;
    }
    if (!addrState.city.trim()) {
      toast.error('Please enter your city');
      return;
    }
    if (addrState.pincode.replace(/\D/g, '').length !== 6) {
      toast.error('Please enter a valid 6-digit postal pincode');
      return;
    }
    setAddress({ full_name: nameInput, phone: phoneInput, ...addrState });
    setStep('delivery');
  };

  /* ── Place Cash on Delivery Order ── */
  const handlePlaceCodOrder = async () => {
    if (loading) return;
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customer: {
          name: contact.name || nameInput || 'Lanan Customer',
          phone: contact.phone || phoneInput,
          email: contact.email || emailInput || null,
        },
        shipping_address: {
          full_name: contact.name || nameInput,
          phone: contact.phone || phoneInput,
          line1: addrState.line1,
          line2: addrState.line2,
          city: addrState.city,
          state: addrState.state,
          pincode: addrState.pincode,
          landmark: addrState.landmark,
        },
        delivery_method: deliveryMethod || 'standard',
        payment_method: 'cod',
        subtotal,
        discount_amt: discount,
        shipping_charge: shippingCharge,
        gst_amount: gstAmount,
        total_amount: total,
        coupon_code: useCartStore.getState().couponCode || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          product_name: item.product_name,
          variant_name: item.variant_name || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
          gst_rate: 18,
          image_url: item.image_url || null,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      // Success
      clearCart();
      setConfirmedOrder({
        id: data.order_id,
        number: data.order_number,
        total: data.total_amount || total,
        paymentMethod: 'Cash on Delivery (COD)',
        customerName: contact.name || nameInput,
        city: addrState.city,
        state: addrState.state,
        pincode: addrState.pincode,
      });

      setStep('success');
      toast.success('Your order has been placed successfully via Cash on Delivery!');
    } catch (err: any) {
      console.error('[Checkout] Order error:', err);
      toast.error(err.message || 'Something went wrong while placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Redirect if cart empty ──
  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory gap-4 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-beige/60 flex items-center justify-center text-taupe mb-2">
          <ShoppingBag size={28} />
        </div>
        <p className="font-heading text-2xl text-obsidian">Your cart is empty</p>
        <p className="text-xs font-body text-taupe max-w-xs">
          Explore our Ayurvedic and clinical skincare formulations to begin your ritual.
        </p>
        <Link href="/shop" className="btn-gold mt-2">
          Start Shopping
        </Link>
      </div>
    );
  }

  // ── SUCCESS SCREEN ──
  if (step === 'success' && confirmedOrder) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-card shadow-luxury max-w-lg w-full p-8 text-center border border-beige/60"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
            className="w-16 h-16 rounded-full bg-success-green/15 flex items-center justify-center mx-auto mb-4"
          >
            <Check size={32} className="text-success-green" />
          </motion.div>

          <h2 className="font-heading text-2xl text-obsidian mb-1">Order Confirmed!</h2>
          <p className="font-body text-taupe text-xs mb-5">
            Thank you for choosing LANAN. Your order has been placed via Cash on Delivery.
          </p>

          <div className="bg-ivory rounded-xl p-4 mb-5 border border-beige/60">
            <p className="text-[11px] font-body text-taupe uppercase tracking-wider mb-1">Order Number</p>
            <p className="font-mono text-lg font-bold text-gold tracking-wide">{confirmedOrder.number}</p>
          </div>

          <div className="bg-gold/5 rounded-xl p-4 mb-6 border border-gold/20 text-left space-y-2.5">
            <div className="flex justify-between items-center text-xs font-body">
              <span className="text-taupe">Payment Method:</span>
              <span className="font-semibold text-obsidian flex items-center gap-1.5">
                <Banknote size={14} className="text-gold" /> Cash on Delivery (COD)
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-body">
              <span className="text-taupe">Amount to Pay at Doorstep:</span>
              <span className="font-sans tabular-nums font-bold text-obsidian text-sm">
                {formatPrice(confirmedOrder.total)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-body">
              <span className="text-taupe">Estimated Delivery:</span>
              <span className="font-medium text-obsidian flex items-center gap-1">
                <Clock size={12} className="text-taupe" /> 3–5 Business Days
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-body">
              <span className="text-taupe">Shipping To:</span>
              <span className="font-medium text-obsidian text-right">
                {confirmedOrder.city}, {confirmedOrder.state} - {confirmedOrder.pincode}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-ivory text-[11px] font-body text-taupe mb-6 border border-beige/40">
            💡 Please keep <span className="font-bold text-obsidian">{formatPrice(confirmedOrder.total)}</span> ready in cash or UPI when the courier arrives.
          </div>

          <div className="flex flex-col gap-2.5">
            <Link href="/shop" className="btn-gold w-full justify-center">
              Continue Shopping
            </Link>
            <Link
              href="/account/orders"
              className="text-xs font-body text-taupe hover:text-gold transition-colors py-1"
            >
              View Order History
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="container-lanan py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/shop"
            className="flex items-center gap-2 text-xs font-body font-medium text-taupe hover:text-gold transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Shop
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7">
              <Image src="/lanan-logo.png" alt="LANAN Logo" fill sizes="28px" className="object-contain" />
            </div>
            <span className="font-heading text-lg tracking-widest text-obsidian">LANAN</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <StepIndicator currentStep={step} />
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 max-w-5xl mx-auto">
          {/* Left — Step Content */}
          <div className="bg-white rounded-card shadow-card p-6 lg:p-8 border border-beige/50">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: CONTACT ── */}
              {step === 'contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="font-heading text-xl text-obsidian mb-1">Contact Information</h2>
                  <p className="text-xs font-body text-taupe mb-6">
                    Enter your contact details for order and delivery notifications.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-body font-medium text-obsidian block mb-1.5">
                        Full Name <span className="text-error-red">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="input-luxury"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-body font-medium text-obsidian block mb-1.5">
                        Mobile Number <span className="text-error-red">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 rounded-xl border border-beige bg-ivory text-xs font-body font-medium text-taupe flex-shrink-0">
                          🇮🇳 +91
                        </div>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                          className="input-luxury flex-1 font-sans tabular-nums"
                        />
                      </div>
                      <p className="text-[10px] text-taupe font-body mt-1">
                        Our delivery associate will call this number prior to delivery.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-body font-medium text-obsidian block mb-1.5">
                        Email Address <span className="text-taupe font-normal">(optional)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="For digital invoice & tracking"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="input-luxury"
                      />
                    </div>
                  </div>

                  <button onClick={handleContactNext} className="btn-gold w-full justify-center mt-6">
                    Continue to Address <ArrowRight size={15} />
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2: ADDRESS ── */}
              {step === 'address' && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="font-heading text-xl text-obsidian mb-1">Shipping Address</h2>
                  <p className="text-xs font-body text-taupe mb-6">
                    Where should our courier deliver your LANAN order?
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-body font-medium text-obsidian block mb-1.5">
                        Flat / House / Building / Apartment <span className="text-error-red">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="House/Flat No., Building Name, Street"
                        value={addrState.line1}
                        onChange={(e) => setAddrState((s) => ({ ...s, line1: e.target.value }))}
                        className="input-luxury"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-body font-medium text-obsidian block mb-1.5">
                        Area / Locality / Sector
                      </label>
                      <input
                        type="text"
                        placeholder="Area, Colony, Sector (optional)"
                        value={addrState.line2}
                        onChange={(e) => setAddrState((s) => ({ ...s, line2: e.target.value }))}
                        className="input-luxury"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-body font-medium text-obsidian block mb-1.5">
                          City <span className="text-error-red">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="City"
                          value={addrState.city}
                          onChange={(e) => setAddrState((s) => ({ ...s, city: e.target.value }))}
                          className="input-luxury"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-body font-medium text-obsidian block mb-1.5">
                          Pincode <span className="text-error-red">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="6-digit pincode"
                          maxLength={6}
                          value={addrState.pincode}
                          onChange={(e) =>
                            setAddrState((s) => ({ ...s, pincode: e.target.value.replace(/\D/g, '') }))
                          }
                          className="input-luxury font-sans tabular-nums"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-body font-medium text-obsidian block mb-1.5">
                        State <span className="text-error-red">*</span>
                      </label>
                      <select
                        value={addrState.state}
                        onChange={(e) => setAddrState((s) => ({ ...s, state: e.target.value }))}
                        className="input-luxury appearance-none"
                      >
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-body font-medium text-obsidian block mb-1.5">Landmark</label>
                      <input
                        type="text"
                        placeholder="Near landmark (optional)"
                        value={addrState.landmark}
                        onChange={(e) => setAddrState((s) => ({ ...s, landmark: e.target.value }))}
                        className="input-luxury"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep('contact')} className="btn-outline-gold">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button onClick={handleAddressNext} className="btn-gold flex-1 justify-center">
                      Continue to Delivery <ArrowRight size={15} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: DELIVERY ── */}
              {step === 'delivery' && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="font-heading text-xl text-obsidian mb-1">Delivery Speed</h2>
                  <p className="text-xs font-body text-taupe mb-6">Select your preferred delivery speed.</p>

                  <div className="space-y-3">
                    {[
                      {
                        value: 'standard',
                        label: 'Standard Doorstep Delivery',
                        desc: '3–5 business days to your doorstep',
                        price: shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge),
                        badge: 'Cash on Delivery Available',
                      },
                      {
                        value: 'express',
                        label: 'Express Air Shipping',
                        desc: '1–2 business days',
                        price: '₹149',
                        badge: 'Coming Soon',
                      },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                          deliveryMethod === opt.value
                            ? 'border-gold bg-gold/5 shadow-xs cursor-pointer'
                            : opt.badge === 'Coming Soon'
                            ? 'border-beige opacity-50 cursor-not-allowed'
                            : 'border-beige hover:border-gold/40 cursor-pointer'
                        )}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={opt.value}
                          checked={deliveryMethod === opt.value}
                          onChange={() => opt.badge !== 'Coming Soon' && setDeliveryMethod(opt.value as any)}
                          disabled={opt.badge === 'Coming Soon'}
                          className="accent-gold w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-body font-semibold text-obsidian">{opt.label}</p>
                            {opt.badge && (
                              <span
                                className={cn(
                                  'text-[9px] px-2 py-0.5 rounded-full font-body font-semibold',
                                  opt.badge === 'Coming Soon'
                                    ? 'bg-beige text-taupe'
                                    : 'bg-gold/20 text-gold-dark border border-gold/30'
                                )}
                              >
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-taupe mt-0.5">{opt.desc}</p>
                        </div>
                        <span className="text-xs font-sans tabular-nums font-bold text-obsidian">
                          {opt.price}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep('address')} className="btn-outline-gold">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button onClick={() => setStep('payment')} className="btn-gold flex-1 justify-center">
                      Continue to Payment <ArrowRight size={15} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 4: PAYMENT (CASH ON DELIVERY ONLY) ── */}
              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-heading text-xl text-obsidian">Payment Method</h2>
                    <span className="badge-gold text-[10px] px-2.5 py-0.5">COD Exclusive</span>
                  </div>
                  <p className="text-xs font-body text-taupe mb-5">
                    We currently offer Cash on Delivery (COD) for maximum convenience and safety.
                  </p>

                  {/* Delivery destination card */}
                  <div className="bg-ivory rounded-xl p-4 mb-5 border border-beige/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-body text-taupe">Delivering to</p>
                        <p className="text-xs font-body font-semibold text-obsidian mt-0.5">
                          {addrState.city}, {addrState.state} - {addrState.pincode}
                        </p>
                        <p className="text-[11px] text-taupe line-clamp-1">{addrState.line1}</p>
                      </div>
                      <button
                        onClick={() => setStep('address')}
                        className="text-xs text-gold hover:underline font-semibold"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* COD Primary Option (Always Selected & Highlighted) */}
                  <div className="mb-4 p-4 rounded-xl border-2 border-gold bg-gold/5 shadow-xs relative">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-gold text-obsidian flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-xs font-body font-bold text-obsidian flex items-center gap-1.5">
                            <Banknote size={15} className="text-gold" /> Cash on Delivery (COD)
                          </p>
                          <span className="px-2 py-0.5 text-[9px] font-body font-bold bg-success-green/15 text-success-green border border-success-green/30 rounded-full">
                            Available for your pincode
                          </span>
                        </div>
                        <p className="text-[11px] font-body text-taupe mt-1 leading-relaxed">
                          Pay securely with cash or UPI directly to our delivery courier at your doorstep upon receiving the package.
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-gold/20 flex items-center gap-2 text-[10px] text-obsidian font-medium font-body">
                          <Sparkles size={11} className="text-gold" /> No advance payment needed • Inspect package on arrival
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Online Payment (Clearly Shown as Paused) */}
                  <div className="mb-6 p-4 rounded-xl border border-beige bg-beige/20 opacity-70">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full border border-taupe/40 flex items-center justify-center flex-shrink-0">
                        <span className="w-2 h-2 rounded-full bg-taupe/40" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-xs font-body font-semibold text-charcoal flex items-center gap-1.5">
                            <CreditCard size={14} className="text-taupe" /> Online Payment (UPI / Cards / NetBanking)
                          </p>
                          <span className="px-2 py-0.5 text-[9px] font-body font-medium bg-beige text-taupe rounded-full">
                            Temporarily Paused
                          </span>
                        </div>
                        <p className="text-[10px] font-body text-taupe mt-1">
                          Online payment gateways are currently undergoing routine maintenance. Please proceed with Cash on Delivery.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary on mobile */}
                  <div className="lg:hidden mb-6 p-4 rounded-xl bg-ivory border border-beige/60">
                    <div className="flex justify-between text-xs font-body mb-1">
                      <span className="text-taupe">Total Amount</span>
                      <span className="font-sans tabular-nums font-bold text-obsidian">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-body text-taupe">
                      <span>Payment Type</span>
                      <span className="font-medium text-obsidian">Cash on Delivery</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button onClick={() => setStep('delivery')} className="btn-outline-gold">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button
                      onClick={handlePlaceCodOrder}
                      disabled={loading || items.length === 0}
                      className={cn(
                        'btn-gold flex-1 justify-center py-4 text-xs font-semibold',
                        loading && 'opacity-70 cursor-not-allowed'
                      )}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
                          Placing Your COD Order...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Banknote size={16} />
                          Confirm Order (Cash on Delivery) — {formatPrice(total)}
                        </span>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] font-body text-taupe text-center mt-3">
                    By placing your order, you agree to LANAN's Terms & Conditions and Privacy Policy.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right — Order Summary (Desktop) */}
          <div className="hidden lg:block">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
