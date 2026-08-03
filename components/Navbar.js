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
  const [searchOpen, setSearchOpen] = useState(false);
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

      <header className="sticky top-0 z-50 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Main row */}
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden -ml-2 p-2 text-black/70"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={18} strokeWidth={1.25} /> : <Menu size={18} strokeWidth={1.25} />}
            </button>

            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                <Image
                  src="/logo.png"
                  alt="Mohith Trends"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="hidden sm:block font-serif text-base tracking-wide text-black">
                Mohith Trends
              </span>
            </Link>

            {/* Search — desktop, understated */}
            <form
              onSubmit={onSearch}
              className="flex-1 max-w-xs hidden md:flex items-center gap-2 mx-8"
            >
              <Search size={14} strokeWidth={1.25} className="text-black/30 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="bg-transparent outline-none w-full text-sm text-black placeholder:text-black/30 font-light"
              />
            </form>

            {/* Icons */}
            <div className="flex items-center gap-1">
              {/* Search — mobile toggle */}
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 text-black/60"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
              >
                <Search size={17} strokeWidth={1.25} />
              </button>

              <Link
                href="/orders"
                className="hidden md:flex items-center justify-center w-9 h-9 text-black/60 hover:text-black transition-colors"
                aria-label="My Orders"
              >
                <ClipboardList size={17} strokeWidth={1.25} />
              </Link>

              <Link
                href="/wishlist"
                className="hidden md:flex relative items-center justify-center w-9 h-9 text-black/60 hover:text-black transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={17} strokeWidth={1.25} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full bg-[#C6A15B]" />
                )}
              </Link>

              <Link
                href="/cart"
                className="relative flex items-center justify-center w-9 h-9 text-black/60 hover:text-black transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={18} strokeWidth={1.25} />
                {count > 0 && (
                  <span className="absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full bg-[#C6A15B]" />
                )}
              </Link>
            </div>
          </div>

          {/* Search — mobile, only when opened */}
          {searchOpen && (
            <form onSubmit={onSearch} className="md:hidden flex items-center gap-2 pb-3">
              <Search size={14} strokeWidth={1.25} className="text-black/30 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="bg-transparent outline-none w-full text-sm text-black placeholder:text-black/30 font-light"
              />
            </form>
          )}

          {/* Categories — desktop */}
          <nav className="hidden md:flex items-center gap-7 h-11 overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <Link
                key={c._id}
                href={`/category/${c.slug}`}
                className="text-[11px] tracking-[0.08em] uppercase whitespace-nowrap text-black/45 hover:text-black transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu */}
          {menuOpen && (
            <nav className="md:hidden flex flex-col gap-4 pt-1 pb-5">
              {categories.map((c) => (
                <Link
                  key={c._id}
                  href={`/category/${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-[11px] tracking-[0.08em] uppercase text-black/60"
                >
                  {c.name}
                </Link>
              ))}
              <div className="flex gap-6 pt-2 mt-1 border-t border-black/10">
                <Link href="/orders" className="text-[11px] tracking-[0.08em] uppercase text-black/60">
                  Orders
                </Link>
                <Link href="/wishlist" className="text-[11px] tracking-[0.08em] uppercase text-black/60">
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}