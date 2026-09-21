import React from "react";

/**
 * Doublure web de Stripe.
 *
 * L'application est distribuée sur iOS et Android ; `expo start --web` ne
 * sert qu'à prévisualiser les écrans. Le module natif de Stripe ne s'y
 * compile pas, et Apple Pay comme Google Pay n'y existent pas. On rend donc
 * un fournisseur inerte et un `useStripe` qui annonce clairement que le
 * paiement n'est pas disponible ici, au lieu de faire échouer le bundle.
 */
export function StripeProvider({ children }: { children?: React.ReactNode }) {
  return children as React.ReactElement;
}

const unavailable = {
  code: "Failed" as const,
  message: "Le paiement n'est disponible que depuis l'application iOS ou Android.",
};

export function useStripe() {
  return {
    initPaymentSheet: async () => ({ error: unavailable }),
    presentPaymentSheet: async () => ({ error: unavailable }),
  };
}
