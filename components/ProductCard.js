'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, ShoppingBag, Zap } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getDefaultAvailableSizeEntry, getVariantTotalStock } from '@/lib/stock';
import { useCart } from './CartContext';
import { useWishlist } from './WhishlistContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// SSRK Brand Colors
// Crimson : #8B0000
// Gold    : #C9A84C
// Cream   : #fdf5f5

export default function ProductCard({ product }) {
  const variant = product.variants?.[0];
  const image = variant?.images?.[0] || '/placeholder.png';
  const price = product.basePrice || variant?.price || 0;
  const compareAt = variant?.compareAtPrice || 0;
  const discountPct = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wished = isWishlisted(product._id);
  const router = useRouter();

  // Default to the first size that actually has stock; fall back to the
  // first size entry if everything is sold out (so we can still show 0).
  const defaultSizeEntry = getDefaultAvailableSizeEntry(variant);
  const defaultSize = defaultSizeEntry?.size || 'Free Size';
  const defaultSizeStock = defaultSizeEntry?.stock || 0;

  const totalStock = getVariantTotalStock(variant);
  const outOfStock = totalStock <= 0;
  const lowStock = !outOfStock && totalStock <= 5;

  function buildItem() {
    return {
      productId: product._id,
      variantId: variant?._id,
      comboId: null,
      name: product.name,
      image,
      color: variant?.color || '-',
      size: defaultSize,
      price,
      qty: 1,
      stock: defaultSizeStock,
    };
  }

  function handleAddToCart(e) {
    e.preventDefault();
    if (outOfStock || defaultSizeStock <= 0) {
      toast.error('This item is currently out of stock');
      return;
    }
    setAdding(true);
    addItem(buildItem());
    setTimeout(() => setAdding(false), 800);
  }

  function handleBuyNow(e) {
    e.preventDefault();
    if (outOfStock || defaultSizeStock <= 0) {
      toast.error('This item is currently out of stock');
      return;
    }
    addItem(buildItem());
    router.push('/checkout');
  }

  function handleWish(e) {
    e.preventDefault();
    toggleWishlist(product._id);
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist');
  }

  return (
    <div
      className="group block overflow-hidden bg-white transition-all"
      style={{
        borderRadius: '12px',
        border: '1.5px solid #e8d5d5',
        boxShadow: '0 1px 4px rgba(139,0,0,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,0,0,0.13)';
        e.currentTarget.style.borderColor = '#C9A84C';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(139,0,0,0.06)';
        e.currentTarget.style.borderColor = '#e8d5d5';
      }}
    >
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden" style={{ background: '#fdf5f5' }}>
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-500 ${outOfStock ? 'grayscale opacity-70' : 'group-hover:scale-105'}`}
          />

          {/* Badges */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1">
            {discountPct > 0 && !outOfStock && (
              <span
                className="text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full"
                style={{ background: '#8B0000', fontFamily: 'sans-serif' }}
              >
                {discountPct}% OFF
              </span>
            )}
            {product.isBestSeller && (
              <span
                className="text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full"
                style={{ background: '#C9A84C', color: '#fff', fontFamily: 'sans-serif' }}
              >
                ⭐ <span className="hidden sm:inline">BESTSELLER</span>
                <span className="sm:hidden">BEST</span>
              </span>
            )}
            {outOfStock && (
              <span
                className="text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full"
                style={{ background: '#666', fontFamily: 'sans-serif' }}
              >
                Out of Stock
              </span>
            )}
            {lowStock && (
              <span
                className="text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full"
                style={{ background: '#c0392b', fontFamily: 'sans-serif' }}
              >
                Only {totalStock} left
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWish}
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            style={{ border: wished ? '1.5px solid #8B0000' : '1.5px solid #e8d5d5' }}
            aria-label="Toggle wishlist"
          >
            <Heart
              className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]"
              style={{
                fill: wished ? '#8B0000' : 'none',
                color: wished ? '#8B0000' : '#999',
              }}
            />
          </button>
        </div>

        {/* Info */}
        <div className="pt-2 px-2 sm:pt-2.5 sm:px-2.5">
          <p
            className="text-xs sm:text-sm font-medium line-clamp-1"
            style={{ color: '#1a1a1a', fontFamily: 'Georgia, serif' }}
          >
            {product.name}
          </p>

          <div className="flex items-center gap-1 mt-0.5">
            <Star
              className="w-2.5 h-2.5 sm:w-[11px] sm:h-[11px]"
              style={{ fill: '#C9A84C', color: '#C9A84C' }}
            />
            <span className="text-[10px] sm:text-[11px]" style={{ color: '#888', fontFamily: 'sans-serif' }}>
              {product.rating || 'New'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
            <span
              className="font-extrabold text-sm sm:text-base"
              style={{ color: '#8B0000', fontFamily: 'Georgia, serif' }}
            >
              {formatINR(price)}
            </span>
            {compareAt > price && (
              <>
                <span
                  className="text-[11px] sm:text-[12px] line-through"
                  style={{ color: '#bbb', fontFamily: 'sans-serif' }}
                >
                  {formatINR(compareAt)}
                </span>
                <span
                  className="text-[10px] sm:text-[11px] font-semibold"
                  style={{ color: '#2e7d32', fontFamily: 'sans-serif' }}
                >
                  {discountPct}% off
                </span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Gold divider */}
      <div
        className="mx-2 sm:mx-2.5 mt-1.5"
        style={{ height: '1px', background: '#C9A84C', opacity: 0.35 }}
      />

      {/* CTAs */}
      <div className="px-2 pb-2 pt-1.5 sm:px-2.5 sm:pb-2.5 sm:pt-2 flex gap-1 sm:gap-1.5">
        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold py-1.5 sm:py-2 active:scale-95 transition-transform"
          style={{
            border: '1.5px solid #8B0000',
            color: '#8B0000',
            borderRadius: '8px',
            background: '#fff',
            fontFamily: 'sans-serif',
            cursor: outOfStock ? 'not-allowed' : 'pointer',
            opacity: outOfStock ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!outOfStock) e.currentTarget.style.background = '#fdf5f5';
          }}
          onMouseLeave={(e) => {
            if (!outOfStock) e.currentTarget.style.background = '#fff';
          }}
        >
          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="truncate">
            {outOfStock ? (
              'Sold Out'
            ) : adding ? (
              'Added!'
            ) : (
              <>
                <span className="sm:hidden">Cart</span>
                <span className="hidden sm:inline">Add to Cart</span>
              </>
            )}
          </span>
        </button>

        {/* Buy Now */}
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold py-1.5 sm:py-2 active:scale-95 transition-transform"
          style={{
            background: '#8B0000',
            color: '#fff',
            border: '1.5px solid #C9A84C',
            borderRadius: '8px',
            fontFamily: 'sans-serif',
            cursor: outOfStock ? 'not-allowed' : 'pointer',
            opacity: outOfStock ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!outOfStock) e.currentTarget.style.background = '#6e0000';
          }}
          onMouseLeave={(e) => {
            if (!outOfStock) e.currentTarget.style.background = '#8B0000';
          }}
        >
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" fill="white" />
          <span className="truncate">{outOfStock ? 'Sold Out' : 'Buy Now'}</span>
        </button>
      </div>
    </div>
  );
}