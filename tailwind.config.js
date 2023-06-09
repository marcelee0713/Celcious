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
        primary: "#2B2B2B",
        secondary: "#FFFFFF",
      },

      letterSpacing: {
        headSpacing: "0.3em",
      },

      maxWidth: {
        picMax: "40px",
      },
    },
  },
  plugins: [],
};
