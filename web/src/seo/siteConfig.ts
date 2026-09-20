/**
 * Réglages publics du site. L'URL canonique sert aux balises Open Graph,
 * au sitemap et au lien `canonical` : elle doit pointer vers le domaine
 * réellement servi, d'où la variable d'environnement.
 */
export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://luxuryconnect.fr"
).replace(/\/$/, "");

export const SITE_NAME = "LuxuryConnect";

export const DEFAULT_DESCRIPTION =
  "Une seule demande, un seul prix. LuxuryConnect consulte pour vous les ateliers " +
  "de PPF, covering, protection céramique, vitres teintées et lustrage, puis vous " +
  "transmet une offre unique et ferme.";

/** Image de partage (1200×630), référencée par Open Graph et Twitter Card. */
export const SHARE_IMAGE = "/og-image.jpg";

export const CONTACT_EMAIL = "contact@luxuryconnect.fr";
