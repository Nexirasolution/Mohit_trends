'use client';

import { useEffect, useState } from 'react';
import { Tag, Truck } from 'lucide-react';

export default function CouponMarquee() {
  const [coupons, setCoupons] = useState([]);
  const [freeShippingAbove, setFreeShippingAbove] = useState(null);

  useEffect(() => {
    fetch('/api/coupons?active=true')
      .then((r) => r.json())
      .then((d) => setCoupons(d.coupons || []))
      .catch(() => {});

    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => setFreeShippingAbove(d.settings?.freeShippingAbove ?? null))
      .catch(() => {});
  }, []);

  const freeShippingItem =
    freeShippingAbove != null ? { type: 'freeshipping', minOrderValue: freeShippingAbove } : null;

  const allItems = freeShippingItem ? [...coupons, freeShippingItem] : coupons;
  if (!allItems.length) return null;

  const items = [...allItems, ...allItems];

  return (
    <div className="relative overflow-hidden py-1.5 bg-pink-600">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10" style={{ background: 'linear-gradient(to right, #DB2777, transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10" style={{ background: 'linear-gradient(to left, #DB2777, transparent)' }} />

      <div className="flex animate-marquee whitespace-nowrap w-max">
        {items.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 mx-7 text-[11.5px] font-semibold text-white">
            {i > 0 && <span className="mr-3 text-white/50">•</span>}

            {c.type === 'freeshipping' ? (
              <>
                <Truck size={11} className="shrink-0 text-white/80" />
                FREE SHIPPING on orders above ₹{c.minOrderValue}
              </>
            ) : (
              <>
                <Tag size={11} className="shrink-0 text-white/80" />
                Use{' '}
                <span className="font-semibold tracking-widest text-[10.5px] px-2 py-px rounded-full bg-white/20 border border-white/40 text-white">
                  {c.code}
                </span>
                {' '}—{' '}
                {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                {c.minOrderValue > 0 && (
                  <span className="text-white/70 font-normal"> on orders above ₹{c.minOrderValue}</span>
                )}
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}