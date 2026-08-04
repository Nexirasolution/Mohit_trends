'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { useWishlist } from '@/components/WhishlistContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { wishlist } = useWishlist();

  const wishlistCount = wishlist?.length || 0;

  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/orders', label: 'Orders', icon: ClipboardList },
    { href: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { href: '/cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
  ];

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white pb-[env(safe-area-inset-bottom)]"
      style={{
        borderTop: '1.5px solid #C9A84C',
        boxShadow: '0 -2px 12px rgba(139,26,26,0.08)',
      }}
    >
      <div className="flex items-stretch justify-between px-1">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 pt-2.5 relative"
            >
              {/* Crimson top indicator bar */}
              {active && (
                <span
                  className="absolute top-0 left-[20%] right-[20%] h-[2px] rounded-b"
                  style={{ background: '#8B1A1A' }}
                />
              )}

              <span className="relative">
                <Icon
                  size={21}
                  strokeWidth={active ? 2.4 : 1.8}
                  style={{ color: active ? '#8B1A1A' : '#C4B8A8' }}
                  fill={active && label === 'Wishlist' ? '#8B1A1A' : 'none'}
                />
                {badge > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 text-white text-[8px] font-bold leading-none rounded-full min-w-[13px] h-[13px] flex items-center justify-center px-[3px]"
                    style={{ background: '#8B1A1A', border: '1.5px solid #fff' }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>

              <span
                className="text-[9px] font-semibold tracking-wide"
                style={{ color: active ? '#8B1A1A' : '#C4B8A8' }}
              >
                {label}
              </span>

              {/* Gold dot at bottom when active */}
              {active && (
                <span
                  className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{ background: '#C9A84C' }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}