/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2d3ed6',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#2d3ed6',
          700: '#2730ae',
          800: '#1f2a86',
          900: '#18205d',
        },
        accent: {
          yellow: '#f6ff00',
          coral: '#f9735b',
          gray: '#f6f7fb',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
