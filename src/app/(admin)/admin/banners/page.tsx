'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon, Sliders, Play, Plus, Trash2, X, Check, Eye
} from 'lucide-react';

const INITIAL_BANNERS = [
  {
    id: 'ban-1',
    name: 'Marquee Announcement Bar',
    type: 'announcement_bar',
    content: 'FREE SHIPPING ON ORDERS ABOVE ₹599 · USE CODE FIRSTORDER FOR FLAT ₹100 OFF · 100% VEGAN & CRUELTY-FREE FORMULAS',
    linkUrl: '/shop',
    bgColor: '#0A0A0A',
    textColor: '#C9A96E',
    isActive: true,
  },
  {
    id: 'ban-2',
    name: 'Summer Glow Campaign',
    type: 'sale',
    content: 'Get the uncompromised luxury your skin deserves. Discover Lanan rituals today.',
    linkUrl: '/shop?category=serums',
    bgColor: '#E8D8CA',
    textColor: '#0A0A0A',
    isActive: false,
  }
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [editingBanner, setEditingBanner] = useState<any>(INITIAL_BANNERS[0]);
  
  // Form edit states
  const [content, setContent] = useState(INITIAL_BANNERS[0].content);
  const [linkUrl, setLinkUrl] = useState(INITIAL_BANNERS[0].linkUrl);
  const [bgColor, setBgColor] = useState(INITIAL_BANNERS[0].bgColor);
  const [textColor, setTextColor] = useState(INITIAL_BANNERS[0].textColor);

  const handleSelectBanner = (b: any) => {
    setEditingBanner(b);
    setContent(b.content);
    setLinkUrl(b.linkUrl);
    setBgColor(b.bgColor);
    setTextColor(b.textColor);
  };

  const handleApplyChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    setBanners(prev =>
      prev.map(b => {
        if (b.id === editingBanner.id) {
          return {
            ...b,
            content,
            linkUrl,
            bgColor,
            textColor,
          };
        }
        return b;
      })
    );

    alert('Banner changes applied successfully to layout parameters!');
  };

  const toggleBannerState = (id: string) => {
    setBanners(prev =>
      prev.map(b => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-obsidian">Banners & Promotions</h1>
          <p className="text-xs font-body text-taupe mt-0.5">
            Manage your announcement ticker, promotional sales content, and brand campaign banners.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Banner selection list */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-body font-semibold text-taupe uppercase tracking-wider">Campaign Components</h3>
          {banners.map((b) => (
            <div
              key={b.id}
              onClick={() => handleSelectBanner(b)}
              className={`p-4 rounded-xl border bg-white shadow-card cursor-pointer transition-all ${
                editingBanner?.id === b.id ? 'border-gold ring-1 ring-gold/40' : 'border-beige/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider font-semibold bg-ivory text-taupe px-2 py-0.5 rounded-full">
                  {b.type.replace('_', ' ')}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBannerState(b.id);
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-semibold border transition-all ${
                    b.isActive
                      ? 'bg-success-green/10 text-success-green border-success-green/20'
                      : 'bg-charcoal/10 text-charcoal/60 border-charcoal/10'
                  }`}
                >
                  {b.isActive ? 'Active' : 'Paused'}
                </button>
              </div>
              <h4 className="font-semibold text-sm text-obsidian mt-2">{b.name}</h4>
              <p className="text-[10px] text-taupe line-clamp-1 mt-1 font-body">{b.content}</p>
            </div>
          ))}
        </div>

        {/* Banner edit & Live preview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Preview Card */}
          <div className="bg-white p-5 rounded-xl border border-beige/50 shadow-card space-y-3">
            <h3 className="text-xs font-body font-semibold text-taupe uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={12} className="text-gold" /> Live Preview
            </h3>
            
            <div className="border border-beige/40 rounded-lg overflow-hidden bg-ivory p-4 flex flex-col items-center justify-center min-h-[100px]">
              {editingBanner?.type === 'announcement_bar' ? (
                <div
                  className="w-full text-center text-[10px] font-body font-medium uppercase tracking-[0.2em] py-2 px-4 rounded shadow-sm overflow-hidden"
                  style={{ backgroundColor: bgColor, color: textColor }}
                >
                  <div className="animate-ticker whitespace-nowrap inline-block">
                    {content} · {content}
                  </div>
                </div>
              ) : (
                <div
                  className="w-full text-center p-6 rounded shadow-sm flex flex-col items-center gap-2"
                  style={{ backgroundColor: bgColor, color: textColor }}
                >
                  <p className="text-xs font-body font-semibold max-w-md">{content}</p>
                  <span className="text-[9px] font-bold border-b border-current pb-0.5 uppercase tracking-wider font-mono">
                    Explore Link: {linkUrl}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Form */}
          {editingBanner && (
            <div className="bg-white p-5 rounded-xl border border-beige/50 shadow-card">
              <h3 className="text-xs font-body font-semibold text-taupe uppercase tracking-wider mb-4">
                Configure Layout Parameters
              </h3>
              
              <form onSubmit={handleApplyChanges} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe font-body">Banner Content Text</label>
                  <textarea
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="input-luxury text-xs py-2 resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe font-body">Campaign Link URL</label>
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="input-luxury text-xs py-2 font-mono"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe font-body">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded border border-beige cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="input-luxury text-xs py-1.5 px-2 flex-1 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe font-body">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-8 h-8 rounded border border-beige cursor-pointer"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="input-luxury text-xs py-1.5 px-2 flex-1 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-beige/40 flex items-center justify-end">
                  <button
                    type="submit"
                    className="btn-gold text-xs py-2 px-5 font-semibold"
                  >
                    Apply Config & Preview
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
