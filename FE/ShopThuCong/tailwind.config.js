/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeSlide: {
          '0%': { opacity: '0', transform: 'translateY(-5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeSlide: 'fadeSlide 0.25s ease-out',
      },
    },
  },
  plugins: [],
  
};