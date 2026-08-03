'use client';

import { X } from 'lucide-react';
import { formatINR } from '@/lib/utils';

// Mohith Trends theme tokens — keep in sync with other admin pages until centralized in tailwind.config.js
const GOLD = '#B08D3F';
const INK = '#1A1A1A';
const INK_MUTED = '#6B6B66';
const HAIRLINE = '#E8E4DA';
const PAPER = '#FDFCFA';

export default function OrderItemModal({ item, image, categoryName, productSku, onClose }) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(26,26,26,0.5)' }}
      onClick={onClose}
    >
      <div
        className="p-6 max-w-sm w-full"
        style={{ background: PAPER }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
          <h3
            className="pr-4 text-lg"
            style={{ color: INK, fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {item.name}
          </h3>
          <button onClick={onClose} className="shrink-0 hover:opacity-70" style={{ color: INK_MUTED }}>
            <X size={18} />
          </button>
        </div>

        {image ? (
          <img src={image} alt={item.name} className="w-full h-56 object-cover mb-4" style={{ borderRadius: 2 }} />
        ) : (
          <div
            className="w-full h-56 mb-4 flex items-center justify-center text-sm"
            style={{ background: HAIRLINE, color: INK_MUTED, borderRadius: 2 }}
          >
            No image available
          </div>
        )}

        <div className="text-sm space-y-2">
          {categoryName && (
            <p style={{ color: INK }}><span style={{ color: INK_MUTED }}>Category:</span> {categoryName}</p>
          )}
          <p style={{ color: INK }}><span style={{ color: INK_MUTED }}>Color:</span> {item.color || '—'}</p>
          <p style={{ color: INK }}><span style={{ color: INK_MUTED }}>Size:</span> {item.size || '—'}</p>
          <p style={{ color: INK }}><span style={{ color: INK_MUTED }}>Quantity ordered:</span> {item.qty}</p>
          <p style={{ color: INK }}><span style={{ color: INK_MUTED }}>Price:</span> {formatINR(item.price)} each</p>
          <p className="pt-2 mt-1 font-medium" style={{ color: INK, borderTop: `1px solid ${HAIRLINE}` }}>
            <span className="font-normal" style={{ color: INK_MUTED }}>Subtotal:</span>{' '}
            <span style={{ color: GOLD }}>{formatINR(item.price * item.qty)}</span>
          </p>
          {productSku && <p style={{ color: INK }}><span style={{ color: INK_MUTED }}>Product SKU:</span> {productSku}</p>}
          {item.sku && <p style={{ color: INK }}><span style={{ color: INK_MUTED }}>Size SKU:</span> {item.sku}</p>}
        </div>
      </div>
    </div>
  );
}