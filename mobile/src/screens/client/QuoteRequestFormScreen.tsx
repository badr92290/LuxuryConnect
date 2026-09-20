import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, eyebrow, fonts, radius, spacing } from "../../theme/colors";
import { Button, Input, Screen } from "../../components/ui";
import { api, ApiError } from "../../api/client";
import { ServiceType, SERVICE_LABELS } from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ClientStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList, "QuoteRequestForm">;

const SERVICES: ServiceType[] = ["PPF", "COVERING", "CERAMIC", "TINT", "POLISH"];

export default function QuoteRequestFormScreen({ route, navigation }: Props) {
  const { professionalId, businessName } = route.params;
  const [serviceType, setServiceType] = useState<ServiceType>("PPF");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!vehicleMake || !vehicleModel) {
      setError("Merci d'indiquer au moins la marque et le modèle du véhicule.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/quote-requests", {
        professionalId,
        serviceType,
        vehicleMake,
        vehicleModel,
        vehicleYear: vehicleYear ? parseInt(vehicleYear, 10) : undefined,
        description: description || undefined,
      });
      navigation.goBack();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible d'envoyer la demande");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.gutter }}>
        <Text style={styles.subtitle}>Auprès de {businessName}</Text>

        <Text style={styles.label}>Prestation souhaitée</Text>
        <View style={styles.serviceGrid}>
          {SERVICES.map((s) => (
            <Pressable
              key={s}
              onPress={() => setServiceType(s)}
              style={[styles.serviceOption, serviceType === s && styles.serviceOptionActive]}
            >
              <Text style={[styles.serviceText, serviceType === s && styles.serviceTextActive]}>
                {SERVICE_LABELS[s]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input label="Marque du véhicule" value={vehicleMake} onChangeText={setVehicleMake} placeholder="Peugeot" />
        <Input label="Modèle" value={vehicleModel} onChangeText={setVehicleModel} placeholder="308" />
        <Input
          label="Année (optionnel)"
          value={vehicleYear}
          onChangeText={setVehicleYear}
          keyboardType="number-pad"
          placeholder="2022"
        />
        <Input
          label="Décrivez votre besoin (optionnel)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: "top" }}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button title="Envoyer la demande" onPress={handleSubmit} loading={loading} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  label: { ...eyebrow, color: colors.textMuted, marginBottom: spacing.sm },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  serviceOption: {
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  serviceOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  serviceText: { fontFamily: fonts.bodySemi, color: colors.textMuted, fontSize: 13 },
  serviceTextActive: { color: colors.background },
  error: { fontFamily: fonts.body, fontSize: 14, color: colors.danger, marginBottom: spacing.md },
});
