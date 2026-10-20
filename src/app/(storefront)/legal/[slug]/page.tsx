// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Luxury Skincare Legal, Policies & Compliance Center
// Compliant with Indian Consumer Protection (E-Commerce) Rules 2020, IT Act 2000,
// SPDI Rules 2011, DPDP Act 2023, and Next.js 16 App Router.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Shield,
  Truck,
  RefreshCw,
  FileText,
  Ban,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import CookiePreferenceTrigger from '@/components/legal/CookiePreferenceTrigger';
import { BRAND } from '@/lib/utils';

interface PolicySection {
  id: string;
  number: string;
  title: string;
  content: string[];
  subsections?: Array<{
    title: string;
    items?: string[];
    paragraphs?: string[];
  }>;
  table?: {
    headers: string[];
    rows: string[][];
  };
  callout?: {
    type: 'info' | 'warning' | 'alert' | 'highlight';
    title: string;
    text: string;
  };
  hasCookieTrigger?: boolean;
}

interface PolicyDocument {
  title: string;
  slug: string;
  lastUpdated: string;
  effectiveDate: string;
  summary: string;
  intro: string;
  sections: PolicySection[];
  flaggedNotice?: string;
}

const POLICIES: Record<string, PolicyDocument> = {
  // ───────────────────────────────────────────────────────────────────────────
  // PART 1 — SHIPPING POLICY
  // ───────────────────────────────────────────────────────────────────────────
  'shipping-policy': {
    title: 'Shipping & Delivery Policy',
    slug: 'shipping-policy',
    lastUpdated: 'October 2026',
    effectiveDate: '1 October 2026',
    summary:
      'LANAN provides reliable doorstep delivery across India. Free standard shipping applies to orders ₹599 and above. Orders dispatch within 24–48 business hours.',
    intro:
      'At LANAN, we craft our skincare formulations with high-potency actives and delicate botanical extracts. We ensure every parcel is handled under temperature-controlled packaging standards and expedited safely to your doorstep anywhere in India.',
    flaggedNotice:
      'Business Configuration Note: Express 1–2 business day air delivery (₹149) is currently configured in checkout as "Coming Soon" for select metro pin codes. International shipping is currently in evaluation and not active.',
    sections: [
      {
        id: 'overview',
        number: '01',
        title: 'Shipping Policy Overview',
        content: [
          'This Shipping & Delivery Policy governs the dispatch and transit of all products ordered through the LANAN website (lanan.in / lvbrilanan.in) and its associated headless Shopify storefront.',
          'All shipments are packed at our primary fulfillment center under stringent hygiene and tamper-evident security procedures. LANAN operates under the registered legal entity Ma Tara Neelsarashwati.',
        ],
      },
      {
        id: 'locations-eligibility',
        number: '02',
        title: 'Locations Served & Delivery Eligibility',
        content: [
          'LANAN delivers to over 19,000+ postal PIN codes spanning all 28 States and 8 Union Territories across the Republic of India.',
          'We ship to verifiable physical residential and commercial addresses. We cannot ship to anonymous Post Office Boxes (P.O. Boxes) or military APO/FPO locations where physical courier signature verification is unsupported.',
          'Certain remote pin codes, special union territories (including Andaman & Nicobar Islands, Lakshadweep), and select border regions in Jammu & Kashmir or the Northeast may require additional transit days depending on regional accessibility.',
        ],
      },
      {
        id: 'processing-dispatch',
        number: '03',
        title: 'Order Processing & Dispatch Timelines',
        content: [
          'All confirmed orders are processed and handed over to our logistics partners within 24 to 48 business hours (Monday through Saturday, excluding Sundays and gazetted Indian national holidays).',
          'Orders received before 2:00 PM IST on a business day enter fulfillment queuing on the same day. Orders placed after 2:00 PM IST, on Sundays, or during public holidays will begin processing on the following business day.',
          'During high-volume festive seasons or nationwide sales events, processing may occasionally take up to 72 business hours. Any unexpected delay will be communicated to you directly via SMS or email.',
        ],
      },
      {
        id: 'delivery-timelines',
        number: '04',
        title: 'Estimated Delivery Timelines (When Estimates Begin)',
        content: [
          'Important Clarification: All estimated delivery timelines begin from the date and time of physical dispatch from our fulfillment hub (when an Air Waybill / AWB tracking number is generated), NOT from the time of order placement.',
          'Actual transit timelines vary based on your delivery PIN code and destination tier:',
        ],
        table: {
          headers: ['Destination Region', 'Estimated Transit Days (Post-Dispatch)', 'Eligible Courier Speed'],
          rows: [
            ['Metro Cities (Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Pune)', '2 to 4 Business Days', 'Standard Air & Surface'],
            ['Tier 2 Cities & State Capitals (Jaipur, Lucknow, Ahmedabad, Chandigarh, Kochi, etc.)', '3 to 5 Business Days', 'Standard Surface & Rail'],
            ['Tier 3 Cities, District Towns & Regional Areas', '4 to 7 Business Days', 'Standard Surface'],
            ['Northeast States, J&K, Himachal Pradesh, Uttarakhand & Island Territories', '7 to 10 Business Days', 'Special Regional Cargo'],
          ],
        },
        callout: {
          type: 'info',
          title: 'External Transit Delays',
          text: 'While we partner with tier-1 Indian courier networks, transit may occasionally be affected by adverse weather conditions, regional regulatory checkpoints, or logistics strikes beyond our immediate control. Our concierge actively tracks delayed parcels until safely delivered.',
        },
      },
      {
        id: 'shipping-charges',
        number: '05',
        title: 'Shipping Charges & Free-Shipping Eligibility',
        content: [
          'LANAN maintains complete pricing transparency. Our shipping charges are synchronized directly with our Shopify store configuration:',
        ],
        subsections: [
          {
            title: 'Standard Doorstep Delivery',
            items: [
              'Free Shipping: All domestic orders with a net subtotal of ₹599 and above qualify for 100% Free Standard Doorstep Delivery across India.',
              'Standard Delivery Fee: For orders with a net subtotal below ₹599, a flat shipping fee of ₹79 is applied at checkout.',
              'No Hidden Surcharges: The shipping fee displayed in your cart and order summary is final. We do not charge additional fuel surcharges or octroi handling fees.',
            ],
          },
          {
            title: 'Express Air Shipping (Coming Soon)',
            items: [
              'Express Air Shipping is configured at ₹149 for guaranteed 1–2 business day delivery in select metro pin codes. This feature is currently marked as "Coming Soon" in the checkout flow and will be activated once carrier pilot testing concludes.',
            ],
          },
        ],
      },
      {
        id: 'address-accuracy',
        number: '06',
        title: 'Address Accuracy & Address Changes',
        content: [
          'Customers are solely responsible for ensuring that the shipping address, contact phone number, landmark, and 6-digit PIN code provided during checkout are complete and accurate.',
          'Address Modifications: You may request an address correction only if your order has NOT yet been packed and dispatched. To request a modification, contact our concierge immediately via WhatsApp or phone at +91 9235170198 or email support@lanan.in.',
          'Once a package is handed over to the courier partner and an AWB is issued, the destination address cannot be modified in transit.',
        ],
      },
      {
        id: 'tracking-notifications',
        number: '07',
        title: 'Tracking Information & Delivery Notifications',
        content: [
          'As soon as your parcel is dispatched from our facility, you will receive an automated dispatch notification via SMS and email containing:',
          '1. The assigned courier partner name and official tracking link.',
          '2. Your unique Air Waybill (AWB) consignment tracking number.',
          '3. Estimated doorstep delivery arrival window.',
          'You can also check live order status at any time by logging into your account under My Account → Orders.',
        ],
      },
      {
        id: 'unsuccessful-deliveries',
        number: '08',
        title: 'Delayed, Unsuccessful or Returned Deliveries (RTO)',
        content: [
          'Our courier partners attempt delivery up to three (3) consecutive times before marking a parcel as non-deliverable.',
          'Prior to delivery, the courier executive typically makes phone or SMS contact. If the customer is unavailable, the parcel is held at the local delivery branch for 24–48 hours before being returned to our facility as Return to Origin (RTO).',
          'In case of an RTO caused by an incorrect address, non-responsiveness, or customer refusal at the doorstep, re-dispatch will require address re-verification and may incur an additional standard shipping fee of ₹79.',
        ],
      },
      {
        id: 'damaged-missing-shipments',
        number: '09',
        title: 'Incorrect, Damaged or Missing Shipments',
        content: [
          'All LANAN parcels are secured with custom tamper-evident security tape. If you notice that the outer cardboard box is crushed, punctured, damp, or the security seal is broken upon arrival, please photograph the parcel before accepting or opening it.',
          'Any transit damage, product leakage, or item discrepancy must be reported to support@lanan.in within 48 hours of delivery along with unboxing photographs.',
          'For complete replacement and refund steps, please consult our Return & Refund Policy.',
        ],
      },
      {
        id: 'customer-support',
        number: '10',
        title: 'Contacting Customer Support About Delivery',
        content: [
          'For any questions regarding order dispatch, transit updates, or delivery assistance, our dedicated concierge team is at your service:',
          'Email: support@lanan.in | hello@lanan.in',
          'Phone / WhatsApp: +91 9235170198 (Monday to Saturday, 10:00 AM – 6:00 PM IST)',
          'Registered Business Address: Ma Tara Neelsarashwati (LANAN), Plot No 36A, Arazi No 1800BA, Sundar Nagar, Panki, Kanpur, Uttar Pradesh - 208020, India.',
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // PART 2 — RETURN & REFUND POLICY
  // ───────────────────────────────────────────────────────────────────────────
  'return-refund-policy': {
    title: 'Return & Refund Policy',
    slug: 'return-refund-policy',
    lastUpdated: 'October 2026',
    effectiveDate: '1 October 2026',
    summary:
      'LANAN provides a 1-day return window from verified delivery for unopened and sealed skincare products, with mandatory unboxing video proof. Cash on Delivery refunds are processed via secure bank transfer (NEFT) or UPI.',
    intro:
      'Your satisfaction and skin well-being are paramount to LANAN. Because our products are high-performance skincare formulations designed for direct application to the skin, we uphold transparent, hygiene-compliant return standards under Indian consumer protection laws.',
    flaggedNotice:
      'Owner Policy Note: Standard return window is 1 calendar day (24 hours) from verified delivery for unopened, unused products; mandatory continuous unboxing video proof is required for transit damage, defects, or incorrect items. Reverse pickup is arranged where courier reverse logistics is operational.',
    sections: [
      {
        id: 'return-overview',
        number: '01',
        title: 'Return & Refund Overview',
        content: [
          'This Return & Refund Policy applies to all purchases made directly on the LANAN website (lanan.in / lvbrilanan.in).',
          'We take pride in the efficacy and luxury of our formulations. If you encounter any genuine issue with your order — including transit damage, manufacturing defects, or wrong items — we provide swift replacements or full refunds under the conditions detailed below.',
        ],
      },
      {
        id: 'eligible-products',
        number: '02',
        title: 'Products Eligible for Return',
        content: [
          'A return or replacement request must be initiated within one (1) calendar day (24 hours) of verified courier delivery under the following verifiable conditions:',
          '1. Damaged in Transit: Products delivered with broken glass containers, shattered droppers, leaked bottles, or damaged outer packaging.',
          '2. Manufacturing Defect: Non-functional dispensers, pump mechanisms that fail to dispense, or compromised factory seals.',
          '3. Incorrect Product Delivered: Product formula, variant, or size mismatching your verified order confirmation.',
          '4. Unopened & Unused Items: Products in original, untampered packaging with the outer shrink wrap, hologram, and batch labels completely intact.',
        ],
      },
      {
        id: 'non-returnable-items',
        number: '03',
        title: 'Products That Cannot Be Returned (Skincare Hygiene & Safety Rules)',
        content: [
          'Due to strict consumer health guidelines, cosmetic safety regulations, and formulation integrity under Indian law, the following items are strictly non-returnable and non-refundable:',
        ],
        subsections: [
          {
            title: 'Hygiene & Product Safety Restrictions',
            items: [
              'Opened or Used Skincare: Skincare formulations (including serums, cleansers, toners, moisturisers, and sunscreens) that have had their factory seal broken, pump primed, cap opened, or formula sampled cannot be returned for hygiene and public safety reasons.',
              'Tampered Packaging: Products returned without their original outer carton, batch code, MRP sticker, or security seal.',
              'Late Submissions: Return requests submitted after the expiration of the 1-day (24-hour) delivery window.',
              'Complimentary or Promotional Items: Free trial samples, promotional gifts, or clearance items marked as "Final Sale".',
            ],
          },
        ],
        callout: {
          type: 'warning',
          title: 'Skin Compatibility & Patch Testing',
          text: 'Because individual skin chemistry varies, an individual skin reaction or personal dislike of a botanical aroma or texture does not qualify as a manufacturing defect. Full ingredient lists are provided on every product page. We strongly recommend performing a 24-hour patch test before full facial application.',
        },
      },
      {
        id: 'damaged-defective-items',
        number: '04',
        title: 'Damaged, Defective, Incorrect or Missing Items Protocol',
        content: [
          'If your shipment arrives damaged, leaked, or missing an item, you must notify LANAN within 48 hours of delivery.',
          'Timely notification is essential because courier transit damage insurance claims must be filed within 48 hours of delivery scan.',
          'Upon verification, LANAN will dispatch a brand-new replacement parcel at zero additional charge. If the item is out of stock, a 100% full refund will be processed immediately.',
        ],
      },
      {
        id: 'how-to-request',
        number: '05',
        title: 'How Customers Request a Return (Step-by-Step)',
        content: [
          'To initiate a return or replacement, follow this streamlined process:',
          'Step 1: Send an email to support@lanan.in or message our WhatsApp concierge at +91 9235170198 within the eligible timeline.',
          'Step 2: Use the subject line: "Return Request - [Your Order Number]" (e.g. Return Request - LAN2605ABC).',
          'Step 3: State the reason for return and specify whether you prefer a replacement or refund.',
          'Step 4: Attach the photographic and video evidence detailed in Section 06 below.',
          'Step 5: Our quality concierge team will review your request and reply with return approval instructions within 24 to 48 business hours.',
        ],
      },
      {
        id: 'evidence-required',
        number: '06',
        title: 'Evidence & Documentation Required',
        content: [
          'To prevent fraudulent claims and ensure swift approval, the following documentation must be provided with your request:',
          '1. Photographs of the outer cardboard delivery box showing the printed courier shipping label and AWB number.',
          '2. Mandatory Continuous Unboxing Video: A clear, unbroken, unedited videograph showing the parcel from before the package seal is cut through the inspection of the damaged, defective, or incorrect item. Unboxing video proof is mandatory for transit damage or missing item claims.',
          '3. Clear photograph of the bottom or back of the product container displaying the Batch Number and Expiry Date.',
        ],
      },
      {
        id: 'reverse-pickup',
        number: '07',
        title: 'Return Collection & Shipping Instructions',
        content: [
          'Reverse Pickup: Once your return is approved, LANAN will schedule a courier reverse pickup from your delivery address at no cost to you for damaged or incorrect deliveries.',
          'Packing the Return: Secure the product in its original outer carton and ensure it is safely padded to prevent additional breakage during transit.',
          'Self-Ship Guidelines: If reverse courier pickup is temporarily unserviceable in your postal PIN code, our team will authorize you to dispatch the parcel via a reputable courier service (e.g. India Post Speed Post, Blue Dart, or Delhivery). Upon inspection at our warehouse, LANAN will reimburse your courier expense up to standard courier rates.',
        ],
      },
      {
        id: 'inspection-approval',
        number: '08',
        title: 'Quality Inspection & Approval Procedure',
        content: [
          'Returned items typically arrive at our fulfillment facility within 5 to 7 business days of pickup.',
          'Our quality control team inspects the returned parcel within 48 hours of arrival to verify that the item matches the approved claim and packaging conditions.',
          'Upon successful inspection, you will receive an official email confirmation confirming approval and initiation of your refund or replacement dispatch.',
        ],
      },
      {
        id: 'refund-timelines',
        number: '09',
        title: 'Refund Timelines & Original Payment Method',
        content: [
          'Refunds are processed promptly upon claim approval:',
          'Prepaid Online Orders: Refunds are credited back to the original source payment method (UPI, Debit/Credit Card, Net Banking) within 5 to 7 business days. Depending on your issuing bank, the credit may take 2 to 3 additional days to appear on your account statement.',
          'Processing Fees: LANAN does not deduct any payment processing penalty for approved refunds.',
        ],
      },
      {
        id: 'cod-refund-procedure',
        number: '10',
        title: 'Cash on Delivery (COD) Refund Procedure',
        content: [
          'Because Cash on Delivery (COD) payments are collected in physical cash or carrier-facilitated doorstep UPI by the logistics executive, funds cannot be returned in cash at your doorstep.',
          'COD Refund Flow: For approved COD returns, refunds are transferred directly into your verified Indian bank account via NEFT/IMPS or verified UPI ID.',
          'Banking Information Required: Our support team will request the following details via official email from support@lanan.in:',
          '- Account Holder Full Name (matching the order name)',
          '- Bank Name & Branch',
          '- Bank Account Number',
          '- Bank IFSC Code, OR Verified UPI ID (e.g. name@okhdfcbank)',
          'Timeline: COD bank transfers are initiated within 48 hours of receiving verified banking details and typically credit within 3 to 5 business days.',
        ],
      },
      {
        id: 'shipping-deductions',
        number: '11',
        title: 'Shipping Charges & Legitimate Deductions',
        content: [
          'Damaged, Defective or Incorrect Shipments: 100% full refund is issued, including any standard shipping charge paid at the time of purchase.',
          'Voluntary Return of Unopened Items: If an unopened, sealed item is returned voluntarily within the 1-day window, the original shipping charge (₹79 for orders under ₹599) is non-refundable, as it covers third-party courier dispatch expenses already incurred.',
        ],
      },
      {
        id: 'contact-refund',
        number: '12',
        title: 'Contact Information for Refund Assistance',
        content: [
          'For any assistance regarding an ongoing return, replacement, or refund status:',
          'Email: support@lanan.in | hello@lanan.in',
          'Phone / WhatsApp: +91 9235170198 (Monday to Saturday, 10:00 AM – 6:00 PM IST)',
          'Registered Address: Ma Tara Neelsarashwati (LANAN), Plot No 36A, Arazi No 1800BA, Sundar Nagar, Panki, Kanpur, Uttar Pradesh - 208020, India.',
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // PART 3 — PRIVACY POLICY
  // ───────────────────────────────────────────────────────────────────────────
  'privacy-policy': {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    lastUpdated: 'October 2026',
    effectiveDate: '1 October 2026',
    summary:
      'LANAN protects your personal information under the Information Technology Act 2000, SPDI Rules 2011, and the Digital Personal Data Protection Act 2023. We never sell your personal data.',
    intro:
      'Ma Tara Neelsarashwati (operating as LANAN) respects your privacy. This comprehensive Privacy Policy describes how we collect, process, store, and safeguard your personal information when you visit lanan.in, interact with our headless Shopify storefront, or communicate with our concierge.',
    flaggedNotice:
      'Legal & Compliance Notice: Drafted in accordance with Indian IT Act 2000, SPDI Rules 2011, and Digital Personal Data Protection (DPDP) Act 2023. Grievance Redressal Officer is officially designated under Indian law.',
    sections: [
      {
        id: 'statutory-framework',
        number: '01',
        title: 'Introduction & Statutory Scope',
        content: [
          'This Privacy Policy is published in compliance with Section 43A of the Information Technology Act, 2000; the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules); and the Digital Personal Data Protection Act, 2023 (DPDP Act).',
          'This policy governs all personal data collected through lanan.in, lvbrilanan.in, our mobile-responsive web applications, and customer support channels.',
        ],
      },
      {
        id: 'information-collected',
        number: '02',
        title: 'Information We Collect',
        content: [
          'We collect only the personal information necessary to deliver exceptional skincare products and services:',
        ],
        subsections: [
          {
            title: '1. Contact & Identification Information',
            items: [
              'Full Name, Mobile Phone Number, and Email Address.',
              'Delivery Address, Postal PIN Code, City, State, and landmark details for shipping.',
              'Billing address details where applicable.',
            ],
          },
          {
            title: '2. Order & Commerce Information',
            items: [
              'Products viewed, added to cart, or purchased.',
              'Order numbers, transaction dates, order values, and delivery tracking status.',
              'Selected payment method (e.g. Cash on Delivery or online gateway status). Note: LANAN does not store complete card numbers or banking passwords.',
            ],
          },
          {
            title: '3. Customer Service & Communications',
            items: [
              'Inquiries, emails, and WhatsApp messages exchanged with our concierge.',
              'Feedback, reviews, and survey submissions.',
            ],
          },
          {
            title: '4. Device & Technical Information',
            items: [
              'Internet Protocol (IP) address, operating system, browser type, and language.',
              'Pages visited, time spent on pages, referral links, and interaction telemetry.',
            ],
          },
        ],
      },
      {
        id: 'collection-methods',
        number: '03',
        title: 'How Information is Collected',
        content: [
          'Information is collected through three primary mechanisms:',
          '1. Direct Input: Information you provide when creating an account, entering checkout details, placing an order, filling out the contact form, or subscribing to our newsletter.',
          '2. Automated Technologies: Cookies, server logs, and web analytics that collect technical telemetry as you browse.',
          '3. Third-Party Integrations: Delivery status signals received from our logistics partners, and payment confirmation tokens from RBI-compliant payment gateways.',
        ],
      },
      {
        id: 'processing-purposes',
        number: '04',
        title: 'Purposes for Processing Customer Information',
        content: [
          'LANAN processes customer information for legitimate business and contractual purposes:',
          '- Order fulfillment: Packing, dispatching, and delivering your skincare orders.',
          '- Transactional updates: Sending order confirmations, dispatch alerts, and delivery OTPs via SMS and email.',
          '- Customer care: Addressing inquiries, return requests, and skincare routine recommendations.',
          '- Fraud prevention & security: Verifying Cash on Delivery orders to curb spurious orders and RTO fraud.',
          '- Statutory compliance: Maintaining financial, invoicing, and tax records mandated under Indian GST and company laws.',
          '- Marketing & news (Opt-In): Sending promotional newsletters and new launch announcements only where you have explicitly opted in.',
        ],
      },
      {
        id: 'shopify-commerce',
        number: '05',
        title: 'Shopify Commerce & Headless Architecture',
        content: [
          'LANAN operates a modern headless commerce architecture: our customer-facing web application is built on Next.js, while product catalog data and backend commerce operations interface securely with Shopify (Shopify Inc.).',
          'When you interact with the checkout flow, transaction data is transmitted securely to Shopify infrastructure under Shopify’s global security certifications (PCI-DSS Level 1 compliance).',
        ],
      },
      {
        id: 'payment-gateways',
        number: '06',
        title: 'Payment Processing & Cash on Delivery',
        content: [
          'Cash on Delivery (COD): Currently, Cash on Delivery is our primary active payment method. Delivery executives collect exact funds in physical cash or carrier-facilitated doorstep UPI upon parcel handover.',
          'Online Payment Processing (Razorpay): When online payments are enabled, transactions are handled by Razorpay Software Private Limited, an RBI-licensed payment aggregator.',
          'Critical Payment Security Standard: LANAN NEVER collects, captures, stores, or processes complete credit/debit card numbers, CVVs, expiry dates, or net banking passwords. All online card transactions are tokenized directly within the payment gateway’s PCI-DSS compliant vault.',
        ],
      },
      {
        id: 'hosting-infrastructure',
        number: '07',
        title: 'Website Hosting & Database Infrastructure',
        content: [
          'Hosting Services: Our web application is hosted on edge server infrastructure (Vercel) delivering fast, SSL-encrypted content.',
          'Database Services: User authentication and customer profile data are managed using Supabase (PostgreSQL), utilizing industry-standard Row Level Security (RLS) and encrypted database connections.',
          'Transactional Email Services: Transactional emails are dispatched via Resend over encrypted SMTP/API protocols.',
        ],
      },
      {
        id: 'ai-skin-analysis-disclosure',
        number: '08',
        title: 'AI Skin Analysis — Facial Photo Processing Disclosure',
        content: [
          'LANAN provides an optional AI Skin Analysis feature designed to offer cosmetic skincare routine suggestions.',
          'Explicit Consent: Image processing occurs only when a customer explicitly checks the consent box prior to uploading photos.',
          'Photo Transmission & External AI Provider: When you upload up to 4 close-up photos of your face, the images are securely transmitted via encrypted HTTPS to Google’s Generative AI API (Gemini Flash model) for visual cosmetic evaluation (analyzing visible indicators of oiliness, texture, tone, and hydration).',
          'Data Storage & Biometric Limitation: LANAN processes these photographs ephemerally in-memory solely to generate your personalized skincare routine recommendations. LANAN does not save your facial photographs to a permanent customer profile database. Google processes API requests under its Google Cloud Data Governance standards.',
          'Cosmetic Disclaimer: The AI Skin Analysis is an automated cosmetic guide for educational and beauty ritual recommendations. It is NOT a medical device, dermatological diagnosis, or biometric identification tool.',
        ],
      },
      {
        id: 'cookie-preferences-policy',
        number: '09',
        title: 'Cookies & Similar Technologies',
        content: [
          'We use cookies to maintain your shopping bag, preserve security tokens, and analyze site performance.',
          'Categories of cookies used:',
          '- Strictly Essential Cookies: Mandatory for website security, cart persistence, and checkout handoff.',
          '- Analytics Cookies: Aggregated performance metrics to improve site navigation and page speeds.',
          '- Marketing Cookies: Coordinates with our Meta Ads Pixel for personalized campaign attribution.',
          'You have full control over optional cookies at any time. Click the button below to review or update your choices:',
        ],
        hasCookieTrigger: true,
      },
      {
        id: 'meta-pixel-tracking',
        number: '10',
        title: 'Marketing, Analytics & Meta Ads Pixel',
        content: [
          'We utilize the Meta Ads Pixel (operated by Meta Platforms, Inc.) to understand user interactions and assess the performance of our advertising campaigns.',
          'Consent Synchronization: In compliance with modern data privacy standards, our Meta Pixel implementation synchronizes with your Cookie Preferences:',
          '- If you reject or withdraw marketing consent, Meta Pixel consent is revoked via fbq("consent", "revoke") and optional marketing events are suppressed.',
          '- PageView and tracking events do not execute without affirmative consent where required.',
          'You may change your marketing consent status at any time via our Cookie Preferences modal.',
        ],
      },
      {
        id: 'data-sharing',
        number: '11',
        title: 'Data Sharing with Service Providers',
        content: [
          'LANAN does NOT sell, rent, or trade your personal information to third-party data brokers under any circumstances.',
          'We disclose your data only to trusted service partners strictly necessary for store operations:',
          '- Logistics Partners: Courier networks (e.g. Delhivery, Blue Dart, Express logistics) receive your name, delivery address, phone number, and parcel contents for doorstep delivery.',
          '- Payment Aggregators: Razorpay receives transaction identifiers for secure payment processing.',
          '- Cloud & Communications Providers: Vercel, Supabase, and Resend for infrastructure and transactional notices.',
          '- Legal Mandate: We may disclose information if required to comply with a valid court order, government subpoena, or applicable Indian law enforcement directive.',
        ],
      },
      {
        id: 'data-retention',
        number: '12',
        title: 'Data Retention & Deletion',
        content: [
          'We retain order, billing, and accounting records for the statutory retention periods mandated under Indian tax laws (such as the Goods and Services Tax Act and Companies Act, typically up to 8 years).',
          'Marketing subscriber data is retained until you unsubscribe or request data deletion.',
          'You may request the deletion of non-statutory personal account data by sending an email to hello@lanan.in.',
        ],
      },
      {
        id: 'security-measures',
        number: '13',
        title: 'Security Safeguards & Limitations',
        content: [
          'We employ multi-layered technical safeguards including 256-bit SSL/TLS encryption for all data in transit, firewalls, and restricted database access controls.',
          'Limitations: While we take every commercially viable measure to secure customer data, no electronic transmission over the Internet or digital storage system can be guaranteed 100% impenetrable. We urge customers to safeguard their login credentials and OTPs.',
        ],
      },
      {
        id: 'customer-rights',
        number: '14',
        title: 'Customer Privacy Rights Under Indian Law',
        content: [
          'Under the Digital Personal Data Protection Act, 2023 and SPDI Rules 2011, you enjoy the following rights:',
          '- Right to Access: Request a summary of personal data held about you.',
          '- Right to Correction: Request correction or updating of inaccurate personal data.',
          '- Right to Erasure: Request deletion of data that is no longer required for statutory or contractual purposes.',
          '- Right to Withdraw Consent: Revoke consent for marketing communications or optional cookies at any time.',
          '- Right of Grievance Redressal: Lodge a privacy grievance with our designated Grievance Officer.',
        ],
      },
      {
        id: 'grievance-officer',
        number: '15',
        title: 'Statutory Grievance Redressal Officer',
        content: [
          'In accordance with Rule 5(9) of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 and Section 12 of the DPDP Act 2023, the details of our designated Grievance Officer are:',
          'Designation: Grievance Redressal Officer',
          'Legal Entity: Ma Tara Neelsarashwati (Brand: LANAN)',
          'Registered Office: Plot No 36A, Arazi No 1800BA, Sundar Nagar, Panki, Kanpur, Uttar Pradesh - 208020, India',
          'Email: hello@lanan.in | support@lanan.in',
          'Telephone: +91 9235170198 (Mon–Sat, 10:00 AM – 6:00 PM IST)',
          'Turnaround: All grievances are acknowledged within 48 business hours and resolved within 30 days as prescribed by law.',
        ],
      },
      {
        id: 'policy-updates',
        number: '16',
        title: 'Updates to This Privacy Policy',
        content: [
          'LANAN reserves the right to update this Privacy Policy periodically to reflect technological advancements, operational enhancements, or statutory amendments.',
          'The updated version will be indicated by the "Last Updated" date at the top of this document. Continued use of our website constitutes your acknowledgment of the updated policy.',
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // PART 5 — TERMS & CONDITIONS
  // ───────────────────────────────────────────────────────────────────────────
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    lastUpdated: 'October 2026',
    effectiveDate: '1 October 2026',
    summary:
      'These Terms & Conditions govern your access to the LANAN website and purchase of skincare products. Formulations are for personal cosmetic use. Governing law is Indian law with jurisdiction in Kanpur, UP.',
    intro:
      'Welcome to LANAN (lanan.in / lvbrilanan.in). These Terms & Conditions constitute a legally binding agreement between you and Ma Tara Neelsarashwati, operating under the brand name LANAN. By browsing our website, registering an account, or placing an order, you agree to comply with and be bound by these terms.',
    flaggedNotice:
      'Legal Review Notice: Standard terms drafted under Indian Contract Act 1872 and Consumer Protection (E-Commerce) Rules 2020. Specific corporate arbitration or jurisdiction clauses should be reviewed by company legal counsel upon corporate expansion.',
    sections: [
      {
        id: 'acceptance',
        number: '01',
        title: 'Introduction & Acceptance of Terms',
        content: [
          'By accessing, browsing, or utilizing the services provided on lanan.in, you acknowledge that you have read, understood, and agreed to be bound by these Terms & Conditions, together with our Privacy Policy, Shipping Policy, Return & Refund Policy, and Cancellation Policy.',
          'If you do not agree to all provisions contained herein, you must refrain from using this website or placing orders.',
        ],
      },
      {
        id: 'eligibility',
        number: '02',
        title: 'Eligibility to Use the Website',
        content: [
          'You must be at least 18 years of age and competent to enter into a legally binding contract under the Indian Contract Act, 1872.',
          'If you are under 18 years of age, you may browse the website or make purchases only under the active supervision of a parent or legal guardian who agrees to be bound by these terms.',
        ],
      },
      {
        id: 'product-info',
        number: '03',
        title: 'Product Information & Availability',
        content: [
          'LANAN offers luxury Indian skincare formulations crafted with dermatologically tested actives and natural botanical extracts (such as Glutathione, Niacinamide, Salicylic Acid, Hyaluronic Acid, and Ceramides).',
          'All products are subject to stock availability. We reserve the right to discontinue any product or modify formulations for quality enhancement without prior notice.',
          'We make reasonable efforts to display accurate ingredient lists, batch sizes, and usage directions on our product detail pages.',
        ],
      },
      {
        id: 'product-imagery',
        number: '04',
        title: 'Product Images & Colour Representation',
        content: [
          'We make every reasonable effort to display product containers, colors, and textures as accurately as possible.',
          'However, actual colors may vary slightly due to individual monitor display settings, lighting conditions during photography, and the natural chromatic variations inherent in plant-derived botanical extracts. Packaging design may also be periodically upgraded.',
        ],
      },
      {
        id: 'pricing-taxes',
        number: '05',
        title: 'Pricing, Taxes & Promotions',
        content: [
          'All prices displayed on the website are in Indian Rupees (INR / ₹) and are inclusive of applicable Goods and Services Tax (GST at 18%).',
          'Prices are subject to revision without prior notice. The price charged for an order will be the price in effect at the time the order is placed and confirmed.',
          'Promotional discount codes and coupons are valid only within their specified validity period and cannot be combined with conflicting offers unless explicitly stated.',
          'Pricing Errors: In the unlikely event that a product is listed at an incorrect price due to a technical error, LANAN reserves the right to cancel any unfulfilled orders placed at the erroneous price and issue an immediate full refund.',
        ],
      },
      {
        id: 'orders-acceptance',
        number: '06',
        title: 'Orders & Contract Acceptance Flow',
        content: [
          'Order Submission: Submitting an order through our checkout constitutes an offer to purchase the selected products.',
          'Contract Formation: An automated order confirmation email acknowledges receipt of your request, but does NOT constitute binding legal acceptance. A binding sales contract is formed only when your order is verified, packed, and physically dispatched from our fulfillment facility with an assigned courier AWB number.',
          'We reserve the right to limit order quantities per person or per household, and to decline or cancel orders suspected of commercial resale, arbitrage, or fraudulent activity.',
        ],
      },
      {
        id: 'payment-processing',
        number: '07',
        title: 'Payment Methods & Processing',
        content: [
          'Cash on Delivery (COD) is supported across serviceable domestic PIN codes.',
          'Online payments (UPI, Credit Cards, Debit Cards, Net Banking) are processed via RBI-licensed third-party payment aggregators (such as Razorpay).',
          'LANAN does NOT store your credit card, debit card, or net banking authentication credentials. All payment authorizations are governed by the terms of the respective payment aggregator and your issuing bank.',
        ],
      },
      {
        id: 'cod-conditions',
        number: '08',
        title: 'Cash on Delivery Conditions',
        content: [
          'Exact Payment: For COD orders, the exact invoice amount must be handed to the delivery executive in cash or carrier-facilitated doorstep UPI prior to taking custody of the parcel.',
          'No Open Box Delivery: Courier delivery executives are not permitted to unseal, open, or allow trial of the parcel before full payment is handed over.',
          'Abuse of COD Facility: Repeated refusal or willful failure to accept confirmed COD orders causes significant freight loss. LANAN reserves the right to disable Cash on Delivery for user accounts or delivery addresses exhibiting repeated RTO patterns.',
        ],
      },
      {
        id: 'shipping-delivery',
        number: '09',
        title: 'Shipping & Delivery',
        content: [
          'Shipping procedures, dispatch timelines, rates, and transit conditions are governed by our dedicated Shipping & Delivery Policy, which is incorporated into these Terms by reference.',
          'Risk of loss and title for all products pass to the customer upon delivery of the package by our logistics partner to the specified delivery address.',
        ],
      },
      {
        id: 'returns-cancellations',
        number: '10',
        title: 'Returns, Refunds & Cancellations',
        content: [
          'All return, replacement, refund, and cancellation requests are governed strictly by our Return & Refund Policy and Cancellation Policy.',
          'Skincare products that have been unsealed, opened, or used cannot be returned for hygiene and cosmetic safety reasons, except where verified transit damage or manufacturing defect is reported within 48 hours of delivery.',
        ],
      },
      {
        id: 'account-security',
        number: '11',
        title: 'Customer Accounts & Account Security',
        content: [
          'When you create a LANAN account, you are responsible for maintaining the confidentiality of your login credentials and for restricting access to your devices.',
          'You agree to accept responsibility for all activities that occur under your account. Notify our concierge immediately at hello@lanan.in if you suspect unauthorized access.',
        ],
      },
      {
        id: 'prohibited-conduct',
        number: '12',
        title: 'Website Use & Prohibited Conduct',
        content: [
          'You agree not to engage in any of the following prohibited activities:',
          '- Using any automated web scraper, spider, bot, or extraction script to scrape product data, images, or pricing without written authorization.',
          '- Attempting to probe, scan, or breach the security of our Next.js or Shopify infrastructure.',
          '- Introducing malicious code, viruses, Trojan horses, or corrupted files.',
          '- Misrepresenting your identity or providing fraudulent delivery details.',
        ],
      },
      {
        id: 'intellectual-property',
        number: '13',
        title: 'Intellectual Property & Brand Assets',
        content: [
          'All content on lanan.in — including brand names, logos, formulas, packaging designs, product descriptions, photography, graphics, and source code — is the exclusive intellectual property of Ma Tara Neelsarashwati (LANAN) and is protected by Indian copyright, trademark, and design laws.',
          'No part of this website may be reproduced, duplicated, republished, or exploited for commercial purposes without our express prior written consent.',
        ],
      },
      {
        id: 'customer-reviews',
        number: '14',
        title: 'Reviews & Customer-Submitted Content',
        content: [
          'By submitting product reviews, testimonials, or photographs, you grant LANAN a non-exclusive, royalty-free, perpetual license to use, display, and publish such content across our digital channels.',
          'Reviews must reflect genuine personal experiences and must not contain defamatory, abusive, or unlawful remarks.',
        ],
      },
      {
        id: 'cosmetic-disclaimer',
        number: '15',
        title: 'Cosmetic Guidance & Medical Disclaimer',
        content: [
          'LANAN skincare formulations are cosmetic products designed solely for personal aesthetic and skincare enhancement.',
          'We make no medical, therapeutic, or pharmaceutical claims. Our products are NOT intended to diagnose, treat, cure, or prevent any dermatological illness or medical condition.',
          'Always review the ingredient list for potential allergens and perform a 24-hour patch test before full use. If irritation occurs, discontinue use immediately and consult a qualified medical professional.',
        ],
      },
      {
        id: 'limitation-liability',
        number: '16',
        title: 'Limitation of Liability',
        content: [
          'To the fullest extent permitted by applicable Indian law, LANAN (Ma Tara Neelsarashwati), its proprietors, employees, and logistics partners shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use our products or website.',
          'In all events, LANAN’s aggregate liability shall be strictly limited to the net amount actually paid by you for the specific order giving rise to the claim.',
        ],
      },
      {
        id: 'governing-law',
        number: '17',
        title: 'Governing Law & Dispute Resolution',
        content: [
          'These Terms & Conditions shall be governed by, construed, and enforced in accordance with the laws of the Republic of India.',
          'Subject to applicable consumer rights under the Consumer Protection Act, 2019, any legal suit, action, or proceeding arising out of or related to these terms shall be instituted exclusively in the competent courts located in Kanpur, Uttar Pradesh, India.',
        ],
      },
      {
        id: 'contact-terms',
        number: '18',
        title: 'Official Entity Details & Contact Information',
        content: [
          'Legal Registered Entity: Ma Tara Neelsarashwati (Brand: LANAN)',
          'Registered Office Address: Plot No 36A, Arazi No 1800BA, Sundar Nagar, Panki, Kanpur, Uttar Pradesh - 208020, India',
          'Official Support Email: support@lanan.in | Corporate Inquiries: hello@lanan.in',
          'Phone / WhatsApp: +91 9235170198 (Mon–Sat, 10:00 AM – 6:00 PM IST)',
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // PART 6 — CANCELLATION POLICY
  // ───────────────────────────────────────────────────────────────────────────
  'cancellation-policy': {
    title: 'Cancellation Policy',
    slug: 'cancellation-policy',
    lastUpdated: 'October 2026',
    effectiveDate: '1 October 2026',
    summary:
      'Orders can be cancelled free of charge within 24 hours of placement provided the order has not been dispatched/assigned an AWB. Dispatched orders in transit cannot be intercepted and must follow our Return Policy.',
    intro:
      'We understand that beauty rituals and shopping plans can change. LANAN provides an honest, customer-centric cancellation workflow designed to accommodate changes before orders leave our fulfillment center.',
    flaggedNotice:
      'Operational 24-Hour Cutoff Note: Orders are eligible for cancellation within 24 hours of placement, provided courier packaging and Air Waybill (AWB) generation have not occurred. Once an AWB is issued and handed to the logistics carrier, orders are in transit and cannot be cancelled.',
    sections: [
      {
        id: 'cancellation-overview',
        number: '01',
        title: 'Cancellation Policy Overview',
        content: [
          'This Cancellation Policy governs the conditions under which an order placed on lanan.in may be cancelled by either the customer or LANAN.',
          'We strive to dispatch orders rapidly; therefore, the window for pre-dispatch cancellation is time-sensitive. Please review the cutoffs and procedures below.',
        ],
      },
      {
        id: 'pre-dispatch-cancellation',
        number: '02',
        title: 'Customer Cancellation Requests Before Dispatch',
        content: [
          'You may cancel your order free of charge within twenty-four (24) hours of placing the order, provided the parcel has not yet been assigned a courier Air Waybill (AWB) and handed over to our logistics partner.',
          'Prepaid Orders: If a prepaid order is cancelled prior to dispatch within the 24-hour window, a 100% full refund is initiated immediately with zero cancellation penalties.',
          'Cash on Delivery (COD) Orders: COD orders can be cancelled prior to dispatch within the 24-hour window at zero cost.',
        ],
      },
      {
        id: 'post-dispatch-cancellation',
        number: '03',
        title: 'Requests After Dispatch (In Transit)',
        content: [
          'Once an order has been packaged, assigned an Air Waybill (AWB) consignment tracking number, and handed to the logistics carrier, it is in physical transit and cannot be recalled or cancelled in our system.',
          'For COD Shipments: If you no longer wish to receive the parcel, you may decline the delivery when the courier executive arrives at your doorstep.',
          'For Prepaid Shipments: You may either refuse the delivery at your doorstep or accept the parcel and initiate a return of unopened items under our Return & Refund Policy.',
        ],
      },
      {
        id: 'delivered-orders',
        number: '04',
        title: 'Orders Already Delivered',
        content: [
          'Delivered orders cannot be cancelled under any circumstances.',
          'If you have received your order and wish to return an eligible, unopened skincare item, or if the product was received damaged in transit, please follow the guidelines in our Return & Refund Policy.',
        ],
      },
      {
        id: 'promotional-orders',
        number: '05',
        title: 'Promotional, Bundled & Discounted Orders',
        content: [
          'Orders placed using promotional discount codes or coupon vouchers may be cancelled before dispatch under standard rules.',
          'The refund amount will strictly equal the net amount actually paid after applying the promotional discount.',
          'Promotional discount codes may not be re-activated or re-issued if their validity period has expired.',
          'Bundled sets or multi-item promotions cannot be partially cancelled; the entire bundle must be cancelled together.',
        ],
      },
      {
        id: 'cancellation-by-lanan',
        number: '06',
        title: 'Cancellation Initiated by LANAN',
        content: [
          'LANAN reserves the right to cancel an order under rare operational circumstances:',
          '- Inventory Exhaustion: If a product is unexpectedly out of stock or fails our pre-dispatch quality inspection.',
          '- Unserviceable PIN Code: If our courier partners are unable to service the destination delivery PIN code.',
          '- Incomplete Address / Unreachable Customer: If the shipping address or phone number is invalid, and the customer does not respond to verification calls/messages.',
          '- Technical or Pricing Errors: If a technical glitch causes an incorrect price or promotional error to be applied.',
          'In every such case, the customer will be proactively notified via email/SMS, and any prepaid amount will be refunded in full within 24 to 48 business hours.',
        ],
      },
      {
        id: 'cod-cancellation-rules',
        number: '07',
        title: 'Cash on Delivery (COD) Cancellation Rules',
        content: [
          'We understand that emergencies arise; however, unaccepted COD shipments cause substantial two-way freight losses and carbon footprint waste.',
          'Customers are kindly requested to cancel COD orders prior to dispatch if plans change.',
          'Accounts with repeated unaccepted or refused COD deliveries may have the Cash on Delivery payment option temporarily suspended.',
        ],
      },
      {
        id: 'refund-handling',
        number: '08',
        title: 'Refund Handling for Cancelled Orders',
        content: [
          'For successfully cancelled prepaid orders, refunds are processed as follows:',
          'Initiation: The refund is triggered in our payment gateway within 24 to 48 business hours of cancellation confirmation.',
          'Credit Timeline: The refunded funds will reflect in your original payment method (bank account, card, or UPI) within 5 to 7 business days, depending on your bank’s processing schedule.',
          'No Deductions: No cancellation fee or processing penalty is deducted for pre-dispatch cancellations.',
        ],
      },
      {
        id: 'how-to-cancel-guide',
        number: '09',
        title: 'How to Submit a Cancellation Request (Step-by-Step)',
        content: [
          'To request a cancellation before dispatch:',
          'Option A (Fastest — WhatsApp / Phone): Message or call our concierge at +91 9235170198 with your Order ID and cancellation request.',
          'Option B (Email): Send an email to support@lanan.in with the subject line: "Order Cancellation - [Your Order ID]". State your Order ID and reason for cancellation.',
          'Our team will verify the dispatch status immediately and confirm cancellation if the parcel has not yet left the hub.',
        ],
      },
      {
        id: 'support-links',
        number: '10',
        title: 'Customer Concierge & Related Policies',
        content: [
          'For immediate assistance with any ongoing order:',
          'Email: support@lanan.in | hello@lanan.in',
          'Phone / WhatsApp: +91 9235170198 (Mon–Sat, 10:00 AM – 6:00 PM IST)',
          'Registered Office: Ma Tara Neelsarashwati (LANAN), Plot No 36A, Arazi No 1800BA, Sundar Nagar, Panki, Kanpur, Uttar Pradesh - 208020, India.',
        ],
      },
    ],
  },
};

const SIDEBAR_NAV = [
  { label: 'Shipping Policy', slug: 'shipping-policy', icon: <Truck size={14} /> },
  { label: 'Return & Refund Policy', slug: 'return-refund-policy', icon: <RefreshCw size={14} /> },
  { label: 'Privacy Policy', slug: 'privacy-policy', icon: <Shield size={14} /> },
  { label: 'Terms & Conditions', slug: 'terms-and-conditions', icon: <FileText size={14} /> },
  { label: 'Cancellation Policy', slug: 'cancellation-policy', icon: <Ban size={14} /> },
];

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];

  if (!policy) {
    return {
      title: 'Legal & Policies | LANAN',
      description: 'Official policies and customer support information for LANAN Skincare.',
    };
  }

  return {
    title: `${policy.title} | LANAN Skincare`,
    description: `${policy.summary} Official policy of Ma Tara Neelsarashwati (Brand: LANAN). Updated ${policy.lastUpdated}.`,
    alternates: {
      canonical: `https://lanan.in/legal/${policy.slug}`,
    },
    openGraph: {
      title: `${policy.title} | LANAN`,
      description: policy.summary,
      url: `https://lanan.in/legal/${policy.slug}`,
      siteName: 'LANAN',
      type: 'website',
    },
  };
}

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const policy = POLICIES[slug];

  if (!policy) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F7F0E7]/40 pb-20">
      {/* ── 1. Luxury Header Banner ── */}
      <section className="relative py-14 sm:py-18 bg-gradient-to-b from-[#090807] via-[#141210] to-[#090807] text-[#F7F0E7] border-b border-[#C9A45D]/20 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C9A45D]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#C9A45D]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container-lanan relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center flex-wrap gap-2 text-xs font-body text-[#F7F0E7]/60">
              <li>
                <Link href="/" className="hover:text-[#C9A45D] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight size={12} className="text-[#C9A45D]/60" />
              </li>
              <li>
                <Link href="/legal/terms-and-conditions" className="hover:text-[#C9A45D] transition-colors">
                  Legal
                </Link>
              </li>
              <li>
                <ChevronRight size={12} className="text-[#C9A45D]/60" />
              </li>
              <li className="text-[#C9A45D] font-medium" aria-current="page">
                {policy.title}
              </li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-body tracking-[0.2em] text-[#C9A45D] uppercase font-semibold mb-2">
                LANAN Trust & Compliance Center
              </p>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-[#F7F0E7] tracking-tight">
                {policy.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 self-start md:self-end bg-white/5 border border-[#C9A45D]/20 px-3.5 py-1.5 rounded-full text-xs font-body text-[#F7F0E7]/70">
              <Clock size={13} className="text-[#C9A45D]" />
              <span>Last Updated: <strong className="text-[#F7F0E7] font-semibold">{policy.lastUpdated}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Mobile Document Switcher (Tap Friendly) ── */}
      <div className="lg:hidden bg-[#090807] border-b border-[#C9A45D]/20 px-4 py-3 sticky top-[68px] z-30 shadow-md">
        <p className="text-[10px] uppercase tracking-widest text-[#C9A45D] font-body font-semibold mb-1.5">
          Select Policy Document
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scroll-hidden">
          {SIDEBAR_NAV.map((item) => {
            const isActive = item.slug === slug;
            return (
              <Link
                key={item.slug}
                href={`/legal/${item.slug}`}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-body transition-colors shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#C9A45D] text-[#090807] font-semibold'
                    : 'bg-white/10 text-[#F7F0E7]/70 hover:text-[#F7F0E7]'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 3. Main Content Grid ── */}
      <div className="container-lanan max-w-6xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Desktop Navigation Sidebar & Quick TOC */}
          <aside className="hidden lg:block sticky top-32 space-y-6">
            <div>
              <h3 className="font-body font-semibold text-xs text-[#885746] uppercase tracking-widest mb-3 px-2">
                Legal Documents
              </h3>
              <nav className="flex flex-col gap-1.5 bg-white p-2.5 rounded-2xl border border-[#E6D7C8] shadow-xs">
                {SIDEBAR_NAV.map((item) => {
                  const isActive = item.slug === slug;
                  return (
                    <Link
                      key={item.slug}
                      href={`/legal/${item.slug}`}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-body transition-all ${
                        isActive
                          ? 'bg-[#C9A45D]/15 text-[#A9813D] font-bold border-l-2 border-[#C9A45D] pl-2.5 shadow-xs'
                          : 'text-[#1E1B18]/70 hover:text-[#090807] hover:bg-[#F7F0E7]'
                      }`}
                    >
                      <span className={isActive ? 'text-[#C9A45D]' : 'text-[#885746]'}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Document Navigation (Table of Contents Jump Links) */}
            <div className="bg-white p-4 rounded-2xl border border-[#E6D7C8] shadow-xs">
              <h4 className="font-body font-semibold text-xs text-[#090807] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#C9A45D]" /> In This Policy
              </h4>
              <ul className="space-y-1.5 max-h-64 overflow-y-auto scroll-hidden pr-1">
                {policy.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-[11px] font-body text-[#885746] hover:text-[#A9813D] hover:underline transition-colors block line-clamp-1 py-0.5"
                    >
                      {section.number}. {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct Support Card in Sidebar */}
            <div className="bg-[#090807] text-[#F7F0E7] p-4 rounded-2xl border border-[#C9A45D]/30 shadow-md">
              <p className="text-[10px] text-[#C9A45D] uppercase tracking-widest font-semibold mb-1">
                Concierge Care
              </p>
              <p className="text-xs font-body text-[#F7F0E7]/80 leading-relaxed mb-3">
                Have questions about our policies or an existing order?
              </p>
              <a
                href={`tel:+91${BRAND.phone}`}
                className="btn-gold text-[11px] py-1.5 px-3 w-full justify-center flex items-center gap-1.5 mb-2"
              >
                <Phone size={12} /> Call Concierge
              </a>
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="text-[11px] font-body text-[#C9A45D] hover:underline block text-center"
              >
                {BRAND.supportEmail}
              </a>
            </div>
          </aside>

          {/* Right Column: Main Legal Content */}
          <main className="bg-white rounded-2xl border border-[#E6D7C8] p-6 sm:p-10 shadow-sm overflow-hidden">
            
            {/* Quick Summary Callout Box */}
            <div className="mb-8 p-5 rounded-2xl border border-[#C9A45D]/30 bg-[#C9A45D]/5 flex gap-3.5 items-start">
              <CheckCircle2 size={20} className="text-[#C9A45D] mt-0.5 shrink-0" />
              <div>
                <strong className="text-xs sm:text-sm font-body font-semibold text-[#090807] block mb-1">
                  Policy Summary & Key Takeaways
                </strong>
                <p className="text-xs font-body text-[#1E1B18]/80 leading-relaxed">
                  {policy.summary}
                </p>
              </div>
            </div>

            {/* Intro paragraph */}
            <p className="font-body text-sm sm:text-base text-[#1E1B18] leading-relaxed mb-8 pb-6 border-b border-[#E6D7C8]/60">
              {policy.intro}
            </p>

            {/* Notice Callout for business owners / legal flags */}
            {policy.flaggedNotice && (
              <div className="mb-8 p-4 rounded-xl border border-[#C9A45D]/40 bg-[#090807] text-[#F7F0E7] flex items-start gap-3 shadow-xs">
                <AlertCircle size={17} className="text-[#C9A45D] mt-0.5 shrink-0" />
                <p className="text-xs font-body text-[#F7F0E7]/80 leading-relaxed">
                  {policy.flaggedNotice}
                </p>
              </div>
            )}

            {/* Sections Loop */}
            <div className="space-y-10 divide-y divide-[#E6D7C8]/50">
              {policy.sections.map((section, idx) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={idx > 0 ? 'pt-8' : ''}
                >
                  {/* Heading */}
                  <div className="flex items-baseline gap-2.5 mb-3">
                    <span className="font-mono text-xs font-bold text-[#C9A45D]">
                      {section.number}
                    </span>
                    <h2 className="font-heading text-xl sm:text-2xl text-[#090807] font-normal">
                      {section.title}
                    </h2>
                  </div>

                  {/* Paragraphs */}
                  <div className="space-y-3 font-body text-xs sm:text-sm text-[#1E1B18]/90 leading-relaxed">
                    {section.content.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Subsections if present */}
                  {section.subsections && section.subsections.length > 0 && (
                    <div className="mt-5 space-y-4">
                      {section.subsections.map((sub, sIdx) => (
                        <div key={sIdx} className="bg-[#F7F0E7]/50 rounded-xl p-4 border border-[#E6D7C8]/70">
                          <h4 className="font-body font-semibold text-xs sm:text-sm text-[#090807] mb-2">
                            {sub.title}
                          </h4>
                          {sub.paragraphs?.map((sp, spIdx) => (
                            <p key={spIdx} className="font-body text-xs text-[#1E1B18]/80 leading-relaxed mb-2">
                              {sp}
                            </p>
                          ))}
                          {sub.items && (
                            <ul className="space-y-1.5 list-disc list-inside font-body text-xs text-[#1E1B18]/80">
                              {sub.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="leading-relaxed">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Data Table if present */}
                  {section.table && (
                    <div className="mt-5 overflow-x-auto rounded-xl border border-[#E6D7C8]">
                      <table className="w-full text-left border-collapse text-xs font-body">
                        <thead>
                          <tr className="bg-[#090807] text-[#F7F0E7]">
                            {section.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="p-3 font-medium text-xs">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E6D7C8]">
                          {section.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#F7F0E7]/40 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-3 text-[#1E1B18] font-normal">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Callout box if present */}
                  {section.callout && (
                    <div className="mt-5 p-4 rounded-xl border border-[#C9A45D]/30 bg-[#F7F0E7]/70 flex items-start gap-3">
                      <HelpCircle size={16} className="text-[#C9A45D] mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-xs font-body font-semibold text-[#090807] block mb-0.5">
                          {section.callout.title}
                        </strong>
                        <p className="text-xs font-body text-[#1E1B18]/80 leading-relaxed">
                          {section.callout.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Interactive Cookie Preference trigger if required */}
                  {section.hasCookieTrigger && (
                    <div className="mt-5 p-5 rounded-2xl bg-[#090807] text-[#F7F0E7] border border-[#C9A45D]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-heading text-lg text-[#F7F0E7] font-light">
                          Manage Your Cookie Choices
                        </h4>
                        <p className="font-body text-xs text-[#F7F0E7]/70 leading-relaxed mt-0.5">
                          You can review, modify, or revoke your consent for analytics and Meta Pixel tracking anytime.
                        </p>
                      </div>
                      <CookiePreferenceTrigger label="Open Cookie Preferences" />
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Cross-Policy Links Section */}
            <div className="mt-14 pt-8 border-t border-[#E6D7C8]">
              <h3 className="font-body font-semibold text-xs text-[#885746] uppercase tracking-wider mb-4">
                Explore Related Policies
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {SIDEBAR_NAV.filter((item) => item.slug !== slug).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/legal/${item.slug}`}
                    className="p-3.5 rounded-xl border border-[#E6D7C8] hover:border-[#C9A45D] bg-[#F7F0E7]/30 hover:bg-[#F7F0E7] transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#C9A45D]">{item.icon}</span>
                      <span className="text-xs font-body font-medium text-[#090807]">
                        {item.label}
                      </span>
                    </div>
                    <ArrowRight size={13} className="text-[#885746] group-hover:text-[#A9813D] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Official Registered Entity & Support Footer Card */}
            <div className="mt-10 p-6 sm:p-8 bg-[#090807] text-[#F7F0E7] rounded-2xl border border-[#C9A45D]/30 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] font-body text-[#C9A45D] uppercase tracking-widest font-semibold mb-1">
                    Registered Business Entity
                  </p>
                  <h4 className="font-heading text-xl text-[#F7F0E7] font-light">
                    {BRAND.fullName} (Brand: {BRAND.name})
                  </h4>
                  <div className="mt-3 space-y-1.5 text-xs font-body text-[#F7F0E7]/70">
                    <p className="flex items-start gap-2">
                      <MapPin size={13} className="text-[#C9A45D] mt-0.5 shrink-0" />
                      <span>{BRAND.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={13} className="text-[#C9A45D] shrink-0" />
                      <a href={`tel:+91${BRAND.phone}`} className="hover:text-[#C9A45D] transition-colors">
                        +91 {BRAND.phone} (Mon–Sat, 10:00 AM – 6:00 PM IST)
                      </a>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail size={13} className="text-[#C9A45D] shrink-0" />
                      <a href={`mailto:${BRAND.supportEmail}`} className="hover:text-[#C9A45D] transition-colors">
                        {BRAND.supportEmail} | {BRAND.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <Link
                    href="/contact"
                    className="btn-gold text-xs px-5 py-2.5 text-center whitespace-nowrap"
                  >
                    Contact Concierge
                  </Link>
                  <Link
                    href="/shop"
                    className="px-5 py-2.5 rounded-full border border-white/20 text-xs font-body text-[#F7F0E7]/80 hover:text-[#F7F0E7] hover:border-[#C9A45D] transition-colors text-center whitespace-nowrap"
                  >
                    Return to Shop
                  </Link>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
