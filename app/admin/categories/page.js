'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Pencil, X, Upload, Loader2 } from 'lucide-react';

const emptyForm = { name: '', slug: '', image: '', description: '', sizes: '' };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const fileRef = useRef();

  async function load() {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data.categories || []);
  }
  useEffect(() => { load(); }, []);

  function startEdit(c) {
    setEditingId(c._id);
    setForm({ name: c.name, slug: c.slug, image: c.image || '', description: c.description || '', sizes: (c.sizes || []).join(', ') });
    setPreview(c.image || '');
    setShowForm(true);
  }

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
    setPreview('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setPreview('');
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
    const payload = { ...form, sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean) };
    const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok) {
      toast.success(editingId ? 'Category updated' : 'Category created');
      setShowForm(false);
      setPreview('');
      load();
    } else toast.error(data.error || 'Failed');
  }

  async function remove(id) {
    if (!confirm('Delete this category?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); load(); }
  }

  const inputClass =
    'w-full border border-black/15 px-3 py-2.5 text-sm text-black placeholder:text-black/35 outline-none focus:border-black transition-colors bg-white';

  return (
    <div>
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-black/10">
        <h1 className="font-serif text-2xl text-black">Categories</h1>
        <button
          onClick={startNew}
          className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase bg-black text-white px-5 py-3 hover:bg-black/85 transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} /> Add Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="border border-black/10 p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-black/10">
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-black/50">
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>
            <button type="button" onClick={closeForm} className="text-black/40 hover:text-black transition-colors">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Image upload — circular preview to match category icon style */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF9F6] overflow-hidden shrink-0 border border-dashed border-black/20 flex items-center justify-center">
              {preview
                ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                : <Upload size={16} strokeWidth={1.25} className="text-black/30" />
              }
            </div>
            <div className="flex-1">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-xs tracking-wide border border-black/20 px-3 py-2 hover:border-black transition-colors disabled:opacity-50"
              >
                {uploading
                  ? <><Loader2 size={13} strokeWidth={1.5} className="animate-spin" /> Uploading…</>
                  : <><Upload size={13} strokeWidth={1.5} /> {preview ? 'Change image' : 'Choose image'}</>
                }
              </button>
              <p className="text-xs text-black/40 font-light mt-1.5">Shown as circular icon on homepage</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          <input required placeholder="Category name (e.g. Umbrella Kurtis)" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Slug (auto if blank)" className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <input placeholder="Available sizes, comma separated (S, M, L, XL)" className={inputClass} value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
          <textarea placeholder="Description" className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <button
            className="text-xs tracking-[0.15em] uppercase bg-black text-white px-6 py-3 hover:bg-black/85 transition-colors disabled:opacity-40"
            disabled={uploading}
          >
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((c) => (
          <div key={c._id} className="border border-black/10 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FAF9F6] overflow-hidden shrink-0">
              {c.image && <img src={c.image} alt={c.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <p className="text-sm text-black">{c.name}</p>
              <p className="text-xs text-black/40 font-light mt-0.5">/{c.slug}</p>
            </div>
            <button onClick={() => startEdit(c)} className="text-black/40 hover:text-black transition-colors p-1">
              <Pencil size={15} strokeWidth={1.5} />
            </button>
            <button onClick={() => remove(c._id)} className="text-black/40 hover:text-black transition-colors p-1">
              <Trash2 size={15} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}