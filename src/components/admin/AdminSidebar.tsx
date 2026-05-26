'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Admin Sidebar
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Megaphone,
  Image as ImageIcon, BarChart3, Settings, ChevronRight, LogOut,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { href: '/admin/products', icon: <Package size={16} />, label: 'Products' },
  { href: '/admin/orders', icon: <ShoppingBag size={16} />, label: 'Orders' },
  { href: '/admin/customers', icon: <Users size={16} />, label: 'Customers' },
  { href: '/admin/coupons', icon: <Tag size={16} />, label: 'Coupons' },
  { href: '/admin/popups', icon: <Megaphone size={16} />, label: 'Popups' },
  { href: '/admin/banners', icon: <ImageIcon size={16} />, label: 'Banners' },
  { href: '/admin/analytics', icon: <BarChart3 size={16} />, label: 'Analytics' },
  { href: '/admin/settings', icon: <Settings size={16} />, label: 'Settings' },
];

export default function AdminSidebar() {
  const path = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-obsidian text-ivory h-full flex-shrink-0">
      {/* Brand */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8">
            <Image
              src="/lanan logo.png"
              alt="LANAN Logo"
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <div>
            <p className="font-heading text-lg tracking-widest text-gold">LANAN</p>
            <p className="text-[9px] font-body text-ivory/40 tracking-widest uppercase">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto scroll-hidden">
        <p className="text-[9px] font-body font-semibold text-ivory/30 uppercase tracking-[0.2em] px-3 mb-2 mt-2">
          Main Menu
        </p>
        {NAV.map((item) => {
          const active = path === item.href || path.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200',
                active
                  ? 'bg-gold/20 text-gold'
                  : 'text-ivory/60 hover:text-ivory hover:bg-white/5'
              )}
            >
              <span className={active ? 'text-gold' : ''}>{item.icon}</span>
              <span className="text-xs font-body font-medium">{item.label}</span>
              {active && <ChevronRight size={12} className="ml-auto text-gold/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center text-obsidian text-xs font-bold">A</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-body font-medium text-ivory/90 truncate">Admin</p>
            <p className="text-[10px] text-ivory/40 truncate">admin@lanan.in</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-ivory/40 hover:text-error-red hover:bg-error-red/10 transition-all text-xs font-body">
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
