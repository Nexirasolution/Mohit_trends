'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';

const emptyForm = { code: '', type: 'percent', value: '', minOrderValue: '', maxDiscount: '', expiresAt: '', usageLimit: '' };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const res = await fetch('/api/coupons');
    const data = await res.json();
    setCoupons(data.coupons || []);
  }
  useEffect(() => { load(); }, []);

  function updateField(key, val) {
    setForm({ ...form, [key]: val });
    if (errors[key]) setErrors({ ...errors, [key]: null });
  }

  function validate() {
    const e = {};
    if (!form.code.trim()) e.code = 'Coupon code is required';
    else if (!/^[A-Za-z0-9_-]+$/.test(form.code.trim())) e.code = 'Use letters, numbers, - or _ only';

    if (!form.value || Number(form.value) <= 0) e.value = 'Enter a discount value greater than 0';
    if (form.type === 'percent' && Number(form.value) > 100) e.value = 'Percentage cannot exceed 100';

    if (form.expiresAt && new Date(form.expiresAt) < new Date(new Date().toDateString())) {
      e.expiresAt = 'Expiry date is in the past';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      value: Number(form.value),
      minOrderValue: Number(form.minOrderValue) || 0,
      maxDiscount: form.type === 'percent' ? (Number(form.maxDiscount) || 0) : 0,
      usageLimit: Number(form.usageLimit) || 0,
      expiresAt: form.expiresAt || null
    };
    try {
      const res = await fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Coupon "${payload.code}" created`);
        setShowForm(false);
        setForm(emptyForm);
        setErrors({});
        load();
      } else {
        toast.error(data.error || 'Could not create coupon');
      }
    } catch {
      toast.error('Network error — please try again');
    } finally {
      setSubmitting(false);
    }
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
    setErrors({});
  }

  async function toggleActive(c) {
    await fetch(`/api/coupons/${c._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !c.isActive }) });
    load();
  }

  async function remove(id, code) {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
    toast.success('Coupon deleted');
    load();
  }

  const previewText = form.value
    ? form.type === 'percent'
      ? `${form.value}% off${form.maxDiscount ? `, capped at ₹${form.maxDiscount}` : ''}`
      : `₹${form.value} off`
    : null;

  const labelClass = 'block text-[11px] tracking-[0.1em] uppercase text-black/40 mb-1.5';
  const inputBase =
    'w-full border px-3 py-2.5 text-sm text-black placeholder:text-black/35 outline-none focus:border-black transition-colors bg-white';
  const inputClass = (hasError) => `${inputBase} ${hasError ? 'border-red-400' : 'border-black/15'}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-black/10">
        <h1 className="font-serif text-2xl text-black">Coupons</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase bg-black text-white px-5 py-3 hover:bg-black/85 transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} /> Add Coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="border border-black/10 p-6 mb-8 grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2 flex justify-between items-center pb-4 border-b border-black/10">
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-black/50">New Coupon</h2>
            <button type="button" onClick={closeForm} className="text-black/40 hover:text-black transition-colors">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Code */}
          <div>
            <label className={labelClass}>Coupon Code</label>
            <input
              placeholder="e.g. WELCOME10"
              className={`${inputClass(errors.code)} uppercase`}
              value={form.code}
              onChange={(e) => updateField('code', e.target.value)}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1.5 font-light">{errors.code}</p>}
          </div>

          {/* Type */}
          <div>
            <label className={labelClass}>Discount Type</label>
            <select
              className={inputBase}
              value={form.type}
              onChange={(e) => updateField('type', e.target.value)}
            >
              <option value="percent">Percentage off (%)</option>
              <option value="flat">Flat amount off (₹)</option>
            </select>
          </div>

          {/* Value */}
          <div>
            <label className={labelClass}>{form.type === 'percent' ? 'Percentage' : 'Amount'}</label>
            <input
              type="number"
              min="0"
              placeholder={form.type === 'percent' ? 'e.g. 10' : 'e.g. 100'}
              className={inputClass(errors.value)}
              value={form.value}
              onChange={(e) => updateField('value', e.target.value)}
            />
            {errors.value && <p className="text-xs text-red-500 mt-1.5 font-light">{errors.value}</p>}
          </div>

          {/* Min order value */}
          <div>
            <label className={labelClass}>Minimum Order Value (optional)</label>
            <input
              type="number"
              min="0"
              placeholder="0 = no minimum"
              className={inputBase}
              value={form.minOrderValue}
              onChange={(e) => updateField('minOrderValue', e.target.value)}
            />
          </div>

          {/* Max discount — only relevant for percent */}
          {form.type === 'percent' && (
            <div>
              <label className={labelClass}>Max Discount Cap (optional)</label>
              <input
                type="number"
                min="0"
                placeholder="0 = no cap"
                className={inputBase}
                value={form.maxDiscount}
                onChange={(e) => updateField('maxDiscount', e.target.value)}
              />
              <p className="text-xs text-black/40 font-light mt-1.5">Caps the rupee value of a percentage discount</p>
            </div>
          )}

          {/* Usage limit */}
          <div>
            <label className={labelClass}>Usage Limit (optional)</label>
            <input
              type="number"
              min="0"
              placeholder="0 = unlimited"
              className={inputBase}
              value={form.usageLimit}
              onChange={(e) => updateField('usageLimit', e.target.value)}
            />
          </div>

          {/* Expiry */}
          <div>
            <label className={labelClass}>Expiry Date (optional)</label>
            <input
              type="date"
              className={inputClass(errors.expiresAt)}
              value={form.expiresAt}
              onChange={(e) => updateField('expiresAt', e.target.value)}
            />
            {errors.expiresAt && <p className="text-xs text-red-500 mt-1.5 font-light">{errors.expiresAt}</p>}
            <p className="text-xs text-black/40 font-light mt-1.5">Leave blank if the coupon never expires</p>
          </div>

          {/* Live preview */}
          {previewText && (
            <div className="sm:col-span-2 border border-[#C6A15B]/40 px-4 py-3 text-sm text-black flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#C6A15B] shrink-0" />
              Preview: <span className="text-black">{form.code.trim() || 'CODE'}</span> → {previewText}
              {form.minOrderValue > 0 && ` on orders above ₹${form.minOrderValue}`}
            </div>
          )}

          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase bg-black text-white px-6 py-3 hover:bg-black/85 transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 size={13} strokeWidth={1.5} className="animate-spin" />}
              {submitting ? 'Creating…' : 'Create Coupon'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="text-xs tracking-[0.15em] uppercase px-6 py-3 border border-black/20 text-black/60 hover:border-black hover:text-black transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="border border-black/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-black/10">
              <th className="p-3 text-[11px] tracking-[0.1em] uppercase text-black/40 font-normal">Code</th>
              <th className="p-3 text-[11px] tracking-[0.1em] uppercase text-black/40 font-normal">Discount</th>
              <th className="p-3 text-[11px] tracking-[0.1em] uppercase text-black/40 font-normal">Used</th>
              <th className="p-3 text-[11px] tracking-[0.1em] uppercase text-black/40 font-normal">Expires</th>
              <th className="p-3 text-[11px] tracking-[0.1em] uppercase text-black/40 font-normal">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="border-b border-black/5">
                <td className="p-3 text-black">{c.code}</td>
                <td className="p-3 text-black/70">{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="p-3 text-black/70">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                <td className="p-3 text-black/70">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'Never'}</td>
                <td className="p-3">
                  <label className="flex items-center gap-1.5 text-xs text-black/60">
                    <input type="checkbox" checked={c.isActive} onChange={() => toggleActive(c)} style={{ accentColor: '#0A0A0A' }} /> Active
                  </label>
                </td>
                <td className="p-3">
                  <button onClick={() => remove(c._id, c.code)} className="text-black/40 hover:text-black transition-colors">
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="text-center text-black/35 font-light py-14">No coupons yet.</p>}
      </div>
    </div>
  );
}