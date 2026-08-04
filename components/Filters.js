'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function Filters({ sort, onSortChange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value) => {
    if (typeof onSortChange === 'function') {
      // CategoryPage: client-side state, no URL involved
      onSortChange(value);
    } else {
      // ProductsPage: server component, drive via URL params
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', value);
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <div
      className="flex items-center justify-end py-3 px-4"
      style={{ background: '#FAF7F2', borderBottom: '1.5px solid #EDE0C4' }}
    >
      {/* Sort */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-[11px] font-bold tracking-wide uppercase"
          style={{ color: '#9A7A5A' }}
        >
          Sort
        </span>
        <select
          value={sort}
          onChange={(e) => handleChange(e.target.value)}
          className="text-[11.5px] font-semibold rounded-full px-3 py-1 outline-none border-[1.5px] transition-colors"
          style={{
            background: '#fff',
            borderColor: '#DDD0B8',
            color: '#5a3a2a',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238B1A1A' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            paddingRight: '28px',
            appearance: 'none',
          }}
        >
          <option value="newest">Newest</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </div>
  );
}