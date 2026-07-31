/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B5ED7',
          dark: '#084298',
          light: '#EAF4FF',
        },
      },
    },
  },
  plugins: [],
};
