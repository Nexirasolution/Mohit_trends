'use client';

export default function ColorSizeSelector({ variants, activeVariant, onColorChange, activeSize, onSizeChange, categoryType }) {
  const isJewellery = categoryType === 'jewellery';
  const sizeStock = (size) => activeVariant?.sizes?.find((s) => s.size === size)?.stock ?? 0;

  // If every variant has a blank color, there's nothing meaningful to pick between —
  // skip the color swatches entirely (common for single-material jewellery listings).
  const hasColors = variants?.some((v) => v.color && v.color.trim());

  return (
    <div className="space-y-5 p-4 rounded-xl" style={{ background: '#FAF7F2', border: '1px solid #EDE0C4' }}>

      {/* Color selector */}
      {hasColors && (
        <>
          <div>
            <p className="text-sm font-bold mb-2.5 flex items-center gap-1.5" style={{ color: '#3a1a1a' }}>
              <span className="inline-block w-0.5 h-3.5 rounded-sm" style={{ background: '#C9A84C' }} />
              {isJewellery ? 'Material/Colour:' : 'Color:'}{' '}
              <span style={{ color: '#8B1A1A' }}>{activeVariant?.color}</span>
            </p>

            <div className="flex gap-2 flex-wrap">
              {variants.map((v) => (
                <button
                  key={v._id}
                  onClick={() => onColorChange(v)}
                  title={v.color}
                  className="relative w-9 h-9 rounded-full transition-transform"
                  style={{
                    backgroundColor: v.colorHex || '#ccc',
                    border: activeVariant?._id === v._id
                      ? '2px solid #C9A84C'
                      : '2px solid transparent',
                    boxShadow: activeVariant?._id === v._id
                      ? '0 0 0 2px #8B1A1A'
                      : 'none',
                    transform: activeVariant?._id === v._id ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {activeVariant?._id === v._id && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '0.5px', background: '#EDE0C4' }} />
        </>
      )}

      {/* Jewellery attribute chips (material / purity / weight) — shown per active variant */}
      {isJewellery && (activeVariant?.material || activeVariant?.purity || activeVariant?.weight > 0) && (
        <>
          <div className="flex flex-wrap gap-2">
            {activeVariant?.material && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#fff', border: '1.5px solid #C9A84C', color: '#8B1A1A' }}>
                {activeVariant.material}
              </span>
            )}
            {activeVariant?.purity && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#fff', border: '1.5px solid #C9A84C', color: '#8B1A1A' }}>
                {activeVariant.purity}
              </span>
            )}
            {activeVariant?.weight > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#fff', border: '1.5px solid #C9A84C', color: '#8B1A1A' }}>
                {activeVariant.weight}g
              </span>
            )}
          </div>
          <div style={{ height: '0.5px', background: '#EDE0C4' }} />
        </>
      )}

      {/* Size selector */}
      <div>
        <p className="text-sm font-bold mb-2.5 flex items-center gap-1.5" style={{ color: '#3a1a1a' }}>
          <span className="inline-block w-0.5 h-3.5 rounded-sm" style={{ background: '#C9A84C' }} />
          {isJewellery ? 'Ring/Bangle Size:' : 'Size:'}
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
                className="min-w-[42px] h-[38px] px-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  border: outOfStock
                    ? '1.5px solid #EEE'
                    : active
                    ? '1.5px solid #8B1A1A'
                    : '1.5px solid #DDD0B8',
                  background: active ? '#8B1A1A' : outOfStock ? '#FAFAFA' : '#fff',
                  color: active ? '#fff' : outOfStock ? '#CCC' : '#5a3a2a',
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
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold rounded-r-md py-1.5 px-2.5"
            style={{
              color: '#8B1A1A',
              background: '#FDF0F0',
              borderLeft: '3px solid #8B1A1A',
            }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Only {sizeStock(activeSize)} left in stock!
          </div>
        )}
      </div>
    </div>
  );
}