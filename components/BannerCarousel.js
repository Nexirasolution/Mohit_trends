'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BannerCarousel({ banners }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners?.length) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners]);

  if (!banners?.length) return null;

  return (
    <section className="relative w-full bg-black">
      <div className="relative w-full pb-[46%] sm:pb-[38%]">

        {banners.map((b, i) => (
          <div
            key={b._id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={b.image}
              alt={b.title || 'Banner'}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Quiet black gradient for legibility — no color tint */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />

            {(b.title || b.subtitle || b.link) && (
              <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 lg:px-24">

                {b.eyebrow && (
                  <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-3 text-[#D4B872]">
                    {b.eyebrow}
                  </p>
                )}

                {b.title && (
                  <h2 className="font-serif text-white leading-[1.1]
                    text-2xl max-w-[80%]
                    sm:text-4xl sm:max-w-md
                    lg:text-5xl lg:max-w-lg">
                    {b.title}
                  </h2>
                )}

                <span className="block h-px w-10 bg-[#D4B872] mt-4 sm:mt-6" />

                {b.subtitle && (
                  <p className="mt-4 sm:mt-5 font-light text-white/70
                    text-xs leading-relaxed max-w-[70%]
                    sm:text-sm sm:max-w-xs
                    lg:text-base lg:max-w-sm">
                    {b.subtitle}
                  </p>
                )}

                {b.link && (
                  <Link
                    href={b.link}
                    className="mt-6 sm:mt-8 w-fit group flex items-center gap-3 text-white
                      text-[11px] sm:text-xs tracking-[0.2em] uppercase"
                  >
                    <span className="border-b border-white/40 pb-1 group-hover:border-[#D4B872] transition-colors">
                      {b.buttonText || 'Shop Now'}
                    </span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}

        {banners.length > 1 && (
          <>
            <button
              onClick={() => setIndex((i) => (i - 1 + banners.length) % banners.length)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeft size={22} strokeWidth={1.25} />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % banners.length)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRight size={22} strokeWidth={1.25} />
            </button>

            {/* Slim line indicators instead of dots */}
            <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="h-[2px] transition-all"
                  style={{
                    width: i === index ? '28px' : '12px',
                    background: i === index ? '#D4B872' : 'rgba(255,255,255,0.35)',
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}