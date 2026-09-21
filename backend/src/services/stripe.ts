import Stripe from "stripe";

/**
 * Accès à Stripe.
 *
 * LuxuryConnect encaisse le client sur son propre compte, garde sa marge,
 * puis vire la part de l'atelier sur le compte Connect de celui-ci. C'est le
 * schéma dit « charges séparées » : l'argent transite bien par nous, ce qui
 * est exactement le modèle voulu, et Stripe porte l'agrément d'établissement
 * de paiement que cette collecte pour compte de tiers exige.
 *
 * Sans clé configurée, l'application démarre quand même : les routes de
 * paiement répondent alors 503 avec un message clair, plutôt que de faire
 * tomber tout le serveur.
 */
let client: Stripe | null = null;

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new StripeNotConfiguredError();
  }
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // Épinglée : une montée de version de l'API se décide, elle ne se subit pas.
      apiVersion: "2026-08-26.dahlia",
      appInfo: { name: "LuxuryConnect", version: "1.0.0" },
    });
  }
  return client;
}

export class StripeNotConfiguredError extends Error {
  constructor() {
    super("Le paiement en ligne n'est pas encore configuré.");
    this.name = "StripeNotConfiguredError";
  }
}

/** Devise unique pour l'instant ; centralisée pour n'avoir qu'un endroit à changer. */
export const CURRENCY = "eur";

/** Convertit des euros (stockés en Float côté offre) en centimes. */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function toEuros(cents: number): number {
  return cents / 100;
}

/**
 * Libellé lisible du moyen de paiement, pour le reçu et l'écran admin.
 * Apple Pay et Google Pay arrivent sous forme de carte assortie d'un
 * `wallet.type` : sans ce détour, tout s'afficherait « Visa ».
 */
export function paymentMethodLabel(
  method: Stripe.PaymentMethod | Stripe.Charge.PaymentMethodDetails | null | undefined,
): string | null {
  if (!method) return null;
  const card = "card" in method ? (method.card as Stripe.Charge.PaymentMethodDetails.Card | null) : null;
  if (!card) return null;

  const wallet = card.wallet?.type;
  if (wallet === "apple_pay") return "Apple Pay";
  if (wallet === "google_pay") return "Google Pay";
  if (wallet === "link") return "Link";

  const brand = card.brand ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1) : "Carte";
  return card.last4 ? `${brand} •••• ${card.last4}` : brand;
}
