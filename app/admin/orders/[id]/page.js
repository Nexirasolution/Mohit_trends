'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatINR } from '@/lib/utils';
import { buildProductIndex, resolveOrderItem } from '@/lib/orderItemResolver';
import OrderItemModal from '@/components/admin/OrderItemModal';

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

// Mohith Trends theme tokens — keep in sync with other admin pages until centralized in tailwind.config.js
const GOLD = '#B08D3F';
const INK = '#1A1A1A';
const INK_MUTED = '#6B6B66';
const HAIRLINE = '#E8E4DA';
const PAPER = '#FDFCFA';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courier, setCourier] = useState({ partner: '', trackingId: '', awbNumber: '' });
  const [modalItem, setModalItem] = useState(null); // { item, image, categoryName }
  const [notFound, setNotFound] = useState(false);

  async function load() {
    if (!id) return; // guard: params not ready yet, avoids /api/orders/undefined
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        if (res.status === 404) { setNotFound(true); return; }
        const text = await res.text().catch(() => '');
        throw new Error(`Order fetch failed (${res.status}): ${text.slice(0, 200)}`);
      }
      const data = await res.json();
      setOrder(data.order);
      setCourier(data.order?.courier || { partner: '', trackingId: '', awbNumber: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to load order');
    }
  }
  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    fetch('/api/products?limit=200')
      .then(async (r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setProducts(d.products || []))
      .catch((err) => console.error('Failed to load products', err));

    fetch('/api/categories')
      .then(async (r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories || []))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const index = useMemo(() => buildProductIndex(products), [products]);

  function categoryName(catRef) {
    const cid = catRef?._id || catRef;
    return categories.find((c) => c._id === cid)?.name || catRef?.name || '';
  }

  async function updateStatus(status) {
    const res = await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) { toast.success('Status updated'); load(); }
    else toast.error('Failed to update status');
  }

  async function saveCourier() {
    const res = await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courier }) });
    if (res.ok) { toast.success('Courier details saved'); load(); }
    else toast.error('Failed to save courier details');
  }

  if (notFound) return <p style={{ color: INK_MUTED }}>Order not found.</p>;
  if (!order) return <p style={{ color: INK_MUTED }}>Loading...</p>;

  const inputStyle = {
    borderBottom: `1px solid ${HAIRLINE}`,
    color: INK,
    background: 'transparent',
  };

  return (
    <div className="max-w-2xl" style={{ background: PAPER }}>
      <h1
        className="text-2xl mb-1 tracking-tight"
        style={{ color: INK, fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Order {order.orderNumber}
      </h1>
      <p className="text-sm mb-8" style={{ color: INK_MUTED }}>
        {new Date(order.createdAt).toLocaleString('en-IN')}
      </p>

      {/* Items */}
      <div className="pb-6 mb-6" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <h2 className="text-[11px] uppercase tracking-wide mb-3" style={{ color: INK_MUTED }}>Items</h2>
        {order.items.map((item, i) => {
          const resolved = resolveOrderItem(item, index);
          return (
            <button
              key={i}
              onClick={() =>
                setModalItem({ item, image: resolved.image, categoryName: categoryName(resolved.category), productSku: resolved.product?.sku })
              }
              className="w-full flex justify-between items-center text-sm py-3 text-left transition-colors hover:opacity-70"
              style={{ borderBottom: `1px solid ${HAIRLINE}` }}
            >
              <span className="flex items-center gap-3">
                {resolved.image ? (
                  <img src={resolved.image} alt={item.name} className="w-10 h-10 object-cover shrink-0" style={{ borderRadius: 2 }} />
                ) : (
                  <span className="w-10 h-10 shrink-0" style={{ background: HAIRLINE, borderRadius: 2 }} />
                )}
                <span style={{ color: INK }}>
                  {item.name} ({item.color}/{item.size}) x{item.qty}
                  {resolved.product?.sku && (
                    <span className="block text-xs" style={{ color: INK_MUTED }}>Product SKU: {resolved.product.sku}</span>
                  )}
                  {item.sku && (
                    <span className="block text-xs" style={{ color: INK_MUTED }}>Size SKU: {item.sku}</span>
                  )}
                </span>
              </span>
              <span style={{ color: INK }}>{formatINR(item.price * item.qty)}</span>
            </button>
          );
        })}
        <div className="flex justify-between font-semibold mt-3 pt-3" style={{ borderTop: `1px solid ${HAIRLINE}`, color: INK }}>
          <span>Total</span><span style={{ color: GOLD }}>{formatINR(order.total)}</span>
        </div>
      </div>

      {/* Customer & Shipping */}
      <div className="pb-6 mb-6" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <h2 className="text-[11px] uppercase tracking-wide mb-3" style={{ color: INK_MUTED }}>Customer &amp; Shipping</h2>
        <p className="text-sm" style={{ color: INK }}>{order.customer?.name} — {order.customer?.phone}</p>
        <p className="text-sm" style={{ color: INK_MUTED }}>{order.shippingAddress?.line1}, {order.shippingAddress?.line2}</p>
        <p className="text-sm" style={{ color: INK_MUTED }}>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
      </div>

      {/* Order Status */}
      <div className="pb-6 mb-6" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <h2 className="text-[11px] uppercase tracking-wide mb-3" style={{ color: INK_MUTED }}>Order Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => {
            const active = order.status === s;
            return (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className="px-3 py-1.5 text-xs font-medium capitalize rounded-full transition-colors"
                style={
                  active
                    ? { background: INK, color: PAPER }
                    : { border: `1px solid ${HAIRLINE}`, color: INK_MUTED }
                }
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Courier Details */}
      <div className="pb-6 mb-6" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <h2 className="text-[11px] uppercase tracking-wide mb-3" style={{ color: INK_MUTED }}>Courier Details</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <input
            placeholder="Courier partner"
            className="px-1 py-2 text-sm outline-none"
            style={inputStyle}
            value={courier.partner}
            onChange={(e) => setCourier({ ...courier, partner: e.target.value })}
          />
          <input
            placeholder="AWB / Tracking number"
            className="px-1 py-2 text-sm outline-none"
            style={inputStyle}
            value={courier.awbNumber}
            onChange={(e) => setCourier({ ...courier, awbNumber: e.target.value })}
          />
          <input
            placeholder="Tracking link/ID"
            className="px-1 py-2 text-sm outline-none"
            style={inputStyle}
            value={courier.trackingId}
            onChange={(e) => setCourier({ ...courier, trackingId: e.target.value })}
          />
        </div>
        <button
          onClick={saveCourier}
          className="text-sm font-medium px-4 py-2 transition-colors"
          style={{ border: `1px solid ${GOLD}`, color: GOLD }}
        >
          Save Courier Info
        </button>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/invoice/${order._id}`}
          target="_blank"
          className="text-sm font-medium px-4 py-2 transition-colors"
          style={{ border: `1px solid ${HAIRLINE}`, color: INK }}
        >
          View Invoice
        </Link>
        <Link
          href={`/courier-bill/${order._id}`}
          target="_blank"
          className="text-sm font-medium px-4 py-2 transition-colors"
          style={{ border: `1px solid ${HAIRLINE}`, color: INK }}
        >
          Print Shipping Label
        </Link>
      </div>

      <OrderItemModal
        item={modalItem?.item}
        image={modalItem?.image}
        categoryName={modalItem?.categoryName}
        productSku={modalItem?.productSku}
        onClose={() => setModalItem(null)}
      />
    </div>
  );
}