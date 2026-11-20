export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9ecff',
          200: '#b8dcff',
          300: '#85c5ff',
          400: '#4aa5ff',
          500: '#1f83f7',
          600: '#0b64d9',
          700: '#0d50ae',
          800: '#12448c',
          900: '#143a72',
          950: '#0d2450',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
