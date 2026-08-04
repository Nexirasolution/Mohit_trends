'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order));
  }, [id]);

  if (!order) return <div className="max-w-xl mx-auto px-4 py-20 text-center text-[#2B1B14]/50">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1F6B3B]/10 border-2 border-[#1F6B3B]/30 mb-4">
        <CheckCircle2 size={48} className="text-[#1F6B3B]" />
      </div>

      <h1 className="font-display text-2xl font-bold text-[#8B1A3D]">Order Placed Successfully!</h1>

      <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-3 mb-3" />

      <p className="text-[#2B1B14]/60 mt-2">Order Number: <strong className="text-[#2B1B14]">{order.orderNumber}</strong></p>
      <p className="text-[#2B1B14]/60">Total: <strong className="text-[#2B1B14]">{formatINR(order.total)}</strong></p>
      <p className="text-sm text-[#2B1B14]/50 mt-1">We'll send updates to {order.customer?.phone}</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link
          href={`/invoice/${order._id}`}
          className="px-5 py-2.5 rounded-xl border-2 border-[#8B1A3D] text-[#8B1A3D] font-semibold text-sm hover:bg-[#8B1A3D]/5 transition-colors"
        >
          View Invoice
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-[#8B1A3D] text-white font-semibold text-sm hover:bg-[#71152F] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}