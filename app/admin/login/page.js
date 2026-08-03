'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Mohith Trends theme tokens — keep in sync with AdminInventoryPage until centralized in tailwind.config.js
const GOLD = '#B08D3F';
const INK = '#1A1A1A';
const INK_MUTED = '#6B6B66';
const HAIRLINE = '#E8E4DA';
const PAPER = '#FDFCFA';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      toast.error(data.error || 'Login failed');
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: PAPER }}
    >
      <form onSubmit={submit} className="w-full max-w-sm">
        {/* Small mark above the wordmark, echoing the logo's ring motif */}
        <div className="flex justify-center mb-5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ border: `1px solid ${GOLD}` }}
          >
            <span
              className="text-lg"
              style={{ color: GOLD, fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              M
            </span>
          </div>
        </div>

        <h1
          className="text-2xl text-center mb-1 tracking-tight"
          style={{ color: INK, fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Mohith Trends
        </h1>
        <p
          className="text-center text-xs uppercase tracking-widest mb-8"
          style={{ color: INK_MUTED }}
        >
          Style That Speaks You
        </p>

        <div className="space-y-4 mb-6">
          <input
            type="email"
            required
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent px-1 py-2.5 text-sm outline-none"
            style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK }}
            onFocus={(e) => (e.target.style.borderBottom = `1px solid ${GOLD}`)}
            onBlur={(e) => (e.target.style.borderBottom = `1px solid ${HAIRLINE}`)}
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent px-1 py-2.5 text-sm outline-none"
            style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK }}
            onFocus={(e) => (e.target.style.borderBottom = `1px solid ${GOLD}`)}
            onBlur={(e) => (e.target.style.borderBottom = `1px solid ${HAIRLINE}`)}
          />
        </div>

        <button
          disabled={loading}
          className="w-full py-2.5 text-sm font-medium tracking-wide transition-opacity disabled:opacity-60"
          style={{ background: INK, color: PAPER }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}