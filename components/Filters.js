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
    <div className="flex items-center justify-end py-4 border-b border-black/10">
      {/* Sort */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[11px] tracking-[0.15em] uppercase text-black/40">
          Sort by
        </span>
        <select
          value={sort}
          onChange={(e) => handleChange(e.target.value)}
          className="text-xs text-black outline-none border-none bg-transparent transition-colors cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%230A0A0A' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right center',
            paddingRight: '18px',
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