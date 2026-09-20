import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, eyebrow, fonts, spacing } from "../../theme/colors";
import { Button, Screen } from "../../components/ui";
import { HaloBackground } from "../../components/HaloBackground";
import { ClientReviewsStrip } from "../../components/ClientReviews";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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

        <ClientReviewsStrip onSeeAll={() => navigation.navigate("Reviews")} />

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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: spacing.lg,
    paddingTop: 100,
    paddingBottom: 50,
  },
  eyebrow: { ...eyebrow, color: colors.primary, marginBottom: spacing.md },
  headline: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.8,
    color: colors.text,
  },
  headlineAccent: { fontFamily: fonts.displayItalic, color: colors.primary },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 23,
    marginTop: spacing.md,
  },
  wordmarkWrap: {
    height: 260,
    marginVertical: spacing.lg,
    overflow: "hidden",
  },
  wordmark: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    textAlign: "center",
    transform: [{ translateY: -40 }],
    fontFamily: fonts.display,
    fontSize: 27,
    color: colors.text,
  },
  wordmarkAccent: { fontFamily: fonts.displayItalic, color: colors.primary },
  actions: {
    width: "100%",
    marginTop: spacing.xl,
  },
});
