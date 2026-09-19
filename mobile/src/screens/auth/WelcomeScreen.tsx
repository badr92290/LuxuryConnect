import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/colors";
import { Button, Screen } from "../../components/ui";
import { HaloBackground } from "../../components/HaloBackground";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.container}>
        <View>
          <Text style={styles.eyebrow}>CONCIERGE PPF · COVERING · CÉRAMIQUE</Text>
          <Text style={styles.headline}>
            La protection automobile, <Text style={styles.headlineAccent}>orchestrée</Text> pour
            vous.
          </Text>
          <Text style={styles.tagline}>
            Décrivez votre besoin — notre équipe consulte pour vous les meilleurs artisans du
            secteur et vous revient avec une offre unique, claire, sans négociation à mener
            vous-même.
          </Text>
        </View>

        <View style={styles.wordmarkWrap}>
          <HaloBackground />
          <Text style={styles.wordmark}>
            Luxury<Text style={styles.wordmarkAccent}>Connect</Text>
          </Text>
        </View>

        <View style={styles.actions}>
          <Button title="Se connecter" onPress={() => navigation.navigate("Login")} />
          <Button
            title="Créer un compte client"
            variant="secondary"
            onPress={() => navigation.navigate("Register", { role: "CLIENT" })}
            style={{ marginTop: spacing.sm }}
          />
          <Button
            title="Je suis un professionnel"
            variant="secondary"
            onPress={() => navigation.navigate("Register", { role: "PROFESSIONAL" })}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: spacing.lg,
    paddingTop: 100,
    paddingBottom: 50,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  headline: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "600",
    color: colors.text,
  },
  headlineAccent: {
    color: colors.primary,
    fontStyle: "italic",
  },
  tagline: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  wordmarkWrap: {
    flex: 1,
    overflow: "hidden",
  },
  wordmark: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    textAlign: "center",
    transform: [{ translateY: -40 }],
    fontSize: 28,
    fontWeight: "500",
    color: colors.text,
  },
  wordmarkAccent: {
    color: colors.primary,
    fontStyle: "italic",
  },
  actions: {
    width: "100%",
  },
});
