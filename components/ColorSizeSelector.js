'use client';

export default function ColorSizeSelector({ variants, activeVariant, onColorChange, activeSize, onSizeChange, categoryType }) {
  const isJewellery = categoryType === 'jewellery';
  const sizeStock = (size) => activeVariant?.sizes?.find((s) => s.size === size)?.stock ?? 0;

  // If every variant has a blank color, there's nothing meaningful to pick between —
  // skip the color swatches entirely (common for single-material jewellery listings).
  const hasColors = variants?.some((v) => v.color && v.color.trim());

  return (
    <div className="space-y-6">

      {/* Color selector */}
      {hasColors && (
        <>
          <div>
            <p className="text-[11px] tracking-[0.15em] uppercase text-black/40 mb-3">
              {isJewellery ? 'Material / Colour' : 'Color'}
              {activeVariant?.color && (
                <span className="text-black normal-case tracking-normal ml-1.5">— {activeVariant.color}</span>
              )}
            </p>

            <div className="flex gap-3 flex-wrap">
              {variants.map((v) => {
                const active = activeVariant?._id === v._id;
                return (
                  <button
                    key={v._id}
                    onClick={() => onColorChange(v)}
                    title={v.color}
                    className="relative w-8 h-8 rounded-full transition-transform"
                    style={{
                      backgroundColor: v.colorHex || '#ccc',
                      boxShadow: active
                        ? '0 0 0 1px #fff, 0 0 0 2px #0A0A0A'
                        : '0 0 0 1px rgba(0,0,0,0.12)',
                    }}
                  >
                    {active && (
                      <span
                        className="absolute inset-0 flex items-center justify-center text-[10px]"
                        style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-black/10" />
        </>
      )}

      {/* Jewellery attribute chips (material / purity / weight) — shown per active variant */}
      {isJewellery && (activeVariant?.material || activeVariant?.purity || activeVariant?.weight > 0) && (
        <>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/60 font-light">
            {activeVariant?.material && <span>{activeVariant.material}</span>}
            {activeVariant?.purity && <span>{activeVariant.purity}</span>}
            {activeVariant?.weight > 0 && <span>{activeVariant.weight}g</span>}
          </div>
          <div className="h-px bg-black/10" />
        </>
      )}

      {/* Size selector */}
      <div>
        <p className="text-[11px] tracking-[0.15em] uppercase text-black/40 mb-3">
          {isJewellery ? 'Ring / Bangle Size' : 'Size'}
        </p>

        <div className="flex gap-2 flex-wrap">
          {activeVariant?.sizes?.map((s) => {
            const outOfStock = s.stock <= 0;
            const active = activeSize === s.size;
            return (
              <button
                key={s.size}
                disabled={outOfStock}
                onClick={() => onSizeChange(s.size)}
                className="min-w-[42px] h-[38px] px-2.5 text-sm border transition-colors"
                style={{
                  borderColor: active ? '#0A0A0A' : outOfStock ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.18)',
                  background: active ? '#0A0A0A' : 'transparent',
                  color: active ? '#fff' : outOfStock ? 'rgba(0,0,0,0.25)' : '#0A0A0A',
                  textDecoration: outOfStock ? 'line-through' : 'none',
                  cursor: outOfStock ? 'not-allowed' : 'pointer',
                }}
              >
                {s.size}
              </button>
            );
          })}
        </div>

        {activeSize && sizeStock(activeSize) <= 5 && sizeStock(activeSize) > 0 && (
          <p className="mt-3 flex items-center gap-2 text-xs text-black/50 font-light">
            <span className="w-1 h-1 rounded-full bg-[#C6A15B]" />
            Only {sizeStock(activeSize)} left in stock
          </p>
        )}
      </div>
    </div>
  );
}