'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X, Star, Trash2, Plus, Loader2, ImagePlus } from 'lucide-react';

// Mohith Trends theme tokens — keep in sync with other admin pages until centralized in tailwind.config.js
const GOLD = '#B08D3F';
const INK = '#1A1A1A';
const INK_MUTED = '#6B6B66';
const HAIRLINE = '#E8E4DA';
const PAPER = '#FDFCFA';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ product: '', customerName: '', rating: 5, comment: '', images: [], isFeatured: false });

  async function load() {
    const res = await fetch('/api/reviews?all=true');
    const data = await res.json();
    setReviews(data.reviews || []);
  }
  async function loadProducts() {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data.products || []);
  }
  useEffect(() => { load(); loadProducts(); }, []);

  async function update(id, body) {
    await fetch(`/api/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this review?')) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    toast.success('Deleted');
    load();
  }

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
        else toast.error(`Could not upload ${file.name}`);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  function closeForm() {
    setShowForm(false);
    setForm({ product: '', customerName: '', rating: 5, comment: '', images: [], isFeatured: false });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.product || !form.customerName.trim()) {
      toast.error('Select a product and enter a customer name');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Review added');
        closeForm();
        load();
      } else {
        toast.error(data.error || 'Could not add review');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    borderBottom: `1px solid ${HAIRLINE}`,
    color: INK,
    background: 'transparent',
  };

  function Badge({ children, tone = 'muted' }) {
    const tones = {
      gold: { background: 'rgba(176,141,63,0.12)', color: GOLD },
      ink: { background: INK, color: PAPER },
      muted: { background: HAIRLINE, color: INK_MUTED },
    };
    return (
      <span className="px-2 py-0.5 rounded-full text-xs" style={tones[tone]}>
        {children}
      </span>
    );
  }

  return (
    <div style={{ background: PAPER }}>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl tracking-tight"
          style={{ color: INK, fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Reviews
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 transition-colors"
          style={{ background: INK, color: PAPER }}
        >
          <Plus size={15} /> Add Review
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-8 pb-8 grid sm:grid-cols-2 gap-5" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
          <div className="sm:col-span-2 flex justify-between items-center">
            <h2 className="text-[11px] uppercase tracking-wide" style={{ color: INK_MUTED }}>New Review</h2>
            <button type="button" onClick={closeForm} style={{ color: INK_MUTED }} className="hover:opacity-70">
              <X size={17} />
            </button>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs mb-1.5" style={{ color: INK_MUTED }}>Product</label>
            <select
              className="w-full px-1 py-2 text-sm outline-none bg-transparent"
              style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK }}
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: INK_MUTED }}>Customer Name</label>
            <input
              placeholder="e.g. Priya S."
              className="w-full px-1 py-2 text-sm outline-none"
              style={inputStyle}
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: INK_MUTED }}>Rating</label>
            <div className="flex gap-1 py-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button type="button" key={i} onClick={() => setForm({ ...form, rating: i + 1 })}>
                  <Star
                    size={20}
                    style={i < form.rating ? { fill: GOLD, color: GOLD } : { color: HAIRLINE }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs mb-1.5" style={{ color: INK_MUTED }}>Comment</label>
            <textarea
              rows={3}
              placeholder="What did the customer say?"
              className="w-full px-1 py-2 text-sm outline-none resize-none"
              style={inputStyle}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs mb-2" style={{ color: INK_MUTED }}>Photos (optional)</label>
            <div className="flex flex-wrap gap-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative w-16 h-16 overflow-hidden" style={{ border: `1px solid ${HAIRLINE}` }}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-0 right-0 p-0.5"
                    style={{ background: 'rgba(26,26,26,0.6)', color: PAPER }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label
                className="w-16 h-16 flex items-center justify-center cursor-pointer"
                style={{ border: `1px dashed ${HAIRLINE}`, color: INK_MUTED }}
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <label className="sm:col-span-2 flex items-center gap-2 text-sm" style={{ color: INK }}>
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Feature on homepage
          </label>

          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="text-sm flex items-center gap-2 px-4 py-2 transition-colors disabled:opacity-60"
              style={{ background: INK, color: PAPER }}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? 'Saving…' : 'Add Review'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="text-sm px-4 py-2"
              style={{ border: `1px solid ${HAIRLINE}`, color: INK_MUTED }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-5">
        {reviews.map((r) => (
          <div key={r._id} className="pb-5 flex items-start gap-4" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} style={i < r.rating ? { fill: GOLD, color: GOLD } : { color: HAIRLINE }} />
                ))}
              </div>
              <p className="text-sm" style={{ color: INK }}>{r.comment}</p>
              {r.images?.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {r.images.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-10 h-10 object-cover" style={{ borderRadius: 2 }} />
                  ))}
                </div>
              )}
              <p className="text-xs mt-2" style={{ color: INK_MUTED }}>{r.customerName} · {r.product?.name}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge tone={r.isApproved ? 'gold' : 'muted'}>{r.isApproved ? 'Approved' : 'Pending'}</Badge>
                {r.isFeatured && <Badge tone="ink">Featured</Badge>}
                {r.isVerifiedPurchase && <Badge tone="muted">Verified Purchase</Badge>}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {!r.isApproved ? (
                <button onClick={() => update(r._id, { isApproved: true })} style={{ color: GOLD }} className="hover:opacity-70">
                  <Check size={16} />
                </button>
              ) : (
                <button onClick={() => update(r._id, { isApproved: false })} style={{ color: INK_MUTED }} className="hover:opacity-70">
                  <X size={16} />
                </button>
              )}
              <button
                onClick={() => update(r._id, { isFeatured: !r.isFeatured })}
                style={{ color: r.isFeatured ? GOLD : INK_MUTED }}
                className="hover:opacity-70"
              >
                <Star size={16} style={r.isFeatured ? { fill: GOLD } : {}} />
              </button>
              <button onClick={() => remove(r._id)} style={{ color: INK_MUTED }} className="hover:opacity-70">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-center py-10" style={{ color: INK_MUTED }}>No reviews yet.</p>}
      </div>
    </div>
  );
}