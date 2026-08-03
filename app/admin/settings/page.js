'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Mohith Trends theme tokens — keep in sync with other admin pages until centralized in tailwind.config.js
const INK = '#1A1A1A';
const INK_MUTED = '#6B6B66';
const HAIRLINE = '#E8E4DA';
const PAPER = '#FDFCFA';

export default function AdminSettingsPage() {
  const [form, setForm] = useState(null);

  useEffect(() => {
    fetch('/api/admin/settings').then((r) => r.json()).then((d) => setForm(d.settings));
  }, []);

  async function submit(e) {
    e.preventDefault();
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) toast.success('Settings saved');
  }

  if (!form) return <p style={{ color: INK_MUTED }}>Loading...</p>;

  const inputStyle = {
    borderBottom: `1px solid ${HAIRLINE}`,
    color: INK,
    background: 'transparent',
  };

  const labelStyle = { color: INK_MUTED };

  return (
    <div className="max-w-xl" style={{ background: PAPER }}>
      <h1
        className="text-2xl mb-6 tracking-tight"
        style={{ color: INK, fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Store Settings
      </h1>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="text-sm" style={labelStyle}>Store Name</label>
          <input
            className="w-full px-1 py-2 text-sm mt-1 outline-none"
            style={inputStyle}
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm" style={labelStyle}>WhatsApp Number (with country code)</label>
          <input
            className="w-full px-1 py-2 text-sm mt-1 outline-none"
            style={inputStyle}
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm" style={labelStyle}>Instagram Handle</label>
          <input
            className="w-full px-1 py-2 text-sm mt-1 outline-none"
            style={inputStyle}
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm" style={labelStyle}>Address</label>
          <input
            className="w-full px-1 py-2 text-sm mt-1 outline-none"
            style={inputStyle}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-sm" style={labelStyle}>Shipping Fee (₹)</label>
            <input
              type="number"
              className="w-full px-1 py-2 text-sm mt-1 outline-none"
              style={inputStyle}
              value={form.shippingFee}
              onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm" style={labelStyle}>Free Shipping Above (₹)</label>
            <input
              type="number"
              className="w-full px-1 py-2 text-sm mt-1 outline-none"
              style={inputStyle}
              value={form.freeShippingAbove}
              onChange={(e) => setForm({ ...form, freeShippingAbove: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <label className="text-sm" style={labelStyle}>SEO Title</label>
          <input
            className="w-full px-1 py-2 text-sm mt-1 outline-none"
            style={inputStyle}
            value={form.seoTitle}
            onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm" style={labelStyle}>SEO Description</label>
          <textarea
            rows={3}
            className="w-full px-1 py-2 text-sm mt-1 outline-none resize-none"
            style={inputStyle}
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
          />
        </div>
        <button
          className="text-sm font-medium px-4 py-2 transition-colors"
          style={{ background: INK, color: PAPER }}
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}