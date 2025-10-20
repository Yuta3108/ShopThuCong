/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {

    extend: {
       mint: {
        50: "#e7fdf7",
        100: "#c4f5e8",
      },
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