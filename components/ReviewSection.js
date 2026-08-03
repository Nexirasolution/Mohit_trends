'use client';

import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

export default function ReviewSection({ reviews }) {
  if (!reviews?.length) return null;

  return (
    <section className="py-10">
      {/* Review cards — full bleed, no heading */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar px-1.5 sm:px-2">
        {reviews.map((r) => (
          <div
            key={r._id}
            className="min-w-[230px] max-w-[250px] shrink-0 bg-[#FAF9F6] p-5"
          >
            <Quote size={14} strokeWidth={1.5} className="text-[#C6A15B] mb-2.5" />

            {/* Stars */}
            <div className="flex items-center gap-0.5 mb-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  strokeWidth={1.5}
                  className={i < r.rating ? 'text-[#C6A15B]' : 'text-black/15'}
                  fill={i < r.rating ? '#C6A15B' : 'none'}
                />
              ))}
            </div>

            {/* Comment */}
            <p className="text-[13px] text-black/65 font-light line-clamp-4 leading-relaxed">
              {r.comment}
            </p>

            {/* Review image */}
            {r.images?.[0] && (
              <div className="relative w-full h-24 mt-3.5 overflow-hidden bg-white">
                <Image src={r.images[0]} alt="Review photo" fill className="object-cover" />
              </div>
            )}

            {/* Footer */}
            <div className="mt-3.5 pt-3.5 border-t border-black/10">
              <p className="font-serif text-[13px] text-black">{r.customerName}</p>
              {r.product?.name && (
                <p className="text-[10px] mt-0.5 text-black/40 font-light line-clamp-1">
                  {r.product.name}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}