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
        'gta-blue': '#52FDFF',
        'gta-pink': '#F152FF',
        'gta-green': '#56FF52',
        'gta-purple': '#AC52FF',
        'gta-yellow': '#FFE552',
        'gta-red': '#FF5252',
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