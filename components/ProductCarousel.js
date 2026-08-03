'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';

const TABS = [
  { key: 'best', label: 'Bestsellers' },
  { key: 'top',  label: 'Top Sellers' },
  { key: 'new',  label: 'New Arrivals' },
];

const SLIDE_INTERVAL = 2200; // ms between auto-slides

// Collage span pattern — repeats every 8 products, keeps a rhythm of
// big / medium / small tiles instead of a uniform grid.
function getSpan(idx) {
  const p = idx % 8;
  if (p === 0) return 'col-span-4 row-span-2';
  if (p === 3) return 'col-span-2 row-span-2';
  if (p === 5) return 'col-span-2 row-span-1';
  return 'col-span-2 row-span-1';
}

function ProductTile({ product, span }) {
  // Products come from the Mongoose schema, which stores images/price
  // inside `variants[]`, not on the product itself. Pick a variant to
  // display — defaulting to the first one — and fall back to basePrice
  // if for some reason there's no variant at all.
  const variant = product.variants?.[0] || {};
  const images = (variant.images?.length ? variant.images : ['/placeholder.png']).filter(Boolean);
  const price = variant.price ?? product.basePrice;

  const [i, setI] = useState(0);
  const hovering = useRef(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setI((prev) => (prev + 1) % images.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`group relative overflow-hidden bg-black/[0.03] ${span}`}
    >
      {images.map((src, idx) => (
        <img
          key={src + idx}
          src={src}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          style={{ opacity: idx === i ? 1 : 0 }}
        />
      ))}

      {/* Progress dots — only if more than one image */}
      {images.length > 1 && (
        <div className="absolute top-2.5 left-2.5 right-2.5 flex gap-1 z-10">
          {images.map((_, idx) => (
            <span
              key={idx}
              className="h-[2px] flex-1 bg-white/40 overflow-hidden rounded-full"
            >
              <span
                className="block h-full bg-white transition-all"
                style={{ width: idx === i ? '100%' : '0%', transitionDuration: idx === i ? `${SLIDE_INTERVAL}ms` : '0ms' }}
              />
            </span>
          ))}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute left-3 right-3 bottom-3 text-white opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
        <p className="text-[11px] sm:text-xs tracking-wide truncate">{product.name}</p>
        <p className="text-xs sm:text-sm font-semibold mt-0.5">{formatINR(price)}</p>
      </div>
    </Link>
  );
}

export default function ProductTabs({ bestSellers, topSellers, activeSellers }) {
  const [active, setActive] = useState('best');

  const map = { best: bestSellers, top: topSellers, new: activeSellers };
  const products = map[active] || [];

  return (
    <section className="py-10">
      {/* Tabs only — no heading */}
      <div className="flex items-center justify-center gap-8 flex-wrap border-b border-black/10 mb-4 px-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className="shrink-0 pb-3 text-xs tracking-[0.15em] uppercase transition-colors relative"
            style={{ color: active === t.key ? '#0A0A0A' : 'rgba(0,0,0,0.4)' }}
            onMouseEnter={(e) => { if (active !== t.key) e.currentTarget.style.color = '#0A0A0A'; }}
            onMouseLeave={(e) => { if (active !== t.key) e.currentTarget.style.color = 'rgba(0,0,0,0.4)'; }}
          >
            {t.label}
            {active === t.key && <span className="absolute left-0 right-0 -bottom-px h-px bg-black" />}
          </button>
        ))}
      </div>

      {/* Full-bleed collage grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 auto-rows-[150px] sm:auto-rows-[190px] gap-1.5 sm:gap-2 px-1.5 sm:px-2">
        {products.map((p, idx) => (
          <ProductTile key={p._id} product={p} span={getSpan(idx)} />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-white bg-black px-10 py-4 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}