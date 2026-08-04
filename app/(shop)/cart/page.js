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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: '#C9A84C', opacity: 0.5 }} />
        <p className="mb-2" style={{ color: '#8B0000', fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '600' }}>
          Your cart is empty
        </p>
        <p className="mb-6 text-sm" style={{ color: '#a07070', fontFamily: 'sans-serif' }}>
          Add something beautiful from our collection!
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 font-bold text-sm transition-all"
          style={{
            background: '#8B0000',
            color: '#fff',
            border: '2px solid #C9A84C',
            borderRadius: '8px',
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.5px',
          }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: '#8B0000', fontFamily: 'Georgia, serif', letterSpacing: '0.5px' }}
        >
          Your Cart
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <div style={{ height: '1px', width: '50px', background: '#C9A84C' }} />
          <span style={{ color: '#C9A84C', fontSize: '13px' }}>✦</span>
          <div style={{ height: '1px', width: '50px', background: '#C9A84C' }} />
        </div>
      </div>

      {/* Cart items */}
      <div className="space-y-4">
        {items.map((item) => {
          const key = cartKey(item);
          return (
            <div
              key={key}
              className="flex gap-4 p-4 bg-white transition-all"
              style={{
                borderRadius: '12px',
                border: '1.5px solid #e8d5d5',
                boxShadow: '0 2px 8px rgba(139,0,0,0.06)',
              }}
            >
              {/* Product image */}
              <div
                className="relative shrink-0 overflow-hidden"
                style={{ width: '80px', height: '96px', borderRadius: '8px', background: '#fdf5f5', border: '1px solid #e8d5d5' }}
              >
                <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" />
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium line-clamp-1"
                  style={{ color: '#1a1a1a', fontFamily: 'Georgia, serif', fontSize: '14px' }}
                >
                  {item.name}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: '#a07070', fontFamily: 'sans-serif' }}
                >
                  Color: {item.color} &nbsp;|&nbsp; Size: {item.size}
                </p>
                <p
                  className="font-semibold mt-1"
                  style={{ color: '#8B0000', fontFamily: 'Georgia, serif', fontSize: '15px' }}
                >
                  {formatINR(item.price)}
                </p>

                {/* Qty controls + remove */}
                <div className="flex items-center gap-3 mt-2">
                  <div
                    className="flex items-center"
                    style={{ border: '1.5px solid #C9A84C', borderRadius: '6px', overflow: 'hidden' }}
                  >
                    <button
                      onClick={() => updateQty(key, item.qty - 1)}
                      className="px-2.5 py-1 text-sm font-bold transition-all"
                      style={{ color: '#8B0000', background: '#fdf5f5', fontFamily: 'sans-serif' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f5e0e0')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#fdf5f5')}
                    >
                      −
                    </button>
                    <span
                      className="px-3 py-1 text-sm font-semibold"
                      style={{ color: '#8B0000', borderLeft: '1px solid #C9A84C', borderRight: '1px solid #C9A84C', fontFamily: 'sans-serif' }}
                    >
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(key, item.qty + 1)}
                      className="px-2.5 py-1 text-sm font-bold transition-all"
                      style={{ color: '#8B0000', background: '#fdf5f5', fontFamily: 'sans-serif' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f5e0e0')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#fdf5f5')}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(key)}
                    className="transition-colors"
                    style={{ color: '#c9a0a0' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#8B0000')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#c9a0a0')}
                    aria-label="Remove item"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              {/* Line total */}
              <p
                className="font-bold shrink-0 self-start pt-1"
                style={{ color: '#8B0000', fontFamily: 'Georgia, serif', fontSize: '15px' }}
              >
                {formatINR(item.price * item.qty)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Subtotal card */}
      <div
        className="flex items-center justify-between p-5 mt-6"
        style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1.5px solid #C9A84C',
          boxShadow: '0 2px 8px rgba(139,0,0,0.07)',
        }}
      >
        <span style={{ color: '#5a2020', fontFamily: 'sans-serif', fontSize: '14px' }}>Subtotal</span>
        <span
          className="font-bold text-xl"
          style={{ color: '#8B0000', fontFamily: 'Georgia, serif' }}
        >
          {formatINR(subtotal)}
        </span>
      </div>

      {/* Checkout CTA */}
      <Link
        href="/checkout"
        className="block w-full text-center mt-4 py-3 font-bold text-sm transition-all"
        style={{
          background: '#8B0000',
          color: '#fff',
          border: '2px solid #C9A84C',
          borderRadius: '8px',
          fontFamily: 'Georgia, serif',
          fontSize: '15px',
          letterSpacing: '0.5px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#6e0000')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#8B0000')}
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}