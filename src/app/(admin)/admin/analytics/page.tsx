'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Admin Analytics Console (Live Data)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, ShoppingBag, ArrowUpRight, ArrowDownRight,
  Package, RefreshCw, Smartphone, Monitor, Tablet, CreditCard, Banknote
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

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
  total_amount: number;
  payment_method: string | null;
  payment_status: string;
  fulfillment_status: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  status: string;
  base_price: number;
  variants?: Array<{
    sku?: string;
    inventory: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

  const loadData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const [ordersRes, productsRes] = await Promise.allSettled([
        fetch('/api/admin/orders', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/admin/products', { cache: 'no-store' }).then((r) => r.json()),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders) {
        setOrders(ordersRes.value.orders);
      }
      if (productsRes.status === 'fulfilled' && productsRes.value?.products) {
        setProducts(productsRes.value.products);
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter orders by timeRange
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return orders.filter((o) => {
      const d = new Date(o.created_at);
      if (isNaN(d.getTime())) return true;
      return d >= cutoff;
    });
  }, [orders, timeRange]);

  // Aggregate metrics
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.fulfillment_status !== 'cancelled' && o.payment_status !== 'failed')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  }, [filteredOrders]);

  const totalOrdersCount = filteredOrders.length;
  const aov = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Monthly Revenue Trend from actual orders
  const revenueTrendData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();

    interface MonthTrendItem {
      label: string;
      monthIndex: number;
      year: number;
      revenue: number;
      orders: number;
    }

    // Last 5 months
    const months: MonthTrendItem[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonthIdx - i);
      const mIdx = d.getMonth();
      const year = d.getFullYear();
      months.push({
        label: `${monthNames[mIdx]}`,
        monthIndex: mIdx,
        year,
        revenue: 0,
        orders: 0,
      });
    }

    orders.forEach((o) => {
      if (o.fulfillment_status === 'cancelled') return;
      const d = new Date(o.created_at);
      if (isNaN(d.getTime())) return;
      const m = d.getMonth();
      const y = d.getFullYear();
      const entry = months.find((item) => item.monthIndex === m && item.year === y);
      if (entry) {
        entry.revenue += Number(o.total_amount) || 0;
        entry.orders += 1;
      }
    });

    return months;
  }, [orders]);

  // Top products calculation from real order items
  const topProducts = useMemo(() => {
    const salesMap: Record<string, { sales: number; revenue: number }> = {};

    orders.forEach((o) => {
      if (o.fulfillment_status === 'cancelled') return;
      const items = o.items || o.order_items || [];
      items.forEach((item) => {
        const name = item.product_name || 'Skincare Item';
        if (!salesMap[name]) {
          salesMap[name] = { sales: 0, revenue: 0 };
        }
        salesMap[name].sales += Number(item.quantity) || 1;
        salesMap[name].revenue += Number(item.total_price || item.unit_price) || 0;
      });
    });

    return products.map((prod, idx) => {
      const record = salesMap[prod.name] || { sales: 0, revenue: 0 };
      const inventory = prod.variants?.[0]?.inventory ?? 100;
      return {
        rank: idx + 1,
        name: prod.name,
        sales: record.sales,
        revenue: record.revenue,
        stock: `${inventory} in stock`,
      };
    }).sort((a, b) => b.sales - a.sales || b.revenue - a.revenue);
  }, [orders, products]);

  // SVG Chart Calculation
  const svgWidth = 500;
  const svgHeight = 200;
  const padding = 30;
  const maxRevenue = Math.max(...revenueTrendData.map((d) => d.revenue), 1000);
  const points = revenueTrendData
    .map((d, index) => {
      const x = padding + (index * (svgWidth - padding * 2)) / (revenueTrendData.length - 1);
      const y = svgHeight - padding - (d.revenue * (svgHeight - padding * 2)) / maxRevenue;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-obsidian">Analytics Console</h1>
          <p className="text-xs font-body text-taupe mt-0.5">
            Real-time sales performance, live orders pipeline, and catalog diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 border border-beige rounded-xl hover:bg-ivory text-taupe hover:text-obsidian transition-colors disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-luxury text-xs py-2 pr-8 w-32"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-stat-card flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase font-body font-semibold text-taupe">Total Sales Revenue</p>
            <p className="font-mono text-xl font-bold text-obsidian mt-1">{formatPrice(totalRevenue)}</p>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-taupe font-body">Captured transactions</span>
          </div>
        </div>

        <div className="admin-stat-card flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase font-body font-semibold text-taupe">Total Orders</p>
            <p className="font-mono text-xl font-bold text-obsidian mt-1">{totalOrdersCount}</p>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-taupe font-body">In selected period</span>
          </div>
        </div>

        <div className="admin-stat-card flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase font-body font-semibold text-taupe">Average Order Value</p>
            <p className="font-mono text-xl font-bold text-obsidian mt-1">{formatPrice(aov)}</p>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-taupe font-body">Per customer order</span>
          </div>
        </div>

        <div className="admin-stat-card flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase font-body font-semibold text-taupe">Catalog Products</p>
            <p className="font-mono text-xl font-bold text-obsidian mt-1">{products.length}</p>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-success-green font-body font-medium">Active in store</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-5 rounded-xl border border-beige/50 shadow-card space-y-4">
          <h2 className="font-body font-semibold text-sm text-obsidian flex items-center gap-1.5">
            <TrendingUp size={15} className="text-gold" /> Sales Revenue Trend (YTD)
          </h2>

          <div className="relative w-full overflow-hidden flex items-center justify-center p-2 bg-ivory/10 border border-beige/30 rounded-lg">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#E8D8CA" strokeDasharray="3" strokeWidth="0.5" />
              <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="#E8D8CA" strokeDasharray="3" strokeWidth="0.5" />
              <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#E8D8CA" strokeWidth="0.5" />

              {/* Spark Line */}
              <polyline
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />

              {/* Data points */}
              {revenueTrendData.map((d, index) => {
                const x = padding + (index * (svgWidth - padding * 2)) / (revenueTrendData.length - 1);
                const y = svgHeight - padding - (d.revenue * (svgHeight - padding * 2)) / maxRevenue;
                return (
                  <g key={index} className="group cursor-pointer">
                    <circle cx={x} cy={y} r="4" fill="#0A0A0A" stroke="#C9A96E" strokeWidth="1.5" />
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      className="text-[9px] font-mono font-bold fill-obsidian bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {formatPrice(d.revenue)}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {revenueTrendData.map((d, index) => {
                const x = padding + (index * (svgWidth - padding * 2)) / (revenueTrendData.length - 1);
                return (
                  <text key={index} x={x} y={svgHeight - 10} textAnchor="middle" className="text-[9px] font-body fill-taupe font-medium">
                    {d.label}
                  </text>
                );
              })}

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C9A96E" />
                  <stop offset="100%" stopColor="#A8813D" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] font-body text-taupe pt-1">
            <span>YTD Revenue: {formatPrice(orders.reduce((sum, o) => sum + (o.fulfillment_status !== 'cancelled' ? Number(o.total_amount) || 0 : 0), 0))}</span>
            <span>{orders.length} total orders recorded</span>
          </div>
        </div>

        {/* Order Fulfillment Status */}
        <div className="bg-white p-5 rounded-xl border border-beige/50 shadow-card space-y-4">
          <h2 className="font-body font-semibold text-sm text-obsidian flex items-center gap-1.5">
            <ShoppingBag size={15} className="text-gold" /> Storefront Fulfillment Status
          </h2>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-taupe text-xs font-body">
              No orders recorded yet to evaluate fulfillment.
            </div>
          ) : (
            <div className="space-y-4 font-body pt-2">
              {[
                {
                  label: 'Delivered Orders',
                  count: orders.filter((o) => o.fulfillment_status === 'delivered').length,
                  color: 'bg-success-green',
                },
                {
                  label: 'Pending / Processing',
                  count: orders.filter((o) => o.fulfillment_status === 'pending' || o.fulfillment_status === 'processing').length,
                  color: 'bg-amber-500',
                },
                {
                  label: 'Shipped / In Transit',
                  count: orders.filter((o) => o.fulfillment_status === 'shipped').length,
                  color: 'bg-blue-500',
                },
                {
                  label: 'Cancelled / Returned',
                  count: orders.filter((o) => o.fulfillment_status === 'cancelled' || o.fulfillment_status === 'returned').length,
                  color: 'bg-error-red',
                },
              ].map((step, idx) => {
                const pct = orders.length > 0 ? Math.round((step.count / orders.length) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-obsidian">{step.label}</span>
                      <span className="font-mono text-taupe">{step.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-ivory rounded-full overflow-hidden border border-beige/40">
                      <div
                        className={`h-full ${step.color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top selling products table */}
      <div className="bg-white p-5 rounded-xl border border-beige/50 shadow-card space-y-4">
        <h2 className="font-body font-semibold text-sm text-obsidian">Product Catalog Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-body">
            <thead>
              <tr className="bg-ivory/50 text-taupe border-b border-beige/60">
                <th className="py-2.5 px-4 font-semibold">Rank</th>
                <th className="py-2.5 px-4 font-semibold">Product Name</th>
                <th className="py-2.5 px-4 font-semibold text-center">Units Sold</th>
                <th className="py-2.5 px-4 font-semibold">Total Revenue</th>
                <th className="py-2.5 px-4 text-right font-semibold">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige/30">
              {topProducts.map((prod) => (
                <tr key={prod.rank} className="hover:bg-ivory/10">
                  <td className="py-3 px-4 font-mono font-bold text-gold">{prod.rank}</td>
                  <td className="py-3 px-4 font-semibold text-obsidian">{prod.name}</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-obsidian">{prod.sales}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-obsidian">{formatPrice(prod.revenue)}</td>
                  <td className="py-3 px-4 text-right font-mono text-taupe">{prod.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
