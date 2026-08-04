'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Instagram, ShoppingBag } from 'lucide-react';

export default function ReelsSection({ reels }) {
  if (!reels?.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Section heading */}
      <div className="text-center mb-6">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: '#C9A84C', fontFamily: 'sans-serif' }}
        >
          Watch &amp; Shop
        </p>
        <h2
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: '#8B0000', fontFamily: 'Georgia, serif', letterSpacing: '0.5px' }}
        >
          Shop by Reels
        </h2>

        {/* Gold ornament divider */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div style={{ height: '1px', width: '50px', background: '#C9A84C' }} />
          <span style={{ color: '#C9A84C', fontSize: '14px' }}>✦</span>
          <div style={{ height: '1px', width: '50px', background: '#C9A84C' }} />
        </div>

        <a
          href="https://instagram.com/ssrkcollections"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
          style={{ color: '#8B0000', fontFamily: 'sans-serif' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8B0000')}
        >
          <Instagram size={15} /> Follow us on Instagram
        </a>
      </div>

      {/* Reels scroll row */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {reels.map((reel) => (
          <div
            key={reel._id}
            className="relative min-w-[145px] sm:min-w-[175px] aspect-[9/16] shrink-0 group"
            style={{
              borderRadius: '14px',
              overflow: 'hidden',
              border: '2px solid #C9A84C',
              boxShadow: '0 2px 10px rgba(139,0,0,0.15)',
            }}
          >
            <Image
              src={reel.thumbnail || '/placeholder.png'}
              alt={reel.title || 'Reel'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(80,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, rgba(139,0,0,0.2) 100%)' }} />

            {/* Play button */}
            <a
              href={reel.instagramLink || '#'}
              target="_blank"
              rel="noreferrer"
              className="absolute inset-0 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  border: '2px solid #C9A84C',
                  boxShadow: '0 2px 8px rgba(139,0,0,0.25)',
                }}
              >
                <Play size={16} fill="#8B0000" color="#8B0000" className="ml-0.5" />
              </div>
            </a>

            {/* Bottom info + CTA */}
            <div className="absolute bottom-0 inset-x-0 p-2.5">
              {reel.product?.name && (
                <p
                  className="text-[11px] font-medium line-clamp-1 mb-1.5"
                  style={{ color: '#fff', fontFamily: 'Georgia, serif' }}
                >
                  {reel.product.name}
                </p>
              )}
              {reel.product?.slug && (
                <Link
                  href={`/product/${reel.product.slug}`}
                  className="flex items-center justify-center gap-1 w-full text-[11px] font-bold py-1.5 transition-all"
                  style={{
                    background: '#C9A84C',
                    color: '#8B0000',
                    borderRadius: '7px',
                    fontFamily: 'sans-serif',
                    border: '1px solid #8B0000',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#8B0000';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = '#C9A84C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#C9A84C';
                    e.currentTarget.style.color = '#8B0000';
                    e.currentTarget.style.borderColor = '#8B0000';
                  }}
                >
                  <ShoppingBag size={11} /> Shop Now
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}