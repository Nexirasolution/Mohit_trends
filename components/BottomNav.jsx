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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-between">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3"
            >
              <span className="relative">
                <Icon
                  size={20}
                  strokeWidth={active ? 1.75 : 1.4}
                  className={active ? 'text-black' : 'text-black/30'}
                  fill={active && label === 'Wishlist' ? '#0A0A0A' : 'none'}
                />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-black text-white text-[8px] leading-none rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-[3px]">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>

              <span
                className={`text-[9px] tracking-[0.08em] ${
                  active ? 'text-black' : 'text-black/30'
                }`}
              >
                {label}
              </span>

              {/* Gold underline dash when active */}
              <span
                className="h-[2px] w-4 mt-0.5 transition-colors"
                style={{ background: active ? '#C6A15B' : 'transparent' }}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}