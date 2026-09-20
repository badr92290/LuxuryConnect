import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, goldGradient, radius, spacing } from "../../theme/colors";
import { Button, ErrorText, Input, Muted, Screen, Subtitle, Title, Wordmark } from "../../components/ui";
import { Checkbox } from "../../components/Checkbox";
import { HaloBackground } from "../../components/HaloBackground";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";
import type { Role } from "../../types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const ROLES: readonly Role[] = ["CLIENT", "PROFESSIONAL"] as const;

export default function RegisterScreen({ navigation, route }: Props) {
  const { register } = useAuth();
  const [role, setRole] = useState<Role>(route.params.role);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteRightsConfirmed, setWebsiteRightsConfirmed] = useState(false);
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
        websiteUrl: role === "PROFESSIONAL" && websiteUrl.trim() ? websiteUrl.trim() : undefined,
        websiteRightsConfirmed: role === "PROFESSIONAL" ? websiteRightsConfirmed : undefined,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de créer le compte");
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

          <Title>Créer un compte</Title>
          <Subtitle style={styles.lede}>Rejoignez LuxuryConnect en tant que…</Subtitle>

          <View style={styles.roleSwitch}>
            {ROLES.map((r) => {
              const active = role === r;
              const label = r === "CLIENT" ? "Client" : "Professionnel";
              return (
                <Pressable key={r} onPress={() => setRole(r)} style={styles.roleOption}>
                  {active && (
                    <LinearGradient
                      colors={goldGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Text style={[styles.roleText, active && styles.roleTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.nameRow}>
            <Input label="Prénom" value={firstName} onChangeText={setFirstName} containerStyle={styles.flex} />
            <Input label="Nom" value={lastName} onChangeText={setLastName} containerStyle={styles.flex} />
          </View>

          {role === "PROFESSIONAL" && (
            <>
              <Input
                label="Nom de l'entreprise"
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="ex: Auto Shine Lyon"
              />
              <Input
                label="Site internet (optionnel)"
                value={websiteUrl}
                onChangeText={setWebsiteUrl}
                autoCapitalize="none"
                keyboardType="url"
                placeholder="www.mon-atelier.fr"
              />
              {websiteUrl.trim() !== "" && (
                <View style={styles.rights}>
                  <Checkbox
                    checked={websiteRightsConfirmed}
                    onChange={() => setWebsiteRightsConfirmed((v) => !v)}
                    label="Je certifie détenir les droits sur les photos de mon site et j'autorise LuxuryConnect à en afficher jusqu'à six sur ma fiche."
                  />
                  <Muted style={styles.rightsNote}>
                    Vos réalisations seront reprises automatiquement. Vous pourrez les retirer ou en
                    ajouter d'autres depuis votre profil.
                  </Muted>
                </View>
              )}
            </>
          )}

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Téléphone (optionnel)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

          {error && <ErrorText>{error}</ErrorText>}

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
  container: { padding: spacing.lg, paddingTop: 56, paddingBottom: 56 },
  mark: { marginBottom: spacing.lg },
  lede: { marginTop: 4, marginBottom: spacing.lg },

  roleSwitch: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  roleText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textMuted },
  roleTextActive: { color: colors.background },

  nameRow: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },

  rights: { marginBottom: spacing.md },
  rightsNote: {
    fontFamily: fonts.body,
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textMutedDark,
  },

  link: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.primary,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    textAlign: "center",
  },
});
