/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#0B7B8C',
          light: '#B2EBF2',
          dark: '#065F70',
        },
        coral: {
          DEFAULT: '#D4684A',
          light: '#FDE8DC',
          dark: '#A84E30',
        },
        beige: '#F5F0E8',
        ocean: '#072B36',
      },
    },
  },
  plugins: [],
}
