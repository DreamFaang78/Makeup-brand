'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, Loader } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  payment_status: string;
  fulfillment_status: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUserAndFetchOrders = async () => {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Check for mock user
        const mockUserStr = localStorage.getItem('mock_user');
        if (!mockUserStr) {
          router.push('/');
          toast.error('Please sign in to view your orders');
          return;
        }
      }

      setUser(session?.user || JSON.parse(localStorage.getItem('mock_user') || '{}'));
      
      // Fetch user's orders
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('id, order_number, created_at, total_amount, payment_status, fulfillment_status')
          .eq('customer_id', session?.user?.id || localStorage.getItem('mock_user_id'))
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setOrders(data || []);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetchOrders();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payment_captured':
        return 'text-green-600';
      case 'payment_pending':
        return 'text-yellow-600';
      case 'payment_failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />
      
      <main className="flex-1 container-lanan py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-sm text-taupe hover:text-gold mb-4 inline-flex items-center gap-2">
              <ArrowRight size={14} className="rotate-180" />
              Back to Shop
            </Link>
            <h1 className="font-heading text-4xl text-obsidian font-light mt-4">My Orders</h1>
            <p className="text-taupe mt-2">Track and manage your orders</p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="animate-spin text-gold" size={32} />
            </div>
          ) : orders.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl border border-beige/50 p-12 text-center">
              <ShoppingBag size={48} className="mx-auto text-beige mb-4 opacity-50" />
              <h2 className="font-heading text-xl text-obsidian mb-2">No Orders Yet</h2>
              <p className="text-taupe mb-6">Start your skincare journey by shopping our collection</p>
              <Link href="/shop" className="btn-gold inline-flex items-center gap-2">
                Shop Now
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block bg-white rounded-xl border border-beige/50 p-6 hover:border-gold/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-body font-semibold text-obsidian mb-1">
                        Order {order.order_number}
                      </h3>
                      <p className="text-sm text-taupe">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="font-body font-semibold text-obsidian">
                          {formatPrice(order.total_amount)}
                        </p>
                        <p className={`text-sm font-body ${getStatusColor(order.payment_status)}`}>
                          {order.payment_status.replace('_', ' ')}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-body text-taupe">
                          Fulfillment
                        </p>
                        <p className="text-sm font-body font-semibold text-obsidian capitalize">
                          {order.fulfillment_status}
                        </p>
                      </div>

                      <ArrowRight size={16} className="text-gold opacity-50" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
