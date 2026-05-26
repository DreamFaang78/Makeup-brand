// Razorpay Standard Checkout global type declaration
// Loaded dynamically via <script src="https://checkout.razorpay.com/v1/checkout.js">
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: (data: any) => void): void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}
