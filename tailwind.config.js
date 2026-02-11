/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#050608',
          secondary: '#0C1014',
          tertiary: '#F5F5F7',
        },
        surface: {
          dark: '#10141A',
          accent: '#181D24',
          light: '#FFFFFF',
        },
        brand: {
          DEFAULT: '#F5B664',
          soft: 'rgba(245,182,100,0.15)',
          highlight: '#FFDDAB',
          outline: 'rgba(245,182,100,0.45)',
          muted: '#E9A84B',
        },
        ink: {
          high: '#FFFFFF',
          med: '#C4CBD4',
          low: '#8A94A3',
          dark: '#14161A',
          darkmed: '#464C59',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          med: 'rgba(255,255,255,0.12)',
          strong: 'rgba(255,255,255,0.22)',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '16px',
        lg: '24px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 18px 50px rgba(0,0,0,0.85)',
        'card-hover': '0 22px 60px rgba(0,0,0,0.9)',
        brand: '0 12px 30px rgba(245,182,100,0.35)',
        'brand-hover': '0 18px 40px rgba(245,182,100,0.5)',
        glass: '0 8px 32px rgba(0,0,0,0.45)',
      },
      backdropBlur: {
        soft: '14px',
        strong: '30px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.16,1,0.3,1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseSoft: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.02)' } },
      },
    },
  },
  plugins: [],
}
