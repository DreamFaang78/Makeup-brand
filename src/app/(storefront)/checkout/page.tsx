'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Full Checkout Page (Multi-Step)
// Contact → Address → Delivery → Payment → Success
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight, Shield, Phone, MapPin, Truck, CreditCard } from 'lucide-react';
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
          <div className={cn(
            'flex flex-col items-center gap-1',
          )}>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-semibold transition-all duration-300',
              i < currentIndex ? 'bg-success-green text-white' :
                i === currentIndex ? 'bg-gold text-obsidian shadow-gold' :
                  'bg-beige text-taupe'
            )}>
              {i < currentIndex ? <Check size={12} /> : i + 1}
            </div>
            <span className={cn(
              'text-[9px] font-body whitespace-nowrap',
              i === currentIndex ? 'text-gold font-semibold' : 'text-taupe'
            )}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              'w-12 sm:w-20 h-px mx-1 mb-4 transition-all duration-500',
              i < currentIndex ? 'bg-success-green' : 'bg-beige'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Order Summary Sidebar ── */
function OrderSummary() {
  const { items, subtotal, shippingCharge, gstAmount, total, couponDiscount } = useCartStore();
  return (
    <div className="bg-ivory rounded-card p-5 sticky top-28">
      <h3 className="font-heading text-lg text-obsidian mb-4">Order Summary</h3>
      <div className="space-y-3 mb-4 max-h-56 overflow-y-auto scroll-hidden">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 items-center">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-beige flex-shrink-0">
              <Image src={item.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80&auto=format&fit=crop'} alt={item.product_name} width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-body font-medium text-obsidian line-clamp-1">{item.product_name}</p>
              {item.variant_name && <p className="text-[10px] text-taupe">{item.variant_name}</p>}
              <p className="text-xs font-mono text-taupe">× {item.quantity}</p>
            </div>
            <p className="text-xs font-mono font-medium text-obsidian flex-shrink-0">{formatPrice(item.unit_price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-beige pt-3 space-y-1.5">
        <div className="flex justify-between text-xs font-body text-taupe">
          <span>Subtotal</span><span className="font-mono">{formatPrice(subtotal)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-xs font-body text-success-green">
            <span>Discount</span><span className="font-mono">-{formatPrice(couponDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs font-body text-taupe">
          <span>Shipping</span>
          <span className="font-mono">{shippingCharge === 0 ? <span className="text-success-green">FREE</span> : formatPrice(shippingCharge)}</span>
        </div>
        <div className="flex justify-between text-xs font-body text-taupe">
          <span>GST (incl.)</span><span className="font-mono">{formatPrice(gstAmount)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold font-body text-obsidian pt-2 border-t border-beige">
          <span>Total</span><span className="font-mono">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs font-body text-taupe">
        <Shield size={11} className="text-gold" />
        Secured by Razorpay. 256-bit SSL encryption.
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN CHECKOUT COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function CheckoutPage() {
  const { step, setStep, contact, setContact, address, setAddress, deliveryMethod, setDeliveryMethod } = useCheckoutStore();
  const { items, total, subtotal, shippingCharge, gstAmount, couponDiscount, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{ id: string; number: string } | null>(null);

  // ── OTP State (Demo) ──
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  // ── Address State ──
  const [addrState, setAddrState] = useState({
    line1: '', line2: '', city: '', state: 'Uttar Pradesh', pincode: '', landmark: '',
  });

  const sendOTP = async () => {
    if (!/^\d{10}$/.test(phoneInput)) { toast.error('Enter valid 10-digit phone number'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setOtpSent(true);
    setLoading(false);
    toast.success(`OTP sent to +91 ${phoneInput} (Demo: use 1234)`);
  };

  const verifyOTP = async () => {
    if (otp !== '1234') { toast.error('Invalid OTP. Use 1234 for demo.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setOtpVerified(true);
    setLoading(false);
    toast.success('Phone verified!');
  };

  const handleContactNext = () => {
    if (!otpVerified) { toast.error('Please verify your phone number'); return; }
    if (!nameInput.trim()) { toast.error('Please enter your name'); return; }
    setContact({ phone: phoneInput, name: nameInput, email: emailInput });
    setStep('address');
  };

  const handleAddressNext = () => {
    if (!addrState.line1 || !addrState.city || !addrState.state || !addrState.pincode) {
      toast.error('Please fill all required fields'); return;
    }
    setAddress({ full_name: nameInput, phone: phoneInput, ...addrState });
    setStep('delivery');
  };

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // ── Step 1: Create Razorpay order on the server ──
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100) }), // paise
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        toast.error(err.error || 'Could not initiate payment. Please try again.');
        setLoading(false);
        return;
      }

      const { orderId, amount, currency } = await orderRes.json();

      // ── Step 2: Load Razorpay checkout.js if not already present ──
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.head.appendChild(script);
        });
      }

      // ── Step 3: Open Razorpay modal ──
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency,
        order_id: orderId,
        name: 'LANAN Skincare',
        description: `Order for ${contact.name || contact.phone}`,
        image: '/lanan logo.png',
        prefill: {
          name: contact.name || '',
          email: contact.email || '',
          contact: contact.phone ? `+91${contact.phone}` : '',
        },
        notes: {
          shipping_address: address ? `${address.line1}, ${address.city}, ${address.state} - ${address.pincode}` : '',
        },
        theme: { color: '#C9A96E' },

        // ── Payment success handler ──
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // ── Step 4: Verify signature on server & create DB order ──
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  phone: contact.phone,
                  email: contact.email || null,
                  full_name: contact.name || 'Lanan Customer',
                  guest_phone: contact.phone,
                  guest_email: contact.email || null,
                  shipping_address: address,
                  billing_address: address,
                  subtotal,
                  discount_amt: couponDiscount,
                  shipping_charge: shippingCharge,
                  gst_amount: gstAmount,
                  total_amount: total,
                  delivery_method: deliveryMethod,
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
                },
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.verified) {
              toast.error('Payment verification failed. Contact support with your payment ID: ' + response.razorpay_payment_id);
              setLoading(false);
              return;
            }

            // ── Step 5: Success ──
            clearCart();
            setConfirmedOrder({
              id: verifyData.db_order_id || response.razorpay_order_id,
              number: verifyData.order_number || `LAN${Date.now().toString().slice(-6)}`,
            });
            setStep('success');
          } catch (err) {
            console.error('Verify payment error:', err);
            toast.error('Payment received but order confirmation failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },

        // ── Modal dismissed ──
        modal: {
          ondismiss: () => {
            toast('Payment cancelled. Your cart is saved.');
            setLoading(false);
          },
        },
      });

      // Listen for payment failure inside the modal
      rzp.on('payment.failed', (failResponse: any) => {
        console.error('Razorpay payment failed:', failResponse.error);
        toast.error(`Payment failed: ${failResponse.error?.description || 'Please try again.'}`);
        setLoading(false);
      });

      rzp.open();

    } catch (err: any) {
      console.error('handlePayment error:', err);
      toast.error(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // ── Redirect if cart empty ──
  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory gap-4">
        <p className="font-heading text-2xl text-obsidian">Your cart is empty</p>
        <Link href="/shop" className="btn-gold">Start Shopping</Link>
      </div>
    );
  }

  // ── Success screen ──
  if (step === 'success' && confirmedOrder) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-card shadow-luxury max-w-md w-full p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-full bg-success-green/15 flex items-center justify-center mx-auto mb-5"
          >
            <Check size={32} className="text-success-green" />
          </motion.div>
          <h2 className="font-heading text-2xl text-obsidian mb-1">Order Confirmed!</h2>
          <p className="font-body text-taupe text-sm mb-4">Thank you for choosing LANAN. Your ritual is on its way.</p>

          <div className="bg-ivory rounded-xl p-4 mb-6">
            <p className="text-xs font-body text-taupe mb-1">Order Number</p>
            <p className="font-mono text-lg font-semibold text-gold">{confirmedOrder.number}</p>
          </div>

          <div className="text-left space-y-2 mb-6">
            {[
              { label: 'Payment', value: 'Successful' },
              { label: 'Delivery', value: '3-5 business days' },
              { label: 'Shipping to', value: address?.city ?? 'Your address' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-xs font-body">
                <span className="text-taupe">{item.label}</span>
                <span className="font-medium text-obsidian">{item.value}</span>
              </div>
            ))}
          </div>

          <p className="text-xs font-body text-taupe mb-5">
            📧 Confirmation sent to {contact.email || contact.phone}
          </p>

          <Link href="/shop" className="btn-gold w-full justify-center">
            Continue Shopping
          </Link>
          <Link href="/account/orders" className="block mt-2 text-xs font-body text-taupe hover:text-gold transition-colors">
            View My Orders
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="container-lanan py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/shop" className="flex items-center gap-2 text-sm font-body text-taupe hover:text-gold transition-colors">
            <ArrowLeft size={15} />
            Back to Shop
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7">
              <Image
                src="/lanan logo.png"
                alt="LANAN Logo"
                fill
                sizes="28px"
                className="object-contain"
              />
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
          <div className="bg-white rounded-card shadow-card p-6 lg:p-8">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: CONTACT ── */}
              {step === 'contact' && (
                <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-heading text-xl text-obsidian mb-1">Contact Details</h2>
                  <p className="text-xs font-body text-taupe mb-6">We'll send your order confirmation here.</p>

                  {/* Phone + OTP */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-body font-medium text-obsidian block mb-1.5">
                        Mobile Number <span className="text-error-red">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 rounded-xl border border-beige bg-ivory text-sm font-body text-taupe flex-shrink-0">
                          🇮🇳 +91
                        </div>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                          disabled={otpVerified}
                          className="input-luxury flex-1"
                        />
                        {!otpVerified && (
                          <button
                            onClick={sendOTP}
                            disabled={loading || phoneInput.length !== 10}
                            className={cn(
                              'px-4 rounded-xl text-xs font-body font-semibold transition-all whitespace-nowrap',
                              'bg-obsidian text-ivory hover:bg-charcoal',
                              (loading || phoneInput.length !== 10) && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            {loading ? '...' : otpSent ? 'Resend' : 'Send OTP'}
                          </button>
                        )}
                        {otpVerified && (
                          <div className="flex items-center gap-1 text-success-green text-xs font-body font-semibold px-3">
                            <Check size={13} /> Verified
                          </div>
                        )}
                      </div>
                    </div>

                    {/* OTP Input */}
                    {otpSent && !otpVerified && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="text-xs font-body font-medium text-obsidian block mb-1.5">
                          Enter OTP <span className="text-taupe font-normal">(Demo OTP: 1234)</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter 4-digit OTP"
                            maxLength={4}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="input-luxury flex-1 font-mono text-center text-lg tracking-[0.3em]"
                          />
                          <button
                            onClick={verifyOTP}
                            disabled={otp.length !== 4 || loading}
                            className={cn(
                              'px-5 rounded-xl text-xs font-body font-semibold bg-gold text-obsidian transition-all',
                              (otp.length !== 4 || loading) && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            Verify
                          </button>
                        </div>
                        <p className="text-[10px] font-body text-taupe mt-1">
                          OTP valid for 10 minutes. Didn't receive? <button className="text-gold underline">Resend</button>
                        </p>
                      </motion.div>
                    )}

                    {otpVerified && (
                      <>
                        <div>
                          <label className="text-xs font-body font-medium text-obsidian block mb-1.5">Full Name <span className="text-error-red">*</span></label>
                          <input type="text" placeholder="As on your address" value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="input-luxury" />
                        </div>
                        <div>
                          <label className="text-xs font-body font-medium text-obsidian block mb-1.5">Email Address <span className="text-taupe font-normal">(optional)</span></label>
                          <input type="email" placeholder="For order confirmation email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="input-luxury" />
                        </div>
                      </>
                    )}
                  </div>

                  <button onClick={handleContactNext} className="btn-gold w-full justify-center mt-6">
                    Continue to Address <ArrowRight size={15} />
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2: ADDRESS ── */}
              {step === 'address' && (
                <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-heading text-xl text-obsidian mb-1">Shipping Address</h2>
                  <p className="text-xs font-body text-taupe mb-6">Where should we deliver your order?</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-body font-medium text-obsidian block mb-1.5">Address Line 1 <span className="text-error-red">*</span></label>
                      <input type="text" placeholder="House/Flat No., Building, Street" value={addrState.line1} onChange={(e) => setAddrState((s) => ({ ...s, line1: e.target.value }))} className="input-luxury" />
                    </div>
                    <div>
                      <label className="text-xs font-body font-medium text-obsidian block mb-1.5">Address Line 2</label>
                      <input type="text" placeholder="Area, Colony, Locality" value={addrState.line2} onChange={(e) => setAddrState((s) => ({ ...s, line2: e.target.value }))} className="input-luxury" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-body font-medium text-obsidian block mb-1.5">City <span className="text-error-red">*</span></label>
                        <input type="text" placeholder="City" value={addrState.city} onChange={(e) => setAddrState((s) => ({ ...s, city: e.target.value }))} className="input-luxury" />
                      </div>
                      <div>
                        <label className="text-xs font-body font-medium text-obsidian block mb-1.5">Pincode <span className="text-error-red">*</span></label>
                        <input type="text" placeholder="6-digit pincode" maxLength={6} value={addrState.pincode} onChange={(e) => setAddrState((s) => ({ ...s, pincode: e.target.value.replace(/\D/g, '') }))} className="input-luxury font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-body font-medium text-obsidian block mb-1.5">State <span className="text-error-red">*</span></label>
                      <select value={addrState.state} onChange={(e) => setAddrState((s) => ({ ...s, state: e.target.value }))} className="input-luxury appearance-none">
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-body font-medium text-obsidian block mb-1.5">Landmark</label>
                      <input type="text" placeholder="Near landmark (optional)" value={addrState.landmark} onChange={(e) => setAddrState((s) => ({ ...s, landmark: e.target.value }))} className="input-luxury" />
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
                <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-heading text-xl text-obsidian mb-1">Delivery Option</h2>
                  <p className="text-xs font-body text-taupe mb-6">Choose your preferred delivery speed.</p>

                  <div className="space-y-3">
                    {[
                      { value: 'standard', label: 'Standard Delivery', desc: '3-5 business days', price: 'FREE above ₹599', badge: null },
                      { value: 'express', label: 'Express Delivery', desc: '1-2 business days', price: '₹149', badge: 'Coming Soon' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                          deliveryMethod === opt.value ? 'border-gold bg-gold/5' : 'border-beige hover:border-gold/40',
                          opt.badge && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={opt.value}
                          checked={deliveryMethod === opt.value}
                          onChange={() => !opt.badge && setDeliveryMethod(opt.value as any)}
                          disabled={!!opt.badge}
                          className="accent-gold"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-body font-medium text-obsidian">{opt.label}</p>
                            {opt.badge && <span className="badge-gold">{opt.badge}</span>}
                          </div>
                          <p className="text-xs text-taupe">{opt.desc}</p>
                        </div>
                        <span className="text-sm font-mono font-semibold text-gold">{opt.price}</span>
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

              {/* ── STEP 4: PAYMENT ── */}
              {step === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-heading text-xl text-obsidian mb-1">Payment</h2>
                  <p className="text-xs font-body text-taupe mb-6">Secured by Razorpay. Your card details are never stored.</p>

                  {/* Order summary mini */}
                  <div className="bg-ivory rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-body text-taupe">Delivering to</p>
                        <p className="text-xs font-body font-semibold text-obsidian">
                          {address?.city}, {address?.state} - {address?.pincode}
                        </p>
                      </div>
                      <button onClick={() => setStep('address')} className="text-xs text-gold hover:underline">Edit</button>
                    </div>
                  </div>

                  {/* Payment Methods (informational — Razorpay handles the actual modal) */}
                  <div className="mb-6">
                    <p className="text-xs font-body font-semibold text-obsidian mb-3">Accepted Payment Methods</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['UPI / GPay', 'Debit Card', 'Credit Card', 'Net Banking', 'Wallets', 'EMI'].map((m) => (
                        <div key={m} className="p-2.5 rounded-xl border border-beige text-center text-[10px] font-body text-taupe">
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COD Option */}
                  <div className="mb-6 p-4 rounded-xl border border-beige">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="accent-gold" disabled />
                      <div>
                        <p className="text-xs font-body font-medium text-charcoal">Cash on Delivery (COD)</p>
                        <p className="text-[10px] text-taupe">Currently unavailable for your pincode.</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep('delivery')} className="btn-outline-gold">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className={cn('btn-gold flex-1 justify-center py-4 text-sm', loading && 'opacity-70')}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <>
                          <Shield size={15} />
                          Pay {formatPrice(total)} Securely
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] font-body text-taupe text-center mt-3">
                    By placing order you agree to our Terms & Conditions and Privacy Policy.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right — Order Summary */}
          <div className="hidden lg:block">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
