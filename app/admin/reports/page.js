'use client';

import { useState } from 'react';
import { daysAgo } from '@/lib/utils';

// Mohith Trends theme tokens — keep in sync with other admin pages until centralized in tailwind.config.js
const GOLD = '#B08D3F';
const INK = '#1A1A1A';
const INK_MUTED = '#6B6B66';
const HAIRLINE = '#E8E4DA';
const PAPER = '#FDFCFA';

function toDateInput(d) {
  return d.toISOString().slice(0, 10);
}

export default function AdminReportsPage() {
  const [from, setFrom] = useState(toDateInput(daysAgo(30)));
  const [to, setTo] = useState(toDateInput(new Date()));

  function exportCsv(rangeFrom, rangeTo) {
    const params = new URLSearchParams({ from: rangeFrom, to: rangeTo });
    window.open(`/api/admin/reports/export?${params.toString()}`, '_blank');
  }

  const reportCardStyle = {
    border: `1px solid ${HAIRLINE}`,
  };

  return (
    <div style={{ background: PAPER }}>
      <h1
        className="text-2xl mb-6 tracking-tight"
        style={{ color: INK, fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Sales Reports
      </h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => exportCsv(toDateInput(daysAgo(0)), toDateInput(new Date()))}
          className="p-5 text-left transition-colors"
          style={reportCardStyle}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
        >
          <p className="font-semibold" style={{ color: INK }}>Daily Report</p>
          <p className="text-xs mt-1" style={{ color: INK_MUTED }}>Today's sales as CSV</p>
        </button>
        <button
          onClick={() => exportCsv(toDateInput(daysAgo(7)), toDateInput(new Date()))}
          className="p-5 text-left transition-colors"
          style={reportCardStyle}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
        >
          <p className="font-semibold" style={{ color: INK }}>Weekly Report</p>
          <p className="text-xs mt-1" style={{ color: INK_MUTED }}>Last 7 days as CSV</p>
        </button>
        <button
          onClick={() => exportCsv(toDateInput(daysAgo(30)), toDateInput(new Date()))}
          className="p-5 text-left transition-colors"
          style={reportCardStyle}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
        >
          <p className="font-semibold" style={{ color: INK }}>Monthly Report</p>
          <p className="text-xs mt-1" style={{ color: INK_MUTED }}>Last 30 days as CSV</p>
        </button>
      </div>

      <div className="pt-6" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <h2 className="text-[11px] uppercase tracking-wide mb-4" style={{ color: INK_MUTED }}>
          Custom Date Range Export
        </h2>
        <div className="flex flex-wrap items-end gap-5">
          <div>
            <label className="text-xs block mb-1" style={{ color: INK_MUTED }}>From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-1 py-2 text-sm outline-none bg-transparent block"
              style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK }}
            />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: INK_MUTED }}>To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-1 py-2 text-sm outline-none bg-transparent block"
              style={{ borderBottom: `1px solid ${HAIRLINE}`, color: INK }}
            />
          </div>
          <button
            onClick={() => exportCsv(from, to)}
            className="text-sm font-medium px-4 py-2 transition-colors"
            style={{ background: INK, color: PAPER }}
          >
            Export All Orders (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}