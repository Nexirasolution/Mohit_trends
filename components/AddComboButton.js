'use client';

import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';

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
        className="w-full flex items-center justify-center gap-2 text-white text-xs tracking-[0.2em] uppercase py-4 transition-colors active:scale-[0.98]"
        style={{ background: '#0A0A0A' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#000000')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#0A0A0A')}
      >
        Buy Now
      </button>

      <button
        onClick={handleAddToCart}
        className="w-full flex items-center justify-center gap-2 text-xs tracking-[0.2em] uppercase py-3.5 border border-black/70 text-black bg-transparent transition-colors active:scale-[0.98]"
        onMouseEnter={(e) => (e.currentTarget.style.background = '#FAF9F6')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <ShoppingBag size={15} strokeWidth={1.5} />
        Add to Cart
      </button>
    </div>
  );
}