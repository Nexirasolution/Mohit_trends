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

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center bg-brand-cream min-h-[60vh]">
        <p className="text-brand-ink/40 text-sm tracking-wide">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center bg-brand-cream min-h-[60vh]">
      {/* Signature — a thin gold ring around the check, echoing the logo's circle motif, no filled color block */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-brand-gold/50 mb-5">
        <CheckCircle2 size={36} strokeWidth={1.5} className="text-brand-gold" />
      </div>

      <span className="eyebrow block mb-2">Confirmed</span>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-ink">Order Placed Successfully</h1>

      <div className="gold-divider max-w-[5rem] mx-auto mt-4 mb-5" />

      <p className="text-brand-ink/60 text-sm">Order Number: <strong className="text-brand-ink font-semibold">{order.orderNumber}</strong></p>
      <p className="text-brand-ink/60 text-sm mt-0.5">Total: <strong className="text-brand-ink font-semibold">{formatINR(order.total)}</strong></p>
      <p className="text-sm text-brand-ink/40 mt-2">We'll send updates to {order.customer?.phone}</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9">
        <Link href={`/invoice/${order._id}`} className="btn-outline text-sm">
          View Invoice
        </Link>
        <Link href="/" className="btn-primary text-sm">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}