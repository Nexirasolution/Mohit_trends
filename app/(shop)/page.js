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
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import { ArrowRight, Tag } from 'lucide-react';

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
    <div className="overflow-x-hidden bg-white">

      {/* Banner */}
      <BannerCarousel banners={JSON.parse(JSON.stringify(banners))} />

      
{/* Shop by Category */}
{plainCategories?.length > 0 && (
  <section className="max-w-6xl mx-auto px-4 pt-14 pb-6">
    <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-6 text-center">
      Shop by Category
    </h2>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
      {plainCategories.map((c) => (
        <Link
          key={c._id}
          href={`/category/${c.slug}`}
          className="group rounded-lg overflow-hidden border-2 border-pink-100 hover:border-pink-400 transition-colors bg-white"
        >
          {/* Image */}
          <div className="relative w-full aspect-square overflow-hidden bg-neutral-50">
            {c.image ? (
              <img
                src={c.image}
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-pink-50" />
            )}
          </div>

          {/* Label */}
          <div className="px-1.5 py-1.5 text-center border-t border-pink-100">
            <span
              className="text-[10.5px] font-bold font-serif tracking-wide text-neutral-900 leading-tight line-clamp-2"
              style={{
                WebkitTextStroke: "0.4px #ec4899", // pink outline around text
                textShadow: "0 0 1px rgba(236,72,153,0.4)",
              }}
            >
              {c.name}
            </span>
          </div>
        </Link>
      ))}
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
        <section className="py-16 bg-white border-t border-neutral-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center text-center mb-8">
              <span className="text-[11px] font-semibold text-pink-500 uppercase tracking-[0.2em] mb-2">
                Save More
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                Combo Offers
              </h2>
              <p className="text-neutral-400 text-sm mt-1">Buy together, save together</p>
              <Link href="/combos" className="hidden sm:flex items-center gap-1 text-sm text-pink-600 font-medium hover:gap-2 transition-all mt-3">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
              {plainCombos.map((c, idx) => {
                const savings = c.originalPrice > c.comboPrice ? c.originalPrice - c.comboPrice : 0;
                const pct = c.originalPrice > 0 ? Math.round((savings / c.originalPrice) * 100) : 0;
                const isFeatured = idx === 0;

                return (
                  <Link
                    key={c._id}
                    href={`/combo/${c.slug}`}
                    className={`group relative rounded-xl overflow-hidden border border-neutral-100 hover:border-pink-200 transition-colors ${isFeatured ? 'sm:col-span-1 row-span-1' : ''}`}
                  >
                    {/* Image */}
                    <div className={`relative w-full overflow-hidden bg-neutral-50 ${isFeatured ? 'aspect-[4/5]' : 'aspect-square'}`}>
                      {c.image && (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      {pct > 0 && (
                        <div className="absolute top-2 left-2 bg-white text-pink-600 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-pink-100">
                          <Tag size={9} /> {pct}% OFF
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-white">
                      <p className="text-sm font-medium text-neutral-900 line-clamp-1">{c.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-pink-600 font-semibold text-sm">{formatINR(c.comboPrice)}</span>
                        {savings > 0 && (
                          <span className="text-[11px] text-neutral-300 line-through">{formatINR(c.originalPrice)}</span>
                        )}
                      </div>
                      {savings > 0 && (
                        <p className="text-[11px] text-pink-500 font-medium mt-0.5">Save {formatINR(savings)}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link href="/combo" className="text-sm text-pink-600 font-medium">View all combos →</Link>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <ReviewSection reviews={JSON.parse(JSON.stringify(reviews))} />

      {/* Reels */}
      <ReelsSection reels={JSON.parse(JSON.stringify(reels))} />

      {/* Brand strip */}
      {/*
      <section className="bg-pink-50 py-16 mt-4 border-t border-pink-100">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mb-3">
            Sivakasi's own clothing store, now online
          </h2>
          <p className="text-neutral-500 text-sm">
            Women's kurtis, salwar sets, nighties and innerwear — handpicked and shipped across India.
          </p>
          <Link href="/category/salwar-set" className="inline-block mt-6 bg-pink-600 text-white font-medium px-6 py-2.5 rounded-full text-sm hover:bg-pink-700 transition-colors">
            Shop Now
          </Link>
        </div>
      </section>
      */}

    </div>
  );
}