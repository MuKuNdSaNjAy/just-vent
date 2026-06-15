/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        pitch: {
          950: '#090608',
          900: '#0E0A0B',
          800: '#140D0B',
          700: '#1C1210',
          600: '#251816',
          500: '#2E1F1C',
        },
        ember: {
          50:  '#fff3ee',
          100: '#ffe4d4',
          200: '#ffc6a0',
          300: '#F0A855',
          400: '#E8943A',
          500: '#D4622A',
          600: '#B5521F',
          700: '#8A3A14',
          800: '#61260C',
          900: '#3A1506',
        },
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 98, 42, 0)' },
          '50%':       { boxShadow: '0 0 18px 4px rgba(212, 98, 42, 0.35)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'mic-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 98, 42, 0.5)' },
          '50%':       { boxShadow: '0 0 0 10px rgba(212, 98, 42, 0)' },
        },
        'spin-gold': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.45s ease-out both',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        shimmer:      'shimmer 3s linear infinite',
        'mic-pulse':  'mic-pulse 1.4s ease-in-out infinite',
        'spin-gold':  'spin-gold 0.9s linear infinite',
      },
    },
  },
  plugins: [],
}
