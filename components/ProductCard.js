'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getDefaultAvailableSizeEntry, getVariantTotalStock } from '@/lib/stock';
import { useCart } from './CartContext';
import { useWishlist } from './WhishlistContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Mohith Trends brand tokens
// Ink   : #0A0A0A
// Gold  : #C6A15B
// Ivory : #FAF9F6

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
    <div className="group block">
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF9F6]">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-500 ${outOfStock ? 'grayscale opacity-60' : 'group-hover:scale-105'}`}
          />

          {/* Badges — quiet, plain text on transparent scrim */}
          {(outOfStock || discountPct > 0 || lowStock || product.isBestSeller) && (
            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
              {outOfStock ? (
                <span className="text-white text-[9px] tracking-widest uppercase drop-shadow-sm">
                  Sold Out
                </span>
              ) : (
                <>
                  {discountPct > 0 && (
                    <span className="text-white text-[9px] tracking-widest uppercase drop-shadow-sm">
                      {discountPct}% off
                    </span>
                  )}
                  {lowStock && (
                    <span className="text-white text-[9px] tracking-widest uppercase drop-shadow-sm">
                      {totalStock} left
                    </span>
                  )}
                  {product.isBestSeller && (
                    <span className="text-[#E8CD97] text-[9px] tracking-widest uppercase drop-shadow-sm">
                      Bestseller
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* Wishlist — plain icon, no backdrop chip */}
          <button
            onClick={handleWish}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Toggle wishlist"
          >
            <Heart
              size={16}
              strokeWidth={1.5}
              className={wished ? 'text-white' : 'text-white/80'}
              fill={wished ? '#fff' : 'none'}
            />
          </button>

          {/* CTA overlay — hidden until hover, matches collage tile reveal */}
          {!outOfStock && (
            <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-1 text-[9px] tracking-wide uppercase py-1.5 border border-white/80 text-white"
              >
                <ShoppingBag size={11} strokeWidth={1.5} className="shrink-0" />
                {adding ? 'Added' : 'Add'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 text-[9px] tracking-wide uppercase py-1.5 bg-white text-black"
              >
                Buy Now
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pt-2.5">
          <p className="text-[13px] text-black/80 line-clamp-1">{product.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-black">{formatINR(price)}</span>
            {compareAt > price && (
              <span className="text-[11px] text-black/30 line-through">{formatINR(compareAt)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}