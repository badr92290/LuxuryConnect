/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B0F14",
        surface: "#141A21",
        surfaceAlt: "#1D252E",
        border: "#2A333D",
        primary: {
          DEFAULT: "#3DA9FC",
          dark: "#2C86D6",
        },
        accent: "#FFB627",
        muted: "#93A1AD",
        success: "#3ECF8E",
        danger: "#FF5C5C",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};
