import { loadStripe, Stripe } from "@stripe/stripe-js";

/**
 * Chargement paresseux de Stripe.js.
 *
 * Le script pèse et pose un cookie de détection de fraude : on ne le charge
 * donc qu'au moment où une page de paiement s'ouvre, jamais sur l'accueil.
 * La clé publique est destinée au navigateur — ce n'est pas un secret.
 */
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

let promise: Promise<Stripe | null> | null = null;

export function paymentsConfigured(): boolean {
  return Boolean(publishableKey);
}

export function getStripe(): Promise<Stripe | null> {
  if (!publishableKey) return Promise.resolve(null);
  if (!promise) promise = loadStripe(publishableKey);
  return promise;
}

/**
 * Apparence de l'interface de paiement, alignée sur le reste du site.
 * Stripe n'accepte que des valeurs littérales : les jetons Tailwind sont
 * recopiés ici, d'où le commentaire de rappel.
 */
export const stripeAppearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#C9A876", // gold
    colorBackground: "#131317", // surface
    colorText: "#F6F2EA", // ivory
    colorTextSecondary: "#9A968D", // muted
    colorDanger: "#D97462", // danger
    fontFamily: "Manrope, system-ui, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #28282E", boxShadow: "none" },
    ".Input:focus": { border: "1px solid rgba(201,168,118,0.6)", boxShadow: "none" },
    ".Label": {
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#9A968D",
    },
    ".Tab": { border: "1px solid #28282E", backgroundColor: "#131317" },
    ".Tab--selected": { borderColor: "rgba(201,168,118,0.6)", color: "#F6F2EA" },
  },
};
