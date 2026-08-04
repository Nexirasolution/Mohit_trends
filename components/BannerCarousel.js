'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BannerCarousel({ banners }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners?.length) return;
    // ✅ Fixed: was setInterval(...) inside setInterval — should be setIndex
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners]);

  if (!banners?.length) return null;

  return (
    <section className="relative w-full overflow-hidden" style={{ background: '#FAF7F2' }}>
      <div className="relative w-full pb-[42.1%]">

        {banners.map((b, i) => (
          <div
            key={b._id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Gold left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 z-10" style={{ background: '#C9A84C' }} />

            <img
              src={b.image}
              alt={b.title || 'Banner'}
              className="absolute inset-0 w-full h-full object-contain sm:object-cover object-center"
            />

            {(b.title || b.subtitle || b.link) && (
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 lg:px-20"
                style={{ background: 'linear-gradient(to right, rgba(139,26,26,0.72) 0%, rgba(139,26,26,0.35) 55%, transparent 100%)' }}>

                {/* Gold rule */}
                <div className="mb-2 hidden sm:block" style={{ width: 36, height: 2, background: '#C9A84C', borderRadius: 1 }} />

                {b.eyebrow && (
                  <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase mb-1"
                    style={{ color: '#C9A84C' }}>
                    {b.eyebrow}
                  </p>
                )}

                {b.title && (
                  <h2 className="text-white font-bold drop-shadow-md
                    text-base leading-snug max-w-[75%]
                    sm:text-3xl sm:max-w-sm
                    lg:text-4xl lg:max-w-md">
                    {b.title}
                  </h2>
                )}

                {b.subtitle && (
                  <p className="mt-1 sm:mt-2 drop-shadow
                    text-[11px] leading-relaxed max-w-[70%]
                    sm:text-sm sm:max-w-xs
                    lg:text-base lg:max-w-sm"
                    style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {b.subtitle}
                  </p>
                )}

                {b.link && (
                  <Link
                    href={b.link}
                    className="mt-3 sm:mt-5 w-fit font-bold rounded-full transition-colors
                      text-[10px] px-4 py-1.5 sm:text-sm sm:px-6 sm:py-2.5"
                    style={{
                      background: '#C9A84C',
                      color: '#4a1a00',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {b.buttonText || 'Shop Now'}
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
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full transition z-10"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(201,168,76,0.5)', color: '#C9A84C' }}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % banners.length)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full transition z-10"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(201,168,76,0.5)', color: '#C9A84C' }}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>

            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="rounded-full transition-all"
                  style={{
                    height: i === index ? '6px' : '5px',
                    width: i === index ? '18px' : '5px',
                    background: i === index ? '#C9A84C' : 'rgba(255,255,255,0.4)',
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