/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#E86100',
      },
      keyframes: {
        'marquee-y': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-50%)' },
        },
      },
      animation: {
        'marquee-y': 'marquee-y 14s linear infinite',
      },
    },
  },
  plugins: [],
}
