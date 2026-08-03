'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/components/WhishlistContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      if (!wishlist?.length) {
        if (active) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/products/by-ids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: wishlist })
        });
        const data = await res.json();
        if (active) setProducts(data.products || []);
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      active = false;
    };
  }, [wishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-[60vh] bg-brand-cream">
      <div className="mb-8">
        <span className="eyebrow">Saved for later</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-ink mt-1.5">My Wishlist</h1>
        <p className="text-brand-ink/50 text-sm mt-1">
          {products.length > 0
            ? `${products.length} item${products.length > 1 ? 's' : ''} saved`
            : 'Items you save will show up here'}
        </p>
        <div className="gold-divider max-w-[6rem] mt-4" />
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-sm border border-brand-ink/10 bg-white overflow-hidden">
              <div className="w-full h-full bg-brand-cream animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-20 border border-dashed border-brand-ink/15">
          <Heart size={28} strokeWidth={1.25} className="mx-auto mb-3 text-brand-gold" />
          <p className="text-sm text-brand-ink/50 mb-5 tracking-wide">Your wishlist is empty</p>
          <Link href="/" className="btn-primary text-xs uppercase tracking-widest">
            Start Shopping
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}