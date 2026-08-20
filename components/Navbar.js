'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, Heart, ClipboardList } from 'lucide-react';
import { useCart } from './CartContext';
import { useWishlist } from './WhishlistContext';
import CouponMarquee from './CouponMarquee';

// Design tokens — shared across the site's white/pink design system
const INK = '#241B21';
const ROSE = '#E24C6B';
const BLUSH = '#FDE7EC';
const BLUSH_LINE = '#F6C9D3';
const PAPER = '#FFFFFF';

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { count } = useCart();
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist?.length || 0;

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  function onSearch(e) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <>
      <CouponMarquee />

      <header className="sticky top-0 z-50" style={{ background: PAPER, borderBottom: `1px solid ${BLUSH_LINE}` }}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Main nav row */}
          <div className="flex items-center justify-between gap-3 py-3">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 -ml-2"
              style={{ color: INK }}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
            </button>

            {/* Brand / Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden">
                <Image src="/logo.png" alt="Mohith Trends" fill className="object-cover scale-105" />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span
                  className="font-semibold text-3xl tracking-tight"
                  style={{ color: INK, fontFamily: 'Georgia, serif' }}
                >
                  Mohith
                </span>
                <span
                  className="text-sm tracking-[2px] uppercase font-medium"
                  style={{ color: ROSE }}
                >
                  Trends
                </span>
              </div>
            </Link>

            {/* Search — desktop */}
            <form
              onSubmit={onSearch}
              className="flex-1 max-w-lg hidden sm:flex items-center gap-2 rounded-full px-4 py-2 transition-colors"
              style={{ background: BLUSH, border: `1px solid ${BLUSH_LINE}` }}
            >
              <Search size={17} className="shrink-0" style={{ color: ROSE }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search kurtis, nighties, innerwear..."
                className="bg-transparent outline-none w-full text-sm"
                style={{ color: INK }}
              />
            </form>

            {/* Nav icons */}
            <div className="flex items-center gap-1">
              <Link
                href="/orders"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                style={{ color: INK }}
                aria-label="My Orders"
              >
                <ClipboardList size={21} strokeWidth={1.5} />
              </Link>

              <Link
                href="/wishlist"
                className="hidden md:flex relative items-center justify-center w-10 h-10 rounded-full transition-colors"
                style={{ color: INK }}
                aria-label="Wishlist"
              >
                <Heart size={21} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-[9px] font-semibold rounded-full w-[17px] h-[17px] flex items-center justify-center text-white"
                    style={{ background: ROSE, border: `1px solid ${PAPER}` }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                style={{ color: INK }}
                aria-label="Cart"
              >
                <ShoppingBag size={22} strokeWidth={1.5} />
                {count > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-[9px] font-semibold rounded-full w-[17px] h-[17px] flex items-center justify-center text-white"
                    style={{ background: ROSE, border: `1px solid ${PAPER}` }}
                  >
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Search — mobile */}
          <form
            onSubmit={onSearch}
            className="flex sm:hidden items-center gap-2 rounded-full px-4 py-2 mb-3"
            style={{ background: BLUSH, border: `1px solid ${BLUSH_LINE}` }}
          >
            <Search size={16} className="shrink-0" style={{ color: ROSE }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search kurtis, nighties, innerwear..."
              className="bg-transparent outline-none w-full text-sm"
              style={{ color: INK }}
            />
          </form>

          {/* Category nav — desktop horizontal */}
          <nav className="hidden md:flex items-center overflow-x-auto no-scrollbar" style={{ borderTop: `1px solid ${BLUSH_LINE}` }}>
            {categories.map((c) => (
              <Link
                key={c._id}
                href={`/category/${c.slug}`}
                className="px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 border-transparent transition-colors"
                style={{ color: INK }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = ROSE;
                  e.currentTarget.style.borderColor = ROSE;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = INK;
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {c.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu dropdown */}
          {menuOpen && (
            <nav className="md:hidden flex flex-wrap gap-2 py-3" style={{ borderTop: `1px solid ${BLUSH_LINE}` }}>
              {categories.map((c) => (
                <Link
                  key={c._id}
                  href={`/category/${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ background: BLUSH, color: INK, border: `1px solid ${BLUSH_LINE}` }}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
    </>
  );
}