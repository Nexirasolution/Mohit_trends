'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Upload, Loader2, Video } from 'lucide-react';

// Mohith Trends theme tokens — keep in sync with other admin pages until centralized in tailwind.config.js
const GOLD = '#B08D3F';
const INK = '#1A1A1A';
const INK_MUTED = '#6B6B66';
const HAIRLINE = '#E8E4DA';
const PAPER = '#FDFCFA';

const emptyForm = { title: '', videoUrl: '', thumbnail: '', instagramLink: '', product: '', sortOrder: 0 };

function UploadSlot({ value, accept, folder, placeholder, icon: Icon, preview: PreviewComp, onChange }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
      toast.success('Uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {/* Click area */}
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        className="w-full h-28 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative"
        style={{ border: `1px dashed ${HAIRLINE}`, background: PAPER }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
      >
        {value ? (
          PreviewComp ? <PreviewComp url={value} /> : <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-xs" style={{ color: INK_MUTED }}>
            <Icon size={20} />
            <span>{placeholder}</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(253,252,250,0.8)' }}>
            <Loader2 size={20} className="animate-spin" style={{ color: GOLD }} />
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleFile} />

      {/* Manual URL fallback */}
      <input
        placeholder={`Or paste URL — ${placeholder}`}
        className="w-full px-1 py-1.5 text-xs outline-none bg-transparent"
        style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK_MUTED }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function VideoPreview({ url }) {
  return (
    <video src={url} className="w-full h-full object-cover" muted playsInline
      onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
    />
  );
}

export default function AdminReelsPage() {
  const [reels, setReels] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const [r1, r2] = await Promise.all([fetch('/api/reels?all=true'), fetch('/api/products?limit=200')]);
    setReels((await r1.json()).reels || []);
    setProducts((await r2.json()).products || []);
  }
  useEffect(() => { load(); }, []);

  function closeForm() { setShowForm(false); setForm(emptyForm); }

  async function submit(e) {
    e.preventDefault();
    if (!form.videoUrl) { toast.error('Please upload a video'); return; }
    const payload = { ...form, product: form.product || null };
    const res = await fetch('/api/reels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { toast.success('Reel added'); closeForm(); load(); }
  }

  async function remove(id) {
    if (!confirm('Delete this reel?')) return;
    await fetch(`/api/reels/${id}`, { method: 'DELETE' });
    load();
  }

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
          Shop by Reels
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 transition-colors"
          style={{ background: INK, color: PAPER }}
        >
          <Plus size={15} /> Add Reel
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-8 pb-8 space-y-4" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
          <div className="flex justify-between items-center">
            <h2 className="text-[11px] uppercase tracking-wide" style={{ color: INK_MUTED }}>New Reel</h2>
            <button type="button" onClick={closeForm} style={{ color: INK_MUTED }} className="hover:opacity-70">
              <X size={17} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: INK_MUTED }}>Video * (.mp4, .mov)</p>
              <UploadSlot
                value={form.videoUrl}
                accept="video/*"
                folder="reels/videos"
                placeholder="Click to upload video"
                icon={Video}
                preview={VideoPreview}
                onChange={(url) => setForm((f) => ({ ...f, videoUrl: url }))}
              />
            </div>
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: INK_MUTED }}>Thumbnail image</p>
              <UploadSlot
                value={form.thumbnail}
                accept="image/*"
                folder="reels/thumbnails"
                placeholder="Click to upload thumbnail"
                icon={Upload}
                onChange={(url) => setForm((f) => ({ ...f, thumbnail: url }))}
              />
            </div>
          </div>

          <input
            placeholder="Instagram reel link"
            className="w-full px-1 py-2 text-sm outline-none"
            style={inputStyle}
            value={form.instagramLink}
            onChange={(e) => setForm({ ...form, instagramLink: e.target.value })}
          />
          <select
            className="w-full px-1 py-2 text-sm outline-none bg-transparent"
            style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK }}
            value={form.product}
            onChange={(e) => setForm({ ...form, product: e.target.value })}
          >
            <option value="">Link to product (optional)</option>
            {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>

          <button
            className="text-sm font-medium px-4 py-2 transition-colors"
            style={{ background: INK, color: PAPER }}
          >
            Create
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {reels.map((r) => (
          <div key={r._id} className="overflow-hidden">
            <div className="aspect-[9/16] overflow-hidden" style={{ background: HAIRLINE }}>
              {r.thumbnail
                ? <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover" />
                : r.videoUrl
                  ? <video src={r.videoUrl} className="w-full h-full object-cover" muted playsInline
                      onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }} />
                  : null
              }
            </div>
            <div className="pt-2 flex items-center justify-between">
              <p className="text-xs line-clamp-1" style={{ color: INK }}>{r.product?.name || r.title || 'Reel'}</p>
              <button onClick={() => remove(r._id)} style={{ color: INK_MUTED }} className="hover:opacity-70">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}