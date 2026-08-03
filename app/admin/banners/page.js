'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Upload, Loader2, Pencil } from 'lucide-react';

const emptyForm = {
  title: '', subtitle: '', image: '', link: '',
  buttonText: 'Shop Now', sortOrder: 0, isActive: true,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const fileRef = useRef();

  async function load() {
    const res = await fetch('/api/banners?all=true');
    const data = await res.json();
    setBanners(data.banners || []);
  }
  useEffect(() => { load(); }, []);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // local preview instantly
    setPreview(URL.createObjectURL(file));

    // upload to Cloudinary via our API route
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

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setPreview('');
    setShowForm(true);
  }

  function openEdit(b) {
    setEditingId(b._id);
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      image: b.image || '',
      link: b.link || '',
      buttonText: b.buttonText || 'Shop Now',
      sortOrder: b.sortOrder ?? 0,
      isActive: b.isActive ?? true,
    });
    setPreview(b.image || '');
    setShowForm(true);
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.image) { toast.error('Please upload an image'); return; }

    const isEditing = Boolean(editingId);
    const res = await fetch(
      isEditing ? `/api/banners/${editingId}` : '/api/banners',
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      toast.success(isEditing ? 'Banner updated' : 'Banner added');
      closeForm();
      load();
    } else {
      toast.error(isEditing ? 'Failed to update banner' : 'Failed to add banner');
    }
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setPreview('');
  }

  async function toggleActive(b) {
    await fetch(`/api/banners/${b._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !b.isActive }),
    });
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this banner?')) return;
    await fetch(`/api/banners/${id}`, { method: 'DELETE' });
    load();
  }

  const inputClass =
    'w-full border border-black/15 px-3 py-2.5 text-sm text-black placeholder:text-black/35 outline-none focus:border-black transition-colors bg-white';

  return (
    <div>
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-black/10">
        <div>
          <h1 className="font-serif text-2xl text-black">Homepage Banners</h1>
          <p className="text-xs text-black/40 font-light mt-1">Manage the rotating banners shown on your storefront</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase bg-black text-white px-5 py-3 hover:bg-black/85 transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} /> Add Banner
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="border border-black/10 p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-black/10">
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-black/50">
              {editingId ? 'Edit Banner' : 'New Banner'}
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
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-black/35 text-xs tracking-wide">
                <Upload size={20} strokeWidth={1.25} />
                <span>Click to choose image</span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-black" />
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {editingId && (
            <p className="text-xs text-black/40 font-light">Click the image to replace it, or leave it as is.</p>
          )}

          <input placeholder="Title" className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Subtitle" className={inputClass} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <input placeholder="Link (e.g. /category/umbrella-kurtis)" className={inputClass} value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input placeholder="Button text" className={inputClass} value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
          <input type="number" placeholder="Sort order" className={inputClass} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />

          <label className="text-sm flex items-center gap-2 text-black/70">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              style={{ accentColor: '#0A0A0A' }}
            />
            Active
          </label>

          <button
            className="text-xs tracking-[0.15em] uppercase bg-black text-white px-6 py-3 hover:bg-black/85 transition-colors disabled:opacity-40"
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : editingId ? 'Save Changes' : 'Create'}
          </button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        {banners.map((b) => (
          <div key={b._id} className="border border-black/10 overflow-hidden">
            <img src={b.image} alt={b.title} className="w-full h-32 object-cover" />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-black">{b.title || '(no title)'}</p>
                <p className="text-xs text-black/40 font-light mt-0.5">Order: {b.sortOrder}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs flex items-center gap-1.5 text-black/60">
                  <input
                    type="checkbox"
                    checked={b.isActive}
                    onChange={() => toggleActive(b)}
                    style={{ accentColor: '#0A0A0A' }}
                  />
                  Active
                </label>
                <button onClick={() => openEdit(b)} className="text-black/40 hover:text-black transition-colors">
                  <Pencil size={15} strokeWidth={1.5} />
                </button>
                <button onClick={() => remove(b._id)} className="text-black/40 hover:text-black transition-colors">
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