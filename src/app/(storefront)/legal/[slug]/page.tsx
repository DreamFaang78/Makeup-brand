// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Legal Pages (Dynamic)
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

const LEGAL_CONTENT: Record<string, { title: string; lastUpdated: string; content: string }> = {
  'shipping-policy': {
    title: 'Shipping Policy',
    lastUpdated: 'May 2026',
    content: `
## Shipping Overview

LANAN ships across India. We partner with reputed courier services to ensure your skincare essentials arrive safely and on time.

## Processing Time

All orders are processed within 1-2 business days (excluding Sundays and national holidays). You will receive an email confirmation with tracking details once your order ships.

## Shipping Charges

- **Free Shipping**: Orders above ₹599 qualify for free standard shipping across India.
- **Standard Shipping**: ₹79 for orders below ₹599.
- **Express Shipping**: ₹149 — 1-2 business day delivery (selected pincodes, coming soon).

## Estimated Delivery Times

| Region | Estimated Delivery |
|--------|--------------------|
| Metro Cities (Delhi, Mumbai, Bangalore, Chennai) | 2-4 business days |
| Tier 2 Cities | 3-5 business days |
| Tier 3 Cities & Rural Areas | 5-7 business days |
| Northeast India, J&K, Andaman | 7-10 business days |

## Tracking Your Order

Once your order ships, you will receive:
1. An email with your tracking number and courier partner details.
2. SMS alerts at key delivery milestones.

You can also track your order in the **My Account → Orders** section.

## Business Address

Ma Tara Neelsarashwati (LANAN)  
Plot No 36A, Arazi No 1800BA, Sundar Nagar, Panki  
Kanpur, Uttar Pradesh - 208020  
Phone: +91 7630888521

## Contact

For shipping queries, email us at **support@lanan.in** or call **+91 7630888521** (Mon–Sat, 10 AM – 6 PM IST).
    `,
  },
  'return-refund-policy': {
    title: 'Return & Refund Policy',
    lastUpdated: 'May 2026',
    content: `
## Our Return Promise

At LANAN, we want you to love every product you receive. If you're not completely satisfied, we've made returns simple.

## Return Window

You can initiate a return within **7 days** of delivery for:
- Products received in damaged condition
- Wrong product delivered
- Products with manufacturing defects

## Non-Returnable Items

For hygiene and safety, the following cannot be returned:
- Opened or partially used products (unless defective)
- Products without original packaging
- Items marked as "Final Sale"

## How to Initiate a Return

1. Email **support@lanan.in** within 7 days of delivery
2. Include your Order ID and reason for return
3. Attach photos of the product and packaging
4. Our team will respond within 24-48 hours

## Refund Process

Once your return is received and inspected:
- **Approved refunds** are processed within 5-7 business days
- Refunds are credited to the original payment method
- UPI/Card refunds appear within 7-10 business days
- COD refunds are processed as bank transfers (NEFT) within 7-10 business days

## Exchange Policy

We currently offer exchanges for defective or wrong products only. Contact us at support@lanan.in.

## Contact

**Email**: support@lanan.in  
**Phone**: +91 7630888521 (Mon–Sat, 10 AM – 6 PM IST)
    `,
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    lastUpdated: 'May 2026',
    content: `
## Your Privacy Matters

Ma Tara Neelsarashwati (operating as LANAN) is committed to protecting your personal information. This policy describes how we collect, use, and protect your data.

## Information We Collect

**Personal Information:**
- Name, phone number, email address
- Shipping and billing address
- Order history and preferences

**Automatically Collected:**
- Device type, browser, IP address
- Pages visited, time spent on site
- Add-to-cart and purchase behavior (for improving user experience)

## How We Use Your Information

- Processing and fulfilling your orders
- Sending order confirmations and shipping updates
- Customer support communications
- Improving our website and product offerings
- Sending promotional emails (only if you opt in)
- Analytics to understand shopping patterns

## Data Security

- All payment information is handled by **Razorpay** (PCI-DSS compliant). We never store card numbers or CVV details.
- Your personal data is stored on secure, encrypted servers.
- We use industry-standard SSL/TLS encryption for all data in transit.

## Data Sharing

We do not sell your personal information. We may share data with:
- **Courier partners** (for delivery purposes)
- **Razorpay** (payment processing)
- **Email service providers** (transactional emails only)
- **Analytics providers** (anonymized data only)

## Your Rights

You have the right to:
- Access your personal data
- Request correction of inaccurate data
- Request deletion of your data
- Opt out of marketing communications

To exercise these rights, email **hello@lanan.in**.

## Cookies

We use essential cookies for site functionality and optional analytics cookies. You can manage cookie preferences in your browser settings.

## Contact

Ma Tara Neelsarashwati (LANAN)  
Plot No 36A, Arazi No 1800BA, Sundar Nagar, Panki  
Kanpur, Uttar Pradesh - 208020  
**Email**: hello@lanan.in
    `,
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    lastUpdated: 'May 2026',
    content: `
## Acceptance of Terms

By accessing and using the LANAN website (lanan.in), you agree to these Terms & Conditions. If you do not agree, please do not use our services.

## Products & Pricing

- All prices are in Indian Rupees (₹) inclusive of GST where applicable.
- Prices are subject to change without notice.
- Product images are for illustrative purposes; actual product may vary slightly.
- We reserve the right to limit quantities and cancel orders at our discretion.

## Orders & Payment

- Orders are confirmed only after successful payment verification.
- We accept UPI, Debit Cards, Credit Cards, Net Banking, and Wallets via Razorpay.
- In case of payment failure, your order will not be processed. No amount will be deducted.

## Product Use Disclaimer

- LANAN products are skincare formulations for personal use.
- Results may vary based on individual skin type and conditions.
- We do not make any medical or dermatological claims.
- Consult a dermatologist for specific skin conditions.
- Discontinue use if irritation occurs.

## Intellectual Property

All content on this website — including logos, product images, text, and design — is the property of Ma Tara Neelsarashwati (LANAN) and protected by copyright law.

## Limitation of Liability

LANAN shall not be liable for indirect, consequential, or punitive damages arising from the use of our products beyond the product value.

## Governing Law

These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Kanpur, Uttar Pradesh.

## Contact

**Email**: hello@lanan.in  
**Address**: Plot No 36A, Arazi No 1800BA, Sundar Nagar, Panki, Kanpur, UP - 208020
    `,
  },
  'cancellation-policy': {
    title: 'Cancellation Policy',
    lastUpdated: 'May 2026',
    content: `
## Order Cancellation

We understand plans change. Here's our cancellation policy:

## Before Shipment

- You can cancel your order **within 24 hours** of placing it, provided it hasn't been shipped.
- To cancel, email **support@lanan.in** with your Order ID.
- Full refund will be processed within 5-7 business days.

## After Shipment

- Once an order has been shipped, it cannot be cancelled.
- You may initiate a return after receiving the delivery under our Return Policy.

## COD Orders

- COD orders can be cancelled before dispatch at no charge.
- Repeated COD order refusals may result in COD being disabled for your account.

## Cancellation by LANAN

We reserve the right to cancel orders in case of:
- Product unavailability or out-of-stock situations
- Payment verification failure
- Incorrect pricing due to technical errors

In such cases, you will be notified and a full refund will be issued.

## Contact

**Email**: support@lanan.in  
**Phone**: +91 7630888521 (Mon–Sat, 10 AM – 6 PM IST)
    `,
  },
};

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = LEGAL_CONTENT[params.slug];
  if (!page) return { title: 'Legal | LANAN' };
  return {
    title: `${page.title} | LANAN`,
    description: `LANAN ${page.title} — Ma Tara Neelsarashwati. Updated ${page.lastUpdated}.`,
  };
}

export function generateStaticParams() {
  return Object.keys(LEGAL_CONTENT).map((slug) => ({ slug }));
}

function renderMarkdown(content: string) {
  const lines = content.trim().split('\n');
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-heading text-xl text-obsidian mt-8 mb-3">{line.slice(3)}</h2>);
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={i} className="font-body font-semibold text-obsidian text-sm mt-3">{line.slice(2, -2)}</p>);
    } else if (line.startsWith('- ')) {
      elements.push(<li key={i} className="font-body text-sm text-charcoal ml-4 list-disc">{line.slice(2)}</li>);
    } else if (line.startsWith('| ') && line.includes('|')) {
      // Simple table row
      const cells = line.split('|').filter(Boolean).map((c) => c.trim());
      if (cells[0] !== '---' && !cells[0].startsWith('-')) {
        elements.push(
          <div key={i} className="flex border-b border-beige">
            {cells.map((cell, j) => (
              <div key={j} className="flex-1 px-3 py-2 text-xs font-body text-charcoal">{cell}</div>
            ))}
          </div>
        );
      }
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else if (line.trim()) {
      elements.push(
        <p key={i} className="font-body text-sm text-charcoal leading-relaxed">
          {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold text-obsidian">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    }
    i++;
  }
  return elements;
}

export default function LegalPage({ params }: Props) {
  const page = LEGAL_CONTENT[params.slug];

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-heading text-2xl text-obsidian mb-2">Page not found</p>
          <Link href="/" className="btn-gold mt-4">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-hero border-b border-beige py-12">
        <div className="container-lanan">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-body text-taupe hover:text-gold transition-colors mb-5">
            <ArrowLeft size={13} /> Back to LANAN
          </Link>
          <h1 className="font-heading text-3xl lg:text-4xl text-obsidian font-light">{page.title}</h1>
          <p className="font-body text-xs text-taupe mt-2">Last updated: {page.lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container-lanan py-12">
        <div className="max-w-3xl mx-auto">
          <div className="prose-lanan space-y-2">
            {renderMarkdown(page.content)}
          </div>

          {/* Footer info */}
          <div className="mt-12 p-6 bg-ivory rounded-card border border-beige">
            <h3 className="font-body font-semibold text-sm text-obsidian mb-2">Legal Entity</h3>
            <p className="font-body text-xs text-taupe leading-relaxed">
              Ma Tara Neelsarashwati (Brand: LANAN)<br />
              Plot No 36A, Arazi No 1800BA, Sundar Nagar, Panki<br />
              Kanpur, Uttar Pradesh - 208020, India<br />
              Phone: +91 7630888521 | Email: hello@lanan.in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
