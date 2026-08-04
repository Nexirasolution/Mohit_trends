'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, Heart, ClipboardList } from 'lucide-react';
import { useCart } from './CartContext';
import { useWishlist } from './WhishlistContext';
import CouponMarquee from './CouponMarquee';

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
      {/* Coupon marquee — crimson bar with gold text */}
      {/* <CouponMarquee /> */}

      <header className="sticky top-0 z-50 bg-white shadow-sm" style={{ borderBottom: '3px solid #8B0000' }}>
        {/* Top accent strip */}
        <div
          className="text-center text-xs py-1 font-sans tracking-widest"
          style={{ background: '#8B0000', color: '#C9A84C' }}
        >
          Mohith Trends — Authentic Women's Fashion
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Main nav row */}
          <div className="flex items-center justify-between gap-3 py-3">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              style={{ color: '#8B0000' }}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Brand / Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden"
                // style={{
                //   border: '2.5px solid #8B0000',
                //   outline: '1.5px solid #C9A84C',
                //   outlineOffset: '2px',
                // }}
              >
                <Image src="/logo.png" alt="SSRK Trending Collections" fill className="object-cover scale-125" />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span
                  className="font-bold text-xl tracking-wide"
                  style={{ color: '#8B0000', fontFamily: 'Georgia, serif' }}
                >
                  Mohith 
                </span>
                <span
                  className="text-[10px] tracking-[2px] uppercase font-sans"
                  style={{ color: '#5a5a5a' }}
                >
                  Trends
                </span>
              </div>
            </Link>

            {/* Search — desktop */}
            <form
              onSubmit={onSearch}
              className="flex-1 max-w-lg hidden sm:flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                background: '#fdf5f5',
                border: '1.5px solid #8B0000',
              }}
            >
              <Search size={17} style={{ color: '#8B0000', flexShrink: 0 }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search kurtis, nighties, innerwear..."
                className="bg-transparent outline-none w-full text-sm font-sans"
                style={{ color: '#333' }}
              />
            </form>

            {/* Nav icons */}
            <div className="flex items-center gap-1">
              {/* Orders — desktop */}
              <Link
                href="/orders"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-transparent transition-all"
                style={{ color: '#8B0000' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fdf0f0';
                  e.currentTarget.style.borderColor = '#8B0000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                aria-label="My Orders"
              >
                <ClipboardList size={22} />
              </Link>

              {/* Wishlist — desktop */}
              <Link
                href="/wishlist"
                className="hidden md:flex relative items-center justify-center w-10 h-10 rounded-full border border-transparent transition-all"
                style={{ color: '#8B0000' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fdf0f0';
                  e.currentTarget.style.borderColor = '#8B0000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                aria-label="Wishlist"
              >
                <Heart size={22} />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-[9px] font-bold font-sans rounded-full w-[17px] h-[17px] flex items-center justify-center"
                    style={{ background: '#C9A84C', color: '#8B0000', border: '1px solid #fff' }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart — all sizes */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-full border border-transparent transition-all"
                style={{ color: '#8B0000' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fdf0f0';
                  e.currentTarget.style.borderColor = '#8B0000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                aria-label="Cart"
              >
                <ShoppingBag size={24} />
                {count > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-[9px] font-bold font-sans rounded-full w-[17px] h-[17px] flex items-center justify-center"
                    style={{ background: '#C9A84C', color: '#8B0000', border: '1px solid #fff' }}
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
            style={{ background: '#fdf5f5', border: '1.5px solid #8B0000' }}
          >
            <Search size={16} style={{ color: '#8B0000', flexShrink: 0 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search kurtis, nighties, innerwear..."
              className="bg-transparent outline-none w-full text-sm font-sans"
            />
          </form>

          {/* Gold divider */}
          <div
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #C9A84C 20%, #C9A84C 80%, transparent)',
            }}
          />

          {/* Category nav — desktop horizontal */}
          <nav className="hidden md:flex items-center overflow-x-auto no-scrollbar">
            {categories.map((c, i) => (
              <Link
                key={c._id}
                href={`/category/${c.slug}`}
                className="px-4 py-2.5 text-sm font-sans font-medium whitespace-nowrap transition-all"
                style={{ color: '#5a2020', borderBottom: '2.5px solid transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#8B0000';
                  e.currentTarget.style.borderBottomColor = '#8B0000';
                  e.currentTarget.style.background = '#fdf5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#5a2020';
                  e.currentTarget.style.borderBottomColor = 'transparent';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {c.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu dropdown */}
          {menuOpen && (
            <nav className="md:hidden flex flex-wrap gap-2 py-3">
              {categories.map((c) => (
                <Link
                  key={c._id}
                  href={`/category/${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 rounded-full text-sm font-medium font-sans transition-all"
                  style={{
                    background: '#fdf5f5',
                    color: '#8B0000',
                    border: '1px solid #8B0000',
                  }}
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