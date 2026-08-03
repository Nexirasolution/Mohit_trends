'use client';

export default function PrintButton({ label = 'Print / Save as PDF' }) {
  return (
    <div className="text-center mt-8 print:hidden">
      <button
        onClick={() => window.print()}
        className="text-xs tracking-[0.2em] uppercase px-8 py-3.5 border border-black/70 text-black bg-transparent transition-colors"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#0A0A0A';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#0A0A0A';
        }}
      >
        {label}
      </button>
    </div>
  );
}