'use client';

import { useEffect, useState } from 'react';

export default function CouponMarquee() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    fetch('/api/coupons?active=true')
      .then((r) => r.json())
      .then((d) => setCoupons(d.coupons || []))
      .catch(() => {});
  }, []);

  const freeShippingItem = { type: 'freeshipping', minOrderValue: 1199 };
  const allItems = [...coupons, freeShippingItem];
  if (!allItems.length) return null;

  const items = [...allItems, ...allItems];

  return (
    <div className="relative overflow-hidden bg-black py-2 border-y border-[#C6A15B]/30">

      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-black to-transparent" />

      <div className="flex animate-marquee whitespace-nowrap w-max">
        {items.map((c, i) => (
          <span key={i} className="inline-flex items-center text-[11px] tracking-wide text-white/80 font-light">

            {i > 0 && <span className="mx-6 text-[#C6A15B] text-[8px]">◆</span>}

            {c.type === 'freeshipping' ? (
              <span>
                Free shipping on orders above{' '}
                <span className="text-[#D4B872]">₹{c.minOrderValue}</span>
              </span>
            ) : (
              <span>
                Use{' '}
                <span className="text-[#D4B872] tracking-[0.15em] border-b border-[#D4B872]/50 pb-px">
                  {c.code}
                </span>
                {' '}for{' '}
                <span className="text-white">
                  {c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`}
                </span>
                {c.minOrderValue > 0 && (
                  <span className="text-white/45"> on orders above ₹{c.minOrderValue}</span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}