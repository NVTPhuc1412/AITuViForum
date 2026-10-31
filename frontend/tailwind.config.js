/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        astro: {
          900: '#0B0F19',
          850: '#111827',
          800: '#1A2234',
          700: '#26334D',
          gold: '#E5B869',
          'gold-light': '#F3D295',
          cyan: '#38BDF8',
          purple: '#A855F7',
        }
      }
    },
  },
  plugins: [],
}
