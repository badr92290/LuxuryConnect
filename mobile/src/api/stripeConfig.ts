/**
 * Clé publique Stripe et identifiant marchand Apple.
 *
 * La clé publique est destinée à l'appareil : ce n'est pas un secret. Elle
 * est lue dans `app.json` (extra) pour qu'on puisse changer d'environnement
 * sans recompiler le code source.
 */
import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? extra.stripePublishableKey ?? "";

/** Doit correspondre au `merchantIdentifier` du plugin, sinon Apple Pay ne s'affiche pas. */
export const APPLE_MERCHANT_ID =
  process.env.EXPO_PUBLIC_APPLE_MERCHANT_ID ?? extra.appleMerchantId ?? "merchant.fr.luxuryconnect";

export function paymentsConfigured(): boolean {
  return STRIPE_PUBLISHABLE_KEY.length > 0;
}
