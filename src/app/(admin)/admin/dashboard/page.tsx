'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Admin Dashboard Overview
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Clock, CheckCircle, XCircle,
  RotateCcw, Package, Users, AlertTriangle, Eye, ArrowUp, ArrowDown,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import Link from 'next/link';

/* ── Demo analytics data ── */
const STATS = [
  { label: 'Revenue Today', value: '₹18,450', change: '+12.5%', up: true, icon: <TrendingUp size={18} />, color: 'text-success-green' },
  { label: 'Total Orders', value: '847', change: '+8.2%', up: true, icon: <ShoppingBag size={18} />, color: 'text-gold' },
  { label: 'Pending Orders', value: '23', change: '-3', up: false, icon: <Clock size={18} />, color: 'text-amber-500' },
  { label: 'Delivered Today', value: '156', change: '+22%', up: true, icon: <CheckCircle size={18} />, color: 'text-success-green' },
  { label: 'Failed Payments', value: '4', change: '-2', up: true, icon: <XCircle size={18} />, color: 'text-error-red' },
  { label: 'Returns', value: '7', change: '+1', up: false, icon: <RotateCcw size={18} />, color: 'text-taupe' },
  { label: 'Total Customers', value: '2,341', change: '+45 this week', up: true, icon: <Users size={18} />, color: 'text-gold' },
  { label: 'Cart Abandonment', value: '68%', change: '-3%', up: true, icon: <AlertTriangle size={18} />, color: 'text-amber-500' },
];

const RECENT_ORDERS = [
  { id: 'LAN260501A', customer: 'Priya S.', amount: 1998, status: 'delivered', payment: 'UPI', time: '2h ago' },
  { id: 'LAN260501B', customer: 'Anjali M.', amount: 899, status: 'processing', payment: 'Card', time: '3h ago' },
  { id: 'LAN260501C', customer: 'Kavita R.', amount: 2799, status: 'pending', payment: 'COD', time: '4h ago' },
  { id: 'LAN260501D', customer: 'Deepa J.', amount: 649, status: 'shipped', payment: 'UPI', time: '5h ago' },
  { id: 'LAN260501E', customer: 'Ritu G.', amount: 1599, status: 'delivered', payment: 'Card', time: '6h ago' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-gray-100 text-gray-700',
};

const LOW_STOCK = DEMO_PRODUCTS.filter((p) => {
  const minInv = Math.min(...p.variants.map((v) => v.inventory));
  return minInv <= 5;
});

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-obsidian">Dashboard</h1>
          <p className="text-xs font-body text-taupe mt-0.5">
            Sunday, 25 May 2026 · Last updated: just now
          </p>
        </div>
        <div className="flex gap-2">
          <select className="input-luxury text-xs py-2 pr-8">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.slice(0, 4).map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="admin-stat-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color} bg-current/10`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <span className={`text-xs font-body font-semibold flex items-center gap-0.5 ${stat.up ? 'text-success-green' : 'text-error-red'}`}>
                {stat.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                {stat.change}
              </span>
            </div>
            <p className="font-mono text-xl font-semibold text-obsidian">{stat.value}</p>
            <p className="text-xs font-body text-taupe mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.slice(4, 8).map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 4) * 0.06 }}
            className="admin-stat-card"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.color}`} style={{ background: 'rgba(0,0,0,0.05)' }}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div>
                <p className="font-mono text-lg font-semibold text-obsidian">{stat.value}</p>
                <p className="text-[10px] font-body text-taupe">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl2 shadow-card border border-beige/50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-beige">
            <h2 className="font-body font-semibold text-sm text-obsidian">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-gold hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-beige/50">
            {RECENT_ORDERS.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-ivory/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono font-medium text-obsidian">{order.id}</p>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-body font-semibold capitalize ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-body text-taupe">{order.customer} · {order.payment} · {order.time}</p>
                </div>
                <p className="font-mono text-xs font-semibold text-obsidian flex-shrink-0">{formatPrice(order.amount)}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl2 shadow-card border border-beige/50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-beige">
            <h2 className="font-body font-semibold text-sm text-obsidian flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" />
              Low Stock Alert
            </h2>
            <Link href="/admin/products" className="text-xs text-gold hover:underline">Manage</Link>
          </div>
          <div className="divide-y divide-beige/50">
            {DEMO_PRODUCTS.slice(0, 5).map((p) => {
              const minInv = Math.min(...p.variants.map((v) => v.inventory));
              return (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}/edit`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-ivory/50 transition-colors"
                >
                  <Package size={14} className={minInv <= 5 ? 'text-error-red' : 'text-taupe'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-body font-medium text-obsidian line-clamp-1">{p.name}</p>
                    <p className="text-[10px] font-body text-taupe">{p.variants[0]?.sku}</p>
                  </div>
                  <div className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-lg ${minInv <= 5 ? 'bg-error-red/10 text-error-red' : 'bg-amber-100 text-amber-700'}`}>
                    {minInv} left
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Conversion Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl2 shadow-card border border-beige/50 p-5"
      >
        <h2 className="font-body font-semibold text-sm text-obsidian mb-5">Conversion Funnel (Last 30 Days)</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Page Views', value: 12450, pct: 100 },
            { label: 'Product Views', value: 4820, pct: 38.7 },
            { label: 'Add to Cart', value: 1240, pct: 9.96 },
            { label: 'Checkout Started', value: 680, pct: 5.46 },
            { label: 'Orders Placed', value: 412, pct: 3.31 },
          ].map((step) => (
            <div key={step.label} className="text-center">
              <div className="relative h-20 bg-beige/50 rounded-xl overflow-hidden mb-2">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-gold rounded-b-xl transition-all"
                  style={{ height: `${step.pct}%` }}
                />
              </div>
              <p className="font-mono text-sm font-semibold text-obsidian">{step.value.toLocaleString('en-IN')}</p>
              <p className="text-[10px] font-body text-taupe">{step.label}</p>
              <p className="text-[10px] font-mono text-gold">{step.pct}%</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Add Product', href: '/admin/products/new', color: 'bg-gold/10 text-gold border-gold/20' },
          { label: 'Create Coupon', href: '/admin/coupons/new', color: 'bg-success-green/10 text-success-green border-success-green/20' },
          { label: 'New Banner', href: '/admin/banners', color: 'bg-taupe/10 text-taupe border-taupe/20' },
          { label: 'View Analytics', href: '/admin/analytics', color: 'bg-obsidian/5 text-obsidian border-obsidian/10' },
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
