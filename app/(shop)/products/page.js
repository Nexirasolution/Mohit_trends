import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import Filters from '@/components/Filters';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import '@/models/Category'; // registers the Category schema — required for .populate('category')

export const dynamic = 'force-dynamic'; // never cache/statically render this page

const LIMIT = 24;

const SORT_MAP = {
  newest: { createdAt: -1 },
  priceLow: { basePrice: 1 },
  priceHigh: { basePrice: -1 },
  popular: { soldCount: -1 },
  rating: { rating: -1 },
};

async function getAllProducts(page, sort) {
  await dbConnect();

  const query = { isActive: true };
  const sortStage = SORT_MAP[sort] || SORT_MAP.newest;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug type')
      .sort(sortStage)
      .skip((page - 1) * LIMIT)
      .limit(LIMIT)
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)), // strip Mongoose/ObjectId wrappers for the client
    total,
    pages: Math.ceil(total / LIMIT),
  };
}

export const metadata = {
  title: 'All Products | Mohith Trends',
};

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams; // Next.js 15: searchParams is a Promise

  const page = Math.max(1, Number(resolvedSearchParams?.page || 1));
  const sort = resolvedSearchParams?.sort || 'newest';

  const { products, total, pages } = await getAllProducts(page, sort);

  return (
    <section className="max-w-6xl mx-auto px-5 py-16 bg-brand-cream">
      {/* Header — eyebrow + serif title on the left, quiet count on the right, hairline rule beneath */}
      <div className="mb-10 pb-6 border-b border-brand-ink/10">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <span className="eyebrow">Full Collection</span>
            <h1 className="font-display text-brand-ink text-[clamp(28px,4vw,40px)] tracking-tight mt-1.5">
              All Products
            </h1>
          </div>
          <span className="text-[11px] tracking-[0.15em] uppercase text-brand-ink/40">
            {total} {total === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      <Filters sort={sort} />

      {products.length === 0 ? (
        <div className="text-center py-20 mt-6 border border-dashed border-brand-ink/15">
          <p className="text-brand-ink/50 text-sm tracking-wide">Nothing here yet — check back soon.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10 mt-8">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={pages} basePath="/products" />
        </>
      )}
    </section>
  );
}