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
        'gta-orange': '#FFAD6B',
        'gta-teal': '#6BFFD3',
        'gta-lime': '#ADFF6B',
        'gta-crimson': '#D73333',
        'gta-indigo': '#A66BFF',
        'gta-gray': '#BBBBBB',
        'dark-bg': '#121212',
        'map-bg': '#0fa8d2'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Pricedown', 'Inter', 'sans-serif']
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#fff',
            a: {
              color: '#52FDFF',
              textDecoration: 'none',
              '&:hover': {
                color: '#F152FF',
                textDecoration: 'underline',
              },
            },
            h1: { 
              color: '#fff',
              fontFamily: 'Pricedown, Inter, sans-serif',
              fontSize: '2.25rem',
              marginTop: '2rem',
              marginBottom: '1rem',
              lineHeight: '1.2',
              fontWeight: '700',
              background: 'linear-gradient(to right, #52FDFF, #F152FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent'
            },
            h2: { 
              color: '#fff',
              fontFamily: 'Pricedown, Inter, sans-serif',
              fontSize: '1.875rem',
              marginTop: '1.75rem',
              marginBottom: '0.875rem',
              lineHeight: '1.25',
              fontWeight: '700',
              borderBottom: '1px solid #F152FF30'
            },
            h3: { 
              color: '#52FDFF',
              fontFamily: 'Pricedown, Inter, sans-serif',
              fontSize: '1.5rem',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
              lineHeight: '1.3',
              fontWeight: '600'
            },
            h4: { 
              color: '#F152FF',
              fontWeight: '600',
              fontSize: '1.25rem',
              marginTop: '1.25rem',
              marginBottom: '0.625rem'
            },
            h5: { 
              color: '#FFE552',
              fontWeight: '600',
              fontSize: '1.125rem',
              marginTop: '1.125rem',
              marginBottom: '0.5rem'
            },
            h6: { 
              color: '#56FF52',
              fontWeight: '600',
              fontSize: '1rem',
              marginTop: '1rem',
              marginBottom: '0.5rem'
            },
            strong: { 
              color: '#fff',
              fontWeight: '600'
            },
            code: { 
              color: '#52FDFF',
              fontWeight: '400',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.875em'
            },
            pre: {
              backgroundColor: '#1a1a1a',
              color: '#fff',
              padding: '1.25rem',
              borderRadius: '0.5rem',
              border: '1px solid #333',
              overflowX: 'auto'
            },
            blockquote: {
              color: '#d1d5db',
              borderLeftColor: '#52FDFF',
              borderLeftWidth: '4px',
              paddingLeft: '1rem',
              fontStyle: 'italic',
              backgroundColor: 'rgba(82, 253, 255, 0.05)',
              borderRadius: '0 0.25rem 0.25rem 0',
              margin: '1.5rem 0'
            },
            hr: { 
              borderColor: '#374151',
              margin: '2rem 0'
            },
            ol: {
              li: {
                '&:before': { 
                  color: '#F152FF',
                  fontWeight: '600'
                },
                marginBottom: '0.5rem'
              },
            },
            ul: {
              li: {
                '&:before': { 
                  backgroundColor: '#52FDFF',
                  width: '0.375em',
                  height: '0.375em',
                  top: '0.6875em'
                },
                marginBottom: '0.5rem'
              },
            },
            img: {
              borderRadius: '0.5rem',
              margin: '1.5rem 0'
            },
            table: {
              thead: {
                color: '#fff',
                borderBottomColor: '#52FDFF',
                borderBottomWidth: '2px',
                th: {
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)'
                }
              },
              tbody: {
                tr: {
                  borderBottomColor: '#1f2937',
                  td: {
                    padding: '0.75rem 1rem'
                  },
                  '&:nth-child(odd)': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                  }
                },
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}; 