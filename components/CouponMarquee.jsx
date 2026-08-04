'use client';

import { useEffect, useState } from 'react';
import { Tag, Truck } from 'lucide-react';

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
    <div
      className="relative overflow-hidden py-1.5"
      style={{
        background: '#8B1A1A',
        borderTop: '1.5px solid #C9A84C',
        borderBottom: '1.5px solid #C9A84C',
      }}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10"
        style={{ background: 'linear-gradient(to right, #8B1A1A, transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10"
        style={{ background: 'linear-gradient(to left, #8B1A1A, transparent)' }} />

      <div className="flex animate-marquee whitespace-nowrap w-max">
        {items.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 mx-7 text-[11.5px] font-bold text-white">

            {/* Gold diamond separator between items */}
            {i > 0 && (
              <span className="mr-3" style={{ color: '#C9A84C', fontSize: 14 }}>✦</span>
            )}

            {c.type === 'freeshipping' ? (
              <>
                <Truck size={11} style={{ color: '#C9A84C' }} className="shrink-0" />
                FREE SHIPPING on orders above ₹{c.minOrderValue}
              </>
            ) : (
              <>
                <Tag size={11} style={{ color: '#C9A84C' }} className="shrink-0" />
                Use{' '}
                <span
                  className="font-extrabold tracking-widest text-[10.5px] px-2 py-px rounded-full"
                  style={{
                    background: 'rgba(201,168,76,0.22)',
                    border: '1px solid #C9A84C',
                    color: '#FFE08A',
                  }}
                >
                  {c.code}
                </span>
                {' '}—{' '}
                {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                {c.minOrderValue > 0 && (
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                    {' '}on orders above ₹{c.minOrderValue}
                  </span>
                )}
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}