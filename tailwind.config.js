/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#F8F3EA', // Primary bg
          200: '#F0E6D5',
        },
        oat: {
          100: '#EAE0D0', // Secondary bg
          200: '#DFD1BD',
          300: '#D2BEA4',
        },
        cocoa: {
          700: '#6B4C3A',
          800: '#553B2D', // Primary heading
          900: '#412C21',
        },
        caramel: {
          400: '#D5A073',
          500: '#C58B5A', // Promo / CTA
          600: '#B07545',
          700: '#8E5B32',
        },
        sage: {
          400: '#9EA78F',
          500: '#89927A', // Natural accent
          600: '#717A63',
        },
        rose: {
          200: '#F4DDD2',
          300: '#E8C6B5', // Soft accent
          400: '#D8AEA0',
        },
        espresso: {
          800: '#3D2F29',
          900: '#30241F', // Primary text
          950: '#201815',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
