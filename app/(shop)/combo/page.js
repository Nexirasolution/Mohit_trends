export const dynamic = 'force-dynamic';
import { dbConnect } from '@/lib/mongodb';
import Combo from '@/models/Combo';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { Tag } from 'lucide-react';

async function getCombos() {
  await dbConnect();
  const combos = await Combo.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(combos));
}

export default async function CombosPage() {
  const combos = await getCombos();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-[60vh] bg-brand-cream">
      <div className="flex flex-col items-center text-center mb-9">
        <div className="arc-divider">
          <span className="eyebrow">Combo Offers</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-ink -mt-4">Buy together, save together</h1>
      </div>

      {combos.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-brand-ink/15">
          <Tag size={28} strokeWidth={1.25} className="mx-auto mb-2 text-brand-gold" />
          <p className="text-sm text-brand-ink/50">No combo offers available right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {combos.map((c) => {
            const savings = c.originalPrice > c.comboPrice ? c.originalPrice - c.comboPrice : 0;
            const pct = c.originalPrice > 0 ? Math.round((savings / c.originalPrice) * 100) : 0;

            return (
              <Link
                key={c._id}
                href={`/combo/${c.slug}`}
                className="card-soft group relative overflow-hidden"
              >
                <div className="relative w-full aspect-square overflow-hidden bg-brand-cream">
                  {c.image && (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-500"
                    />
                  )}
                  {pct > 0 && (
                    <div className="absolute top-2 left-2 bg-brand-ink text-brand-cream text-[10px] font-semibold tracking-widest uppercase px-2 py-1">
                      {pct}% off
                    </div>
                  )}
                </div>

                <div className="p-3.5">
                  <p className="text-sm font-semibold text-brand-ink line-clamp-1">{c.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-brand-magenta font-bold text-sm">{formatINR(c.comboPrice)}</span>
                    {savings > 0 && (
                      <span className="text-[11px] text-brand-ink/40 line-through">{formatINR(c.originalPrice)}</span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-[11px] text-brand-gold font-semibold mt-1 uppercase tracking-wide">Save {formatINR(savings)}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}