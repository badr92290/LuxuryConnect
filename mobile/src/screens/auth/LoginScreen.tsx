import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing } from "../../theme/colors";
import { Button, ErrorText, Input, Screen, Subtitle, Title, Wordmark } from "../../components/ui";
import { HaloBackground } from "../../components/HaloBackground";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de se connecter");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <HaloBackground opacity={0.45} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.mark}>
            <Wordmark size={19} />
          </View>

          <Title>Connexion</Title>
          <Subtitle style={styles.lede}>Accédez à votre espace.</Subtitle>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="vous@exemple.fr"
          />
          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          {error && <ErrorText>{error}</ErrorText>}

          <Button title="Se connecter" onPress={handleSubmit} loading={loading} />

          <View style={styles.footer}>
            <Text
              style={styles.linkGold}
              onPress={() => navigation.navigate("Register", { role: "CLIENT" })}
            >
              Pas encore de compte ? Créer un compte client
            </Text>
            <Text
              style={styles.linkMuted}
              onPress={() => navigation.navigate("Register", { role: "PROFESSIONAL" })}
            >
              Vous êtes un professionnel ? Créer un compte pro
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: spacing.lg, paddingVertical: 56 },
  mark: { marginBottom: spacing.xl },
  lede: { marginTop: 4, marginBottom: spacing.xl },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    gap: spacing.sm,
  },
  linkGold: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.primary,
    textAlign: "center",
  },
  linkMuted: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
});
