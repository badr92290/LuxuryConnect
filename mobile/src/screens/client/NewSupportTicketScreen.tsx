import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, eyebrow, fonts, radius, spacing } from "../../theme/colors";
import { Button, ErrorText, Input, Muted, Screen, Subtitle, Title } from "../../components/ui";
import { api, ApiError } from "../../api/client";
import { SUPPORT_REASONS, SUPPORT_REASON_LABELS, SupportTicketReason } from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ClientStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList, "NewSupportTicket">;

export default function NewSupportTicketScreen({ route, navigation }: Props) {
  const { bookingId, businessName } = route.params;
  const [reason, setReason] = useState<SupportTicketReason>("DEFECT");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const found: { subject?: string; message?: string } = {};
    if (subject.trim().length < 4) found.subject = "Résumez l'objet en quelques mots.";
    if (message.trim().length < 10) found.message = "Détaillez un peu pour que l'atelier comprenne.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    setFormError(null);
    try {
      const { ticket } = await api.post<{ ticket: { id: string } }>("/support", {
        bookingId,
        reason,
        subject: subject.trim(),
        message: message.trim(),
      });
      navigation.replace("SupportTicket", { ticketId: ticket.id });
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Le dossier n'a pas pu être ouvert");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Title>Ouvrir un dossier SAV</Title>
          <Subtitle style={styles.lede}>
            Votre message part directement à {businessName}, l'atelier qui a réalisé la prestation.
            Il vous répond ici même. Si rien ne bouge sous trois jours, nous reprenons la main
            automatiquement.
          </Subtitle>

          <Text style={styles.label}>Motif</Text>
          <View style={styles.reasonGrid}>
            {SUPPORT_REASONS.map((r) => {
              const active = reason === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => setReason(r)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[styles.reason, active && styles.reasonActive]}
                >
                  <Text style={[styles.reasonText, active && styles.reasonTextActive]}>
                    {SUPPORT_REASON_LABELS[r]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            label="Objet"
            value={subject}
            onChangeText={setSubject}
            placeholder="ex : léger décollement du film sur le pare-chocs"
          />
          {errors.subject && <ErrorText>{errors.subject}</ErrorText>}

          <Input
            label="Ce que vous constatez"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            placeholder="Décrivez le problème, où il se situe et depuis quand."
            style={{ height: 120, textAlignVertical: "top" }}
          />
          {errors.message && <ErrorText>{errors.message}</ErrorText>}

          {formError && <ErrorText>{formError}</ErrorText>}

          <Button title="Envoyer à l'atelier" onPress={handleSubmit} loading={loading} />

          <Muted style={styles.note}>
            Ce dossier est le seul endroit où vous écrivez directement à l'atelier : pour tout le
            reste, LuxuryConnect reste votre interlocuteur unique.
          </Muted>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.gutter, paddingBottom: spacing.xl },
  lede: { marginTop: spacing.sm, marginBottom: spacing.lg },
  label: { ...eyebrow, color: colors.textMuted, marginBottom: spacing.sm },
  reasonGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  reason: {
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  reasonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  reasonText: { fontFamily: fonts.bodySemi, color: colors.textMuted, fontSize: 13 },
  reasonTextActive: { color: colors.background },
  note: { marginTop: spacing.md, fontSize: 12, color: colors.textMutedDark },
});
