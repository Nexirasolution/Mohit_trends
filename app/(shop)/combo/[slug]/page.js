export const dynamic = 'force-dynamic';
import { dbConnect } from '@/lib/mongodb';
import Combo from '@/models/Combo';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import AddComboButton from '@/components/AddComboButton';
import { Check, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

export default async function ComboPage({ params }) {
  await dbConnect();
  const combo = await Combo.findOne({ slug: params.slug, isActive: true })
    .populate('products.product', 'name slug variants')
    .lean();

  if (!combo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-black/40 font-light tracking-wide">
        Combo not found.
      </div>
    );
  }

  const plain = JSON.parse(JSON.stringify(combo));
  const savings = plain.originalPrice - plain.comboPrice;
  const savingsPct = plain.originalPrice > 0 ? Math.round((savings / plain.originalPrice) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">

      {/* Eyebrow */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className="h-px w-8 bg-[#C6A15B]" />
        <p className="text-[11px] tracking-[0.25em] uppercase text-[#C6A15B] font-medium">
          Exclusive Bundle{savingsPct > 0 ? ` — Save ${savingsPct}%` : ''}
        </p>
        <span className="h-px w-8 bg-[#C6A15B]" />
      </div>

      <div className="grid sm:grid-cols-2 gap-14">

        {/* Image */}
        <div className="relative w-full aspect-square bg-[#FAF9F6]">
          {plain.image
            ? <Image src={plain.image} alt={plain.name} fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover" />
            : <div className="w-full h-full bg-[#FAF9F6]" />
          }
          {savingsPct > 0 && (
            <div className="absolute top-0 left-0 bg-black text-[#C6A15B] text-[11px] tracking-widest uppercase font-medium px-3 py-2">
              {savingsPct}% off
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <h1 className="font-serif text-[2rem] leading-tight text-black">{plain.name}</h1>
          {plain.description && (
            <p className="text-black/50 text-sm mt-3 leading-relaxed font-light">{plain.description}</p>
          )}

          {/* Price */}
          <div className="mt-8 flex items-baseline gap-3">
            <span className="text-2xl text-black tracking-tight">{formatINR(plain.comboPrice)}</span>
            {plain.originalPrice > plain.comboPrice && (
              <span className="text-black/30 line-through text-sm">{formatINR(plain.originalPrice)}</span>
            )}
          </div>
          {savings > 0 && (
            <p className="text-[#C6A15B] text-xs mt-1 tracking-wide">You save {formatINR(savings)}</p>
          )}

          <span className="h-px w-full bg-black/10 my-7" />

          {/* What's included */}
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-4">
              What's included — {plain.products?.length} items
            </p>
            <div className="space-y-3">
              {plain.products?.map((p, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Check size={14} className="text-[#C6A15B] shrink-0" strokeWidth={2.5} />
                  <span className="text-black/80 font-light">{p.product?.name}</span>
                  {p.size && <span className="ml-auto text-xs text-black/35">Size {p.size}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-9">
            <AddComboButton combo={plain} />
          </div>
          <p className="text-[11px] text-center text-black/35 mt-3 tracking-wide">
            Combo price applies automatically at checkout
          </p>
        </div>
      </div>

      {/* Trust strip — minimal, no cards */}
      <div className="mt-20 pt-8 border-t border-black/10 grid sm:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <Truck size={18} className="text-black/70" strokeWidth={1.5} />
          <p className="text-xs tracking-wide text-black/60 font-light">Free delivery across India</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <RotateCcw size={18} className="text-black/70" strokeWidth={1.5} />
          <p className="text-xs tracking-wide text-black/60 font-light">7-day easy returns</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ShieldCheck size={18} className="text-black/70" strokeWidth={1.5} />
          <p className="text-xs tracking-wide text-black/60 font-light">100% genuine, quality-checked</p>
        </div>
      </div>

      {/* Reassurance line */}
      <div className="mt-8 text-center">
        <p className="text-xs text-black/40 font-light tracking-wide">
          Individually, this would cost{' '}
          <span className="line-through">{formatINR(plain.originalPrice)}</span>
          {' '}— bundled for{' '}
          <span className="text-[#C6A15B] font-medium">{formatINR(plain.comboPrice)}</span>
        </p>
      </div>

    </div>
  );
}