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

// Design tokens — shared across the site's white/pink design system
const INK = '#241B21';
const INK_SOFT = '#A9808C';
const ROSE = '#E24C6B';
const BLUSH = '#FDE7EC';
const BLUSH_LINE = '#F6C9D3';
const PAPER = '#FFFFFF';
const NEUTRAL = '#C7BDC1';

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
    <div className="group block" style={{ background: PAPER }}>
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image — full bleed, no border/box around it. Badges reduced to a
            single quiet text label instead of a stack of pills. */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg" style={{ background: BLUSH }}>
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-700 ${outOfStock ? 'grayscale opacity-70' : 'group-hover:scale-[1.03]'}`}
          />

          {/* One status label max — priority: out of stock > low stock > discount */}
          <div className="absolute top-2.5 left-2.5">
            {outOfStock ? (
              <span
                className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: PAPER, background: INK_SOFT, padding: '3px 8px', borderRadius: '3px' }}
              >
                Out of stock
              </span>
            ) : lowStock ? (
              <span
                className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: ROSE, background: 'rgba(255,255,255,0.92)', padding: '3px 8px', borderRadius: '3px' }}
              >
                {totalStock} left
              </span>
            ) : discountPct > 0 ? (
              <span
                className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: PAPER, background: ROSE, padding: '3px 8px', borderRadius: '3px' }}
              >
                {discountPct}% off
              </span>
            ) : null}
          </div>

          {/* Bestseller — small corner tag, not a pill fighting for the same space */}
          {product.isBestSeller && (
            <div className="absolute top-2.5 right-2.5">
              <span
                className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: ROSE }}
              >
                Bestseller
              </span>
            </div>
          )}

          {/* Wishlist — bare icon, no circular chip behind it */}
          <button
            onClick={handleWish}
            className="absolute bottom-2.5 right-2.5 w-8 h-8 flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Toggle wishlist"
          >
            <Heart
              className="w-[18px] h-[18px]"
              style={{
                fill: wished ? ROSE : 'rgba(255,255,255,0.85)',
                color: wished ? ROSE : INK,
                filter: 'drop-shadow(0 1px 2px rgba(36,27,33,0.25))',
              }}
            />
          </button>
        </div>

        {/* Info — quieter type, more air, serif name to match the rest of the site */}
        <div className="pt-3">
          <p
            className="text-[13px] sm:text-sm line-clamp-1"
            style={{ color: INK, fontFamily: 'Georgia, serif' }}
          >
            {product.name}
          </p>

          <div className="flex items-center gap-1 mt-1">
            <Star className="w-2.5 h-2.5" style={{ fill: ROSE, color: ROSE }} />
            <span className="text-[10px] sm:text-[11px]" style={{ color: INK_SOFT }}>
              {product.rating || 'New'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
            <span className="font-semibold text-sm sm:text-base" style={{ color: INK }}>
              {formatINR(price)}
            </span>
            {compareAt > price && (
              <span className="text-[11px] sm:text-[12px] line-through" style={{ color: NEUTRAL }}>
                {formatINR(compareAt)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* CTAs — ghost row separated by a hairline, no boxed buttons */}
      <div
        className="mt-3 flex items-stretch text-[11px] sm:text-[12px] font-medium uppercase tracking-wide"
        style={{ borderTop: `1px solid ${BLUSH_LINE}` }}
      >
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors active:scale-[0.98]"
          style={{
            color: outOfStock ? NEUTRAL : INK,
            cursor: outOfStock ? 'not-allowed' : 'pointer',
            borderRight: `1px solid ${BLUSH_LINE}`,
          }}
        >
          <ShoppingBag className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate">
            {outOfStock ? 'Sold out' : adding ? 'Added' : 'Add to bag'}
          </span>
        </button>

        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors active:scale-[0.98]"
          style={{ color: outOfStock ? NEUTRAL : ROSE, cursor: outOfStock ? 'not-allowed' : 'pointer' }}
        >
          <Zap className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{outOfStock ? 'Sold out' : 'Buy now'}</span>
        </button>
      </div>
    </div>
  );
}