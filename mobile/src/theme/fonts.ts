import {
  useFonts,
  Fraunces_500Medium,
  Fraunces_500Medium_Italic,
  Fraunces_600SemiBold,
} from "@expo-google-fonts/fraunces";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";

/**
 * Charge les deux familles du site : Fraunces pour les titres,
 * Manrope pour tout le reste. Renvoie `true` quand l'app peut s'afficher.
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    Fraunces_500Medium,
    Fraunces_500Medium_Italic,
    Fraunces_600SemiBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  // En cas d'échec de chargement on affiche quand même l'app, avec les
  // polices système, plutôt que de bloquer l'utilisateur sur le splash.
  return loaded || error !== null;
}
