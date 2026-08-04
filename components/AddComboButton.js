'use client';

import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap } from 'lucide-react';

export default function AddComboButton({ combo }) {
  const { addItem } = useCart();
  const router = useRouter();

  const item = {
    productId: combo._id,
    variantId: 'combo',
    comboId: combo._id,
    name: combo.name,
    image: combo.image,
    color: '-',
    size: 'Combo',
    price: combo.comboPrice,
    qty: 1,
  };

  function handleAddToCart() {
    addItem(item);
  }

  function handleBuyNow() {
    addItem(item);
    router.push('/checkout');
  }

  return (
    <div className="flex flex-col gap-3 mt-6">
      <button
        onClick={handleBuyNow}
        className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95"
        style={{
          background: '#8B1A1A',
          boxShadow: '0 2px 8px rgba(139,26,26,0.22)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#6B1212'}
        onMouseLeave={e => e.currentTarget.style.background = '#8B1A1A'}
      >
        <Zap size={18} fill="#FFD700" stroke="#FFD700" />
        Buy Now
      </button>

      <button
        onClick={handleAddToCart}
        className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl active:scale-95 transition-all bg-transparent"
        style={{
          border: '1.5px solid #8B1A1A',
          color: '#8B1A1A',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#FDF0F0'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <ShoppingBag size={17} />
        Add to Cart
      </button>
    </div>
  );
}