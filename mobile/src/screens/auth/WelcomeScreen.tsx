import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/colors";
import { Button, Screen } from "../../components/ui";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.container}>
        <View>
          <Text style={styles.logo}>🚗 CarCare Connect</Text>
          <Text style={styles.tagline}>
            Trouvez le bon professionnel pour le PPF, covering, céramique, vitres teintées et
            lustrage de votre véhicule.
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
    paddingTop: 120,
    paddingBottom: 60,
  },
  logo: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  tagline: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 22,
  },
  actions: {
    width: "100%",
  },
});
