'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart, cartKey } from '@/components/CartContext';
import { formatINR } from '@/lib/utils';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <ShoppingBag size={40} className="mx-auto mb-5 text-black/25" strokeWidth={1.25} />
        <p className="font-serif text-lg text-black mb-2">Your cart is empty</p>
        <p className="mb-8 text-sm text-black/45 font-light">
          Add something beautiful from our collection.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3.5 text-xs tracking-[0.2em] uppercase bg-black text-white hover:bg-black/85 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Page heading */}
      <div className="mb-10 text-center">
        <h1 className="font-serif text-2xl text-black">Your Cart</h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="h-px w-8 bg-[#C6A15B]" />
          <span className="text-[#C6A15B] text-xs">✦</span>
          <span className="h-px w-8 bg-[#C6A15B]" />
        </div>
      </div>

      {/* Cart items */}
      <div className="divide-y divide-black/10 border-t border-b border-black/10">
        {items.map((item) => {
          const key = cartKey(item);
          return (
            <div key={key} className="flex gap-5 py-6">

              {/* Product image */}
              <div className="relative shrink-0 w-20 h-24 bg-[#FAF9F6] overflow-hidden">
                <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" />
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="font-serif text-black text-[15px] line-clamp-1">{item.name}</p>
                <p className="text-xs mt-1 text-black/40 font-light">
                  Color: {item.color} &nbsp;|&nbsp; Size: {item.size}
                </p>
                <p className="text-sm mt-1.5 text-black/70">{formatINR(item.price)}</p>

                {/* Qty controls + remove */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border border-black/15">
                    <button
                      onClick={() => updateQty(key, item.qty - 1)}
                      className="w-7 h-7 flex items-center justify-center text-sm text-black/60 hover:bg-black/5 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 h-7 flex items-center justify-center text-sm text-black border-x border-black/15">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(key, item.qty + 1)}
                      className="w-7 h-7 flex items-center justify-center text-sm text-black/60 hover:bg-black/5 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(key)}
                    className="text-black/30 hover:text-black transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Line total */}
              <p className="text-sm text-black shrink-0 self-start pt-1">
                {formatINR(item.price * item.qty)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between py-6">
        <span className="text-sm text-black/50 tracking-wide">Subtotal</span>
        <span className="font-serif text-xl text-black">{formatINR(subtotal)}</span>
      </div>

      {/* Checkout CTA */}
      <Link
        href="/checkout"
        className="block w-full text-center py-4 text-xs tracking-[0.2em] uppercase bg-black text-white hover:bg-black/85 transition-colors"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}