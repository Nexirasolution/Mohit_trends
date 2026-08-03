'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Search, X, ChevronDown, ChevronRight } from 'lucide-react';

// Mohith Trends theme tokens — swap these if you later centralize them in tailwind.config.js
const GOLD = '#B08D3F';       // primary accent (logo gold)
const GOLD_SOFT = '#C9A85C';  // lighter gold for hovers / secondary accents
const INK = '#1A1A1A';        // near-black (logo black)
const INK_MUTED = '#6B6B66';  // muted text
const HAIRLINE = '#E8E4DA';   // faint warm-gray divider, replaces heavy borders
const PAPER = '#FDFCFA';      // warm off-white background

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [collapsed, setCollapsed] = useState({}); // parentId -> bool

  async function load() {
    setLoading(true);
    const res = await fetch('/api/products?limit=200');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  function editKey(productId, variantId, size) { return `${productId}-${variantId}-${size}`; }

  function setStock(productId, variantId, size, value) {
    setEdits((e) => ({ ...e, [editKey(productId, variantId, size)]: value }));
  }

  async function saveRow(product, variant, sizeObj) {
    const key = editKey(product._id, variant._id, sizeObj.size);
    const newStock = edits[key];
    if (newStock === undefined) return;

    const updatedVariants = product.variants.map((v) =>
      v._id === variant._id
        ? { ...v, sizes: v.sizes.map((s) => (s.size === sizeObj.size ? { ...s, stock: Number(newStock) } : s)) }
        : v
    );
    const res = await fetch(`/api/products/${product._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variants: updatedVariants })
    });
    if (res.ok) {
      toast.success('Stock updated');
      load();
    } else toast.error('Failed to update stock');
  }

  function catId(c) { return c?._id || c; }
  function parentId(c) { return c?.parent?._id || c?.parent || null; }

  const catMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c._id] = c; });
    return map;
  }, [categories]);

  // --- Search + category filter ---
  const filteredProducts = useMemo(() => {
    let list = [...products];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      list = list.filter((p) => {
        const pCatId = catId(p.category);
        if (pCatId === categoryFilter) return true;
        const pCat = catMap[pCatId];
        return parentId(pCat) === categoryFilter;
      });
    }

    return list;
  }, [products, search, categoryFilter, catMap]);

  // --- Category product counts (based on ALL products, not filtered) ---
  const categoryCounts = useMemo(() => {
    const direct = {};
    categories.forEach((c) => { direct[c._id] = 0; });
    products.forEach((p) => {
      const cid = catId(p.category);
      if (direct[cid] !== undefined) direct[cid] += 1;
    });
    const total = { ...direct };
    categories.forEach((c) => {
      const pid = parentId(c);
      if (pid && total[pid] !== undefined) total[pid] += direct[c._id] || 0;
    });
    return { direct, total };
  }, [categories, products]);

  function productStock(p) {
    return p.variants.reduce(
      (sum, v) =>
        sum +
        v.sizes.reduce((s, sz) => {
          const key = editKey(p._id, v._id, sz.size);
          const val = edits[key] !== undefined ? Number(edits[key]) : sz.stock;
          return s + (Number(val) || 0);
        }, 0),
      0
    );
  }

  // --- Group filtered products by parent category -> child category ---
  const grouped = useMemo(() => {
    const parents = categories.filter((c) => !c.parent);

    return parents
      .map((parent) => {
        const children = categories.filter((c) => parentId(c) === parent._id);

        const childGroups = children
          .map((child) => ({
            category: child,
            products: filteredProducts.filter((p) => catId(p.category) === child._id),
          }))
          .filter((g) => g.products.length > 0);

        const directProducts = filteredProducts.filter((p) => catId(p.category) === parent._id);

        return { parent, directProducts, childGroups };
      })
      .filter((g) => g.directProducts.length > 0 || g.childGroups.length > 0);
  }, [categories, filteredProducts]);

  function toggleCollapse(id) {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  }

  function ProductStockTable({ list }) {
    return (
      <table className="w-full text-sm mb-1">
        <thead>
          <tr
            className="text-left text-[11px] uppercase tracking-wide"
            style={{ color: INK_MUTED, borderBottom: `1px solid ${HAIRLINE}` }}
          >
            <th className="py-2 pr-2 font-medium">Product</th>
            <th className="py-2 pr-2 font-medium">SKU</th>
            <th className="py-2 pr-2 font-medium">Color</th>
            <th className="py-2 pr-2 font-medium">Size</th>
            <th className="py-2 pr-2 font-medium">Size SKU</th>
            <th className="py-2 pr-2 font-medium">Stock</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {list.flatMap((p) =>
            p.variants.flatMap((v) =>
              v.sizes.map((s) => {
                const key = editKey(p._id, v._id, s.size);
                const value = edits[key] !== undefined ? edits[key] : s.stock;
                const low = Number(value) <= 5;
                return (
                  <tr key={key} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                    <td className="py-2 pr-2" style={{ color: INK }}>{p.name}</td>
                    <td className="py-2 pr-2 text-xs" style={{ color: INK_MUTED }}>{p.sku || '—'}</td>
                    <td className="py-2 pr-2" style={{ color: INK }}>{v.color}</td>
                    <td className="py-2 pr-2" style={{ color: INK }}>{s.size}</td>
                    <td className="py-2 pr-2 text-xs" style={{ color: INK_MUTED }}>{s.sku || '—'}</td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        className="w-16 bg-transparent px-1 py-1 text-sm outline-none focus:border-b"
                        style={{
                          borderBottom: `1px solid ${low ? GOLD : HAIRLINE}`,
                          color: low ? GOLD : INK,
                        }}
                        value={value}
                        onChange={(e) => setStock(p._id, v._id, s.size, e.target.value)}
                      />
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => saveRow(p, v, s)}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                        style={{ color: GOLD }}
                        aria-label="Save"
                      >
                        <Save size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )
          )}
        </tbody>
      </table>
    );
  }

  return (
    <div style={{ background: PAPER, minHeight: '100%' }} className="px-1">
      <h1
        className="text-2xl font-semibold mb-6 tracking-tight"
        style={{ color: INK, fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Inventory
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-0 top-1/2 -translate-y-1/2" style={{ color: INK_MUTED }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-6 pr-6 py-2 text-sm bg-transparent outline-none"
            style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK }}
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
          className="px-2 py-2 text-sm bg-transparent outline-none"
          style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK }}
        >
          <option value="all">All Categories</option>
          {categories.filter((c) => !c.parent).map((parent) => (
            <optgroup key={parent._id} label={parent.name}>
              <option value={parent._id}>{parent.name} (all)</option>
              {categories
                .filter((c) => parentId(c) === parent._id)
                .map((child) => (
                  <option key={child._id} value={child._id}>— {child.name}</option>
                ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Category summary — plain text row, no card chrome */}
      {!loading && (
        <div
          className="flex flex-wrap gap-x-6 gap-y-1 mb-8 pb-4 text-xs"
          style={{ borderBottom: `1px solid ${HAIRLINE}` }}
        >
          {categories
            .filter((c) => !c.parent)
            .map((parent) => (
              <span key={parent._id}>
                <span className="font-semibold" style={{ color: GOLD }}>{parent.name}</span>
                <span style={{ color: INK_MUTED }}> · {categoryCounts.total[parent._id] || 0}</span>
              </span>
            ))}
        </div>
      )}

      {loading ? (
        <p style={{ color: INK_MUTED }}>Loading...</p>
      ) : grouped.length === 0 ? (
        <p className="text-center py-10" style={{ color: INK_MUTED }}>No products match your filters.</p>
      ) : (
        <div className="space-y-2">
          {grouped.map(({ parent, directProducts, childGroups }) => {
            const isCollapsed = collapsed[parent._id];
            const parentStock =
              directProducts.reduce((sum, p) => sum + productStock(p), 0) +
              childGroups.reduce((sum, g) => sum + g.products.reduce((s, p) => s + productStock(p), 0), 0);
            const parentProductCount =
              directProducts.length + childGroups.reduce((sum, g) => sum + g.products.length, 0);

            return (
              <div key={parent._id} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                <button
                  onClick={() => toggleCollapse(parent._id)}
                  className="w-full flex items-center justify-between py-3"
                >
                  <span className="flex items-center gap-2 font-semibold" style={{ color: INK }}>
                    {isCollapsed ? (
                      <ChevronRight size={15} style={{ color: GOLD }} />
                    ) : (
                      <ChevronDown size={15} style={{ color: GOLD }} />
                    )}
                    {parent.name}
                  </span>
                  <span className="text-xs" style={{ color: INK_MUTED }}>
                    {parentProductCount} products · {parentStock} units
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="pb-4 pl-6">
                    {directProducts.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: INK_MUTED }}>
                          Uncategorized within {parent.name}
                        </p>
                        <ProductStockTable list={directProducts} />
                      </div>
                    )}

                    {childGroups.map(({ category, products: childProducts }) => {
                      const childStock = childProducts.reduce((s, p) => s + productStock(p), 0);
                      return (
                        <div key={category._id} className="mb-5">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium" style={{ color: GOLD_SOFT }}>{category.name}</p>
                            <p className="text-xs" style={{ color: INK_MUTED }}>
                              {childProducts.length} products · {childStock} units
                            </p>
                          </div>
                          <ProductStockTable list={childProducts} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}