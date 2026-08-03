'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Upload, Loader2, Pencil } from 'lucide-react';

const emptyForm = { name: '', image: '', description: '', comboPrice: '', originalPrice: '', productIds: [] };

export default function AdminCombosPage() {
  const [combos, setCombos] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [editingId, setEditingId] = useState(null); // null = create mode, otherwise the combo _id being edited
  const fileRef = useRef();

  async function load() {
    const [r1, r2] = await Promise.all([fetch('/api/combos?all=true'), fetch('/api/products?limit=200')]);
    setCombos((await r1.json()).combos || []);
    setProducts((await r2.json()).products || []);
  }
  useEffect(() => { load(); }, []);

  function toggleProduct(id) {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id) ? f.productIds.filter((p) => p !== id) : [...f.productIds, id],
    }));
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
    setPreview('');
    setEditingId(null);
  }

  function openCreateForm() {
    setForm(emptyForm);
    setPreview('');
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(combo) {
    setForm({
      name: combo.name || '',
      image: combo.image || '',
      description: combo.description || '',
      comboPrice: combo.comboPrice ?? '',
      originalPrice: combo.originalPrice ?? '',
      // products on a combo are typically stored as [{ product: id, ... }] — normalize to plain ids
      productIds: (combo.products || []).map((p) => (typeof p.product === 'object' ? p.product?._id : p.product) || p._id || p),
    });
    setPreview(combo.image || '');
    setEditingId(combo._id);
    setShowForm(true);
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setForm((f) => ({ ...f, image: data.url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
      setPreview('');
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    const payload = {
      name: form.name,
      image: form.image,
      description: form.description,
      comboPrice: Number(form.comboPrice),
      originalPrice: Number(form.originalPrice) || 0,
      products: form.productIds.map((id) => ({ product: id })),
    };

    const isEditing = Boolean(editingId);
    const url = isEditing ? `/api/combos/${editingId}` : '/api/combos';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok) {
      toast.success(isEditing ? 'Combo updated' : 'Combo created');
      closeForm();
      load();
    } else {
      toast.error(data.error || 'Failed');
    }
  }

  async function remove(id) {
    if (!confirm('Delete this combo?')) return;
    await fetch(`/api/combos/${id}`, { method: 'DELETE' });
    load();
  }

  const inputClass =
    'w-full border border-black/15 px-3 py-2.5 text-sm text-black placeholder:text-black/35 outline-none focus:border-black transition-colors bg-white';

  return (
    <div>
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-black/10">
        <h1 className="font-serif text-2xl text-black">Combo Offers</h1>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase bg-black text-white px-5 py-3 hover:bg-black/85 transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} /> Add Combo
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="border border-black/10 p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-black/10">
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-black/50">
              {editingId ? 'Edit Combo' : 'New Combo'}
            </h2>
            <button type="button" onClick={closeForm} className="text-black/40 hover:text-black transition-colors">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Image upload */}
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            className="w-full h-40 border border-dashed border-black/25 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors overflow-hidden relative bg-[#FAF9F6]"
          >
            {preview
              ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
              : <div className="flex flex-col items-center gap-2 text-black/35 text-xs tracking-wide"><Upload size={20} strokeWidth={1.25} /><span>Click to choose image</span></div>
            }
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-black" />
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          <input required placeholder="Combo name (e.g. 2 Kurti Combo)" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea placeholder="Description" className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" placeholder="Combo price ₹" className={inputClass} value={form.comboPrice} onChange={(e) => setForm({ ...form, comboPrice: e.target.value })} />
            <input type="number" placeholder="Original price ₹" className={inputClass} value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
          </div>

          <p className="text-[11px] tracking-[0.15em] uppercase text-black/40">Select products in this combo</p>
          <div className="max-h-40 overflow-y-auto border border-black/15 p-3 space-y-2">
            {products.map((p) => (
              <label key={p._id} className="flex items-center gap-2.5 text-sm text-black/70">
                <input
                  type="checkbox"
                  checked={form.productIds.includes(p._id)}
                  onChange={() => toggleProduct(p._id)}
                  style={{ accentColor: '#0A0A0A' }}
                />
                {p.name}
              </label>
            ))}
          </div>

          <button
            className="text-xs tracking-[0.15em] uppercase bg-black text-white px-6 py-3 hover:bg-black/85 transition-colors disabled:opacity-40"
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : editingId ? 'Save Changes' : 'Create'}
          </button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {combos.map((c) => (
          <div key={c._id} className="border border-black/10 overflow-hidden">
            <div className="h-32 bg-[#FAF9F6]">{c.image && <img src={c.image} alt={c.name} className="w-full h-full object-cover" />}</div>
            <div className="p-4">
              <p className="text-sm text-black">{c.name}</p>
              <p className="text-sm text-black/70 mt-0.5">₹{c.comboPrice}</p>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => openEditForm(c)} className="text-black/40 hover:text-black transition-colors" title="Edit">
                  <Pencil size={15} strokeWidth={1.5} />
                </button>
                <button onClick={() => remove(c._id)} className="text-black/40 hover:text-black transition-colors" title="Delete">
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}