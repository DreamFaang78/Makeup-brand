'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, ShieldCheck, Mail, Phone, Calendar, IndianRupee,
  ShoppingBag, Award, Eye, UserPlus, ArrowUpRight, Loader
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Customer {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  segment: string;
  total_spend: number;
  order_count: number;
  created_at: string;
}

const SEGMENT_BADGES: Record<string, string> = {
  vip: 'bg-amber-100 text-amber-700 border-amber-200/50 text-[10px] font-semibold',
  repeat: 'bg-blue-100 text-blue-700 border-blue-200/50 text-[10px] font-semibold',
  new: 'bg-green-150 text-success-green border-green-200/30 text-[10px] font-semibold',
  inactive: 'bg-gray-100 text-gray-500 border-gray-200/50 text-[10px] font-semibold',
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/customers');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const { customers: data } = await response.json();

      const processedCustomers = data?.map((c: any) => ({
        id: c.id,
        full_name: c.full_name || 'Unknown Customer',
        phone: c.phone,
        email: c.email,
        segment: c.segment || 'new',
        total_spend: c.total_spend || 0,
        order_count: c.order_count || 0,
        created_at: c.created_at,
      })) || [];

      setCustomers(processedCustomers);
      setTotalCustomers(processedCustomers.length);
      setTotalSpend(processedCustomers.reduce((sum: number, c: Customer) => sum + c.total_spend, 0));
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (c.phone?.toLowerCase().includes(search.toLowerCase()) ?? false);
    
    const matchesSegment = selectedSegment === 'all' || c.segment === selectedSegment;

    return matchesSearch && matchesSegment;
  });

  const vipCount = customers.filter(c => c.segment === 'vip').length;
  const avgSpend = customers.length > 0 ? Math.round(totalSpend / customers.length) : 0;
  const repeatRate = customers.length > 0 
    ? Math.round((customers.filter(c => c.segment === 'repeat').length / customers.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-obsidian">Customers Database</h1>
          <p className="text-xs font-body text-taupe mt-0.5">
            Segment your customer catalog, check purchase frequency, and target VIP profiles.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: totalCustomers.toString(), change: 'From database', color: 'text-gold' },
          { label: 'VIP Segments', value: vipCount.toString(), change: `${vipCount > 0 ? Math.round((vipCount/totalCustomers)*100) : 0}% of total`, color: 'text-amber-500' },
          { label: 'Avg Customer Spend', value: `₹${avgSpend.toLocaleString()}`, change: 'Average order value', color: 'text-success-green' },
          { label: 'Repeat Purchase Rate', value: `${repeatRate}%`, change: 'Segment: Repeat', color: 'text-blue-500' },
        ].map((card, i) => (
          <div key={i} className="admin-stat-card">
            <p className="text-[10px] uppercase font-body font-semibold text-taupe">{card.label}</p>
            <p className="font-mono text-xl font-bold text-obsidian mt-1">{card.value}</p>
            <p className="text-[10px] text-taupe mt-0.5">{card.change}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-card border border-beige/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-taupe/60">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-luxury text-xs pl-9 pr-4 py-2"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-taupe font-body flex items-center gap-1">
            <Filter size={12} /> Segment:
          </span>
          {['all', 'vip', 'repeat', 'new', 'inactive'].map((segment) => (
            <button
              key={segment}
              onClick={() => setSelectedSegment(segment)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body capitalize transition-all ${
                selectedSegment === segment
                  ? 'bg-gold/20 text-gold font-semibold'
                  : 'bg-ivory/50 text-taupe hover:bg-ivory'
              }`}
            >
              {segment}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl shadow-card border border-beige/50 overflow-hidden">
        <div className="overflow-x-auto">
          {error && (
            <div className="bg-red-50 border-b border-red-200 p-4 text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader className="animate-spin text-gold" size={32} />
            </div>
          ) : (
          <table className="w-full text-left border-collapse text-xs font-body">
            <thead>
              <tr className="bg-ivory/50 text-taupe border-b border-beige/60">
                <th className="py-3 px-5 font-semibold">Customer</th>
                <th className="py-3 px-5 font-semibold">Contact Info</th>
                <th className="py-3 px-5 font-semibold">Joined Date</th>
                <th className="py-3 px-5 font-semibold">Purchases</th>
                <th className="py-3 px-5 font-semibold">Total Spend</th>
                <th className="py-3 px-5 font-semibold text-center">Segment</th>
                <th className="py-3 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige/30">
              <AnimatePresence mode="popLayout">
                {filteredCustomers.map((c) => (
                  <motion.tr
                    layout
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-ivory/20 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-medium text-obsidian">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-gold/15 text-gold flex items-center justify-center font-bold text-xs">
                          {c.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{c.full_name}</p>
                          <p className="text-[10px] text-taupe font-mono">ID: {c.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-obsidian">
                      <p className="font-mono text-[11px] flex items-center gap-1 text-obsidian">
                        <Phone size={10} className="text-taupe" /> {c.phone || 'N/A'}
                      </p>
                      <p className="text-[11px] flex items-center gap-1 text-taupe">
                        <Mail size={10} className="text-taupe" /> {c.email || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3.5 px-5 text-taupe flex items-center gap-1 h-full py-5">
                      <Calendar size={11} className="text-taupe" /> {formatDate(c.created_at)}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-obsidian">
                      <span className="flex items-center gap-1"><ShoppingBag size={11} className="text-taupe" /> {c.order_count} order{c.order_count !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold font-mono text-obsidian">
                      {formatPrice(c.total_spend)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`px-2 py-0.5 rounded-full capitalize border ${SEGMENT_BADGES[c.segment]}`}>
                        {c.segment}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        title="View Purchases"
                        className="px-2 py-1 rounded bg-ivory hover:bg-gold/10 text-taupe hover:text-gold border border-beige/60 text-[10px] transition-all inline-flex items-center gap-1"
                      >
                        <Eye size={10} /> History
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          )}
        </div>
        {filteredCustomers.length === 0 && (
          <div className="text-center py-10 px-4 text-taupe">
            <Users size={28} className="mx-auto mb-2 opacity-40 text-taupe" />
            <p className="text-sm font-semibold">No customers found</p>
            <p className="text-xs">Adjust your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
