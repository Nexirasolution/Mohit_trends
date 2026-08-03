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

  const pageBtnBase =
    'h-9 min-w-9 px-3 flex items-center justify-center text-[12px] tracking-wide border transition-colors disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Page heading */}
      <div className="mb-10 text-center">
        <h1 className="font-serif text-2xl sm:text-3xl text-black">
          {category?.name || 'Products'}
        </h1>

        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="h-px w-8 bg-[#C6A15B]" />
          <span className="text-[#C6A15B] text-xs">✦</span>
          <span className="h-px w-8 bg-[#C6A15B]" />
        </div>

        {category?.description && (
          <p className="text-sm mt-3 text-black/45 font-light max-w-xl mx-auto">
            {category.description}
          </p>
        )}
      </div>

      {/* Filters */}
      <Filters sort={sort} onSortChange={setSort} />

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse bg-[#FAF9F6] border border-black/5"
            />
          ))}
        </div>

      /* Empty state */
      ) : products.length === 0 ? (
        <div className="text-center py-24 border-t border-black/10 mt-8">
          <p className="text-sm tracking-wide text-black/70">
            No products found in this category yet.
          </p>
          <p className="text-xs mt-2 text-black/35 font-light">
            Check back soon — new arrivals every week.
          </p>
        </div>

      /* Product grid */
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mt-8">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-14 mb-2 flex-wrap">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className={`${pageBtnBase} border-black/15 text-black/60 hover:border-black`}
              >
                Prev
              </button>

              {getPageNumbers()[0] > 1 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className={`${pageBtnBase} border-black/15 text-black/60 hover:border-black`}
                  >
                    1
                  </button>
                  <span className="text-black/30">…</span>
                </>
              )}

              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`${pageBtnBase} ${
                    p === page
                      ? 'bg-black text-white border-black'
                      : 'border-black/15 text-black/60 hover:border-black'
                  }`}
                >
                  {p}
                </button>
              ))}

              {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                <>
                  <span className="text-black/30">…</span>
                  <button
                    onClick={() => goToPage(totalPages)}
                    className={`${pageBtnBase} border-black/15 text-black/60 hover:border-black`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className={`${pageBtnBase} border-black/15 text-black/60 hover:border-black`}
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