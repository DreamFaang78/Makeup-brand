'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Admin Dashboard Overview (Live Data)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Clock, CheckCircle, XCircle,
  RotateCcw, Package, Users, AlertTriangle, ArrowUp, ArrowDown,
  RefreshCw, CheckCircle2, CreditCard, Banknote
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface OrderItem {
  id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string | null;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  subtotal: number;
  discount_amt: number;
  shipping_charge: number;
  total_amount: number;
  payment_method: string | null;
  payment_status: string;
  fulfillment_status: string;
  customer_id?: string | null;
  shipping_address: any;
  customer?: {
    full_name: string;
    phone: string | null;
    email: string | null;
  };
  items?: OrderItem[];
}

interface ProductVariant {
  id: string;
  sku?: string;
  name?: string;
  inventory: number;
  price?: number;
  sale_price?: number;
}

interface ProductImage {
  id?: string;
  url: string;
  alt_text?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  status: 'draft' | 'active' | 'archived';
  base_price: number;
  sale_price?: number;
  variants?: ProductVariant[];
  images?: ProductImage[];
  category?: {
    id?: string;
    name?: string;
    image_url?: string;
  };
}

interface Customer {
  id: string;
  full_name?: string;
  email?: string | null;
  phone?: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200/60',
  processing: 'bg-blue-100 text-blue-700 border-blue-200/50',
  shipped: 'bg-purple-100 text-purple-700 border-purple-200/50',
  delivered: 'bg-green-100 text-green-700 border-green-200/50',
  cancelled: 'bg-red-100 text-red-700 border-red-200/50',
  returned: 'bg-gray-100 text-gray-700 border-gray-200/50',
};

function formatTimeAgo(dateString?: string) {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'recently';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [todayStr, setTodayStr] = useState('');

  const loadData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const [ordersRes, productsRes, customersRes] = await Promise.allSettled([
        fetch('/api/admin/orders', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/admin/products', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/admin/customers', { cache: 'no-store' }).then((r) => r.json()),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders) {
        setOrders(ordersRes.value.orders);
      }
      if (productsRes.status === 'fulfilled' && productsRes.value?.products) {
        setProducts(productsRes.value.products);
      }
      if (customersRes.status === 'fulfilled' && customersRes.value?.customers) {
        setCustomers(customersRes.value.customers);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const d = new Date();
    setTodayStr(
      d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    );
    loadData();
  }, []);

  // Filter orders by timeRange
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      if (timeRange === 'all') return true;
      const d = new Date(order.created_at);
      if (isNaN(d.getTime())) return true;
      if (timeRange === 'today') {
        return d.toDateString() === now.toDateString();
      }
      if (timeRange === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= oneWeekAgo;
      }
      if (timeRange === 'month') {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return d >= oneMonthAgo;
      }
      return true;
    });
  }, [orders, timeRange]);

  // Financial and volume metrics
  const revenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.fulfillment_status !== 'cancelled' && o.payment_status !== 'failed')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  }, [filteredOrders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(
      (o) =>
        o.fulfillment_status === 'pending' ||
        (o.payment_status && o.payment_status.toLowerCase().includes('pending'))
    ).length;
  }, [orders]);

  const deliveredCount = useMemo(() => {
    return filteredOrders.filter((o) => o.fulfillment_status === 'delivered').length;
  }, [filteredOrders]);

  const cancelledCount = useMemo(() => {
    return filteredOrders.filter(
      (o) => o.fulfillment_status === 'cancelled' || o.payment_status === 'failed'
    ).length;
  }, [filteredOrders]);

  const returnsCount = useMemo(() => {
    return filteredOrders.filter((o) => o.fulfillment_status === 'returned').length;
  }, [filteredOrders]);

  const totalCustomersCount = useMemo(() => {
    if (customers.length > 0) return customers.length;
    const uniqueFromOrders = new Set(
      orders.map((o) => o.customer_id || o.shipping_address?.phone || o.customer?.phone).filter(Boolean)
    );
    return uniqueFromOrders.size;
  }, [customers, orders]);

  const aov = useMemo(() => {
    const validOrders = filteredOrders.filter((o) => o.fulfillment_status !== 'cancelled');
    return validOrders.length > 0 ? Math.round(revenue / validOrders.length) : 0;
  }, [filteredOrders, revenue]);

  // Inventory analysis
  const productsWithStock = useMemo(() => {
    return products.map((p) => {
      const variants = p.variants || [];
      const minInv =
        variants.length > 0
          ? Math.min(...variants.map((v) => Number(v.inventory) || 0))
          : 0;
      const sku = variants[0]?.sku || p.sku || 'N/A';
      const coverImg = p.images?.[0]?.url || p.category?.image_url;
      return {
        id: p.id,
        name: p.name,
        sku,
        inventory: minInv,
        isLow: minInv <= 20,
        status: p.status,
        imageUrl: coverImg,
      };
    });
  }, [products]);

  const lowStockCount = useMemo(() => {
    return productsWithStock.filter((p) => p.isLow).length;
  }, [productsWithStock]);

  // Payment Breakdown
  const paymentStats = useMemo(() => {
    const total = filteredOrders.length;
    if (total === 0) return { razorpay: 0, cod: 0, razorpayPct: 0, codPct: 0 };
    const razorpayCount = filteredOrders.filter((o) => (o.payment_method || '').toLowerCase().includes('razorpay')).length;
    const codCount = filteredOrders.filter((o) => (o.payment_method || '').toLowerCase().includes('cod')).length;
    return {
      razorpay: razorpayCount,
      cod: codCount,
      razorpayPct: Math.round((razorpayCount / total) * 100),
      codPct: Math.round((codCount / total) * 100),
    };
  }, [filteredOrders]);

  const timeLabel =
    timeRange === 'today'
      ? 'Today'
      : timeRange === 'week'
      ? 'This Week'
      : timeRange === 'month'
      ? 'This Month'
      : 'All Time';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-obsidian">Dashboard</h1>
          <p className="text-xs font-body text-taupe mt-0.5">
            {todayStr || 'Live Overview'} · Last updated: just now
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 border border-beige rounded-xl hover:bg-ivory text-taupe hover:text-obsidian transition-colors disabled:opacity-50"
            title="Refresh live metrics"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="input-luxury text-xs py-2 pr-8"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-success-green bg-success-green/10">
              <TrendingUp size={18} />
            </div>
            <span className="text-[10px] font-mono text-taupe uppercase tracking-wider">
              {timeLabel}
            </span>
          </div>
          <p className="font-mono text-xl font-semibold text-obsidian">
            {formatPrice(revenue)}
          </p>
          <p className="text-xs font-body text-taupe mt-0.5">Revenue ({timeLabel})</p>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-gold bg-gold/10">
              <ShoppingBag size={18} />
            </div>
            <span className="text-[10px] font-mono text-taupe uppercase tracking-wider">
              {timeLabel}
            </span>
          </div>
          <p className="font-mono text-xl font-semibold text-obsidian">
            {filteredOrders.length.toLocaleString('en-IN')}
          </p>
          <p className="text-xs font-body text-taupe mt-0.5">Total Orders</p>
        </motion.div>

        {/* Pending Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-amber-500 bg-amber-500/10">
              <Clock size={18} />
            </div>
            <span className="text-[10px] font-mono text-taupe uppercase tracking-wider">
              Queue
            </span>
          </div>
          <p className="font-mono text-xl font-semibold text-obsidian">
            {pendingOrdersCount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs font-body text-taupe mt-0.5">Pending Orders</p>
        </motion.div>

        {/* Delivered Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-success-green bg-success-green/10">
              <CheckCircle size={18} />
            </div>
            <span className="text-[10px] font-mono text-taupe uppercase tracking-wider">
              {timeLabel}
            </span>
          </div>
          <p className="font-mono text-xl font-semibold text-obsidian">
            {deliveredCount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs font-body text-taupe mt-0.5">Delivered</p>
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cancelled / Failed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="admin-stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-error-red bg-error-red/10">
              <XCircle size={16} />
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-obsidian">
                {cancelledCount.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] font-body text-taupe">Cancelled / Failed</p>
            </div>
          </div>
        </motion.div>

        {/* Returns */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="admin-stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-taupe bg-taupe/10">
              <RotateCcw size={16} />
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-obsidian">
                {returnsCount.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] font-body text-taupe">Returns</p>
            </div>
          </div>
        </motion.div>

        {/* Total Customers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="admin-stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-gold bg-gold/10">
              <Users size={16} />
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-obsidian">
                {totalCustomersCount.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] font-body text-taupe">Total Customers</p>
            </div>
          </div>
        </motion.div>

        {/* Average Order Value */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="admin-stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-gold bg-gold/10">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-obsidian">
                {formatPrice(aov)}
              </p>
              <p className="text-[10px] font-body text-taupe">Avg. Order Value</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Recent Orders & Catalog Stock */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-xl2 shadow-card border border-beige/50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-beige">
            <div className="flex items-center gap-2">
              <h2 className="font-body font-semibold text-sm text-obsidian">Recent Orders</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-ivory text-taupe border border-beige">
                {orders.length} total
              </span>
            </div>
            <Link href="/admin/orders" className="text-xs text-gold hover:underline font-medium">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center items-center text-taupe gap-2 text-xs">
              <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              Loading live orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 px-6 text-center text-taupe space-y-2">
              <ShoppingBag size={28} className="mx-auto text-taupe/40" />
              <p className="text-xs font-body font-medium text-obsidian">No customer orders yet</p>
              <p className="text-[11px] text-taupe max-w-xs mx-auto">
                Customer purchases placed on the storefront will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-beige/50">
              {orders.slice(0, 5).map((order) => {
                const customerName =
                  order.customer?.full_name ||
                  order.shipping_address?.full_name ||
                  'Customer';
                const paymentMethod = (order.payment_method || 'cod').toUpperCase();
                const timeAgo = formatTimeAgo(order.created_at);
                const statusKey = (order.fulfillment_status || 'pending').toLowerCase();
                const statusClass =
                  STATUS_COLORS[statusKey] || 'bg-gray-100 text-gray-700';

                return (
                  <Link
                    key={order.id}
                    href="/admin/orders"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-ivory/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono font-medium text-obsidian">
                          {order.order_number}
                        </p>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-body font-semibold capitalize border ${statusClass}`}
                        >
                          {order.fulfillment_status || 'pending'}
                        </span>
                      </div>
                      <p className="text-[10px] font-body text-taupe truncate mt-0.5">
                        {customerName} · {paymentMethod} · {timeAgo}
                      </p>
                    </div>
                    <p className="font-mono text-xs font-semibold text-obsidian flex-shrink-0">
                      {formatPrice(order.total_amount)}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Catalog Stock Status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl2 shadow-card border border-beige/50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-beige">
            <h2 className="font-body font-semibold text-sm text-obsidian flex items-center gap-1.5">
              {lowStockCount > 0 ? (
                <AlertTriangle size={14} className="text-amber-500" />
              ) : (
                <CheckCircle2 size={14} className="text-success-green" />
              )}
              Catalog Stock Status
            </h2>
            <Link href="/admin/products" className="text-xs text-gold hover:underline font-medium">
              Manage
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center items-center text-taupe gap-2 text-xs">
              <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              Checking inventory levels...
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 px-6 text-center text-taupe space-y-2">
              <Package size={28} className="mx-auto text-taupe/40" />
              <p className="text-xs font-body font-medium text-obsidian">No products found</p>
            </div>
          ) : (
            <div className="divide-y divide-beige/50">
              {productsWithStock.map((p) => {
                return (
                  <Link
                    key={p.id}
                    href="/admin/products"
                    className="flex items-center gap-3 px-5 py-3 hover:bg-ivory/50 transition-colors"
                  >
                    {p.imageUrl ? (
                      <div className="w-8 h-8 rounded-lg bg-ivory border border-beige/60 overflow-hidden relative flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-ivory border border-beige/60 flex items-center justify-center flex-shrink-0 text-taupe">
                        <Package size={14} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-body font-medium text-obsidian truncate">
                          {p.name}
                        </p>
                        {p.status === 'draft' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-taupe/15 text-taupe font-medium">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-taupe">{p.sku}</p>
                    </div>
                    <div
                      className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-lg flex-shrink-0 ${
                        p.isLow
                          ? 'bg-error-red/10 text-error-red border border-error-red/20'
                          : 'bg-success-green/10 text-success-green border border-success-green/20'
                      }`}
                    >
                      {p.inventory} left
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Order Status & Payment Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-white rounded-xl2 shadow-card border border-beige/50 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-body font-semibold text-sm text-obsidian flex items-center gap-2">
            <TrendingUp size={16} className="text-gold" />
            Storefront Order & Payment Distribution ({timeLabel})
          </h2>
          <span className="text-xs font-mono text-taupe">
            {filteredOrders.length} orders analyzed
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-6 text-center text-taupe space-y-1">
            <p className="text-xs font-body text-obsidian font-medium">No order activity in this period</p>
            <p className="text-[11px] text-taupe">
              When shoppers complete orders with Razorpay or COD, breakdown graphs will populate automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-ivory/60 border border-beige/60">
              <div className="flex items-center justify-between text-xs font-body mb-1">
                <span className="flex items-center gap-1.5 text-obsidian font-medium">
                  <CreditCard size={14} className="text-gold" /> Razorpay (Prepaid)
                </span>
                <span className="font-mono font-bold text-obsidian">{paymentStats.razorpay}</span>
              </div>
              <div className="h-2 bg-beige/40 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gold rounded-full transition-all duration-500"
                  style={{ width: `${paymentStats.razorpayPct}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-taupe mt-1.5">{paymentStats.razorpayPct}% of orders</p>
            </div>

            <div className="p-3.5 rounded-xl bg-ivory/60 border border-beige/60">
              <div className="flex items-center justify-between text-xs font-body mb-1">
                <span className="flex items-center gap-1.5 text-obsidian font-medium">
                  <Banknote size={14} className="text-gold" /> Cash on Delivery (COD)
                </span>
                <span className="font-mono font-bold text-obsidian">{paymentStats.cod}</span>
              </div>
              <div className="h-2 bg-beige/40 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-taupe rounded-full transition-all duration-500"
                  style={{ width: `${paymentStats.codPct}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-taupe mt-1.5">{paymentStats.codPct}% of orders</p>
            </div>

            <div className="p-3.5 rounded-xl bg-ivory/60 border border-beige/60">
              <div className="flex items-center justify-between text-xs font-body mb-1">
                <span className="flex items-center gap-1.5 text-obsidian font-medium">
                  <CheckCircle size={14} className="text-success-green" /> Delivered
                </span>
                <span className="font-mono font-bold text-obsidian">{deliveredCount}</span>
              </div>
              <div className="h-2 bg-beige/40 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-success-green rounded-full transition-all duration-500"
                  style={{
                    width: `${filteredOrders.length > 0 ? Math.round((deliveredCount / filteredOrders.length) * 100) : 0}%`,
                  }}
                />
              </div>
              <p className="text-[10px] font-mono text-taupe mt-1.5">
                {filteredOrders.length > 0 ? Math.round((deliveredCount / filteredOrders.length) * 100) : 0}% completion
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-ivory/60 border border-beige/60">
              <div className="flex items-center justify-between text-xs font-body mb-1">
                <span className="flex items-center gap-1.5 text-obsidian font-medium">
                  <Clock size={14} className="text-amber-500" /> Pending / Processing
                </span>
                <span className="font-mono font-bold text-obsidian">{pendingOrdersCount}</span>
              </div>
              <div className="h-2 bg-beige/40 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${orders.length > 0 ? Math.round((pendingOrdersCount / orders.length) * 100) : 0}%`,
                  }}
                />
              </div>
              <p className="text-[10px] font-mono text-taupe mt-1.5">
                {orders.length > 0 ? Math.round((pendingOrdersCount / orders.length) * 100) : 0}% queue ratio
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Add Skincare Product', href: '/admin/products', color: 'bg-gold/10 text-gold border-gold/20' },
          { label: 'Manage Coupons', href: '/admin/coupons', color: 'bg-success-green/10 text-success-green border-success-green/20' },
          { label: 'Announcement Bar', href: '/admin/banners', color: 'bg-taupe/10 text-taupe border-taupe/20' },
          { label: 'Analytics Console', href: '/admin/analytics', color: 'bg-obsidian/5 text-obsidian border-obsidian/10' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`p-4 rounded-xl border text-center text-sm font-body font-medium transition-all hover:shadow-card ${action.color}`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
