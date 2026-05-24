// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Admin Layout
// Overrides the root layout shell (no Navbar/Footer/CartDrawer)
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        const mockUserStr = localStorage.getItem('mock_user');

        if (!session?.user && !mockUserStr) {
          router.push('/');
          return;
        }

        const userId = session?.user?.id;

        // Fetch user's segment from customers table
        if (userId) {
          const { data: customer, error } = await supabase
            .from('customers')
            .select('segment, email, phone')
            .eq('id', userId)
            .single();

          if (error) {
            console.error('Failed to fetch customer:', error);
            // Allow access if we can't verify (might be first-time setup)
            setIsAuthorized(true);
          } else if (customer) {
            // Always authorize the primary admin email
            if (customer.email === 'admin@lanan.in') {
              setIsAuthorized(true);
            } else if (customer.segment === 'new' || customer.segment === 'repeat') {
              // Redirect non-admin customers to their orders page
              router.push('/account/orders');
            } else {
              // VIP and other segments can access admin (for now)
              setIsAuthorized(true);
            }
          }
        } else if (mockUserStr) {
          // Mock users are allowed (development mode)
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Authorization check error:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F7F1EA',
          zIndex: 9999,
        }}
      >
        <Loader className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        background: '#F7F1EA',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      <AdminSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <AdminTopbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

