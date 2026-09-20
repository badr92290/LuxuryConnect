/**
 * Jetons de design partagés avec le site web (web/tailwind.config.js).
 * Toute valeur modifiée ici doit l'être aussi côté web, et inversement :
 * les deux interfaces doivent rester impossibles à distinguer.
 */
export const colors = {
  background: "#0A0A0C",
  surface: "#131317",
  surfaceAlt: "#1B1B20",
  border: "#28282E",
  /** Filet plus discret que `border`, pour les contours de cartes. */
  hairline: "#232328",

  primary: "#C9A876",
  primaryDark: "#B0895A",
  accent: "#C9A876",
  gold100: "#F3E7C9",
  gold200: "#E8D3A0",

  text: "#F6F2EA",
  textMuted: "#9A968D",
  /** 4.53:1 sur les surfaces, 4.84:1 sur le fond — conforme AA pour du texte. */
  textMutedDark: "#827D74",

  success: "#5CB88A",
  danger: "#D97462",
  white: "#FFFFFF",
};

/** Dégradé or des boutons principaux et du mot « Connect ». */
export const goldGradient = ["#E3C68A", "#C9A876", "#A5824F"] as const;

export const spacing = {
  /** Gouttière de page, équivalent du `px-5` des vues du site. */
  gutter: 20,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/** Rayons repris de tailwind.config.js (xl / 2xl / 3xl). */
export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
};

/** Familles chargées par `useAppFonts` ; `display` est réservé aux titres. */
export const fonts = {
  display: "Fraunces_500Medium",
  displaySemi: "Fraunces_600SemiBold",
  displayItalic: "Fraunces_500Medium_Italic",
  body: "Manrope_400Regular",
  bodyMedium: "Manrope_500Medium",
  bodySemi: "Manrope_600SemiBold",
  bodyBold: "Manrope_700Bold",
};

/** Libellé en petites capitales espacées, repris tel quel du site. */
export const eyebrow = {
  fontFamily: fonts.bodySemi,
  fontSize: 11,
  letterSpacing: 0.88, // 0.08em
  textTransform: "uppercase" as const,
};
