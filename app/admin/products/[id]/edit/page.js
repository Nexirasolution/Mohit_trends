'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';

// Mohith Trends theme tokens — keep in sync with other admin pages until centralized in tailwind.config.js
const INK = '#1A1A1A';
const INK_MUTED = '#6B6B66';

export default function EditProductPage() {
  const { id } = useParams();
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${id}`).then((r) => r.json()).then((d) => setInitial(d.product));
  }, [id]);

  if (!initial) return <p style={{ color: INK_MUTED }}>Loading product...</p>;

  return (
    <div>
      <h1
        className="text-2xl mb-6 tracking-tight"
        style={{ color: INK, fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Edit Product
      </h1>
      <ProductForm initial={initial} productId={id} />
    </div>
  );
}