'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'lb_wishlist_v1';

// ── Mohith Trends brand tokens — matches CartContext's toast styling ──
const GOLD = '#C6A15B';

const toastStyle = {
  fontFamily: 'inherit',
  fontSize: '13px',
  fontWeight: 400,
  color: '#0A0A0A',
  background: '#FFFFFF',
  borderRadius: '2px',
  padding: '12px 16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.08)',
};

function mohithToast(message, dotColor = GOLD) {
  return toast.custom((t) => (
    <div
      style={{
        ...toastStyle,
        opacity: t.visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '220px',
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
        }}
      />
      <span style={{ flex: 1 }}>{message}</span>
    </div>
  ));
}
// ────────────────────────────────────────────────────────────────────

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWishlist(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist, loaded]);

  const addToWishlist = useCallback((productId) => {
    setWishlist((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
    mohithToast('Added to wishlist', GOLD);
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
    mohithToast('Removed from wishlist', '#0A0A0A');
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}