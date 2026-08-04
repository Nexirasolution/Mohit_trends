'use client';

import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

export default function ReviewSection({ reviews }) {
  if (!reviews?.length) return null;

  return (
    <section style={{ background: '#fdf5f5', borderTop: '2px solid #C9A84C', borderBottom: '2px solid #C9A84C' }} className="py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-6">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: '#C9A84C', fontFamily: 'sans-serif' }}
          >
            Real Customers
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: '#8B0000', fontFamily: 'Georgia, serif', letterSpacing: '0.5px' }}
          >
            What They're Saying
          </h2>
          {/* Gold ornament divider */}
          <div className="flex items-center justify-center gap-2">
            <div style={{ height: '1px', width: '50px', background: '#C9A84C' }} />
            <span style={{ color: '#C9A84C', fontSize: '14px' }}>✦</span>
            <div style={{ height: '1px', width: '50px', background: '#C9A84C' }} />
          </div>
        </div>

        {/* Review cards */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="min-w-[240px] max-w-[260px] shrink-0 bg-white p-4"
              style={{
                borderRadius: '14px',
                border: '1.5px solid #e8d5d5',
                boxShadow: '0 2px 8px rgba(139,0,0,0.07)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C9A84C';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(139,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e8d5d5';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(139,0,0,0.07)';
              }}
            >
              {/* Quote icon */}
              <Quote size={20} style={{ color: '#C9A84C', opacity: 0.5, marginBottom: '8px' }} />

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    style={
                      i < r.rating
                        ? { fill: '#C9A84C', color: '#C9A84C' }
                        : { color: '#ddd' }
                    }
                  />
                ))}
              </div>

              {/* Comment */}
              <p
                className="text-sm line-clamp-4 leading-relaxed"
                style={{ color: '#4a2020', fontFamily: 'Georgia, serif' }}
              >
                {r.comment}
              </p>

              {/* Review image */}
              {r.images?.[0] && (
                <div
                  className="relative w-full h-24 mt-3 overflow-hidden"
                  style={{ borderRadius: '8px', border: '1px solid #C9A84C' }}
                >
                  <Image src={r.images[0]} alt="Review photo" fill className="object-cover" />
                </div>
              )}

              {/* Footer */}
              <div
                className="mt-3 pt-3"
                style={{ borderTop: '1px solid #e8d5d5' }}
              >
                <p
                  className="text-xs font-bold"
                  style={{ color: '#8B0000', fontFamily: 'Georgia, serif' }}
                >
                  — {r.customerName}
                </p>
                {r.product?.name && (
                  <p
                    className="text-[11px] mt-0.5 line-clamp-1"
                    style={{ color: '#C9A84C', fontFamily: 'sans-serif' }}
                  >
                    {r.product.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}