'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Eye, Edit2, X, AlertTriangle, Check, Filter, Loader,
  TrendingUp, Clock, Package, Truck, CheckCircle2, ChevronRight, User, Phone, MapPin, Tag
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  gst_rate: number;
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
  pending: 'bg-amber-100 text-amber-700 border-amber-200/50',
  processing: 'bg-blue-100 text-blue-700 border-blue-200/50',
  shipped: 'bg-purple-100 text-purple-700 border-purple-200/50',
  delivered: 'bg-green-100 text-green-700 border-green-200/50',
  cancelled: 'bg-red-100 text-red-700 border-red-200/50',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  captured: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/orders');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const { orders: data } = await response.json();

      const processedOrders = data?.map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        created_at: o.created_at,
        subtotal: o.subtotal || 0,
        discount_amt: o.discount_amt || 0,
        shipping_charge: o.shipping_charge || 0,
        total_amount: o.total_amount || 0,
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        fulfillment_status: o.fulfillment_status,
        courier_name: o.courier_name,
        tracking_id: o.tracking_id,
        shipping_address: o.shipping_address,
        customer_id: o.customer_id,
        guest_phone: o.guest_phone,
        guest_email: o.guest_email,
        items: o.items || [],
        customer: o.customer,
      })) || [];

      setOrders(processedOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter((order) => {
    const customerName = order.customer?.full_name || '';
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase());
    
    const matchesTab = selectedTab === 'all' || order.fulfillment_status === selectedTab;

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
          <h1 className="font-heading text-2xl text-obsidian">Orders Ledger</h1>
          <p className="text-xs font-body text-taupe mt-0.5">
            Process D2C orders, print invoices, and update fulfillment tracking.
          </p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Orders', val: orders.filter(o => o.fulfillment_status === 'pending').length, color: 'text-amber-500', icon: <Clock size={16} /> },
          { label: 'Processing', val: orders.filter(o => o.fulfillment_status === 'processing').length, color: 'text-blue-500', icon: <Package size={16} /> },
          { label: 'Shipped today', val: orders.filter(o => o.fulfillment_status === 'shipped').length, color: 'text-purple-500', icon: <Truck size={16} /> },
          { label: 'Delivered', val: orders.filter(o => o.fulfillment_status === 'delivered').length, color: 'text-success-green', icon: <CheckCircle2 size={16} /> },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-beige/50 shadow-card flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-body text-taupe font-semibold">{stat.label}</p>
              <p className="font-mono text-xl font-bold text-obsidian mt-1">{stat.val}</p>
            </div>
            <div className={`p-2.5 rounded-lg bg-current/10 ${stat.color}`}>
              {stat.icon}
            </div>
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
            placeholder="Search Order ID, customer name..."
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
                  ? 'bg-white text-gold font-semibold shadow-sm'
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
        <div className="overflow-x-auto">          {error && (
            <div className="bg-red-50 border-b border-red-200 p-4 text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader className="animate-spin text-gold" size={32} />
            </div>
          ) : (
          <table className="w-full text-left border-collapse text-xs font-body">
            <thead>
              <tr className="bg-ivory/50 text-taupe border-b border-beige/60">
                <th className="py-3 px-5 font-semibold">Order ID</th>
                <th className="py-3 px-5 font-semibold">Date</th>
                <th className="py-3 px-5 font-semibold">Customer</th>
                <th className="py-3 px-5 font-semibold">Total Amount</th>
                <th className="py-3 px-5 font-semibold">Payment</th>
                <th className="py-3 px-5 font-semibold text-center">Fulfillment</th>
                <th className="py-3 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige/30">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order) => {
                  const itemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
                  const customerName = order.customer?.full_name || 'Guest';
                  const customerPhone = order.customer?.phone || order.guest_phone || 'N/A';
                  
                  return (
                    <motion.tr
                      layout
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-ivory/20 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono text-[11px] font-semibold text-obsidian">
                        {order.order_number}
                      </td>
                      <td className="py-3.5 px-5 text-taupe">
                        {formatDateTime(order.created_at)}
                      </td>
                      <td className="py-3.5 px-5 text-obsidian">
                        <p className="font-semibold">{customerName}</p>
                        <p className="text-[10px] text-taupe font-mono">{customerPhone}</p>
                      </td>
                      <td className="py-3.5 px-5 font-semibold font-mono text-obsidian">
                        {formatPrice(order.total_amount)}
                        <span className="text-[10px] text-taupe font-normal block font-body">{itemsCount} item{itemsCount > 1 ? 's' : ''}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-medium text-obsidian">{order.payment_method || 'N/A'}</span>
                        <span className={`inline-block ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize ${PAYMENT_STATUS_COLORS[order.payment_status]}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize border ${STATUS_COLORS[order.fulfillment_status]}`}>
                          {order.fulfillment_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleOpenDrawer(order)}
                          className="px-2.5 py-1 rounded bg-ivory hover:bg-gold/10 text-taupe hover:text-gold border border-beige/60 text-[10px] font-medium transition-all inline-flex items-center gap-1"
                        >
                          <Eye size={10} /> Details
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
        {filteredOrders.length === 0 && (
          <div className="text-center py-10 px-4 text-taupe">
            <ShoppingBag size={28} className="mx-auto mb-2 opacity-40 text-taupe" />
            <p className="text-sm font-semibold">No orders found</p>
            <p className="text-xs">Adjust your search or status filter.</p>
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
              <div className="flex items-center justify-between p-5 border-b border-beige/60 bg-ivory/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-obsidian">{selectedOrder.order_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize border ${STATUS_COLORS[selectedOrder.fulfillment_status]}`}>
                      {selectedOrder.fulfillment_status}
                    </span>
                  </div>
                  <p className="text-[10px] text-taupe mt-0.5">{formatDateTime(selectedOrder.created_at)}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-taupe hover:bg-ivory transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* Customer Details */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] uppercase tracking-wider font-semibold text-taupe flex items-center gap-1">
                    <User size={11} className="text-gold" /> Customer Profile
                  </h4>
                  <div className="bg-ivory/30 p-3 rounded-lg border border-beige/40 text-xs text-obsidian space-y-1">
                    <p className="font-semibold">{selectedOrder.customer?.full_name || 'Guest Customer'}</p>
                    <p className="text-taupe flex items-center gap-1 font-mono text-[10px]"><Phone size={10} /> {selectedOrder.customer?.phone || selectedOrder.guest_phone || 'N/A'}</p>
                    <p className="text-taupe">{selectedOrder.customer?.email || selectedOrder.guest_email || 'N/A'}</p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] uppercase tracking-wider font-semibold text-taupe flex items-center gap-1">
                    <MapPin size={11} className="text-gold" /> Shipping Address
                  </h4>
                  <p className="bg-ivory/30 p-3 rounded-lg border border-beige/40 text-xs text-taupe leading-relaxed">
                    {selectedOrder.shipping_address?.line1 ? (
                      <>
                        {selectedOrder.shipping_address.full_name}<br/>
                        {selectedOrder.shipping_address.line1}{selectedOrder.shipping_address.line2 ? `, ${selectedOrder.shipping_address.line2}` : ''}<br/>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                      </>
                    ) : 'Address not available'}
                  </p>
                </div>

                {/* Ordered Items */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] uppercase tracking-wider font-semibold text-taupe flex items-center gap-1">
                    <Package size={11} className="text-gold" /> Items Ordered
                  </h4>
                  <div className="divide-y divide-beige/30 border-y border-beige/40">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex-1 pr-4">
                          <p className="font-medium text-obsidian">{item.product_name}</p>
                          <p className="text-[10px] text-taupe">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                        </div>
                        <p className="font-mono font-semibold text-obsidian">{formatPrice(item.total_price)}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Summary math */}
                  <div className="space-y-1 bg-ivory/20 p-3 rounded-lg text-xs font-body">
                    <div className="flex justify-between text-taupe">
                      <span>Subtotal</span>
                      <span className="font-mono">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount_amt > 0 && (
                      <div className="flex justify-between text-error-red">
                        <span className="flex items-center gap-1"><Tag size={10} /> Discount Applied</span>
                        <span className="font-mono">- {formatPrice(selectedOrder.discount_amt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-taupe">
                      <span>Shipping Fee</span>
                      <span className="font-mono">{selectedOrder.shipping_charge === 0 ? 'FREE' : formatPrice(selectedOrder.shipping_charge)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-obsidian pt-1 border-t border-dashed border-beige/60">
                      <span>Total Invoice</span>
                      <span className="font-mono">{formatPrice(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Updates Form */}
                <div className="space-y-3 pt-3 border-t border-beige/40">
                  <h4 className="text-[10px] uppercase tracking-wider font-semibold text-taupe flex items-center gap-1">
                    <Truck size={11} className="text-gold" /> Fulfillment & Logistics
                  </h4>
                  
                  <form onSubmit={handleUpdateFulfillment} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-semibold text-taupe">Courier Partner</label>
                        <input
                          type="text"
                          value={courier}
                          onChange={(e) => setCourier(e.target.value)}
                          placeholder="e.g. Delhivery"
                          className="input-luxury text-[11px] py-1.5 px-2.5"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-semibold text-taupe">Tracking ID</label>
                        <input
                          type="text"
                          value={tracking}
                          onChange={(e) => setTracking(e.target.value)}
                          placeholder="e.g. DLV123"
                          className="input-luxury text-[11px] py-1.5 px-2.5 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-semibold text-taupe">Fulfillment Status</label>
                      <select
                        value={statusVal}
                        onChange={(e) => setStatusVal(e.target.value)}
                        className="input-luxury text-[11px] py-1.5 pr-8"
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
                      className="btn-gold text-[10px] font-semibold py-2 w-full mt-2"
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
