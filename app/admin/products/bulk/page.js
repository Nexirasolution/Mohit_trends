'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { X, UploadCloud, Loader2 } from 'lucide-react';

export default function BulkAddProductsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [categorySizes, setCategorySizes] = useState([]);

  const [titlePrefix, setTitlePrefix] = useState('');
  const [description, setDescription] = useState('');
  const [fabric, setFabric] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stockBySize, setStockBySize] = useState({}); // { S: 10, M: 10, ... }

  const [files, setFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // objectURL[]
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    const cat = categories.find((c) => c._id === category);
    const sizes = cat?.sizes || [];
    setCategorySizes(sizes);
    setStockBySize(Object.fromEntries(sizes.map((s) => [s, ''])));
  }, [category, categories]);

  function handleFilesChange(e) {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    setPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  }

  function removeImage(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
    const data = await res.json();
    return data.url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setResult(null);

    if (!category) return toast.error('Select a category');
    if (!titlePrefix.trim()) return toast.error('Enter a title prefix (e.g. MT)');
    if (!price || Number(price) <= 0) return toast.error('Enter a valid price');
    if (files.length === 0) return toast.error('Add at least one image');

    const sizes = Object.entries(stockBySize)
      .filter(([, stock]) => stock !== '')
      .map(([size, stock]) => ({ size, stock: Number(stock) }));
    if (sizes.length === 0) return toast.error('Enter stock for at least one size');

    setSubmitting(true);
    try {
      // 1. Upload every image first, one product will be created per URL
      const imageUrls = [];
      for (const file of files) {
        const url = await uploadImage(file);
        imageUrls.push(url);
      }

      // 2. Create products in bulk
      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          titlePrefix,
          description,
          fabric,
          price: Number(price),
          compareAtPrice: Number(compareAtPrice) || 0,
          sizes,
          images: imageUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk upload failed');

      setResult(data);
      if (data.createdCount > 0) {
        toast.success(`${data.createdCount} product${data.createdCount > 1 ? 's' : ''} created`);
      }
      if (data.errors?.length) {
        toast.error(`${data.errors.length} item(s) skipped — see details below`);
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-brand-magenta mb-1">Bulk Add Products</h1>
      <p className="text-sm text-brand-ink/50 mb-6">
        One category, description, and fabric applied to every product. Each image you upload becomes
        its own product — titles and SKUs are generated automatically.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-brand-ink/10 outline-none"
              required
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title prefix</label>
            <input
              value={titlePrefix}
              onChange={(e) => setTitlePrefix(e.target.value)}
              placeholder="e.g. MT"
              className="w-full px-3 py-2 text-sm rounded-lg border border-brand-ink/10 outline-none"
              required
            />
            <p className="text-xs text-brand-ink/40 mt-1">
              Titles auto-generate as {titlePrefix ? titlePrefix.toUpperCase() : 'MT'}001, {titlePrefix ? titlePrefix.toUpperCase() : 'MT'}002...
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-brand-ink/10 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Compare-at price (optional)</label>
            <input
              type="number"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-brand-ink/10 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-brand-ink/10 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fabric</label>
          <input
            value={fabric}
            onChange={(e) => setFabric(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-brand-ink/10 outline-none"
          />
        </div>

        {categorySizes.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Stock per size (applies to every product)</label>
            <div className="flex flex-wrap gap-3">
              {categorySizes.map((size) => (
                <div key={size} className="flex items-center gap-2">
                  <span className="text-xs font-semibold w-8">{size}</span>
                  <input
                    type="number"
                    min="0"
                    value={stockBySize[size] ?? ''}
                    onChange={(e) => setStockBySize((prev) => ({ ...prev, [size]: e.target.value }))}
                    placeholder="0"
                    className="w-20 px-2 py-1.5 text-sm rounded-lg border border-brand-ink/10 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Images ({files.length} selected — one product per image)
          </label>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-ink/15 rounded-lg py-8 cursor-pointer text-brand-ink/50 hover:border-brand-magenta/40">
            <UploadCloud size={22} />
            <span className="text-sm">Click to select images</span>
            <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-brand-ink/5">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Creating products...' : `Create ${files.length || ''} Product${files.length === 1 ? '' : 's'}`}
        </button>
      </form>

      {result && (
        <div className="mt-6 card-soft p-4 text-sm">
          <p className="font-medium mb-2">{result.createdCount} product(s) created.</p>
          {result.errors?.length > 0 && (
            <div className="text-brand-ink/60">
              <p className="font-medium text-brand-magenta mb-1">Skipped:</p>
              <ul className="list-disc pl-5 space-y-0.5">
                {result.errors.map((e, i) => (
                  <li key={i}>{e.name}: {e.error}</li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={() => router.push('/admin/products')} className="mt-3 text-brand-magenta underline text-sm">
            Go to product list
          </button>
        </div>
      )}
    </div>
  );
}