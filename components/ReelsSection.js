'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, ShoppingBag } from 'lucide-react';

export default function ReelsSection({ reels }) {
  if (!reels?.length) return null;

  return (
    <section className="py-10">
      {/* Reels scroll row — full bleed, no heading */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar px-1.5 sm:px-2">
        {reels.map((reel) => (
          <div
            key={reel._id}
            className="relative min-w-[130px] sm:min-w-[170px] aspect-[9/16] shrink-0 group overflow-hidden bg-black"
          >
            <Image
              src={reel.thumbnail || '/placeholder.png'}
              alt={reel.title || 'Reel'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Quiet black gradient — legibility only, no color tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

            {/* Play button */}
            <a
              href={reel.instagramLink || '#'}
              target="_blank"
              rel="noreferrer"
              className="absolute inset-0 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-9 h-9 border border-white/70 flex items-center justify-center rounded-full group-hover:scale-110 group-hover:border-white transition-all">
                <Play size={13} fill="#fff" color="#fff" className="ml-0.5" />
              </div>
            </a>

            {/* Bottom info + CTA */}
            <div className="absolute bottom-0 inset-x-0 p-3">
              {reel.product?.name && (
                <p className="text-[11px] text-white/90 font-light line-clamp-1 mb-2">
                  {reel.product.name}
                </p>
              )}
              {reel.product?.slug && (
                <Link
                  href={`/product/${reel.product.slug}`}
                  className="flex items-center justify-center gap-1.5 w-full text-[10px] tracking-widest uppercase py-2 border border-white/70 text-white transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#0A0A0A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#fff';
                  }}
                >
                  <ShoppingBag size={11} strokeWidth={1.5} /> Shop Now
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}