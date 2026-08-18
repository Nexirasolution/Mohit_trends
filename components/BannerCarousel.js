'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Design tokens — shared with ReviewSection for a consistent system
const INK = '#241B21';
const INK_SOFT = '#A9808C';
const ROSE = '#E24C6B';
const BLUSH = '#FDE7EC';
const PAPER = '#FFFFFF';

export default function BannerCarousel({ banners }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners?.length) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners]);

  if (!banners?.length) return null;

  return (
    <section className="relative w-full overflow-hidden" style={{ background: PAPER }}>
      {/*
        On mobile the image and text panel STACK in normal flow (fixed heights,
        no overlay), so long copy can never get clipped or overlap the arrows/dots.
        From sm+ up it switches back to the cinematic overlay treatment.
      */}
      <div className="relative w-full h-[420px] sm:h-0 sm:pb-[42.1%]">

        {banners.map((b, i) => (
          <div
            key={b._id}
            className={`absolute inset-0 flex flex-col sm:block transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Image strip: fixed height on mobile, fills the box on sm+ */}
            <div className="relative w-full h-[220px] shrink-0 sm:absolute sm:inset-0 sm:h-full">
              <img
                src={b.image}
                alt={b.title || 'Banner'}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>

            {(b.title || b.subtitle || b.link) && (
              <div className="relative flex-1 min-h-0 sm:absolute sm:inset-0 sm:flex sm:items-center">
                {/* Quiet paper panel instead of a color gradient wash — text sits on
                    a soft near-opaque card rather than tinting the whole image */}
                <div
                  className="w-full h-full sm:h-auto sm:w-auto sm:max-w-md sm:m-8 lg:m-14 px-5 py-4 sm:px-9 sm:py-9 flex flex-col justify-center overflow-hidden"
                  style={{
                    background: PAPER,
                    borderTop: `1px solid ${BLUSH}`,
                  }}
                >
                  {b.eyebrow && (
                    <p
                      className="text-[10px] sm:text-[11px] font-semibold mb-1.5 sm:mb-2"
                      style={{ color: ROSE, letterSpacing: '0.18em', textTransform: 'uppercase' }}
                    >
                      {b.eyebrow}
                    </p>
                  )}

                  {b.title && (
                    <h2
                      className="leading-snug text-lg sm:text-3xl lg:text-4xl line-clamp-2"
                      style={{
                        color: INK,
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontWeight: 400,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {b.title}
                    </h2>
                  )}

                  {b.subtitle && (
                    <p
                      className="mt-1.5 sm:mt-3 text-[12px] sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3"
                      style={{ color: INK_SOFT, fontFamily: 'system-ui, sans-serif' }}
                    >
                      {b.subtitle}
                    </p>
                  )}

                  {b.link && (
                    <Link
                      href={b.link}
                      className="mt-2.5 sm:mt-6 inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold group w-fit"
                      style={{ color: ROSE, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                    >
                      {b.buttonText || 'Shop Now'}
                      <span
                        aria-hidden="true"
                        className="inline-block transition-transform group-hover:translate-x-0.5"
                        style={{ height: '1px', width: '18px', background: ROSE }}
                      />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {banners.length > 1 && (
          <>
            {/* Arrows: pinned to the 220px image strip on mobile, never
                sitting on top of the text panel below it */}
            <button
              onClick={() => setIndex((i) => (i - 1 + banners.length) % banners.length)}
              className="absolute left-2 sm:left-5 top-[110px] sm:top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full transition z-10"
              style={{ background: PAPER, color: ROSE, border: `1px solid ${BLUSH}` }}
              aria-label="Previous"
            >
              <ChevronLeft size={15} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % banners.length)}
              className="absolute right-2 sm:right-5 top-[110px] sm:top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full transition z-10"
              style={{ background: PAPER, color: ROSE, border: `1px solid ${BLUSH}` }}
              aria-label="Next"
            >
              <ChevronRight size={15} strokeWidth={1.75} />
            </button>

            {/* Thin dash indicators — sit at the base of the image strip on
                mobile, bottom-anchored on sm+, so they never overlap the text */}
            <div className="absolute top-[196px] sm:top-auto sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="rounded-full transition-all"
                  style={{
                    height: '3px',
                    width: i === index ? '22px' : '10px',
                    background: i === index ? ROSE : 'rgba(255,255,255,0.7)',
                    boxShadow: i === index ? 'none' : '0 0 0 1px rgba(36,27,33,0.15)',
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