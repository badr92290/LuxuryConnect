import React, { useState } from "react";
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { colors, radius, spacing } from "../../theme/colors";
import { Button, Input, Screen } from "../../components/ui";
import { HaloBackground } from "../../components/HaloBackground";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";
import type { Role } from "../../types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation, route }: Props) {
  const { register } = useAuth();
  const [role, setRole] = useState<Role>(route.params.role);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!firstName || !lastName || !email || password.length < 8) {
      setError("Merci de remplir tous les champs (mot de passe : 8 caractères minimum).");
      return;
    }
    if (role === "PROFESSIONAL" && !businessName) {
      setError("Le nom de votre entreprise est requis.");
      return;
    }
    setLoading(true);
    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        role,
        firstName,
        lastName,
        phone: phone || undefined,
        businessName: role === "PROFESSIONAL" ? businessName : undefined,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de créer le compte");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <HaloBackground />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Créer un compte</Text>

          <View style={styles.roleSwitch}>
            <Pressable
              style={[styles.roleOption, role === "CLIENT" && styles.roleOptionActive]}
              onPress={() => setRole("CLIENT")}
            >
              <Text style={[styles.roleText, role === "CLIENT" && styles.roleTextActive]}>Client</Text>
            </Pressable>
            <Pressable
              style={[styles.roleOption, role === "PROFESSIONAL" && styles.roleOptionActive]}
              onPress={() => setRole("PROFESSIONAL")}
            >
              <Text style={[styles.roleText, role === "PROFESSIONAL" && styles.roleTextActive]}>
                Professionnel
              </Text>
            </Pressable>
          </View>

          <Input label="Prénom" value={firstName} onChangeText={setFirstName} />
          <Input label="Nom" value={lastName} onChangeText={setLastName} />
          {role === "PROFESSIONAL" && (
            <Input
              label="Nom de l'entreprise"
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="ex: Auto Shine Lyon"
            />
          )}
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input label="Téléphone (optionnel)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button title="Créer mon compte" onPress={handleSubmit} loading={loading} />

          <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
            Déjà un compte ? Se connecter
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  roleSwitch: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  roleOptionActive: {
    backgroundColor: colors.primary,
  },
  roleText: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  roleTextActive: {
    color: colors.background,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  link: {
    color: colors.primary,
    marginTop: spacing.lg,
    textAlign: "center",
  },
});
