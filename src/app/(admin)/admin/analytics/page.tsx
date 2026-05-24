'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, ShoppingBag, ArrowUpRight, ArrowDownRight,
  Sparkles, ShieldCheck, HelpCircle, Monitor, Smartphone, Tablet
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const REVENUE_DATA = [
  { month: 'Jan', revenue: 240000, orders: 120 },
  { month: 'Feb', revenue: 310000, orders: 155 },
  { month: 'Mar', revenue: 450000, orders: 225 },
  { month: 'Apr', revenue: 590000, orders: 295 },
  { month: 'May', revenue: 847000, orders: 423 }, // projected/current
];

const TOP_PRODUCTS = [
  { rank: 1, name: 'Radiance Revival Serum', sales: 412, revenue: 411588, stock: '45 left' },
  { rank: 2, name: 'Velvet Hydra Moisturiser', sales: 245, revenue: 220255, stock: '67 left' },
  { rank: 3, name: 'Rose Dew SPF 40 Sunscreen', sales: 188, revenue: 122012, stock: '88 left' },
  { rank: 4, name: 'Saffron Glow Face Mask', sales: 112, revenue: 123088, stock: '19 left' },
];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  // SVG dimensions for Monthly Revenue Line Graph
  const svgWidth = 500;
  const svgHeight = 200;
  const padding = 30;
  
  // Calculate SVG points
  const maxRevenue = Math.max(...REVENUE_DATA.map(d => d.revenue));
  const points = REVENUE_DATA.map((d, index) => {
    const x = padding + (index * (svgWidth - padding * 2)) / (REVENUE_DATA.length - 1);
    const y = svgHeight - padding - (d.revenue * (svgHeight - padding * 2)) / maxRevenue;
    return `${x},${y}`;
  }).join(' ');

  // Funnel Steps
  const funnelSteps = [
    { label: 'Page Views', value: 12450, pct: 100, color: 'bg-gold/20 text-gold-dark border-gold/40' },
    { label: 'Product Views', value: 4820, pct: 38.7, color: 'bg-gold/40 text-gold-dark border-gold/50' },
    { label: 'Add to Cart', value: 1240, pct: 9.9, color: 'bg-gold/60 text-obsidian border-gold' },
    { label: 'Checkout Started', value: 680, pct: 5.4, color: 'bg-gold/80 text-obsidian border-gold' },
    { label: 'Orders Placed', value: 412, pct: 3.3, color: 'bg-gold text-obsidian border-gold-dark' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-obsidian">Analytics Console</h1>
          <p className="text-xs font-body text-taupe mt-0.5">
            Monitor real-time sales pipelines, checkout conversion ratios, and catalog performance.
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-luxury text-xs py-2 pr-8 w-32 self-start sm:self-auto"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sales Revenue', value: '₹8,47,000', change: '+24.5%', up: true },
          { label: 'Conversion Rate', value: '3.31%', change: '+1.2%', up: true },
          { label: 'Average Order Value', value: '₹2,002', change: '-2.5%', up: false },
          { label: 'Storefront Visits', value: '12,450', change: '+18.2%', up: true },
        ].map((metric, i) => (
          <div key={i} className="admin-stat-card flex flex-col justify-between">
            <div>
              <p className="text-[10px] uppercase font-body font-semibold text-taupe">{metric.label}</p>
              <p className="font-mono text-xl font-bold text-obsidian mt-1">{metric.value}</p>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-[10px] font-bold font-mono ${metric.up ? 'text-success-green' : 'text-error-red'}`}>
                {metric.change}
              </span>
              <span className="text-[10px] text-taupe font-body">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Analytics Graphs */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-5 rounded-xl border border-beige/50 shadow-card space-y-4">
          <h2 className="font-body font-semibold text-sm text-obsidian flex items-center gap-1.5">
            <TrendingUp size={15} className="text-gold" /> Monthly Sales Revenue Trend (YTD)
          </h2>
          
          <div className="relative w-full overflow-hidden flex items-center justify-center p-2 bg-ivory/10 border border-beige/30 rounded-lg">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#E8D8CA" strokeDasharray="3" strokeWidth="0.5" />
              <line x1={padding} y1={svgHeight/2} x2={svgWidth - padding} y2={svgHeight/2} stroke="#E8D8CA" strokeDasharray="3" strokeWidth="0.5" />
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
              {REVENUE_DATA.map((d, index) => {
                const x = padding + (index * (svgWidth - padding * 2)) / (REVENUE_DATA.length - 1);
                const y = svgHeight - padding - (d.revenue * (svgHeight - padding * 2)) / maxRevenue;
                return (
                  <g key={index} className="group cursor-pointer">
                    <circle cx={x} cy={y} r="4" fill="#0A0A0A" stroke="#C9A96E" strokeWidth="1.5" />
                    <text x={x} y={y - 8} textAnchor="middle" className="text-[9px] font-mono font-bold fill-obsidian bg-white opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{(d.revenue/1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {REVENUE_DATA.map((d, index) => {
                const x = padding + (index * (svgWidth - padding * 2)) / (REVENUE_DATA.length - 1);
                return (
                  <text key={index} x={x} y={svgHeight - 10} textAnchor="middle" className="text-[9px] font-body fill-taupe font-medium">
                    {d.month}
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
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white p-5 rounded-xl border border-beige/50 shadow-card space-y-4">
          <h2 className="font-body font-semibold text-sm text-obsidian flex items-center gap-1.5">
            <BarChart3 size={15} className="text-gold" /> Storefront Funnel (Last 30 Days)
          </h2>
          
          <div className="space-y-3 font-body">
            {funnelSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-4 text-xs">
                <span className="w-28 font-medium text-taupe">{step.label}</span>
                <div className="flex-1 h-7 bg-ivory rounded-lg overflow-hidden border border-beige/40 relative flex items-center pl-3">
                  <div
                    className={`absolute inset-y-0 left-0 border-r transition-all duration-1000 ${step.color}`}
                    style={{ width: `${step.pct}%` }}
                  />
                  <span className="relative font-mono font-semibold text-[10px] text-obsidian z-10">
                    {step.value.toLocaleString()} ({step.pct}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Top selling products */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-beige/50 shadow-card space-y-4">
          <h2 className="font-body font-semibold text-sm text-obsidian">Top Selling Products</h2>
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
                {TOP_PRODUCTS.map((prod) => (
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

        {/* Traffic Share */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-beige/50 shadow-card space-y-4 flex flex-col justify-between">
          <h2 className="font-body font-semibold text-sm text-obsidian">Device Traffic Distribution</h2>
          
          <div className="space-y-4 font-body my-auto">
            {[
              { label: 'Mobile Devices', pct: 82.4, icon: <Smartphone size={16} className="text-gold" /> },
              { label: 'Desktop Screens', pct: 15.1, icon: <Monitor size={16} className="text-tau" /> },
              { label: 'Tablet Displays', pct: 2.5, icon: <Tablet size={16} className="text-taupe" /> },
            ].map((device, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-obsidian">
                    {device.icon} {device.label}
                  </span>
                  <span className="font-mono text-gold font-bold">{device.pct}%</span>
                </div>
                <div className="h-2 bg-ivory rounded-full overflow-hidden border border-beige/40">
                  <div
                    className="h-full bg-gradient-gold rounded-full"
                    style={{ width: `${device.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-taupe text-center border-t border-beige/30 pt-3">
            Traffic segmented from standard pixel tags & analytics.
          </div>
        </div>

      </div>
    </div>
  );
}
