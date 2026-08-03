'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatINR } from '@/lib/utils';
import { IndianRupee, ShoppingCart, Package, AlertTriangle } from 'lucide-react';

// Mohith Trends theme tokens — keep in sync with other admin pages until centralized in tailwind.config.js
const GOLD = '#B08D3F';
const INK = '#1A1A1A';
const INK_MUTED = '#6B6B66';
const HAIRLINE = '#E8E4DA';
const PAPER = '#FDFCFA';

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="p-4" style={{ borderLeft: `2px solid ${GOLD}` }}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={15} style={{ color: GOLD }} />
        <p className="text-xs" style={{ color: INK_MUTED }}>{label}</p>
      </div>
      <p className="font-semibold text-xl" style={{ color: INK }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: INK_MUTED }}>{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/dashboard').then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <p style={{ color: INK_MUTED }}>Loading dashboard...</p>;

  return (
    <div style={{ background: PAPER }}>
      <h1
        className="text-2xl mb-6 tracking-tight"
        style={{ color: INK, fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Dashboard
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 pb-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <StatCard icon={IndianRupee} label="Today's Sales" value={formatINR(data.today.sales)} sub={`${data.today.orders} orders`} />
        <StatCard icon={IndianRupee} label="Weekly Sales" value={formatINR(data.week.sales)} sub={`${data.week.orders} orders`} />
        <StatCard icon={IndianRupee} label="Monthly Sales" value={formatINR(data.month.sales)} sub={`${data.month.orders} orders`} />
        <StatCard icon={ShoppingCart} label="Pending Orders" value={data.pendingOrders} sub="Need action" />
      </div>

      <div className="mb-8 pb-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <h2 className="text-[11px] uppercase tracking-wide mb-4" style={{ color: INK_MUTED }}>
          Sales Trend (Last 14 Days)
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke={HAIRLINE} />
            <XAxis dataKey="date" fontSize={12} stroke={INK_MUTED} />
            <YAxis fontSize={12} stroke={INK_MUTED} />
            <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ border: `1px solid ${HAIRLINE}`, borderRadius: 0 }} />
            <Line type="monotone" dataKey="sales" stroke={GOLD} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <h2 className="text-[11px] uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: INK_MUTED }}>
            <Package size={14} style={{ color: GOLD }} /> Top Selling Products
          </h2>
          <ul className="space-y-2">
            {data.topProducts.map((p) => (
              <li key={p._id} className="flex justify-between text-sm py-1.5" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                <span style={{ color: INK }}>{p.name}</span>
                <span className="font-medium" style={{ color: GOLD }}>{p.soldCount} sold</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-[11px] uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: INK_MUTED }}>
            <AlertTriangle size={14} style={{ color: GOLD }} /> Low Stock Alert
          </h2>
          {data.lowStock.length === 0 ? (
            <p className="text-sm" style={{ color: INK_MUTED }}>All good — no low stock items.</p>
          ) : (
            <ul className="space-y-2">
              {data.lowStock.map((p) => (
                <li key={p._id} className="text-sm py-1.5" style={{ color: INK, borderBottom: `1px solid ${HAIRLINE}` }}>
                  {p.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}