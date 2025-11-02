/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
      colors: {
        mint: {
          50: "#F2FBF9",
          100: "#DFF8F1",
          200: "#B9F0E1",
          300: "#83E1CA",
          400: "#3FC8A7",
          500: "#14A58A",
          600: "#0D7D68",
          700: "#0B6353",
          800: "#0A4D42",
          900: "#093F37",
        },
      },
    extend: {
       mint: {
        50: "#e7fdf7",
        100: "#c4f5e8",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeSlide: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleUp: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out forwards",
        fadeSlide: "fadeSlide 0.4s ease-out forwards",
        scaleUp: "scaleUp 0.35s ease-out forwards",
        slideDown: "slideDown 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
  
};