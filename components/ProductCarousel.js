'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

const TABS = [
  { key: 'best', label: 'Bestsellers' },
  { key: 'top',  label: 'Top Sellers' },
  { key: 'new',  label: 'New Arrivals' },
];

export default function ProductTabs({ bestSellers, topSellers, activeSellers }) {
  const [active, setActive] = useState('best');

  const map = { best: bestSellers, top: topSellers, new: activeSellers };
  const products = map[active] || [];

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Section heading */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-5 text-neutral-900">
          Our Collections
        </h2>

        {/* Tab buttons — underline style */}
        <div className="flex items-center justify-center gap-6 border-b border-neutral-100">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`shrink-0 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                active === t.key
                  ? 'text-pink-600 border-pink-600'
                  : 'text-neutral-400 border-transparent hover:text-neutral-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs tracking-[0.14em] uppercase text-white bg-pink-600 hover:bg-pink-700 px-7 py-3 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}