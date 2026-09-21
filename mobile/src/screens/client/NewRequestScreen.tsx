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
import { colors, eyebrow, fonts, radius, spacing } from "../../theme/colors";
import { Button, ErrorText, Input, Muted, Screen, Subtitle, Title } from "../../components/ui";
import { api, ApiError } from "../../api/client";
import { OFFERED_SERVICES, SERVICE_LABELS, ServiceType } from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { ClientStackParamList, ClientTabParamList } from "../../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<ClientTabParamList, "NewRequest">,
  NativeStackScreenProps<ClientStackParamList>
>;

/**
 * Le client décrit son besoin une seule fois. La demande arrive chez
 * LuxuryConnect, qui consulte les ateliers : à aucun moment le client ne
 * choisit un professionnel, ni ne le contacte.
 */
export default function NewRequestScreen({ navigation }: Props) {
  const [serviceType, setServiceType] = useState<ServiceType>("PPF_SATIN");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!vehicleMake.trim() || !vehicleModel.trim()) {
      setError("Merci d'indiquer au moins la marque et le modèle du véhicule.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/quote-requests", {
        serviceType,
        vehicleMake: vehicleMake.trim(),
        vehicleModel: vehicleModel.trim(),
        vehicleYear: vehicleYear ? parseInt(vehicleYear, 10) : undefined,
        city: city.trim() || undefined,
        description: description.trim() || undefined,
      });
      setVehicleMake("");
      setVehicleModel("");
      setVehicleYear("");
      setCity("");
      setDescription("");
      navigation.navigate("MyRequests");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible d'envoyer la demande");
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
          <Title>Nouvelle demande</Title>
          <Subtitle style={styles.lede}>
            Décrivez votre besoin : nous consultons les ateliers qualifiés et revenons vers vous
            avec une offre unique et ferme. Vous n'avez personne à appeler.
          </Subtitle>

          <Text style={styles.label}>Prestation souhaitée</Text>
          <View style={styles.serviceGrid}>
            {OFFERED_SERVICES.map((s) => {
              const active = serviceType === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setServiceType(s)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[styles.serviceOption, active && styles.serviceOptionActive]}
                >
                  <Text style={[styles.serviceText, active && styles.serviceTextActive]}>
                    {SERVICE_LABELS[s]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            label="Marque du véhicule"
            value={vehicleMake}
            onChangeText={setVehicleMake}
            placeholder="Peugeot"
          />
          <Input
            label="Modèle"
            value={vehicleModel}
            onChangeText={setVehicleModel}
            placeholder="308"
          />
          <Input
            label="Année (optionnel)"
            value={vehicleYear}
            onChangeText={setVehicleYear}
            keyboardType="number-pad"
            placeholder="2022"
          />
          <Input
            label="Ville (optionnel)"
            value={city}
            onChangeText={setCity}
            placeholder="Lyon"
          />
          <Input
            label="Décrivez votre besoin (optionnel)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="État actuel du véhicule, délai souhaité…"
            style={{ height: 104, textAlignVertical: "top" }}
          />

          {error && <ErrorText>{error}</ErrorText>}

          <Button title="Envoyer ma demande" onPress={handleSubmit} loading={loading} />

          <Muted style={styles.note}>
            Votre demande nous parvient directement. Nous ne communiquons vos coordonnées à un
            atelier qu'une fois l'offre acceptée.
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
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  serviceOption: {
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  serviceOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  serviceText: { fontFamily: fonts.bodySemi, color: colors.textMuted, fontSize: 13 },
  serviceTextActive: { color: colors.background },
  note: { marginTop: spacing.md, fontSize: 12, color: colors.textMutedDark },
});
