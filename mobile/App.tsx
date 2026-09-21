import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StripeProvider } from "./src/payments/stripe";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { useAppFonts } from "./src/theme/fonts";
import { APPLE_MERCHANT_ID, STRIPE_PUBLISHABLE_KEY } from "./src/api/stripeConfig";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const fontsReady = useAppFonts();

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <SafeAreaProvider>
      {/* `merchantIdentifier` conditionne l'affichage d'Apple Pay ; sans clé
          publique, le fournisseur reste inerte et l'app fonctionne sans
          paiement en ligne. */}
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier={APPLE_MERCHANT_ID}
        urlScheme="luxuryconnect"
      >
        <AuthProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </AuthProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}
