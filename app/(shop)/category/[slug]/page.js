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
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
          {category?.name || 'Products'}
        </h1>

        {category?.description && (
          <p className="text-sm mt-1.5 text-neutral-500">{category.description}</p>
        )}
      </div>

      {/* Filters */}
      <Filters sort={sort} onSortChange={setSort} />

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-pink-50 border border-neutral-100 animate-pulse" />
          ))}
        </div>

      /* Empty state */
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-4xl">🛍️</span>
          <p className="mt-3 text-base font-medium text-neutral-900">No products found in this category yet.</p>
          <p className="text-sm mt-1 text-neutral-400">Check back soon — new arrivals every week!</p>
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
                className="h-9 px-3 flex items-center justify-center text-[12px] font-medium border border-neutral-200 rounded-md text-neutral-600 bg-white hover:border-pink-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              {getPageNumbers()[0] > 1 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="w-9 h-9 flex items-center justify-center text-[12px] font-medium border border-neutral-200 rounded-md text-neutral-600 bg-white hover:border-pink-300 transition-colors"
                  >
                    1
                  </button>
                  <span className="text-neutral-300">…</span>
                </>
              )}

              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 flex items-center justify-center text-[12px] font-medium rounded-md border transition-colors ${
                    p === page
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-pink-300'
                  }`}
                >
                  {p}
                </button>
              ))}

              {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                <>
                  <span className="text-neutral-300">…</span>
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="w-9 h-9 flex items-center justify-center text-[12px] font-medium border border-neutral-200 rounded-md text-neutral-600 bg-white hover:border-pink-300 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="h-9 px-3 flex items-center justify-center text-[12px] font-medium border border-neutral-200 rounded-md text-neutral-600 bg-white hover:border-pink-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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