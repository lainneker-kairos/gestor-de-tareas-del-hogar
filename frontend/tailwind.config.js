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
        coastal: {
          dark: '#033B3C',
          teal: '#0A736D',
          aqua: '#18B985',
          sand: '#9FE870',
          light: '#FFF1C1'
        },
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#46e5b0ff',
          600: '#086652ff',
          700: '#30a343ff',
          900: '#0becc7ff',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        rose: {
          500: '#f43f5e',
          600: '#e11d48',
        }
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
};
