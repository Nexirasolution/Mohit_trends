'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';

const PAGE_SIZE = 12;

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const catRes = await fetch(`/api/categories/${slug}`);
    const catData = await catRes.json();
    setCategory(catData.category);

    const params = new URLSearchParams({
      category: slug,
      sort,
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);

    // Handle common pagination response shapes
    const pages =
      data.pagination?.totalPages ??
      data.totalPages ??
      (data.total ? Math.ceil(data.total / PAGE_SIZE) : 1);
    setTotalPages(pages || 1);

    setLoading(false);
  }, [slug, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 whenever sort or category changes
  useEffect(() => {
    setPage(1);
  }, [slug, sort]);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Page heading */}
      <div className="mb-4">
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: '#8B0000', fontFamily: 'Georgia, serif', letterSpacing: '0.5px' }}
        >
          {category?.name || 'Products'}
        </h1>

        {/* Gold ornament divider */}
        <div className="flex items-center gap-2 mt-1.5 mb-1">
          <div style={{ height: '1px', width: '40px', background: '#C9A84C' }} />
          <span style={{ color: '#C9A84C', fontSize: '12px' }}>✦</span>
          <div style={{ height: '1px', width: '40px', background: '#C9A84C' }} />
        </div>

        {category?.description && (
          <p
            className="text-sm mt-1"
            style={{ color: '#a07070', fontFamily: 'sans-serif' }}
          >
            {category.description}
          </p>
        )}
      </div>

      {/* Filters */}
      <Filters sort={sort} onSortChange={setSort} />

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse"
              style={{
                borderRadius: '12px',
                background: '#f5e8e8',
                border: '1.5px solid #e8d5d5',
              }}
            />
          ))}
        </div>

      /* Empty state */
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span style={{ fontSize: '40px' }}>🛍️</span>
          <p
            className="mt-3 text-base font-medium"
            style={{ color: '#8B0000', fontFamily: 'Georgia, serif' }}
          >
            No products found in this category yet.
          </p>
          <p
            className="text-sm mt-1"
            style={{ color: '#a07070', fontFamily: 'sans-serif' }}
          >
            Check back soon — new arrivals every week!
          </p>
        </div>

      /* Product grid */
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 mb-2 flex-wrap">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="h-9 px-3 flex items-center justify-center text-[12px] font-semibold border-[1.5px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#fff', color: '#5a3a2a', borderColor: '#C9A84C', borderRadius: '4px' }}
              >
                Prev
              </button>

              {getPageNumbers()[0] > 1 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="w-9 h-9 flex items-center justify-center text-[12px] font-semibold border-[1.5px] transition-all"
                    style={{ background: '#fff', color: '#5a3a2a', borderColor: '#C9A84C', borderRadius: '4px' }}
                  >
                    1
                  </button>
                  <span style={{ color: '#a07070' }}>…</span>
                </>
              )}

              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className="w-9 h-9 flex items-center justify-center text-[12px] font-semibold border-[1.5px] transition-all"
                  style={{
                    background: p === page ? '#8B1A1A' : '#fff',
                    color: p === page ? '#fff' : '#5a3a2a',
                    borderColor: '#C9A84C',
                    borderRadius: '4px',
                  }}
                >
                  {p}
                </button>
              ))}

              {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                <>
                  <span style={{ color: '#a07070' }}>…</span>
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="w-9 h-9 flex items-center justify-center text-[12px] font-semibold border-[1.5px] transition-all"
                    style={{ background: '#fff', color: '#5a3a2a', borderColor: '#C9A84C', borderRadius: '4px' }}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="h-9 px-3 flex items-center justify-center text-[12px] font-semibold border-[1.5px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#fff', color: '#5a3a2a', borderColor: '#C9A84C', borderRadius: '4px' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}