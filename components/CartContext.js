'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const STORAGE_KEY = 'lb_cart_v1';

// ── SSRK brand tokens ──────────────────────────────────────────
const CRIMSON = '#8B1A1A';
const GOLD    = '#C9A84C';
const GREEN   = '#2D6A2D';
const RED     = '#c0392b';

const toastBase = {
  duration: 2500,
  style: {
    fontFamily: 'inherit',
    fontSize: '13px',
    fontWeight: 600,
    color: '#3a1a1a',
    background: '#FFFFFF',
    borderRadius: '10px',
    padding: '10px 14px',
    boxShadow: '0 2px 12px rgba(139,26,26,0.12)',
    borderLeft: `3px solid ${CRIMSON}`,
  },
};

function ssrkToast(message, opts = {}) {
  return toast(
    (t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span>{message}</span>
        <span style={{ fontSize: 9, color: GOLD, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          SSRK Trending Collections
        </span>
      </div>
    ),
    { ...toastBase, ...opts }
  );
}
// ───────────────────────────────────────────────────────────────

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  /**
   * Adds an item to the cart, respecting stock limits.
   * `item.stock` should be the max available stock for that
   * productId/variantId/size combo (pass Infinity or omit if unknown,
   * though callers should always know it when possible).
   */
  const addItem = useCallback((item) => {
    let blocked = false;
    let clamped = false;

    setItems((prev) => {
      const idx = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.variantId === item.variantId &&
          i.size === item.size &&
          i.comboId === item.comboId
      );

      const stockLimit = typeof item.stock === 'number' ? item.stock : Infinity;

      if (idx > -1) {
        const currentQty = prev[idx].qty;

        if (currentQty >= stockLimit) {
          blocked = true;
          return prev;
        }

        const desiredQty = currentQty + item.qty;
        const finalQty = Math.min(desiredQty, stockLimit);
        if (finalQty < desiredQty) clamped = true;

        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: finalQty, stock: stockLimit };
        return copy;
      }

      if (stockLimit <= 0) {
        blocked = true;
        return prev;
      }

      const finalQty = Math.min(item.qty, stockLimit);
      if (finalQty < item.qty) clamped = true;
      return [...prev, { ...item, qty: finalQty }];
    });

    if (blocked) {
      ssrkToast('Sorry, this item is out of stock', {
        icon: '⚠️',
        style: { ...toastBase.style, borderLeftColor: RED },
      });
      return;
    }

    if (clamped) {
      ssrkToast('Only limited stock available — quantity adjusted', {
        icon: '⚠️',
        style: { ...toastBase.style, borderLeftColor: GOLD },
      });
      return;
    }

    ssrkToast('Added to cart', {
      icon: '✓',
      style: { ...toastBase.style, borderLeftColor: CRIMSON },
    });
  }, []);

  const updateQty = useCallback((key, qty) => {
    setItems((prev) =>
      prev.map((i) => {
        if (cartKey(i) !== key) return i;
        const max = typeof i.stock === 'number' ? i.stock : Infinity;
        const nextQty = Math.max(1, Math.min(qty, max));
        if (qty > max) {
          ssrkToast(`Only ${max} left in stock`, {
            icon: '⚠️',
            style: { ...toastBase.style, borderLeftColor: GOLD },
          });
        }
        return { ...i, qty: nextQty };
      })
    );
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => cartKey(i) !== key));
    ssrkToast('Removed from cart', {
      icon: '🗑️',
      style: { ...toastBase.style, borderLeftColor: GOLD },
    });
  }, []);

  /**
   * Updates the known stock ceiling for a cart line without changing qty,
   * clamping qty down if it now exceeds the new stock. Used after a
   * server-side stock re-check (e.g. at checkout).
   */
  const setItemStock = useCallback((key, stock) => {
    setItems((prev) =>
      prev.map((i) => {
        if (cartKey(i) !== key) return i;
        const nextQty = Math.max(1, Math.min(i.qty, stock));
        return { ...i, stock, qty: nextQty };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    ssrkToast('Cart cleared', {
      icon: '✕',
      style: { ...toastBase.style, borderLeftColor: GREEN },
    });
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count    = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        removeItem,
        setItemStock,
        clearCart,
        subtotal,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function cartKey(i) {
  return [i.productId, i.variantId, i.size, i.comboId].filter(Boolean).join('-');
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}