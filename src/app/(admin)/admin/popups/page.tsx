'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Plus, Edit2, Trash2, Eye, Sparkles, X, Check,
  Sliders, Activity, Smartphone, Monitor, Percent, Clock
} from 'lucide-react';

const INITIAL_POPUPS = [
  {
    id: 'pop-1',
    name: 'Free AI Skin Scan Diagnostic',
    type: 'welcome',
    title: 'Free 3D AI Skin Analysis',
    body: 'Scan your face in 10 seconds to detect hydration, pores, and receive a customized Indian ritual + 15% Off discount code.',
    couponCode: 'LANANAI',
    triggerDelay: 4,
    autoHideDelay: 8,
    deviceTarget: 'all',
    impressions: 4890,
    clicks: 1240,
    conversions: 620, // coupon code applied
    isActive: true,
  },
  {
    id: 'pop-2',
    name: 'Newsletter First Order Discount',
    type: 'newsletter',
    title: 'Unlock Luxury Skincare Secrets',
    body: 'Subscribe to our premium catalog updates and receive a flat ₹100 Off coupon code.',
    couponCode: 'FIRSTORDER',
    triggerDelay: 15,
    autoHideDelay: 0, // no auto-hide
    deviceTarget: 'mobile',
    impressions: 12050,
    clicks: 1802,
    conversions: 843,
    isActive: false,
  },
  {
    id: 'pop-3',
    name: 'Exit Intent Cart Preservation',
    type: 'exit_intent',
    title: 'Wait! Don\'t Leave Your Glow Behind',
    body: 'Complete your checkout in the next 10 minutes and save 10% on your cart.',
    couponCode: 'GLOW10',
    triggerDelay: 0, // exits
    autoHideDelay: 12,
    deviceTarget: 'desktop',
    impressions: 2310,
    clicks: 412,
    conversions: 189,
    isActive: true,
  }
];

export default function AdminPopupsPage() {
  const [popups, setPopups] = useState(INITIAL_POPUPS);
  const [editingPopup, setEditingPopup] = useState<any>(null);
  
  // Edit form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [triggerDelay, setTriggerDelay] = useState(5);
  const [autoHideDelay, setAutoHideDelay] = useState(8);
  const [deviceTarget, setDeviceTarget] = useState('all');

  const handleEditClick = (pop: any) => {
    setEditingPopup(pop);
    setName(pop.name);
    setTitle(pop.title);
    setBody(pop.body);
    setCouponCode(pop.couponCode);
    setTriggerDelay(pop.triggerDelay);
    setAutoHideDelay(pop.autoHideDelay);
    setDeviceTarget(pop.deviceTarget);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPopup) return;

    setPopups(prev =>
      prev.map(p => {
        if (p.id === editingPopup.id) {
          return {
            ...p,
            name,
            title,
            body,
            couponCode,
            triggerDelay,
            autoHideDelay,
            deviceTarget,
          };
        }
        return p;
      })
    );

    setEditingPopup(null);
  };

  const togglePopupState = (id: string) => {
    setPopups(prev =>
      prev.map(p => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-obsidian">Popup & Campaigns Manager</h1>
          <p className="text-xs font-body text-taupe mt-0.5">
            Configure dynamic modal popups, marketing banners, and AI diagnostic tool triggers.
          </p>
        </div>
      </div>

      {/* Overview Analytics row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {popups.map((pop) => {
          const ctr = pop.impressions > 0 ? ((pop.clicks / pop.impressions) * 100).toFixed(1) : '0';
          const convRate = pop.clicks > 0 ? ((pop.conversions / pop.clicks) * 100).toFixed(1) : '0';
          
          return (
            <div
              key={pop.id}
              className={`bg-white rounded-xl border p-5 shadow-card flex flex-col justify-between transition-all ${
                pop.isActive ? 'border-gold/30' : 'border-beige/50 opacity-75'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                    pop.isActive ? 'bg-gold/20 text-gold' : 'bg-ivory text-taupe'
                  }`}>
                    {pop.type.replace('_', ' ')}
                  </span>
                  
                  <button
                    onClick={() => togglePopupState(pop.id)}
                    className={`px-2 py-0.5 rounded text-[9px] font-semibold border transition-all ${
                      pop.isActive
                        ? 'bg-success-green/10 text-success-green border-success-green/20'
                        : 'bg-charcoal/10 text-charcoal/60 border-charcoal/10'
                    }`}
                  >
                    {pop.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm text-obsidian flex items-center gap-1">
                    {pop.id === 'pop-1' && <Sparkles size={13} className="text-gold" />}
                    {pop.name}
                  </h3>
                  <p className="text-[10px] text-taupe mt-0.5 font-mono">Linked Code: {pop.couponCode}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-ivory/30 p-2.5 rounded-lg border border-beige/40 text-center font-mono mt-3">
                  <div>
                    <p className="text-[9px] font-body text-taupe">Impressions</p>
                    <p className="text-xs font-bold text-obsidian mt-0.5">{pop.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-body text-taupe">CTR</p>
                    <p className="text-xs font-bold text-gold mt-0.5">{ctr}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-body text-taupe">Conv. Rate</p>
                    <p className="text-xs font-bold text-success-green mt-0.5">{convRate}%</p>
                  </div>
                </div>

                <div className="text-[10px] text-taupe space-y-1 pt-2 font-body border-t border-beige/30">
                  <p className="flex justify-between">
                    <span>Trigger Timer:</span>
                    <span className="font-mono text-obsidian font-medium">{pop.triggerDelay === 0 ? 'Exit Intent' : `${pop.triggerDelay}s Delay`}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Auto Hide Timer:</span>
                    <span className="font-mono text-obsidian font-medium">{pop.autoHideDelay === 0 ? 'No Limit' : `${pop.autoHideDelay}s`}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Target Devices:</span>
                    <span className="capitalize font-mono text-obsidian font-medium">{pop.deviceTarget}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEditClick(pop)}
                  className="px-3 py-1.5 rounded-lg bg-ivory hover:bg-gold/10 text-taupe hover:text-gold border border-beige/60 text-[10px] font-medium transition-all flex items-center gap-1"
                >
                  <Sliders size={11} /> Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Drawer / Form */}
      <AnimatePresence>
        {editingPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPopup(null)}
              className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-luxury max-w-md w-full overflow-hidden border border-beige/60"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-beige/60 bg-ivory/30">
                <h3 className="font-body font-semibold text-sm text-obsidian flex items-center gap-1.5">
                  <Megaphone size={15} className="text-gold" />
                  Configure Popup Settings
                </h3>
                <button
                  onClick={() => setEditingPopup(null)}
                  className="p-1 rounded-lg text-taupe hover:bg-ivory transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe font-body">Campaign Identifier Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-luxury text-xs py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe font-body">Promo Coupon</label>
                    <input
                      type="text"
                      required
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="input-luxury text-xs py-2 font-mono font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe font-body">Targeting Devices</label>
                    <select
                      value={deviceTarget}
                      onChange={(e) => setDeviceTarget(e.target.value)}
                      className="input-luxury text-xs py-2 pr-8"
                    >
                      <option value="all">All Devices</option>
                      <option value="mobile">Mobile Viewports</option>
                      <option value="desktop">Desktop Screens</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe font-body flex items-center gap-1">
                      <Clock size={10} /> Trigger Delay (sec)
                    </label>
                    <input
                      type="number"
                      required
                      value={triggerDelay}
                      onChange={(e) => setTriggerDelay(parseInt(e.target.value) || 0)}
                      className="input-luxury text-xs py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe font-body flex items-center gap-1">
                      <Clock size={10} /> Auto Hide (sec)
                    </label>
                    <input
                      type="number"
                      required
                      value={autoHideDelay}
                      onChange={(e) => setAutoHideDelay(parseInt(e.target.value) || 0)}
                      className="input-luxury text-xs py-2"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe font-body">Popup Title Header</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-luxury text-xs py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe font-body">Popup Body Message</label>
                  <textarea
                    required
                    rows={3}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="input-luxury text-xs py-2 resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-beige/60 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingPopup(null)}
                    className="px-4 py-2 border border-beige/60 text-taupe text-xs rounded-full hover:bg-ivory transition-all font-body font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gold text-xs py-2 px-5 font-semibold"
                  >
                    Apply Settings
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
