/**
 * Accès à Stripe sur iOS et Android.
 *
 * `@stripe/stripe-react-native` est un module natif : il ne se compile pas
 * pour le web, où Metro refuse d'importer les internes de React Native. On
 * passe donc par ce point d'entrée, que Metro résout différemment selon la
 * plateforme — `.native` ici, `.web` à côté.
 */
export { StripeProvider, useStripe } from "@stripe/stripe-react-native";
