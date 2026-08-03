'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null); // { item, image, categoryName }

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Orders fetch failed (${res.status}): ${text.slice(0, 200)}`);
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status]);

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

  function catId(c) { return c?._id || c; }
  function parentId(c) {
    const full = categories.find((cat) => cat._id === catId(c));
    return full?.parent?._id || full?.parent || null;
  }

  // Resolve each order's items to categories once, for filtering + display
  const enrichedOrders = useMemo(() => {
    return orders.map((o) => {
      const resolvedItems = (o.items || []).map((item) => ({
        item,
        ...resolveOrderItem(item, index),
      }));
      const categoryIds = new Set(
        resolvedItems.map((r) => catId(r.category)).filter(Boolean)
      );
      return { ...o, resolvedItems, categoryIds };
    });
  }, [orders, index]);

  const filteredOrders = useMemo(() => {
    if (categoryFilter === 'all') return enrichedOrders;
    return enrichedOrders.filter((o) => {
      for (const cid of o.categoryIds) {
        if (cid === categoryFilter || parentId(cid) === categoryFilter) return true;
      }
      return false;
    });
  }, [enrichedOrders, categoryFilter]);

  function categoryName(catRef) {
    const cid = catId(catRef);
    return categories.find((c) => c._id === cid)?.name || catRef?.name || '';
  }

  const inputStyle = {
    borderBottom: `1px solid ${HAIRLINE}`,
    color: INK,
    background: 'transparent',
  };

  return (
    <div style={{ background: PAPER }}>
      <h1
        className="text-2xl mb-6 tracking-tight"
        style={{ color: INK, fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Orders
      </h1>

      <div className="flex flex-wrap items-center gap-4 mb-8 pb-4" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <input
          placeholder="Search by order number, name, phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          className="px-1 py-2 text-sm flex-1 min-w-[200px] outline-none"
          style={inputStyle}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-1 py-2 text-sm outline-none bg-transparent"
          style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK }}
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-1 py-2 text-sm outline-none bg-transparent"
          style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK }}
        >
          <option value="all">All Categories</option>
          {categories.filter((c) => !c.parent).map((parent) => (
            <optgroup key={parent._id} label={parent.name}>
              <option value={parent._id}>{parent.name} (all)</option>
              {categories
                .filter((c) => (c.parent?._id || c.parent) === parent._id)
                .map((child) => (
                  <option key={child._id} value={child._id}>— {child.name}</option>
                ))}
            </optgroup>
          ))}
        </select>
        <button
          onClick={load}
          className="text-sm font-medium px-4 py-2 transition-colors"
          style={{ border: `1px solid ${GOLD}`, color: GOLD }}
        >
          Search
        </button>
      </div>

      {loading ? (
        <p style={{ color: INK_MUTED }}>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-[11px] uppercase tracking-wide"
                style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK_MUTED }}
              >
                <th className="py-2 pr-3 font-medium">Order #</th>
                <th className="py-2 pr-3 font-medium">Customer</th>
                <th className="py-2 pr-3 font-medium">Items</th>
                <th className="py-2 pr-3 font-medium">Product SKU</th>
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 pr-3 font-medium">Total</th>
                <th className="py-2 pr-3 font-medium">Payment</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o._id} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                  <td className="py-3 pr-3 font-medium" style={{ color: INK }}>{o.orderNumber}</td>
                  <td className="py-3 pr-3" style={{ color: INK }}>
                    {o.customer?.name}<br />
                    <span className="text-xs" style={{ color: INK_MUTED }}>{o.customer?.phone}</span>
                  </td>
                  <td className="py-3 pr-3 max-w-[220px]">
                    <div className="flex flex-wrap gap-1">
                      {o.resolvedItems.map((r, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            setModalItem({ item: r.item, image: r.image, categoryName: categoryName(r.category), productSku: r.product?.sku })
                          }
                          className="text-xs px-2 py-1 rounded-full transition-colors"
                          style={{ background: HAIRLINE, color: INK_MUTED }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = PAPER; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = HAIRLINE; e.currentTarget.style.color = INK_MUTED; }}
                          title={r.item.sku || r.item.name}
                        >
                          {r.item.name} x{r.item.qty}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td
                    className="py-3 pr-3 text-xs max-w-[160px] truncate"
                    style={{ color: INK_MUTED }}
                    title={o.resolvedItems.map((r) => r.product?.sku || r.item.sku).filter(Boolean).join(', ')}
                  >
                    {o.resolvedItems.map((r) => r.product?.sku || r.item.sku).filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-3 pr-3 text-xs" style={{ color: INK_MUTED }}>
                    {[...o.categoryIds].map((cid) => categoryName(cid)).filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-3 pr-3" style={{ color: INK }}>{formatINR(o.total)}</td>
                  <td className="py-3 pr-3 capitalize" style={{ color: INK_MUTED }}>{o.paymentStatus}</td>
                  <td className="py-3 pr-3 capitalize" style={{ color: INK }}>{o.status}</td>
                  <td className="py-3 pr-3 text-xs" style={{ color: INK_MUTED }}>
                    {new Date(o.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-3">
                    <Link href={`/admin/orders/${o._id}`} className="font-medium" style={{ color: GOLD }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <p className="text-center py-10" style={{ color: INK_MUTED }}>No orders found.</p>
          )}
        </div>
      )}

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