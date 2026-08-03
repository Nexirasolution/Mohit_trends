import Link from 'next/link';

// Builds the page list with ellipses, e.g. [1, '...', 4, 5, 6, '...', 12]
function getPageNumbers(current, total) {
  const delta = 1; // how many pages to show around the current page
  const range = [];
  const pages = [];

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  let prev;
  for (const i of range) {
    if (prev !== undefined && i - prev > 1) pages.push('...');
    pages.push(i);
    prev = i;
  }
  return pages;
}

export default function Pagination({ currentPage, totalPages, basePath }) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const base =
    'inline-flex items-center justify-center min-w-9 h-9 text-xs tracking-wide border transition-colors';

  const linkClass = (isActive) =>
    isActive
      ? `${base} bg-black text-white border-black`
      : `${base} text-black/60 border-black/15 hover:border-black hover:text-black`;

  return (
    <nav
      aria-label="Product pagination"
      className="mt-16 flex items-center justify-center gap-2 flex-wrap"
    >
      {/* Prev */}
      {currentPage > 1 ? (
        <Link href={`${basePath}?page=${currentPage - 1}`} className={linkClass(false)} aria-label="Previous page">
          ‹
        </Link>
      ) : (
        <span className={`${base} text-black/25 border-black/10 cursor-not-allowed`} aria-hidden="true">
          ‹
        </span>
      )}

      {/* Page numbers */}
      {pageNumbers.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="text-xs text-black/30 px-1">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={`${basePath}?page=${p}`}
            className={linkClass(p === currentPage)}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link href={`${basePath}?page=${currentPage + 1}`} className={linkClass(false)} aria-label="Next page">
          ›
        </Link>
      ) : (
        <span className={`${base} text-black/25 border-black/10 cursor-not-allowed`} aria-hidden="true">
          ›
        </span>
      )}
    </nav>
  );
}