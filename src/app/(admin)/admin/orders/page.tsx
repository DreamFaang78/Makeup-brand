'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Eye, Edit2, X, AlertTriangle, Check, Filter, Loader,
  TrendingUp, Clock, Package, Truck, CheckCircle2, ChevronRight, User, Phone, MapPin, Tag,
  RefreshCw, Banknote, ShieldAlert, AlertCircle
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import Image from 'next/image';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  gst_rate: number;
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
  courier_name: string | null;
  tracking_id: string | null;
  shipping_address: any;
  customer_id: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  items: OrderItem[];
  customer?: {
    full_name: string;
    phone: string | null;
    email: string | null;
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200/60',
  processing: 'bg-blue-100 text-blue-700 border-blue-200/50',
  shipped: 'bg-purple-100 text-purple-700 border-purple-200/50',
  delivered: 'bg-green-100 text-green-700 border-green-200/50',
  cancelled: 'bg-red-100 text-red-700 border-red-200/50',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
  cod_pending: 'bg-amber-100 text-amber-800 border-amber-200/70',
  payment_pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
  payment_captured: 'bg-green-100 text-green-700 border-green-200/50',
  captured: 'bg-green-100 text-green-700 border-green-200/50',
  failed: 'bg-red-100 text-red-700 border-red-200/50',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Fulfillment update state
  const [courier, setCourier] = useState('');
  const [tracking, setTracking] = useState('');
  const [statusVal, setStatusVal] = useState('pending');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/orders', { cache: 'no-store' });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const { orders: data } = await response.json();

      const processedOrders = (data || []).map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        created_at: o.created_at,
        subtotal: Number(o.subtotal) || 0,
        discount_amt: Number(o.discount_amt) || 0,
        shipping_charge: Number(o.shipping_charge) || 0,
        total_amount: Number(o.total_amount) || 0,
        payment_method: o.payment_method || 'cod',
        payment_status: o.payment_status || 'cod_pending',
        fulfillment_status: o.fulfillment_status || 'pending',
        courier_name: o.courier_name,
        tracking_id: o.tracking_id,
        shipping_address: o.shipping_address,
        customer_id: o.customer_id,
        guest_phone: o.guest_phone,
        guest_email: o.guest_email,
        items: o.items || o.order_items || [],
        customer: o.customer,
      }));

      setOrders(processedOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter((order) => {
    const customerName = order.customer?.full_name || order.shipping_address?.full_name || '';
    const phone = order.customer?.phone || order.guest_phone || '';
    const query = search.toLowerCase();

    const matchesSearch =
      order.order_number.toLowerCase().includes(query) ||
      customerName.toLowerCase().includes(query) ||
      phone.includes(query);
    
    const matchesTab =
      selectedTab === 'all' ||
      order.fulfillment_status?.toLowerCase() === selectedTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  const handleOpenDrawer = (order: Order) => {
    setSelectedOrder(order);
    setCourier(order.courier_name || '');
    setTracking(order.tracking_id || '');
    setStatusVal(order.fulfillment_status);
  };

  const handleUpdateFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/fulfillment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          fulfillmentStatus: statusVal,
          courierName: courier || null,
          trackingId: tracking || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update fulfillment');
      }

      // Update local state
      setOrders(prev =>
        prev.map(o => {
          if (o.id === selectedOrder.id) {
            return {
              ...o,
              fulfillment_status: statusVal,
              courier_name: courier || null,
              tracking_id: tracking || null,
            };
          }
          return o;
        })
      );

      setSelectedOrder((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          fulfillment_status: statusVal,
          courier_name: courier || null,
          tracking_id: tracking || null,
        };
      });
    } catch (error) {
      console.error('Error updating fulfillment:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-obsidian font-semibold">Orders Ledger</h1>
          <p className="text-xs font-body text-taupe mt-0.5">
            Process D2C orders, manage COD dispatches, and track fulfillment in real-time.
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={loading || refreshing}
          className="btn-outline-gold text-xs py-2 px-3.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={cn(refreshing && 'animate-spin')} />
          {refreshing ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Pending Orders',
            val: orders.filter((o) => o.fulfillment_status?.toLowerCase() === 'pending').length,
            color: 'text-amber-500 bg-amber-500/10',
            icon: <Clock size={16} className="text-amber-600" />,
          },
          {
            label: 'Processing',
            val: orders.filter((o) => o.fulfillment_status?.toLowerCase() === 'processing').length,
            color: 'text-blue-500 bg-blue-500/10',
            icon: <Package size={16} className="text-blue-600" />,
          },
          {
            label: 'Shipped Today',
            val: orders.filter((o) => o.fulfillment_status?.toLowerCase() === 'shipped').length,
            color: 'text-purple-500 bg-purple-500/10',
            icon: <Truck size={16} className="text-purple-600" />,
          },
          {
            label: 'Delivered',
            val: orders.filter((o) => o.fulfillment_status?.toLowerCase() === 'delivered').length,
            color: 'text-success-green bg-success-green/10',
            icon: <CheckCircle2 size={16} className="text-success-green" />,
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-beige/50 shadow-card flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] uppercase font-body text-taupe font-semibold tracking-wider">
                {stat.label}
              </p>
              <p className="font-sans tabular-nums text-2xl font-bold text-obsidian mt-1">{stat.val}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${stat.color}`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Tabs and search */}
      <div className="bg-white p-4 rounded-xl shadow-card border border-beige/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-taupe/60">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search Order ID, customer name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-luxury text-xs pl-9 pr-4 py-2"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 bg-ivory/50 p-1 rounded-lg border border-beige/50">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-body capitalize transition-all ${
                selectedTab === tab
                  ? 'bg-white text-gold font-semibold shadow-xs'
                  : 'text-taupe hover:text-obsidian'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-xl shadow-card border border-beige/50 overflow-hidden">
        <div className="overflow-x-auto">
          {error && (
            <div className="bg-red-50 border-b border-red-200 p-4 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span><strong>Error:</strong> {error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-taupe">
              <Loader className="animate-spin text-gold" size={30} />
              <p className="text-xs font-body">Fetching live orders...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-body">
              <thead>
                <tr className="bg-ivory/50 text-taupe border-b border-beige/60">
                  <th className="py-3.5 px-5 font-semibold">Order ID</th>
                  <th className="py-3.5 px-5 font-semibold">Date</th>
                  <th className="py-3.5 px-5 font-semibold">Customer</th>
                  <th className="py-3.5 px-5 font-semibold">Total Amount</th>
                  <th className="py-3.5 px-5 font-semibold">Payment</th>
                  <th className="py-3.5 px-5 font-semibold text-center">Fulfillment</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/30">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((order) => {
                    const itemsCount = order.items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
                    const customerName =
                      order.customer?.full_name || order.shipping_address?.full_name || 'Valued Customer';
                    const customerPhone =
                      order.customer?.phone || order.guest_phone || order.shipping_address?.phone || 'N/A';
                    const isCod = order.payment_method?.toLowerCase() === 'cod';

                    return (
                      <motion.tr
                        layout
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-ivory/30 transition-colors"
                      >
                        <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-obsidian tracking-wide">
                          {order.order_number}
                        </td>
                        <td className="py-3.5 px-5 text-taupe text-[11px]">
                          {formatDateTime(order.created_at)}
                        </td>
                        <td className="py-3.5 px-5 text-obsidian">
                          <p className="font-semibold text-xs">{customerName}</p>
                          <p className="text-[10px] text-taupe font-sans tabular-nums mt-0.5">{customerPhone}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-sans tabular-nums font-bold text-sm text-obsidian block">
                            {formatPrice(order.total_amount)}
                          </span>
                          <span className="text-[10px] text-taupe font-normal block">
                            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold text-xs text-obsidian flex items-center gap-1">
                              {isCod ? (
                                <>
                                  <Banknote size={13} className="text-gold" /> Cash on Delivery
                                </>
                              ) : (
                                order.payment_method || 'Online'
                              )}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${
                                PAYMENT_STATUS_COLORS[order.payment_status] || 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {order.payment_status === 'cod_pending'
                                ? 'COD (To Collect)'
                                : order.payment_status === 'payment_captured'
                                ? 'Payment Captured'
                                : order.payment_status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize border inline-block ${
                              STATUS_COLORS[order.fulfillment_status?.toLowerCase()] ||
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {order.fulfillment_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleOpenDrawer(order)}
                            className="px-3 py-1.5 rounded-lg bg-ivory hover:bg-gold/15 text-obsidian hover:text-gold-dark border border-beige/60 text-[11px] font-medium transition-all inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Eye size={12} /> Details
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12 px-4 text-taupe">
            <ShoppingBag size={32} className="mx-auto mb-2 opacity-40 text-taupe" />
            <p className="text-sm font-semibold text-obsidian">No orders found</p>
            <p className="text-xs mt-0.5">Try adjusting your search query or tab status filter.</p>
          </div>
        )}
      </div>

      {/* Slide-out Order Details Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-obsidian/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ translateX: '100%' }}
              animate={{ translateX: 0 }}
              exit={{ translateX: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-luxury border-l border-beige/60 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-beige/60 bg-ivory/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-obsidian">
                      {selectedOrder.order_number}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize border ${
                        STATUS_COLORS[selectedOrder.fulfillment_status?.toLowerCase()] ||
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {selectedOrder.fulfillment_status}
                    </span>
                  </div>
                  <p className="text-[10px] text-taupe mt-0.5">{formatDateTime(selectedOrder.created_at)}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-taupe hover:bg-ivory hover:text-obsidian transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Customer Details */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-wider font-semibold text-taupe flex items-center gap-1.5">
                    <User size={12} className="text-gold" /> Customer Profile
                  </h4>
                  <div className="bg-ivory/40 p-3.5 rounded-xl border border-beige/40 text-xs text-obsidian space-y-1">
                    <p className="font-semibold text-sm">
                      {selectedOrder.customer?.full_name ||
                        selectedOrder.shipping_address?.full_name ||
                        'Customer'}
                    </p>
                    <p className="text-taupe flex items-center gap-1 font-sans tabular-nums text-xs">
                      <Phone size={11} />{' '}
                      {selectedOrder.customer?.phone ||
                        selectedOrder.guest_phone ||
                        selectedOrder.shipping_address?.phone ||
                        'N/A'}
                    </p>
                    <p className="text-taupe text-xs">
                      {selectedOrder.customer?.email ||
                        selectedOrder.guest_email ||
                        selectedOrder.shipping_address?.email ||
                        'No email provided'}
                    </p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-wider font-semibold text-taupe flex items-center gap-1.5">
                    <MapPin size={12} className="text-gold" /> Shipping Destination
                  </h4>
                  <div className="bg-ivory/40 p-3.5 rounded-xl border border-beige/40 text-xs text-obsidian leading-relaxed">
                    {selectedOrder.shipping_address?.line1 ? (
                      <>
                        <p className="font-semibold mb-0.5">{selectedOrder.shipping_address.full_name}</p>
                        <p>{selectedOrder.shipping_address.line1}</p>
                        {selectedOrder.shipping_address.line2 && <p>{selectedOrder.shipping_address.line2}</p>}
                        <p className="text-taupe mt-1">
                          {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} -{' '}
                          <span className="font-bold text-obsidian">{selectedOrder.shipping_address.pincode}</span>
                        </p>
                        {selectedOrder.shipping_address.landmark && (
                          <p className="text-[10px] text-taupe italic mt-1">
                            Landmark: {selectedOrder.shipping_address.landmark}
                          </p>
                        )}
                      </>
                    ) : (
                      'Address not specified'
                    )}
                  </div>
                </div>

                {/* Payment Method Details */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-wider font-semibold text-taupe flex items-center gap-1.5">
                    <Banknote size={12} className="text-gold" /> Payment Status
                  </h4>
                  <div className="bg-gold/5 p-3.5 rounded-xl border border-gold/25 text-xs text-obsidian space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-taupe">Payment Type:</span>
                      <span className="font-bold flex items-center gap-1">
                        {selectedOrder.payment_method?.toLowerCase() === 'cod'
                          ? 'Cash on Delivery (COD)'
                          : 'Online Payment'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-taupe">Collection Status:</span>
                      <span className="font-semibold text-amber-800">
                        {selectedOrder.payment_status === 'cod_pending'
                          ? 'Cash to be collected upon delivery'
                          : selectedOrder.payment_status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-gold/15">
                      <span className="text-taupe font-semibold">Amount to Collect:</span>
                      <span className="font-sans tabular-nums font-bold text-sm text-obsidian">
                        {formatPrice(selectedOrder.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] uppercase tracking-wider font-semibold text-taupe flex items-center gap-1.5">
                      <Package size={12} className="text-gold" /> Items Ordered
                    </h4>
                    <span className="text-[10px] text-taupe">
                      {selectedOrder.items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)} items
                    </span>
                  </div>

                  <div className="divide-y divide-beige/40 border-y border-beige/50">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="py-3 flex items-center gap-3 text-xs">
                        {item.image_url && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-beige flex-shrink-0 border border-beige/60">
                            <Image
                              src={item.image_url}
                              alt={item.product_name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-semibold text-obsidian line-clamp-1">{item.product_name}</p>
                          <p className="text-[11px] text-taupe font-sans tabular-nums mt-0.5">
                            Qty {item.quantity} × {formatPrice(item.unit_price)}
                          </p>
                        </div>
                        <p className="font-sans tabular-nums font-bold text-obsidian flex-shrink-0">
                          {formatPrice(item.total_price)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 bg-ivory/30 p-3.5 rounded-xl border border-beige/40 text-xs font-body">
                    <div className="flex justify-between text-taupe">
                      <span>Subtotal</span>
                      <span className="font-sans tabular-nums font-semibold text-obsidian">
                        {formatPrice(selectedOrder.subtotal)}
                      </span>
                    </div>
                    {selectedOrder.discount_amt > 0 && (
                      <div className="flex justify-between text-success-green">
                        <span className="flex items-center gap-1">
                          <Tag size={10} /> Discount Applied
                        </span>
                        <span className="font-sans tabular-nums font-semibold">
                          -{formatPrice(selectedOrder.discount_amt)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-taupe">
                      <span>Shipping Fee</span>
                      <span className="font-sans tabular-nums">
                        {selectedOrder.shipping_charge === 0 ? (
                          <span className="text-success-green font-semibold">FREE</span>
                        ) : (
                          <span className="font-semibold text-obsidian">
                            {formatPrice(selectedOrder.shipping_charge)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-obsidian pt-2 border-t border-dashed border-beige/60">
                      <span>Total Invoice</span>
                      <span className="font-sans tabular-nums font-bold text-base text-obsidian">
                        {formatPrice(selectedOrder.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Updates Form */}
                <div className="space-y-3 pt-2 border-t border-beige/40">
                  <h4 className="text-[10px] uppercase tracking-wider font-semibold text-taupe flex items-center gap-1.5">
                    <Truck size={12} className="text-gold" /> Fulfillment & Logistics
                  </h4>

                  <form onSubmit={handleUpdateFulfillment} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-semibold text-taupe">
                          Courier Partner
                        </label>
                        <input
                          type="text"
                          value={courier}
                          onChange={(e) => setCourier(e.target.value)}
                          placeholder="e.g. Delhivery, Bluedart"
                          className="input-luxury text-[11px] py-2 px-3"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-semibold text-taupe">
                          Tracking ID
                        </label>
                        <input
                          type="text"
                          value={tracking}
                          onChange={(e) => setTracking(e.target.value)}
                          placeholder="e.g. DLV9832049"
                          className="input-luxury text-[11px] py-2 px-3 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-semibold text-taupe">
                        Fulfillment Status
                      </label>
                      <select
                        value={statusVal}
                        onChange={(e) => setStatusVal(e.target.value)}
                        className="input-luxury text-[11px] py-2 pr-8"
                      >
                        <option value="pending">Pending Processing</option>
                        <option value="processing">Processing & Packaged</option>
                        <option value="shipped">Dispatched / Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="btn-gold text-xs font-semibold py-2.5 w-full mt-2 justify-center"
                    >
                      Update Fulfillment Status
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
