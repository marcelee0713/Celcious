/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        wiggle: "wiggle 1s ease-in-out infinite",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
      },
      colors: {
        primary: "#2B2B2B",
        secondary: "#FFFFFF",
        accent: "#F2F2F2",
      },

      letterSpacing: {
        headSpacing: "0.3em",
      },

      margin: {
        navPageMargin: "60px",
        headSpacing: "0.3em",
      },

      padding: {
        navPageHeight: "60px",
      },

      width: {
        modalWidth: "600px",
        logInWidth: "400px",
        profilePicWidth: "300px",
        profileFormWidth: "400px",
        productBoxWidth: "300px",
      },

      height: {
        logInHeight: "600px",
        profilePicHeight: "300px",
        navPageHeight: "60px",
        productBoxHeight: "500px",
      },

      maxWidth: {
        picMax: "40px",
      },

      gridTemplateColumns: {
        myGridTemplate: "repeat(auto-fit, minmax(300px, 300px))",
      },
    },
  },
  plugins: [],
};
