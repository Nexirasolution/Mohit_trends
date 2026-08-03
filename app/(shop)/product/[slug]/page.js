'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingBag, Zap, Heart, Share2, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getSizeStock } from '@/lib/stock';
import { useCart } from '@/components/CartContext';
import ColorSizeSelector from '@/components/ColorSizeSelector';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [activeVariant, setActiveVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [activeSize, setActiveSize] = useState('');
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setActiveVariant(d.product?.variants?.[0]);
      });
  }, [slug]);

  if (!data?.product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-brand-ink/40">
          <div className="w-8 h-8 border-2 border-brand-magenta border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading product…</p>
        </div>
      </div>
    );
  }

  const { product, reviews, related } = data;
  const images = activeVariant?.images || [];
  const discount = activeVariant?.compareAtPrice > activeVariant?.price
    ? Math.round(((activeVariant.compareAtPrice - activeVariant.price) / activeVariant.compareAtPrice) * 100)
    : 0;

  const selectedSizeStock = getSizeStock(activeVariant, activeSize);
  const sizeOutOfStock = !!activeSize && selectedSizeStock <= 0;

  function prevImage() { setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1)); }
  function nextImage() { setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1)); }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  }

  function handleColorChange(v) {
    setActiveVariant(v);
    setActiveImage(0);
    setActiveSize('');
    setQty(1);
  }

  function handleSizeChange(size) {
    setActiveSize(size);
    const stock = getSizeStock(activeVariant, size);
    setQty((q) => (stock > 0 ? Math.min(q, stock) : 1));
  }

  function handleAddToCart() {
    if (!activeSize) { toast.error('Please select a size'); return; }
    const stock = getSizeStock(activeVariant, activeSize);
    if (stock <= 0) { toast.error('This size is out of stock'); return; }
    if (qty > stock) {
      toast.error(`Only ${stock} left in stock`);
      setQty(stock);
      return;
    }

    addItem({
      productId: product._id,
      variantId: activeVariant._id,
      comboId: null,
      name: product.name,
      image: activeVariant.images?.[0],
      color: activeVariant.color,
      size: activeSize,
      price: activeVariant.price,
      qty,
      stock,
    });
  }

  function handleBuyNow() {
    if (!activeSize) { toast.error('Please select a size'); return; }
    const stock = getSizeStock(activeVariant, activeSize);
    if (stock <= 0) { toast.error('This size is out of stock'); return; }
    if (qty > stock) {
      toast.error(`Only ${stock} left in stock`);
      setQty(stock);
      return;
    }

    addItem({
      productId: product._id,
      variantId: activeVariant._id,
      comboId: null,
      name: product.name,
      image: activeVariant.images?.[0],
      color: activeVariant.color,
      size: activeSize,
      price: activeVariant.price,
      qty,
      stock,
    });
    router.push('/checkout');
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 bg-brand-cream">
      <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">

        {/* ── Images ── */}
        <div>
          {/* Main image — no frame, no border, image just sits */}
          <div className="relative w-full aspect-[3/4] overflow-hidden bg-white">
            {images[activeImage] && (
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                sizes="(max-width:640px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            )}

            {/* Discount — quiet text, no tag box */}
            {discount > 0 && (
              <div className="absolute top-3 left-3 text-white text-[10px] uppercase tracking-widest drop-shadow-sm">
                {discount}% off
              </div>
            )}

            {/* Wish + Share — plain icons, no box */}
            <div className="absolute top-3 right-3 flex flex-col gap-3">
              <button
                onClick={() => { setWished((w) => !w); toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist'); }}
              >
                <Heart size={18} strokeWidth={1.5} className={wished ? 'fill-brand-magenta text-brand-magenta' : 'text-white drop-shadow-sm'} />
              </button>
              <button onClick={handleShare}>
                <Share2 size={17} strokeWidth={1.5} className="text-white drop-shadow-sm" />
              </button>
            </div>

            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                  <ChevronLeft size={20} strokeWidth={1.5} className="text-white drop-shadow-sm" />
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                  <ChevronRight size={20} strokeWidth={1.5} className="text-white drop-shadow-sm" />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`rounded-full transition-all ${i === activeImage ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails — quiet, opacity only, no borders */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-20 overflow-hidden shrink-0 transition-opacity ${i === activeImage ? 'opacity-100' : 'opacity-40'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ── */}
        <div className="flex flex-col">
          <p className="text-[11px] uppercase tracking-[0.15em] text-brand-ink/40">{product.category?.name}</p>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-ink mt-1.5 leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} strokeWidth={1.5} className={i < Math.round(product.rating) ? 'fill-brand-gold text-brand-gold' : 'text-brand-ink/20'} />
              ))}
            </div>
            <span className="text-xs text-brand-ink/40">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="mt-4">
            <div className="flex items-end gap-3">
              <span className="text-2xl text-brand-ink">{formatINR(activeVariant?.price)}</span>
              {activeVariant?.compareAtPrice > activeVariant?.price && (
                <span className="text-brand-ink/30 line-through text-sm mb-0.5">{formatINR(activeVariant.compareAtPrice)}</span>
              )}
            </div>
            {discount > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <Tag size={11} className="text-brand-gold" />
                <p className="text-brand-gold text-xs tracking-wide">You save {formatINR(activeVariant.compareAtPrice - activeVariant.price)}</p>
              </div>
            )}
          </div>

          {product.fabric && (
            <p className="text-sm text-brand-ink/50 mt-2.5">Fabric — <span className="text-brand-ink/80">{product.fabric}</span></p>
          )}

          {/* Color + Size */}
          <div className="mt-5">
            <ColorSizeSelector
              variants={product.variants}
              activeVariant={activeVariant}
              onColorChange={handleColorChange}
              activeSize={activeSize}
              onSizeChange={handleSizeChange}
              categoryType={product.category?.type}
            />
          </div>

          {/* Qty */}
          <div className="flex items-center gap-3 mt-5">
            <p className="text-xs uppercase tracking-wide text-brand-ink/50">Qty</p>
            <div className="flex items-center border border-brand-ink/15">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center text-base">−</button>
              <span className="w-7 text-center text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => (selectedSizeStock > 0 ? Math.min(selectedSizeStock, q + 1) : q + 1))}
                disabled={!!activeSize && qty >= selectedSizeStock}
                className="w-8 h-8 flex items-center justify-center text-base disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            {!!activeSize && selectedSizeStock > 0 && selectedSizeStock <= 5 && (
              <span className="text-xs text-brand-magenta">Only {selectedSizeStock} left</span>
            )}
            {sizeOutOfStock && (
              <span className="text-xs text-red-700">Out of stock</span>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5 mt-6">
            <button
              onClick={handleBuyNow}
              disabled={sizeOutOfStock}
              className="w-full flex items-center justify-center gap-2 text-xs tracking-[0.15em] uppercase py-3.5 bg-brand-ink text-white active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <Zap size={15} /> {sizeOutOfStock ? 'Out of Stock' : 'Buy Now'}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={sizeOutOfStock}
              className="w-full flex items-center justify-center gap-2 text-xs tracking-[0.15em] uppercase py-3.5 border border-brand-ink/70 text-brand-ink active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <ShoppingBag size={14} /> {sizeOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6 text-sm text-brand-ink/60 leading-relaxed pt-5 border-t border-brand-ink/10">
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews — no heading, flat cards */}
      {reviews?.length > 0 && (
        <div className="mt-14">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
            {reviews.map((r) => (
              <div key={r._id}>
                <div className="flex items-center gap-1 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} strokeWidth={1.5} className={i < r.rating ? 'fill-brand-gold text-brand-gold' : 'text-brand-ink/20'} />
                  ))}
                </div>
                <p className="text-sm text-brand-ink/70 leading-relaxed">{r.comment}</p>
                <p className="text-xs text-brand-ink/40 mt-2 tracking-wide">— {r.customerName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related — no heading, full grid */}
      {related?.length > 0 && (
        <div className="mt-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}