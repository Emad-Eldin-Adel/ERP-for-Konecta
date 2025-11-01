/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2800C8',
          50: '#EFEBFF',
          100: '#E0D7FF',
          200: '#C1B0FF',
          300: '#A389FF',
          400: '#845FFF',
          500: '#5C32FF',
          600: '#2800C8',
          700: '#1F00A0',
          800: '#170078',
          900: '#0F0050',
        },
        accent: {
          yellow: '#F0FA00',
          gray: '#F2F0EB',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Arial', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
