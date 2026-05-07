/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F4D03F",
          dark: "#996515",
        },
        dark: {
          DEFAULT: "#0B0F14",
          soft: "#161B22",
          lighter: "#21262D",
        },
        success: "#2D8A4E",
        danger: "#E53E3E",
        surface: "#F7F9FC",
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
