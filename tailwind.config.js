/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'gta-blue': '#0051FF',
        'gta-pink': '#FF00B7',
        'gta-green': '#00FF85',
        'gta-purple': '#8C00FF',
        'gta-yellow': '#FFF500',
        'dark-bg': '#121212',
        'map-bg': '#0fa8d2'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Pricedown', 'Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}; 