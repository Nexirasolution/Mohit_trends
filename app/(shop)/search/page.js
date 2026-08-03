'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

function SearchResults() {
  const params = useSearchParams();
  const q = params.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header — query set apart as the signature element, not just a bolded title */}
      <div className="mb-8 pb-6 border-b border-brand-ink/10">
        <span className="eyebrow">Search</span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink mt-2 leading-tight">
          <span className="text-brand-ink/30">"</span>
          {q}
          <span className="text-brand-ink/30">"</span>
        </h1>
        <p className="text-brand-ink/50 text-sm mt-2 tracking-wide">
          {loading ? 'Searching…' : `${products.length} ${products.length === 1 ? 'product' : 'products'} found`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] border border-brand-ink/10 bg-white overflow-hidden">
              <div className="w-full h-full bg-brand-cream animate-pulse" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-brand-ink/15">
          <p className="font-display text-lg text-brand-ink mb-1.5">Nothing matched "{q}"</p>
          <p className="text-brand-ink/50 text-sm">Try a different spelling, or browse by category instead.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <span className="eyebrow block mb-2">Search</span>
          <p className="text-brand-ink/40 text-sm tracking-wide">Loading…</p>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}