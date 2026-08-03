'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Package, Phone, Truck, Star, X, Loader2, ImagePlus, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

const STATUS_STYLES = {
  placed: 'bg-brand-cream text-brand-ink/70 border border-brand-ink/15',
  confirmed: 'bg-white text-brand-ink border border-brand-gold/40',
  packed: 'bg-brand-gold/10 text-brand-gold border border-brand-gold/30',
  shipped: 'bg-brand-ink/5 text-brand-ink border border-brand-ink/20',
  delivered: 'bg-brand-ink text-brand-cream border border-brand-ink',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  returned: 'bg-gray-50 text-gray-600 border border-gray-200'
};

function ReviewForm({ order, item, phone, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        const url = data.url || data.secure_url;
        if (url) urls.push(url);
      }
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, productId: item.product, rating, comment, images })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Thanks for your review!');
        onDone();
      } else {
        toast.error(data.error || 'Could not submit review');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-brand-ink/10 p-3 mt-2 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-brand-ink">Rate {item.name}</span>
        <button onClick={onDone} type="button"><X size={14} className="text-brand-ink/40" /></button>
      </div>
      <div className="flex gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setRating(i + 1)}>
            <Star size={20} className={i < rating ? 'fill-brand-gold text-brand-gold' : 'text-brand-ink/20'} />
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        placeholder="How was the product?"
        className="w-full border border-brand-ink/15 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((url, i) => (
          <img key={i} src={url} alt="" className="w-12 h-12 object-cover border border-brand-ink/10" />
        ))}
        <label className="w-12 h-12 border border-dashed border-brand-ink/25 flex items-center justify-center cursor-pointer text-brand-ink/40">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>
      </div>
      <button
        onClick={submit}
        disabled={submitting}
        className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
}

export default function OrdersPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewedMap, setReviewedMap] = useState({}); // orderId -> Set of reviewed product ids
  const [openReview, setOpenReview] = useState(null); // `${orderId}-${productId}` or null

  async function fetchReviewedMap(orderList) {
    const map = {};
    await Promise.all(
      orderList
        .filter((o) => o.status === 'delivered')
        .map(async (o) => {
          const res = await fetch(`/api/reviews?orderId=${o._id}`);
          const data = await res.json();
          map[o._id] = new Set(data.reviewedProductIds || []);
        })
    );
    setReviewedMap(map);
  }

  async function handleLookup(e) {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);
    setOrders(null);
    try {
      const res = await fetch('/api/orders/by-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      setOrders(data.orders || []);
      fetchReviewedMap(data.orders || []);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function markReviewed(orderId, productId) {
    setReviewedMap((prev) => {
      const next = { ...prev };
      next[orderId] = new Set([...(next[orderId] || []), productId]);
      return next;
    });
    setOpenReview(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 min-h-[60vh] bg-brand-cream">
      <span className="eyebrow">Track & Review</span>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-ink mt-1.5 mb-1">My Orders</h1>
      <p className="text-brand-ink/50 text-sm mb-6">
        Enter the phone number you used at checkout to view your orders.
      </p>

      <form onSubmit={handleLookup} className="flex gap-2 mb-2">
        <div className="flex-1 relative">
          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/30" />
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit phone number"
            maxLength={10}
            className="w-full pl-9 pr-3 py-2.5 border border-brand-ink/15 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary text-sm px-5 disabled:opacity-50 shrink-0"
        >
          {loading ? 'Searching...' : 'Find Orders'}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {orders !== null && orders.length === 0 && !error && (
        <div className="text-center py-16 border border-dashed border-brand-ink/15 mt-4">
          <Package size={30} strokeWidth={1.25} className="mx-auto mb-2 text-brand-gold" />
          <p className="text-sm text-brand-ink/50">No orders found for this number</p>
        </div>
      )}

      <div className="space-y-3 mt-6">
        {orders?.map((o) => (
          <div key={o._id} className="border border-brand-ink/10 p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-brand-ink/50 tracking-wide">#{o.orderNumber}</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${
                  STATUS_STYLES[o.status] || 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {o.status}
              </span>
            </div>

            <div className="space-y-2 mb-3 divide-y divide-brand-ink/5">
              {o.items.map((it, i) => {
                const reviewKey = `${o._id}-${it.product}`;
                const alreadyReviewed = reviewedMap[o._id]?.has(String(it.product));
                const canReview = o.status === 'delivered' && it.product && !it.isCombo;

                return (
                  <div key={i} className={i > 0 ? 'pt-2' : ''}>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 overflow-hidden bg-brand-cream shrink-0 relative border border-brand-ink/10">
                        {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate text-brand-ink">{it.name}</p>
                        <p className="text-xs text-brand-ink/40">Qty {it.qty}</p>
                      </div>
                      {canReview && (
                        alreadyReviewed ? (
                          <span className="flex items-center gap-1 text-[11px] text-brand-ink/50 shrink-0">
                            <CheckCircle2 size={13} /> Reviewed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setOpenReview(openReview === reviewKey ? null : reviewKey)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-brand-gold shrink-0 uppercase tracking-wide"
                          >
                            <Star size={13} /> Rate
                          </button>
                        )
                      )}
                    </div>
                    {openReview === reviewKey && (
                      <ReviewForm
                        order={o}
                        item={it}
                        phone={phone.replace(/\D/g, '').slice(-10)}
                        onDone={() => markReviewed(o._id, it.product)}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-sm mb-1 pt-2 border-t border-brand-ink/10">
              <span className="text-brand-ink/60">
                {o.items.length} item{o.items.length > 1 ? 's' : ''}
              </span>
              <span className="font-bold text-brand-ink">{formatINR(o.total)}</span>
            </div>

            {o.courier?.trackingId && (
              <div className="flex items-center gap-1.5 text-[11px] text-brand-ink/50 mt-1">
                <Truck size={12} className="text-brand-gold" />
                {o.courier.partner} · {o.courier.trackingId}
              </div>
            )}

            <p className="text-[11px] text-brand-ink/40 mt-1.5">
              {new Date(o.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}