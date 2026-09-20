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
        // 4.53:1 sur les surfaces, 4.84:1 sur le fond — conforme AA pour du texte.
        mutedDark: "#827D74",
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
        "glass-sheen":
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 55%)",
        shimmer:
          "linear-gradient(90deg, transparent 0%, rgba(201,168,118,0.07) 50%, transparent 100%)",
      },
      boxShadow: {
        gold: "0 10px 34px -16px rgba(201,168,118,0.45)",
        "gold-lg": "0 20px 52px -20px rgba(201,168,118,0.55)",
        glass: "0 8px 32px -12px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(18px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.45s ease-out both",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        "toast-in": "toast-in 0.32s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};
