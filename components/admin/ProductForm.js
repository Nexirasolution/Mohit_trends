'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, Loader2, X } from 'lucide-react';

// Mohith Trends theme tokens — keep in sync with other admin pages until centralized in tailwind.config.js
const GOLD = '#B08D3F';
const INK = '#1A1A1A';
const INK_MUTED = '#6B6B66';
const HAIRLINE = '#E8E4DA';
const PAPER = '#FDFCFA';

function emptyVariant() {
  return { color: '', colorHex: '#1A1A1A', images: [''], price: '', compareAtPrice: '', sizes: [{ size: '', stock: 0, sku: '' }] };
}

// Shared input style — underline, no border box
const inputStyle = {
  borderBottom: `1px solid ${HAIRLINE}`,
  padding: '8px 2px',
  fontSize: '14px',
  color: INK,
  background: 'transparent',
  width: '100%',
  outline: 'none',
  marginTop: '4px',
};

const labelStyle = {
  fontSize: '13px',
  color: INK_MUTED,
};

const sectionHeadStyle = {
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: INK_MUTED,
  marginBottom: '16px',
};

function focusGold(e) { e.target.style.borderColor = GOLD; }
function blurHairline(e) { e.target.style.borderColor = HAIRLINE; }

function ImageSlot({ value, onChange, onRemove, showRemove }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 mb-2">
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        className="shrink-0 overflow-hidden relative"
        style={{
          width: '44px',
          height: '44px',
          border: `1px dashed ${HAIRLINE}`,
          background: PAPER,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : uploading ? (
          <Loader2 size={15} className="animate-spin" style={{ color: GOLD }} />
        ) : (
          <Upload size={13} style={{ color: INK_MUTED }} />
        )}
        {uploading && value && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(253,252,250,0.8)' }}>
            <Loader2 size={13} className="animate-spin" style={{ color: GOLD }} />
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <input
        placeholder="https://... or click thumbnail to upload"
        style={{ ...inputStyle, marginTop: 0, flex: 1 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={focusGold}
        onBlur={blurHairline}
      />

      {showRemove && (
        <button type="button" onClick={onRemove} style={{ color: INK_MUTED, flexShrink: 0 }} className="hover:opacity-70">
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export default function ProductForm({ initial, productId }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(
    initial || {
      name: '', slug: '', sku: '', description: '', category: '', fabric: '', tags: [],
      variants: [emptyVariant()],
      isBestSeller: false, isTopSeller: false, isActiveSeller: true, isFeatured: false, isActive: true,
    }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  function updateVariant(idx, field, value) {
    setForm((f) => { const v = [...f.variants]; v[idx] = { ...v[idx], [field]: value }; return { ...f, variants: v }; });
  }

  function updateVariantImage(vIdx, imgIdx, value) {
    setForm((f) => {
      const variants = [...f.variants];
      const images = [...variants[vIdx].images];
      images[imgIdx] = value;
      variants[vIdx] = { ...variants[vIdx], images };
      return { ...f, variants };
    });
  }

  function removeVariantImage(vIdx, imgIdx) {
    setForm((f) => {
      const variants = [...f.variants];
      const images = variants[vIdx].images.filter((_, i) => i !== imgIdx);
      variants[vIdx] = { ...variants[vIdx], images: images.length ? images : [''] };
      return { ...f, variants };
    });
  }

  function addVariantImage(vIdx) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[vIdx] = { ...variants[vIdx], images: [...variants[vIdx].images, ''] };
      return { ...f, variants };
    });
  }

  function updateSize(vIdx, sIdx, field, value) {
    setForm((f) => {
      const variants = [...f.variants];
      const sizes = [...variants[vIdx].sizes];
      sizes[sIdx] = { ...sizes[sIdx], [field]: value };
      variants[vIdx] = { ...variants[vIdx], sizes };
      return { ...f, variants };
    });
  }

  function addSize(vIdx) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[vIdx] = { ...variants[vIdx], sizes: [...variants[vIdx].sizes, { size: '', stock: 0, sku: '' }] };
      return { ...f, variants };
    });
  }

  function removeSize(vIdx, sIdx) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[vIdx] = { ...variants[vIdx], sizes: variants[vIdx].sizes.filter((_, i) => i !== sIdx) };
      return { ...f, variants };
    });
  }

  function addVariant() { setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] })); }
  function removeVariant(idx) { setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) })); }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    // Note: sku is intentionally omitted — it's auto-generated/managed server-side
    // based on the product's category (see /api/products and /api/products/[id]).
    const payload = {
      ...form,
      variants: form.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        compareAtPrice: Number(v.compareAtPrice) || 0,
        images: v.images.filter(Boolean),
        sizes: v.sizes.map((s) => ({ ...s, stock: Number(s.stock) })),
      })),
    };
    delete payload.sku;

    const url = productId ? `/api/products/${productId}` : '/api/products';
    const method = productId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      toast.success(productId ? 'Product updated' : 'Product created');
      router.push('/admin/products');
    } else {
      toast.error(data.error || 'Something went wrong');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8" style={{ background: PAPER }}>

      {/* Basic Info */}
      <div className="pb-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <p style={sectionHeadStyle}>Product Details</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label style={labelStyle}>Product Name *</label>
            <input
              required
              style={inputStyle}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              onFocus={focusGold}
              onBlur={blurHairline}
            />
          </div>
          <div>
            <label style={labelStyle}>SKU</label>
            <input
              disabled
              readOnly
              style={{ ...inputStyle, color: INK_MUTED, cursor: 'not-allowed', borderBottomStyle: 'dashed' }}
              value={form.sku || 'Auto-generated from category on save'}
              title="SKU is generated automatically from the product's category"
            />
          </div>
          <div>
            <label style={labelStyle}>Category *</label>
            <select
              required
              style={inputStyle}
              value={form.category?._id || form.category}
              onChange={(e) => update('category', e.target.value)}
              onFocus={focusGold}
              onBlur={blurHairline}
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Fabric</label>
            <input
              style={inputStyle}
              value={form.fabric}
              onChange={(e) => update('fabric', e.target.value)}
              onFocus={focusGold}
              onBlur={blurHairline}
            />
          </div>
          <div>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input
              style={inputStyle}
              value={Array.isArray(form.tags) ? form.tags.join(', ') : ''}
              onChange={(e) => update('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
              onFocus={focusGold}
              onBlur={blurHairline}
            />
          </div>
          <div className="sm:col-span-2">
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical' }}
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              onFocus={focusGold}
              onBlur={blurHairline}
            />
          </div>

          {/* Toggles */}
          <div className="sm:col-span-2 flex flex-wrap gap-5 pt-2">
            {[
              ['isBestSeller', 'Bestseller'],
              ['isTopSeller', 'Top Seller'],
              ['isActiveSeller', 'Active Seller'],
              ['isFeatured', 'Featured'],
              ['isActive', 'Active (visible on site)'],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm cursor-pointer"
                style={{ color: INK }}
              >
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => update(key, e.target.checked)}
                  style={{ accentColor: GOLD, width: '15px', height: '15px' }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Variants Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p style={{ ...sectionHeadStyle, marginBottom: 0 }}>Variants</p>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 transition-colors"
            style={{ border: `1px solid ${GOLD}`, color: GOLD, cursor: 'pointer' }}
          >
            <Plus size={15} /> Add Variant
          </button>
        </div>

        <div className="space-y-6">
          {form.variants.map((v, vIdx) => (
            <div key={vIdx} className="p-5" style={{ border: `1px solid ${HAIRLINE}` }}>
              {/* Variant header */}
              <div className="flex justify-between items-center mb-4 pb-3" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                <span style={{ fontSize: '13px', color: INK, fontFamily: 'Georgia, serif' }}>
                  Variant {vIdx + 1}
                </span>
                {form.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(vIdx)}
                    style={{ color: INK_MUTED, cursor: 'pointer' }}
                    className="hover:opacity-70"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-4 gap-4 mb-4">
                <input
                  placeholder="Color name (e.g. Green)"
                  style={inputStyle}
                  value={v.color}
                  onChange={(e) => updateVariant(vIdx, 'color', e.target.value)}
                  onFocus={focusGold}
                  onBlur={blurHairline}
                />
                <input
                  type="color"
                  style={{ ...inputStyle, padding: '2px', height: '36px', border: `1px solid ${HAIRLINE}` }}
                  value={v.colorHex}
                  onChange={(e) => updateVariant(vIdx, 'colorHex', e.target.value)}
                />
                <input
                  placeholder="Price ₹"
                  type="number"
                  style={inputStyle}
                  value={v.price}
                  onChange={(e) => updateVariant(vIdx, 'price', e.target.value)}
                  onFocus={focusGold}
                  onBlur={blurHairline}
                />
                <input
                  placeholder="Compare-at price ₹"
                  type="number"
                  style={inputStyle}
                  value={v.compareAtPrice}
                  onChange={(e) => updateVariant(vIdx, 'compareAtPrice', e.target.value)}
                  onFocus={focusGold}
                  onBlur={blurHairline}
                />
              </div>

              <p style={{ fontSize: '12px', color: INK_MUTED, marginBottom: '10px' }}>
                Images for this colour — click thumbnail to upload
              </p>
              {v.images.map((img, imgIdx) => (
                <ImageSlot
                  key={imgIdx}
                  value={img}
                  onChange={(url) => updateVariantImage(vIdx, imgIdx, url)}
                  onRemove={() => removeVariantImage(vIdx, imgIdx)}
                  showRemove={v.images.length > 1}
                />
              ))}
              <button
                type="button"
                onClick={() => addVariantImage(vIdx)}
                style={{ fontSize: '12px', color: GOLD, fontWeight: 500, marginBottom: '16px', cursor: 'pointer' }}
              >
                + Add another image
              </button>

              <p style={{ fontSize: '12px', color: INK_MUTED, marginBottom: '8px' }}>
                Sizes &amp; Stock
              </p>
              {v.sizes.map((s, sIdx) => (
                <div key={sIdx} className="flex gap-3 mb-2 items-center">
                  <input
                    placeholder="Size (e.g. M, 38, Free Size)"
                    style={{ ...inputStyle, width: '140px', marginTop: 0 }}
                    value={s.size}
                    onChange={(e) => updateSize(vIdx, sIdx, 'size', e.target.value)}
                    onFocus={focusGold}
                    onBlur={blurHairline}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    style={{ ...inputStyle, width: '90px', marginTop: 0 }}
                    value={s.stock}
                    onChange={(e) => updateSize(vIdx, sIdx, 'stock', e.target.value)}
                    onFocus={focusGold}
                    onBlur={blurHairline}
                  />
                  <input
                    placeholder="SKU (optional)"
                    style={{ ...inputStyle, flex: 1, marginTop: 0 }}
                    value={s.sku}
                    onChange={(e) => updateSize(vIdx, sIdx, 'sku', e.target.value)}
                    onFocus={focusGold}
                    onBlur={blurHairline}
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(vIdx, sIdx)}
                    style={{ color: INK_MUTED, cursor: 'pointer', flexShrink: 0 }}
                    className="hover:opacity-70"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addSize(vIdx)}
                style={{ fontSize: '12px', color: GOLD, fontWeight: 500, cursor: 'pointer' }}
              >
                + Add size
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <button
        disabled={saving}
        className="w-full sm:w-auto px-8 py-3 text-sm font-medium transition-colors"
        style={{
          background: INK,
          color: PAPER,
          letterSpacing: '0.02em',
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
}