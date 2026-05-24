'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Trash2, Search, X, Check, Calendar, ArrowUpDown, Filter, ToggleLeft, ToggleRight
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const INITIAL_COUPONS = [
  { id: 'cp-1', code: 'LANANAI', description: '15% Off unlocked via AI skin scan diagnostic tools.', type: 'percent', value: 15, minOrder: 0, maxDiscount: 500, limit: 1000, used: 142, isActive: true },
  { id: 'cp-2', code: 'LANAN50', description: '50% Off exclusive premium opening discount.', type: 'percent', value: 50, minOrder: 1999, maxDiscount: 1500, limit: 100, used: 88, isActive: true },
  { id: 'cp-3', code: 'FIRSTORDER', description: 'Flat ₹100 Off for first-time shoppers.', type: 'flat', value: 100, minOrder: 499, maxDiscount: 100, limit: 5000, used: 2167, isActive: true },
  { id: 'cp-4', code: 'FREESHIP', description: 'Free shipping on all premium D2C orders.', type: 'free_shipping', value: 0, minOrder: 0, maxDiscount: 79, limit: 2000, used: 843, isActive: true },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('percent');
  const [formValue, setFormValue] = useState('');
  const [formMinOrder, setFormMinOrder] = useState('0');
  const [formLimit, setFormLimit] = useState('1000');

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || (formType !== 'free_shipping' && !formValue)) return;

    const valNum = parseFloat(formValue) || 0;
    const minOrderNum = parseFloat(formMinOrder) || 0;
    const limitNum = parseInt(formLimit) || 1000;

    const newCoupon = {
      id: `cp-${coupons.length + 1}`,
      code: formCode.toUpperCase().replace(/\s+/g, ''),
      description: formDesc,
      type: formType,
      value: valNum,
      minOrder: minOrderNum,
      maxDiscount: formType === 'percent' ? valNum * 10 : 0,
      limit: limitNum,
      used: 0,
      isActive: true,
    };

    setCoupons([newCoupon, ...coupons]);
    setIsModalOpen(false);

    // Reset Form
    setFormCode('');
    setFormDesc('');
    setFormType('percent');
    setFormValue('');
    setFormMinOrder('0');
    setFormLimit('1000');
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons(prev =>
      prev.map(c => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-obsidian">Coupons & Campaigns</h1>
          <p className="text-xs font-body text-taupe mt-0.5">
            Configure promotional marketing discounts, campaign coupon codes, and thresholds.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-gold text-xs py-2.5 px-5 self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={14} /> Create Coupon
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-xl shadow-card border border-beige/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-taupe/60">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search coupon code, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-luxury text-xs pl-9 pr-4 py-2"
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-card border border-beige/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-body">
            <thead>
              <tr className="bg-ivory/50 text-taupe border-b border-beige/60">
                <th className="py-3 px-5 font-semibold">Code</th>
                <th className="py-3 px-5 font-semibold">Description</th>
                <th className="py-3 px-5 font-semibold">Type</th>
                <th className="py-3 px-5 font-semibold">Value</th>
                <th className="py-3 px-5 font-semibold">Min. Order</th>
                <th className="py-3 px-5 font-semibold text-center">Usage</th>
                <th className="py-3 px-5 font-semibold text-center">Status</th>
                <th className="py-3 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige/30">
              <AnimatePresence mode="popLayout">
                {filteredCoupons.map((c) => (
                  <motion.tr
                    layout
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-ivory/20 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono text-sm font-bold text-gold">
                      {c.code}
                    </td>
                    <td className="py-3.5 px-5 text-taupe max-w-[240px]">
                      {c.description}
                    </td>
                    <td className="py-3.5 px-5 capitalize font-medium text-obsidian">
                      {c.type === 'percent' ? 'Percentage' : c.type === 'flat' ? 'Flat Discount' : 'Free Shipping'}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-semibold text-obsidian">
                      {c.type === 'percent' ? `${c.value}%` : c.type === 'flat' ? formatPrice(c.value) : 'Shipping (₹79)'}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-taupe">
                      {c.minOrder > 0 ? formatPrice(c.minOrder) : 'No Min'}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-mono font-semibold text-obsidian">{c.used} / {c.limit}</span>
                        <div className="w-16 h-1 bg-ivory rounded-full overflow-hidden mt-1 border border-beige/40">
                          <div
                            className="h-full bg-gold rounded-full"
                            style={{ width: `${Math.min(100, (c.used / c.limit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => toggleCouponStatus(c.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                          c.isActive
                            ? 'bg-success-green/10 text-success-green border-success-green/20'
                            : 'bg-charcoal/10 text-charcoal/60 border-charcoal/10'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-1.5 rounded-lg text-taupe hover:bg-error-red/10 hover:text-error-red transition-colors inline-block"
                        title="Delete Coupon"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredCoupons.length === 0 && (
          <div className="text-center py-10 px-4 text-taupe">
            <Tag size={28} className="mx-auto mb-2 opacity-40 text-taupe" />
            <p className="text-sm font-semibold">No coupons found</p>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-luxury max-w-md w-full overflow-hidden border border-beige/60"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-beige/60">
                <h3 className="font-body font-semibold text-sm text-obsidian flex items-center gap-1.5">
                  <Tag size={15} className="text-gold" />
                  Create New Coupon
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-taupe hover:bg-ivory transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddCoupon} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Promo Code</label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                      placeholder="e.g. GLOW15"
                      className="input-luxury text-xs py-2 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Discount Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="input-luxury text-xs py-2 pr-8"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="flat">Flat Price (₹)</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Coupon Description</label>
                  <input
                    type="text"
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="e.g. Get 15% off on your purchase"
                    className="input-luxury text-xs py-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">
                      {formType === 'percent' ? 'Percent Value' : formType === 'flat' ? 'Flat Amount' : 'Not Applicable'}
                    </label>
                    <input
                      type="number"
                      disabled={formType === 'free_shipping'}
                      required={formType !== 'free_shipping'}
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                      placeholder={formType === 'percent' ? '15' : '150'}
                      className="input-luxury text-xs py-2 disabled:bg-ivory/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Min Order (₹)</label>
                    <input
                      type="number"
                      required
                      value={formMinOrder}
                      onChange={(e) => setFormMinOrder(e.target.value)}
                      placeholder="0"
                      className="input-luxury text-xs py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Usage Limit</label>
                    <input
                      type="number"
                      required
                      value={formLimit}
                      onChange={(e) => setFormLimit(e.target.value)}
                      placeholder="1000"
                      className="input-luxury text-xs py-2"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-beige/60 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-beige/60 text-taupe text-xs rounded-full hover:bg-ivory transition-all font-body font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gold text-xs py-2 px-5 font-semibold"
                  >
                    Create Campaign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
