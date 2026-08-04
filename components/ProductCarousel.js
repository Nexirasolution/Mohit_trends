'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

const TABS = [
  { key: 'best', label: '⭐ Bestsellers' },
  { key: 'top',  label: '🔥 Top Sellers' },
  { key: 'new',  label: '✨ New Arrivals' },
];

export default function ProductTabs({ bestSellers, topSellers, activeSellers }) {
  const [active, setActive] = useState('best');

  const map = { best: bestSellers, top: topSellers, new: activeSellers };
  const products = map[active] || [];

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Section heading */}
      <div className="text-center mb-6">
        <h2
          className="text-2xl sm:text-3xl font-bold mb-1"
          style={{ color: '#8B0000', fontFamily: 'Georgia, serif', letterSpacing: '0.5px' }}
        >
          Our Collections
        </h2>
        {/* Gold ornament divider */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div style={{ height: '1px', width: '60px', background: '#C9A84C' }} />
          <span style={{ color: '#C9A84C', fontSize: '16px' }}>✦</span>
          <div style={{ height: '1px', width: '60px', background: '#C9A84C' }} />
        </div>

        {/* Tab buttons */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className="shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={
                active === t.key
                  ? {
                      background: '#8B0000',
                      color: '#fff',
                      border: '1.5px solid #C9A84C',
                      boxShadow: '0 2px 8px rgba(139,0,0,0.2)',
                      fontFamily: 'sans-serif',
                      cursor: 'pointer',
                    }
                  : {
                      background: '#fff',
                      color: '#5a2020',
                      border: '1.5px solid #e8d5d5',
                      fontFamily: 'sans-serif',
                      cursor: 'pointer',
                    }
              }
              onMouseEnter={(e) => {
                if (active !== t.key) {
                  e.currentTarget.style.borderColor = '#C9A84C';
                  e.currentTarget.style.color = '#8B0000';
                }
              }}
              onMouseLeave={(e) => {
                if (active !== t.key) {
                  e.currentTarget.style.borderColor = '#e8d5d5';
                  e.currentTarget.style.color = '#5a2020';
                }
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 13,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#FBF7F0',
            background: '#9E3A1C',
            padding: '12px 28px',
            borderRadius: 10,
            outlineColor: '#C9962B',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#7E2E15')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#9E3A1C')}
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}