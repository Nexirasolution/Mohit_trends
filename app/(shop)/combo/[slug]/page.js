export const dynamic = 'force-dynamic';
import { dbConnect } from '@/lib/mongodb';
import Combo from '@/models/Combo';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import AddComboButton from '@/components/AddComboButton';
import { Package, Tag, CheckCircle2, Zap, RotateCcw, Shield, Truck } from 'lucide-react';

export default async function ComboPage({ params }) {
  await dbConnect();
  const combo = await Combo.findOne({ slug: params.slug, isActive: true })
    .populate('products.product', 'name slug variants')
    .lean();

  if (!combo) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-[#3A2A1A]/50">Combo not found.</div>;
  }

  const plain = JSON.parse(JSON.stringify(combo));
  const savings = plain.originalPrice - plain.comboPrice;
  const savingsPct = plain.originalPrice > 0 ? Math.round((savings / plain.originalPrice) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Urgency banner — bright red, matches the card's accent shapes */}
      <div className="bg-[#E0162F] text-white text-center text-xs font-semibold py-2 rounded-xl mb-6 flex items-center justify-center gap-2">
        <Zap size={13} fill="white" />
        LIMITED COMBO OFFER — Save {savingsPct}% when you bundle
        <Zap size={13} fill="white" />
      </div>

      <div className="grid sm:grid-cols-2 gap-8">

        {/* Image — fully covered, gold corner badge */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md border border-[#D4AF37]/30">
          {plain.image
            ? <Image src={plain.image} alt={plain.name} fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover" />
            : <div className="w-full h-full bg-[#FBF6EC]" />
          }
          {savingsPct > 0 && (
            <div className="absolute top-3 left-3 bg-[#8B1A3D] text-white text-xs font-bold px-3 py-1 rounded-full shadow border border-[#D4AF37]">
              {savingsPct}% OFF
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-[#8B1A3D] uppercase tracking-widest mb-1">Exclusive Bundle</p>
          <h1 className="font-display text-3xl font-bold text-[#2B1B14] leading-tight">{plain.name}</h1>
          <p className="text-[#2B1B14]/60 text-sm mt-2 leading-relaxed">{plain.description}</p>

          {/* Pricing */}
          <div className="mt-5 bg-[#FBF6EC] rounded-xl p-4 border border-[#D4AF37]/30">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-[#8B1A3D]">{formatINR(plain.comboPrice)}</span>
              {plain.originalPrice > plain.comboPrice && (
                <span className="text-[#2B1B14]/40 line-through text-lg mb-0.5">{formatINR(plain.originalPrice)}</span>
              )}
            </div>
            {savings > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Tag size={13} className="text-[#1F6B3B]" />
                <p className="text-[#1F6B3B] text-sm font-semibold">You save {formatINR(savings)} with this combo!</p>
              </div>
            )}
          </div>

          {/* Gold divider, echoes the logo's scroll motif */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-4" />

          {/* What's included */}
          <div className="mt-1">
            <div className="flex items-center gap-2 mb-3">
              <Package size={15} className="text-[#8B1A3D]" />
              <h3 className="font-semibold text-sm text-[#2B1B14]">What's included ({plain.products?.length} items)</h3>
            </div>
            <div className="space-y-2">
              {plain.products?.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#FBF6EC] rounded-lg px-3 py-2 border border-[#D4AF37]/20">
                  <CheckCircle2 size={15} className="text-[#1F6B3B] shrink-0" />
                  <span className="text-sm text-[#2B1B14]/80 font-medium">{p.product?.name}</span>
                  {p.size && <span className="ml-auto text-xs bg-white border border-[#D4AF37]/40 rounded-full px-2 py-0.5 text-[#2B1B14]/50">Size {p.size}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-5">
            <AddComboButton combo={plain} />
          </div>
          <p className="text-xs text-center text-[#2B1B14]/40 mt-2">
            Combo price applies automatically at checkout
          </p>
        </div>
      </div>

      {/* Trust + Policy section — re-enabled, in brand colors */}
      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        <div className="border border-[#D4AF37]/30 rounded-xl p-4 flex gap-3 items-start">
          <Truck size={20} className="text-[#1F6B3B] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-[#2B1B14]">Free Delivery</p>
            <p className="text-xs text-[#2B1B14]/50 mt-0.5">Free shipping on all combo orders across India.</p>
          </div>
        </div>
        <div className="border border-[#D4AF37]/30 rounded-xl p-4 flex gap-3 items-start">
          <RotateCcw size={20} className="text-[#8B1A3D] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-[#2B1B14]">7-Day Returns</p>
            <p className="text-xs text-[#2B1B14]/50 mt-0.5">Not satisfied? Return within 7 days for a full refund — no questions asked.</p>
          </div>
        </div>
        <div className="border border-[#D4AF37]/30 rounded-xl p-4 flex gap-3 items-start">
          <Shield size={20} className="text-[#1F6B3B] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-[#2B1B14]">100% Genuine</p>
            <p className="text-xs text-[#2B1B14]/50 mt-0.5">Every piece is quality-checked before dispatch. What you see is what you get.</p>
          </div>
        </div>
      </div>

      {/* Bottom reassurance */}
      <div className="mt-6 border-t border-[#D4AF37]/30 pt-6 text-center">
        <p className="text-sm text-[#2B1B14]/50">
          💡 Buying individually would cost{' '}
          <span className="line-through">{formatINR(plain.originalPrice)}</span> — get this combo for just{' '}
          <span className="text-[#8B1A3D] font-semibold">{formatINR(plain.comboPrice)}</span>
        </p>
      </div>

    </div>
  );
}