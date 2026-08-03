export const dynamic = 'force-dynamic';
import { dbConnect } from '@/lib/mongodb';
import Banner from '@/models/Banner';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Reel from '@/models/Reel';
import Combo from '@/models/Combo';
import Category from '@/models/Category';
import BannerCarousel from '@/components/BannerCarousel';
import ProductTabs from '@/components/ProductCarousel';
import ReviewSection from '@/components/ReviewSection';
import ReelsSection from '@/components/ReelsSection';

import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

async function getData() {
  await dbConnect();
  const [banners, bestSellers, topSellers, activeSellers, reviews, reels, combos, categories] = await Promise.all([
    Banner.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
    Product.find({ isActive: true, isBestSeller: true }).limit(12).lean(),
    Product.find({ isActive: true, isTopSeller: true }).limit(12).lean(),
    Product.find({ isActive: true, isActiveSeller: true }).sort({ createdAt: -1 }).limit(12).lean(),
    Review.find({ isApproved: true, isFeatured: true }).populate('product', 'name').limit(10).lean(),
    Reel.find({ isActive: true }).sort({ sortOrder: 1 }).populate('product', 'name slug').limit(10).lean(),
    Combo.find({ isActive: true }).limit(6).lean(),
    Category.find({ isActive: true }).limit(10).lean(),
  ]);
  return { banners, bestSellers, topSellers, activeSellers, reviews, reels, combos, categories };
}

export default async function HomePage() {
  const { banners, bestSellers, topSellers, activeSellers, reviews, reels, combos, categories } = await getData();
  const plainCombos = JSON.parse(JSON.stringify(combos));
  const plainCategories = JSON.parse(JSON.stringify(categories));

  return (
    <div className="overflow-x-hidden bg-brand-cream">

      {/* Banner */}
      <BannerCarousel banners={JSON.parse(JSON.stringify(banners))} />

      {/* Shop by Category — editorial collage */}
      {plainCategories?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-12 pb-4">
          <div className="grid grid-cols-6 auto-rows-[110px] sm:auto-rows-[130px] gap-2 sm:gap-3">
            {plainCategories.map((c, idx) => {
              // Repeating collage rhythm: one large tile every 6, rest small.
              const pattern = idx % 6;
              let span = 'col-span-2 row-span-2';
              if (pattern === 0) span = 'col-span-4 row-span-3';
              else if (pattern === 3) span = 'col-span-3 row-span-2';
              else if (pattern === 4) span = 'col-span-3 row-span-2';
              else span = 'col-span-2 row-span-2';

              const isLarge = pattern === 0;

              return (
                <Link
                  key={c._id}
                  href={`/category/${c.slug}`}
                  className={`group relative overflow-hidden ${span}`}
                >
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="absolute inset-0 w-full h-full object-cover grayscale-[8%] group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-700 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-brand-cream" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <span
                    className={`absolute left-3 bottom-3 sm:left-4 sm:bottom-4 font-serif text-white tracking-wide drop-shadow-sm ${
                      isLarge ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'
                    }`}
                  >
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Product tabs — Bestsellers / Top Sellers / New Arrivals */}
      <ProductTabs
        bestSellers={JSON.parse(JSON.stringify(bestSellers))}
        topSellers={JSON.parse(JSON.stringify(topSellers))}
        activeSellers={JSON.parse(JSON.stringify(activeSellers))}
      />

      {/* Combo Offers */}
      {plainCombos?.length > 0 && (
        <section className="py-14 bg-white border-y border-brand-ink/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="arc-divider">
                <span className="eyebrow">Combo Offers</span>
              </div>
              <h2 className="section-title text-2xl sm:text-3xl -mt-4">Buy together, save together</h2>
              <Link href="/combos" className="hidden sm:flex items-center gap-1 text-sm text-brand-ink font-semibold hover:text-brand-magenta hover:gap-2 transition-all mt-4 uppercase tracking-widest text-xs">
                View all <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {plainCombos.map((c, idx) => {
                const savings = c.originalPrice > c.comboPrice ? c.originalPrice - c.comboPrice : 0;
                const pct = c.originalPrice > 0 ? Math.round((savings / c.originalPrice) * 100) : 0;
                const isFeatured = idx === 0;

                return (
                  <Link
                    key={c._id}
                    href={`/combo/${c.slug}`}
                    className={`card-soft group relative overflow-hidden ${isFeatured ? 'sm:col-span-1 row-span-1' : ''}`}
                  >
                    {/* Image */}
                    <div className={`relative w-full overflow-hidden bg-brand-cream ${isFeatured ? 'aspect-[4/5]' : 'aspect-square'}`}>
                      {c.image && (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-500"
                        />
                      )}
                      {pct > 0 && (
                        <div className="absolute top-2 left-2 bg-brand-ink text-brand-cream text-[10px] font-semibold tracking-widest uppercase px-2 py-1">
                          {pct}% off
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3.5">
                      <p className="text-sm font-semibold text-brand-ink line-clamp-1">{c.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-brand-magenta font-bold text-sm">{formatINR(c.comboPrice)}</span>
                        {savings > 0 && (
                          <span className="text-[11px] text-brand-ink/40 line-through">{formatINR(c.originalPrice)}</span>
                        )}
                      </div>
                      {savings > 0 && (
                        <p className="text-[11px] text-brand-gold font-semibold mt-1 uppercase tracking-wide">Save {formatINR(savings)}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link href="/combo" className="text-xs uppercase tracking-widest text-brand-ink font-semibold">View all combos →</Link>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <ReviewSection reviews={JSON.parse(JSON.stringify(reviews))} />

      {/* Reels */}
      <ReelsSection reels={JSON.parse(JSON.stringify(reels))} />

    </div>
  );
}