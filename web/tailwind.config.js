/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0A0A0C",
        surface: "#131317",
        surfaceAlt: "#1B1B20",
        border: "#28282E",
        hairline: "#232328",
        gold: {
          50: "#FBF6EC",
          100: "#F3E7C9",
          200: "#E8D3A0",
          300: "#DCBE77",
          400: "#D0AB58",
          DEFAULT: "#C9A876",
          500: "#C9A876",
          600: "#B0895A",
          700: "#8C6B44",
        },
        primary: {
          DEFAULT: "#C9A876",
          dark: "#B0895A",
          foreground: "#0A0A0C",
        },
        accent: "#C9A876",
        ivory: "#F6F2EA",
        muted: "#9A968D",
        mutedDark: "#6E6A62",
        success: "#5CB88A",
        danger: "#D97462",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Manrope'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "22px",
        "3xl": "28px",
      },
      letterSpacing: {
        wider2: "0.08em",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #E3C68A 0%, #C9A876 45%, #A5824F 100%)",
        "radial-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(201,168,118,0.16) 0%, rgba(201,168,118,0) 70%)",
      },
    },
  },
  plugins: [],
};
