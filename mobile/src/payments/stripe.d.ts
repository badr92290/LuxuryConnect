/**
 * Déclaration du point d'entrée résolu par plateforme.
 *
 * Metro choisit `stripe.native.ts` ou `stripe.web.ts` selon la cible ;
 * TypeScript, lui, ne connaît pas ces suffixes et a besoin de ce fichier
 * pour typer l'import `./payments/stripe`.
 */
import type React from "react";
import type { StripeProvider as NativeProvider, useStripe as useNativeStripe } from "@stripe/stripe-react-native";

export const StripeProvider: typeof NativeProvider;
export const useStripe: typeof useNativeStripe;
