import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import slugify from 'slugify';
import { requireAdmin } from '@/lib/apiAuth';
import { generateSku } from '@/lib/sku';

// POST /api/products/bulk
// body: {
//   category, titlePrefix, description, fabric,
//   price, compareAtPrice, sizes: [{ size, stock }],
//   images: [url, url, ...], tags
// }
// Creates ONE product per image. Title = PREFIX + zero-padded number
// (continuing from the highest existing number for that prefix in that
// category, so repeated bulk uploads don't collide). SKU is generated
// per-product via the existing generateSku(category) helper.
export const POST = requireAdmin(async (req) => {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      category,
      titlePrefix,
      description = '',
      fabric = '',
      price,
      compareAtPrice = 0,
      sizes = [],
      images = [],
      tags = [],
    } = body;

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (!titlePrefix?.trim()) {
      return NextResponse.json({ error: 'Title prefix is required' }, { status: 400 });
    }
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }
    if (!price || Number(price) <= 0) {
      return NextResponse.json({ error: 'Price is required' }, { status: 400 });
    }
    const sizeEntries = (sizes || [])
      .filter((s) => s.size)
      .map((s) => ({ size: s.size, stock: Number(s.stock) || 0 }));
    if (sizeEntries.length === 0) {
      return NextResponse.json({ error: 'At least one size with stock is required' }, { status: 400 });
    }

    const cat = await Category.findById(category);
    if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    // Sanitize prefix -> letters/numbers only, e.g. "Maroon Top" input isn't
    // expected here; the admin types a short code like "MT".
    const prefix = titlePrefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!prefix) {
      return NextResponse.json({ error: 'Title prefix must contain letters/numbers' }, { status: 400 });
    }

    // Continue numbering from the highest existing PREFIX### in this category
    const existing = await Product.find({
      category: cat._id,
      name: { $regex: `^${prefix}\\d+$`, $options: 'i' },
    }).select('name');

    let maxNum = 0;
    const numRe = new RegExp(`^${prefix}(\\d+)$`, 'i');
    for (const p of existing) {
      const match = p.name.match(numRe);
      if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
    }

    const created = [];
    const errors = [];

    for (let i = 0; i < images.length; i++) {
      const num = maxNum + i + 1;
      const name = `${prefix}${String(num).padStart(3, '0')}`; // e.g. MT001
      const slug = slugify(name, { lower: true });

      try {
        const slugTaken = await Product.findOne({ slug });
        if (slugTaken) {
          errors.push({ name, error: 'A product with this generated name/slug already exists — skipped' });
          continue;
        }

        const sku = await generateSku(cat._id);

        const variant = {
          color: '',
          colorHex: '#000000',
          images: [images[i]],
          price: Number(price),
          compareAtPrice: Number(compareAtPrice) || 0,
          sizes: sizeEntries.map((s) => ({ ...s })),
        };

        const product = await Product.create({
          name,
          slug,
          sku,
          description,
          category: cat._id,
          fabric,
          tags,
          variants: [variant],
          basePrice: Number(price),
        });

        created.push({ id: product._id, name: product.name, sku: product.sku });
      } catch (err) {
        errors.push({ name, error: err.message });
      }
    }

    return NextResponse.json(
      { createdCount: created.length, created, errors },
      { status: created.length ? 201 : 400 }
    );
  } catch (err) {
    console.error('POST /api/products/bulk error:', err);
    return NextResponse.json({ error: err.message || 'Bulk upload failed' }, { status: 500 });
  }
});