/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      animation: {
        marquee: 'marquee 22s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      colors: {
        brand: {
          pink: '#D9C48F',       // light gold — was bright red, now the light-gold fill/accent
          magenta: '#A8842E',    // primary accent — was deep maroon, now the primary gold (wordmark, CTAs, prices)
          rose: '#8C6D2F',       // secondary gold tint — for hovers/secondary accents
          green: '#6B5B2C',      // folded into deep gold — no green in the new palette
          deepgreen: '#6B5B2C',  // "savings" text — same deep gold, keeps one accent family
          gold: '#6B5B2C',       // ring/scroll detailing — deep antique gold
          cream: '#F6F1E7',      // warm champagne background
          ink: '#14110D'         // near-black text, matches the logo's black M
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)']
      },
      boxShadow: {
        soft: '0 8px 30px -8px rgba(20,17,13,0.18)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
};