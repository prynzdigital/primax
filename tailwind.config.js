/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', '"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50: '#eef9fb',
          100: '#d6f1f6',
          200: '#aee2ed',
          300: '#7cd0e1',
          400: '#46b5cb',
          500: '#2599b3',
          600: '#1a7c95',
          700: '#176379',
          800: '#155264',
          900: '#114455',
          950: '#0a2c39',
        },
        mint: {
          50: '#f0fbf6',
          100: '#daf4e6',
          200: '#b6e8ce',
          300: '#85d5ae',
          400: '#52bb8a',
          500: '#2fa06f',
          600: '#208158',
          700: '#1c6647',
          800: '#19513b',
          900: '#164332',
        },
        sand: {
          50: '#fafaf7',
          100: '#f3f3ec',
          200: '#e6e6d8',
          300: '#d2d2bb',
          400: '#b6b69a',
          500: '#9c9c7e',
          600: '#7e7e63',
          700: '#5f5f4b',
          800: '#454537',
          900: '#2c2c23',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceff3',
          200: '#d6dbe2',
          300: '#b3bbc7',
          400: '#8c95a4',
          500: '#6c7585',
          600: '#535b6a',
          700: '#414855',
          800: '#2b313a',
          900: '#171b22',
        },
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(20,40,55,0.04), 0 8px 24px -8px rgba(20,40,55,0.10)',
        'lift': '0 2px 4px rgba(20,40,55,0.04), 0 18px 40px -18px rgba(20,40,55,0.18)',
        'glow': '0 0 0 1px rgba(37,153,179,0.20), 0 18px 48px -18px rgba(37,153,179,0.40)',
        'card': '0 1px 0 rgba(255,255,255,0.7) inset, 0 1px 2px rgba(17, 68, 85, 0.04), 0 20px 50px -28px rgba(17, 68, 85, 0.18)',
      },
      backgroundImage: {
        'hero-grid': "radial-gradient(circle at 1px 1px, rgba(17,68,85,0.06) 1px, transparent 0)",
        'gradient-fade': "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 70%, rgba(255,255,255,1) 100%)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
