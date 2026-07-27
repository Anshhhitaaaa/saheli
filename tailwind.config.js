/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm neutral base
        sand: {
          50: '#FBF8F4',
          100: '#F5EFE7',
          200: '#EADFCF',
          300: '#DCCBB2',
          400: '#C7AE89',
          500: '#B0905F',
          600: '#4E453E',
          700: '#38322E',
          800: '#252120',
          900: '#1A1715',
        },
        // Primary accent — terracotta / deep rose
        clay: {
          50: '#FBEEEA',
          100: '#F6D9D0',
          200: '#EBB4A5',
          300: '#DE8B73',
          400: '#CE674E',
          500: '#B84A34',
          600: '#973A28',
          700: '#742E20',
          800: '#4A1C13',
          900: '#2E110B',
        },
        // Secondary accent — sage / soft teal
        sage: {
          50: '#EEF4F0',
          100: '#D8E6DC',
          200: '#B4CCBC',
          300: '#8BAE97',
          400: '#649175',
          500: '#477459',
          600: '#385C46',
          700: '#2C4737',
          800: '#1A2B22',
          900: '#101B14',
        },
        // Functional
        success: '#4F7A4A',
        warning: '#B8843A',
        danger: '#A8443A',
        info: '#3E6B82',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(84, 68, 50, 0.18)',
        card: '0 2px 12px -4px rgba(84, 68, 50, 0.12)',
        lift: '0 12px 40px -12px rgba(84, 68, 50, 0.28)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'drift-slow': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(2%, -3%, 0) scale(1.05)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'drift-slow': 'drift-slow 18s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
