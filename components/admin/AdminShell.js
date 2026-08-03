'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ListTree, ShoppingCart, Boxes, Image as ImageIcon,
  Clapperboard, Star, Ticket, Layers, FileBarChart, Settings as SettingsIcon, Menu, X, LogOut
} from 'lucide-react';

// Mohith Trends Brand Colors — keep in sync with other admin pages until centralized in tailwind.config.js
const GOLD = '#B08D3F';
const INK = '#1A1A1A';       // sidebar background, matches the logo's black "M"
const PAPER = '#FDFCFA';     // main content background
const HAIRLINE = 'rgba(255,255,255,0.08)';

const NAV = [
  { href: '/admin',            label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/products',   label: 'Products',      icon: Package },
  { href: '/admin/categories', label: 'Categories',    icon: ListTree },
  { href: '/admin/orders',     label: 'Orders',        icon: ShoppingCart },
  { href: '/admin/inventory',  label: 'Inventory',     icon: Boxes },
  { href: '/admin/combos',     label: 'Combo Offers',  icon: Layers },
  { href: '/admin/banners',    label: 'Banners',       icon: ImageIcon },
  { href: '/admin/reels',      label: 'Shop by Reels', icon: Clapperboard },
  { href: '/admin/reviews',    label: 'Reviews',       icon: Star },
  { href: '/admin/coupons',    label: 'Coupons',       icon: Ticket },
  { href: '/admin/reports',    label: 'Sales Reports', icon: FileBarChart },
  { href: '/admin/settings',   label: 'Settings',      icon: SettingsIcon },
];

export default function AdminShell({ admin, children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen flex" style={{ background: PAPER }}>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(26,26,26,0.5)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 inset-y-0 left-0 w-60 transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: INK }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ border: `1px solid ${GOLD}` }}
            >
              <span className="text-sm" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>M</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className="text-sm tracking-wide"
                style={{ color: GOLD, fontFamily: 'Georgia, serif' }}
              >
                Mohith Trends
              </span>
              <span className="text-[9px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Admin Panel
              </span>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)} style={{ color: GOLD }}>
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="p-3 space-y-0.5 overflow-y-auto" style={{ height: 'calc(100vh - 76px)' }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors"
                style={
                  active
                    ? { background: GOLD, color: INK, fontWeight: 600 }
                    : { color: 'rgba(255,255,255,0.65)', fontWeight: 400 }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(176,141,63,0.15)';
                    e.currentTarget.style.color = GOLD;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                  }
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3" style={{ height: '1px', background: HAIRLINE }} />

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 text-sm w-full transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = HAIRLINE;
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0">
        {/* Mobile topbar */}
        <header
          className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
          style={{ background: INK }}
        >
          <button onClick={() => setOpen(true)} style={{ color: GOLD }}>
            <Menu size={22} />
          </button>
          <span className="text-base tracking-wide" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>
            Mohith Trends
          </span>
        </header>

        <main className="p-4 sm:p-6 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}