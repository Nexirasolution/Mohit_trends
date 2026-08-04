'use client';

export default function PrintButton({ label = 'Print / Save as PDF' }) {
  return (
    <div className="text-center mt-6 print:hidden">
      <button
        onClick={() => window.print()}
        style={{
          background: '#8B0000',
          color: '#fff',
          border: '2px solid #C9A84C',
          borderRadius: '6px',
          padding: '10px 28px',
          fontSize: '14px',
          fontFamily: 'Georgia, serif',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s',
          boxShadow: '0 2px 6px rgba(139,0,0,0.15)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#C9A84C';
          e.currentTarget.style.color = '#8B0000';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#8B0000';
          e.currentTarget.style.color = '#fff';
        }}
      >
        🖨️ {label}
      </button>
    </div>
  );
}