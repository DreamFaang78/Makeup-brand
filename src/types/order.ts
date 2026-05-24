// ─────────────────────────────────────────────────────────────────────────────
// LANAN Types — Order & Cart
// ─────────────────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | 'payment_pending'
  | 'payment_authorized'
  | 'payment_captured'
  | 'payment_failed'
  | 'payment_refunded'
  | 'cod_pending';

export type FulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentMethod = 'razorpay' | 'cod';
export type DeliveryMethod = 'standard' | 'express';

export interface ShippingAddress {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  gst_rate: number;
  image_url: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress | null;
  subtotal: number;
  discount_amt: number;
  shipping_charge: number;
  gst_amount: number;
  total_amount: number;
  coupon_code: string | null;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  courier_name: string | null;
  tracking_id: string | null;
  razorpay_order_id: string | null;
  notes: string | null;
  delivery_method: DeliveryMethod;
  estimated_delivery: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  product_slug: string;
  variant_name: string | null;
  image_url: string;
  unit_price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  coupon_code: string | null;
  coupon_discount: number;
  subtotal: number;
  shipping_charge: number;
  gst_amount: number;
  total: number;
}
