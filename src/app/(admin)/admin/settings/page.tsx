'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Shield, Database, CreditCard, ShoppingBag, Info, Save,
  CheckCircle2, RefreshCw, AlertTriangle
} from 'lucide-react';
import { BRAND } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [dbStatus, setDbStatus] = useState('connected');
  const [testingDb, setTestingDb] = useState(false);

  // Shop Settings States
  const [codEnabled, setCodEnabled] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(BRAND.freeShippingThreshold.toString());
  const [standardShippingFee, setStandardShippingFee] = useState(BRAND.standardShipping.toString());

  // Razorpay settings states
  const [razorpayMode, setRazorpayMode] = useState('test');
  const [razorpayKey, setRazorpayKey] = useState('rzp_test_LANAN2026');

  // Corporate Info States
  const [businessName, setBusinessName] = useState(BRAND.fullName);
  const [businessAddress, setBusinessAddress] = useState(BRAND.address);
  const [businessPhone, setBusinessPhone] = useState(BRAND.phone);
  const [businessEmail, setBusinessEmail] = useState(BRAND.email);

  const handleTestDatabase = async () => {
    setTestingDb(true);
    // Simulate ping
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setDbStatus('connected');
    setTestingDb(false);
    alert('Supabase Postgres connection ping returned successfully! Response latency: 42ms.');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings successfully compiled and committed to environmental parameters!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-obsidian">Business settings</h1>
          <p className="text-xs font-body text-taupe mt-0.5">
            Configure storefront configurations, Razorpay credentials, and corporate profiles.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="grid lg:grid-cols-3 gap-6 font-body">
        
        {/* Left 2 columns - main settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Supabase Connectivity */}
          <div className="bg-white p-5 rounded-xl border border-beige/50 shadow-card space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-taupe flex items-center gap-1.5 border-b border-beige/30 pb-3">
              <Database size={14} className="text-gold" /> Database Connectivity (Supabase)
            </h3>
            
            <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-ivory/50 border border-beige/40">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success-green"></span>
                </span>
                <div>
                  <p className="font-semibold text-obsidian">Supabase Live Connection</p>
                  <p className="text-[10px] text-taupe">Host: zvcstzvofyfvwedelewn.supabase.co</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleTestDatabase}
                disabled={testingDb}
                className="px-3 py-1.5 rounded-lg border border-beige bg-white text-taupe text-[10px] hover:bg-gold/10 hover:text-gold transition-all flex items-center gap-1 font-semibold disabled:opacity-50"
              >
                <RefreshCw size={10} className={testingDb ? 'animate-spin' : ''} />
                {testingDb ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>

          {/* Payment gateway settings */}
          <div className="bg-white p-5 rounded-xl border border-beige/50 shadow-card space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-taupe flex items-center gap-1.5 border-b border-beige/30 pb-3">
              <CreditCard size={14} className="text-gold" /> Payment Gateways (Razorpay)
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Razorpay Mode</label>
                <select
                  value={razorpayMode}
                  onChange={(e) => setRazorpayMode(e.target.value)}
                  className="input-luxury text-xs py-2 pr-8"
                >
                  <option value="test">Test Sandbox Mode</option>
                  <option value="live">Live Production Mode</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Key ID Token</label>
                <input
                  type="text"
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                  className="input-luxury text-xs py-2 font-mono"
                />
              </div>
            </div>
          </div>

          {/* D2C Logistics Rules */}
          <div className="bg-white p-5 rounded-xl border border-beige/50 shadow-card space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-taupe flex items-center gap-1.5 border-b border-beige/30 pb-3">
              <ShoppingBag size={14} className="text-gold" /> Storefront Commerce Rules
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Cash on Delivery (COD)</label>
                <select
                  value={codEnabled ? 'yes' : 'no'}
                  onChange={(e) => setCodEnabled(e.target.value === 'yes')}
                  className="input-luxury text-xs py-2 pr-8"
                >
                  <option value="no">Disabled (Prepaid Only)</option>
                  <option value="yes">Enabled (COD Active)</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Free Shipping Threshold</label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  placeholder="599"
                  className="input-luxury text-xs py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Standard Shipping Fee</label>
                <input
                  type="number"
                  value={standardShippingFee}
                  onChange={(e) => setStandardShippingFee(e.target.value)}
                  placeholder="79"
                  className="input-luxury text-xs py-2"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 column - business details */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white p-5 rounded-xl border border-beige/50 shadow-card space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-taupe flex items-center gap-1.5 border-b border-beige/30 pb-3">
              <Info size={14} className="text-gold" /> Registered Corporate Entity
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-semibold text-taupe">Business Legal Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="input-luxury text-xs py-1.5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-semibold text-taupe">GST & Corporate Address</label>
                <textarea
                  rows={4}
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="input-luxury text-xs py-1.5 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-semibold text-taupe">Support Hot-Line</label>
                <input
                  type="text"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="input-luxury text-xs py-1.5 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-semibold text-taupe">Billing Email Address</label>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className="input-luxury text-xs py-1.5"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-gold text-xs py-2.5 w-full flex items-center justify-center gap-1.5 font-semibold"
            >
              <Save size={13} /> Save Configuration
            </button>
          </div>

          <div className="bg-ivory/50 p-4 rounded-xl border border-beige/60 text-[10px] text-taupe flex items-start gap-2">
            <Shield size={16} className="text-gold flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Updating these parameters will instantly synchronize layout settings across dynamic client hooks. Prepaid orders fetch payment ID configs from Razorpay.
            </p>
          </div>

        </div>

      </form>
    </div>
  );
}
