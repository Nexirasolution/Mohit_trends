'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { formatINR } from '@/lib/utils';

// Mohith Trends theme tokens — keep in sync with other admin pages until centralized in tailwind.config.js
const GOLD = '#B08D3F';
const INK = '#1A1A1A';
const INK_MUTED = '#6B6B66';
const HAIRLINE = '#E8E4DA';
const PAPER = '#FDFCFA';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest | category | name | priceLow | priceHigh

  async function load() {
    setLoading(true);
    const res = await fetch('/api/products?limit=100');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  async function remove(id) {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Product deleted');
      load();
    } else toast.error('Failed to delete');
  }

  const filtered = useMemo(() => {
    let list = [...products];

    // Search by product name or SKU
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      list = list.filter((p) => (p.category?._id || p.category) === categoryFilter);
    }

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case 'category':
          return (a.category?.name || '').localeCompare(b.category?.name || '');
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'priceLow':
          return (a.basePrice || 0) - (b.basePrice || 0);
        case 'priceHigh':
          return (b.basePrice || 0) - (a.basePrice || 0);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return list;
  }, [products, search, categoryFilter, sortBy]);

  const inputStyle = {
    borderBottom: `1px solid ${HAIRLINE}`,
    color: INK,
    background: 'transparent',
  };

  return (
    <div style={{ background: PAPER }}>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl tracking-tight"
          style={{ color: INK, fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 transition-colors"
          style={{ background: INK, color: PAPER }}
        >
          <Plus size={15} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8 pb-4" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-0 top-1/2 -translate-y-1/2" style={{ color: INK_MUTED }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-6 pr-6 py-2 text-sm outline-none"
            style={inputStyle}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-0 top-1/2 -translate-y-1/2"
              style={{ color: INK_MUTED }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-1 py-2 text-sm outline-none bg-transparent"
          style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-1 py-2 text-sm outline-none bg-transparent"
          style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK }}
        >
          <option value="newest">Sort: Newest</option>
          <option value="category">Sort: Category (A–Z)</option>
          <option value="name">Sort: Name (A–Z)</option>
          <option value="priceLow">Sort: Price (Low to High)</option>
          <option value="priceHigh">Sort: Price (High to Low)</option>
        </select>
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
                <th className="py-2 pr-3 font-medium">Product</th>
                <th className="py-2 pr-3 font-medium">SKU</th>
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 pr-3 font-medium">Price</th>
                <th className="py-2 pr-3 font-medium">Variants</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                  <td className="py-3 pr-3 font-medium" style={{ color: INK }}>{p.name}</td>
                  <td className="py-3 pr-3" style={{ color: INK_MUTED }}>
                    {p.sku || <span>—</span>}
                  </td>
                  <td className="py-3 pr-3" style={{ color: INK_MUTED }}>{p.category?.name}</td>
                  <td className="py-3 pr-3" style={{ color: INK }}>{formatINR(p.basePrice)}</td>
                  <td className="py-3 pr-3" style={{ color: INK }}>{p.variants?.length}</td>
                  <td className="py-3 pr-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs"
                      style={
                        p.isActive
                          ? { background: 'rgba(176,141,63,0.12)', color: GOLD }
                          : { background: HAIRLINE, color: INK_MUTED }
                      }
                    >
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-3 flex gap-3 justify-end">
                    <Link href={`/admin/products/${p._id}/edit`} style={{ color: INK_MUTED }} className="hover:opacity-70">
                      <Pencil size={15} />
                    </Link>
                    <button onClick={() => remove(p._id)} style={{ color: INK_MUTED }} className="hover:opacity-70">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-10" style={{ color: INK_MUTED }}>
              {products.length === 0
                ? 'No products yet. Add your first product!'
                : 'No products match your filters.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}