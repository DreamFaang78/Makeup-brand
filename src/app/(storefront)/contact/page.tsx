'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Contact & Concierge Page
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail, Phone, MapPin, Clock, Send, CheckCircle2,
  Sparkles
} from 'lucide-react';
import { BRAND } from '@/lib/utils';
import { toast } from 'sonner';

const FAQ_ITEMS = [
  {
    q: 'How long does delivery take across India?',
    a: 'Orders are dispatched within 24 to 48 hours from our fulfillment hub. Metro cities typically receive delivery within 2–4 business days; non-metro locations take 4–6 business days. Express tracking updates are sent via SMS and email.',
  },
  {
    q: 'Is Cash on Delivery (COD) available?',
    a: 'Yes, Cash on Delivery is available across most serviceable pin codes throughout India. You can select Cash on Delivery at checkout.',
  },
  {
    q: 'What is LANAN’s return and refund policy?',
    a: 'We take immense pride in our formulations. If your parcel arrives damaged in transit, with defective pumps, leakage, or incorrect products, please submit a return request within 24 hours of verified courier delivery accompanied by continuous unboxing video evidence. Following verification, our concierge team will arrange a free replacement or initiate a full refund.',
  },
  {
    q: 'Can I cancel my order before it is dispatched?',
    a: 'Yes. You can cancel your order free of charge within 24 hours of placement, provided courier packaging and Air Waybill (AWB) generation have not yet occurred. Once dispatched and handed to logistics carriers, orders in transit cannot be cancelled.',
  },
  {
    q: 'Can I get personalized skincare consultation?',
    a: 'Absolutely. You can try our free AI Skin Analysis online, or reach out to our concierge team directly via WhatsApp or email for personalized routine advice.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat && ['general', 'cancellation', 'returns', 'order', 'consultation', 'press'].includes(cat)) {
        setFormData((prev) => ({ ...prev, subject: cat }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    if ((formData.subject === 'returns' || formData.subject === 'cancellation') && !formData.orderNumber.trim()) {
      toast.error('Please provide your Order ID for return or cancellation requests.');
      return;
    }

    setIsSubmitting(true);
    // Simulate inquiry dispatch / integration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Your request has been logged! Our concierge team will review your order records and respond within 24 business hours.');
  };

  return (
    <div className="min-h-screen bg-sand-50/40 pb-20">
      {/* ── Hero ── */}
      <section className="relative py-20 bg-gradient-hero overflow-hidden border-b border-gold/15">
        <div className="container-lanan relative z-10 text-center max-w-3xl mx-auto">
          <p className="section-label mb-3">Client Care & Concierge</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-obsidian font-light mb-4 tracking-tight">
            We Are Here To <span className="text-gradient-gold italic">Assist You</span>
          </h1>
          <p className="font-body text-taupe text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Whether you seek bespoke skincare guidance, order inquiries, or brand collaborations, our concierge is dedicated to your ritual.
          </p>
        </div>
      </section>

      {/* ── Main Contact Grid ── */}
      <div className="container-lanan mt-12">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct Info & Addresses (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-obsidian text-ivory rounded-2xl p-8 border border-gold/20 shadow-luxury relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl" />
              <h2 className="font-heading text-2xl text-gold mb-6 font-light">
                Direct Contact
              </h2>

              <div className="space-y-6 font-body text-sm">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0 text-gold">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gold/70 uppercase tracking-widest font-semibold mb-1">Phone & WhatsApp</p>
                    <a
                      href={`tel:+91${BRAND.phone}`}
                      className="text-ivory hover:text-gold transition-colors block text-base font-medium"
                    >
                      +91 {BRAND.phone}
                    </a>
                    <a
                      href={`https://wa.me/91${BRAND.phone}?text=Hi%20LANAN%20Skincare%2C%20I%20have%20an%20inquiry.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gold underline underline-offset-4 mt-1 inline-block hover:opacity-80"
                    >
                      Chat directly on WhatsApp →
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0 text-gold">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gold/70 uppercase tracking-widest font-semibold mb-1">Email Concierge</p>
                    <a
                      href={`mailto:${BRAND.email}`}
                      className="text-ivory hover:text-gold transition-colors block text-base font-medium"
                    >
                      {BRAND.email}
                    </a>
                    <a
                      href={`mailto:${BRAND.supportEmail}`}
                      className="text-xs text-ivory/60 hover:text-gold transition-colors block mt-0.5"
                    >
                      Support: {BRAND.supportEmail}
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0 text-gold">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gold/70 uppercase tracking-widest font-semibold mb-1">Concierge Hours</p>
                    <p className="text-ivory/90">Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
                    <p className="text-xs text-ivory/50 mt-0.5">Closed on Sundays & National Holidays</p>
                  </div>
                </div>

                {/* Registered Address */}
                <div className="flex items-start gap-4 pt-4 border-t border-gold/15">
                  <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0 text-gold">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gold/70 uppercase tracking-widest font-semibold mb-1">Fulfillment & Registered Office</p>
                    <p className="text-ivory font-medium mb-1">{BRAND.fullName} (LANAN)</p>
                    <p className="text-xs text-ivory/70 leading-relaxed">
                      {BRAND.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Skin Analysis Card */}
            <div className="bg-white rounded-2xl p-6 border border-gold/25 shadow-subtle flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-xs font-semibold mb-2">
                  <Sparkles size={12} /> Instant Routine Analysis
                </span>
                <h3 className="font-heading text-lg text-obsidian font-medium">Unsure which formulation is right for you?</h3>
                <p className="font-body text-xs text-taupe mt-1">
                  Take our 60-second AI Skin Scan for personalized product recommendations.
                </p>
              </div>
              <Link
                href="/skin-analysis"
                className="shrink-0 btn-gold text-xs px-4 py-2.5 rounded-pill"
              >
                Scan Now
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gold/20 shadow-subtle">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="font-heading text-2xl text-obsidian font-normal">Thank You for Connecting</h3>
                  <p className="font-body text-taupe text-sm max-w-md mx-auto leading-relaxed">
                    {formData.subject === 'returns'
                      ? 'Your return or replacement claim has been logged with our customer care desk. Please ensure your continuous unboxing video recording is sent to support@lanan.in or WhatsApp +91 9235170198 with your Order ID for verification. A specialist will review and respond within 24 business hours.'
                      : formData.subject === 'cancellation'
                      ? 'Your cancellation request has been logged. Our fulfillment team is verifying dispatch and AWB records to confirm eligibility. You will receive an official update within 24 business hours.'
                      : 'Your inquiry has been logged with our customer care desk. A skincare specialist will review your details and respond within 24 business hours.'}
                  </p>
                  <p className="text-xs text-taupe/80 italic">
                    Note: Requests are subject to verification and are not automatically approved upon form submission.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        orderNumber: '',
                        subject: 'general',
                        message: '',
                      });
                    }}
                    className="btn-outline-gold text-xs px-6 py-2.5 rounded-pill mt-4 inline-flex items-center gap-2 cursor-pointer"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="font-heading text-2xl sm:text-3xl text-obsidian font-light">
                      Send a Message to <span className="text-gradient-gold">LANAN</span>
                    </h2>
                    <p className="font-body text-xs sm:text-sm text-taupe mt-1">
                      Fill out the form below and our team will get back to you promptly.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium font-body text-charcoal mb-1.5">
                        Your Full Name <span className="text-gold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Radhika Sharma"
                        className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm font-body bg-sand-50/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium font-body text-charcoal mb-1.5">
                        Email Address <span className="text-gold">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. radhika@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm font-body bg-sand-50/30"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium font-body text-charcoal mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm font-body bg-sand-50/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium font-body text-charcoal mb-1.5">
                        Order ID {(formData.subject === 'returns' || formData.subject === 'cancellation') && <span className="text-gold">* (Required)</span>}
                      </label>
                      <input
                        type="text"
                        required={formData.subject === 'returns' || formData.subject === 'cancellation'}
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                        placeholder="e.g. LAN261014..."
                        className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm font-body bg-sand-50/30 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium font-body text-charcoal mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm font-body bg-sand-50/30 cursor-pointer"
                    >
                      <option value="general">General Skincare Inquiry</option>
                      <option value="returns">Return, Replacement or Damaged Item Claim</option>
                      <option value="cancellation">Order Cancellation (Pre-Dispatch)</option>
                      <option value="order">Order Tracking & Delivery Status</option>
                      <option value="consultation">Routine & Product Consultation</option>
                      <option value="press">Press, Collaborations & Partnerships</option>
                    </select>
                  </div>

                  {formData.subject === 'returns' && (
                    <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 text-xs font-body text-charcoal space-y-2">
                      <p className="font-semibold text-obsidian flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-gold" />
                        24-Hour Return Window & Video Evidence Guidance:
                      </p>
                      <p className="text-taupe leading-relaxed">
                        Under our approved policy, requests for transit damage, mechanical pump defects, leakage, or incorrect items must be initiated within <strong>24 hours</strong> of verified courier delivery.
                      </p>
                      <p className="text-taupe leading-relaxed">
                        <strong>Mandatory Video Evidence:</strong> A single, continuous unboxing video recording starting from the unopened package showing the courier label is required. Please paste a private link (Google Drive / iCloud / OneDrive) in the message below, or send the video file directly to WhatsApp Concierge at <strong>+91 9235170198</strong> or email <strong>support@lanan.in</strong> with your Order ID.
                      </p>
                    </div>
                  )}

                  {formData.subject === 'cancellation' && (
                    <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 text-xs font-body text-charcoal space-y-2">
                      <p className="font-semibold text-obsidian flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-gold" />
                        24-Hour Pre-Dispatch Cancellation Guidance:
                      </p>
                      <p className="text-taupe leading-relaxed">
                        Orders are eligible for cancellation within <strong>24 hours</strong> of placement, provided courier packaging and Air Waybill (AWB) generation have not yet occurred.
                      </p>
                      <p className="text-taupe leading-relaxed">
                        For fastest pre-dispatch cancellation, you can also message or call our concierge directly at <strong>+91 9235170198</strong>.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium font-body text-charcoal mb-1.5">
                      Your Message / Issue Description <span className="text-gold">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={
                        formData.subject === 'returns'
                          ? 'Please describe the issue (damage, defect, leak, or wrong item) and include any video link or mention if video was sent to WhatsApp/Email...'
                          : formData.subject === 'cancellation'
                          ? 'Please state the reason for order cancellation...'
                          : 'Please share your questions or feedback...'
                      }
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm font-body bg-sand-50/30 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-gold py-3.5 rounded-pill flex items-center justify-center gap-2 cursor-pointer font-medium tracking-wide disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
                        Transmitting...
                      </span>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Note to Concierge
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── Frequent Questions Accordion ── */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="section-label mb-2">Answers at a Glance</p>
            <h2 className="font-heading text-3xl text-obsidian font-light">
              Frequently Asked <span className="text-gradient-gold">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-gold/20 overflow-hidden shadow-subtle transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 font-body text-sm font-medium text-obsidian hover:text-gold transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <span className="text-gold font-mono text-lg shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm font-body text-taupe leading-relaxed border-t border-gold/10">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
