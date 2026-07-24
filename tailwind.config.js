/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B2422',
        paper: '#F6F4EE',
        panel: '#FFFFFF',
        primary: {
          50: '#EBF3F1',
          100: '#D2E4DF',
          200: '#A6C9C0',
          300: '#79AD9F',
          400: '#4C9180',
          500: '#256B5B',
          600: '#1F4B43',
          700: '#173832',
          800: '#102723',
          900: '#0A1917',
        },
        brass: {
          50: '#FBF6E9',
          100: '#F3E6BE',
          200: '#E6CE85',
          300: '#D6B355',
          400: '#C29B3E',
          500: '#B08D3E',
          600: '#8E6F2F',
          700: '#6C5424',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(23, 56, 50, 0.06), 0 8px 24px rgba(23, 56, 50, 0.06)',
        card: '0 1px 2px rgba(23,56,50,0.04), 0 12px 32px -12px rgba(23,56,50,0.18)',
        glow: '0 0 0 1px rgba(176,141,62,0.25), 0 8px 30px -8px rgba(176,141,62,0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
