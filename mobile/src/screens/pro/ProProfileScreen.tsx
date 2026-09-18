import React, { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing } from "../../theme/colors";
import { Badge, Button, Card, Input, Screen } from "../../components/ui";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { ProfessionalProfile, ServiceType, SERVICE_LABELS } from "../../types";

const SERVICES: ServiceType[] = ["PPF", "COVERING", "CERAMIC", "TINT", "POLISH"];

export default function ProProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [serviceType, setServiceType] = useState<ServiceType>("PPF");
  const [priceFrom, setPriceFrom] = useState("");
  const [savingService, setSavingService] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [savingImage, setSavingImage] = useState(false);

  const load = useCallback(async () => {
    if (!user?.professionalProfile) return;
    const data = await api.get<{ professional: ProfessionalProfile }>(
      `/professionals/${user.professionalProfile.id}`
    );
    setProfile(data.professional);
    setBusinessName(data.professional.businessName);
    setDescription(data.professional.description ?? "");
    setCity(data.professional.city ?? "");
    setAddress(data.professional.address ?? "");
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await api.put("/professionals/me", { businessName, description, city, address });
      await load();
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveService() {
    if (!priceFrom) return;
    setSavingService(true);
    try {
      await api.put("/professionals/me/services", { serviceType, priceFrom: parseFloat(priceFrom) });
      setPriceFrom("");
      await load();
    } finally {
      setSavingService(false);
    }
  }

  async function addImage() {
    if (!imageUrl) return;
    setSavingImage(true);
    try {
      await api.post("/professionals/me/portfolio", { imageUrl, caption: caption || undefined });
      setImageUrl("");
      setCaption("");
      await load();
    } finally {
      setSavingImage(false);
    }
  }

  async function removeImage(id: string) {
    await api.delete(`/professionals/me/portfolio/${id}`);
    await load();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}>
        <Text style={styles.title}>Mon profil professionnel</Text>

        <View>
          <Text style={styles.sectionTitle}>Informations</Text>
          <Input label="Nom de l'entreprise" value={businessName} onChangeText={setBusinessName} />
          <Input label="Ville" value={city} onChangeText={setCity} />
          <Input label="Adresse" value={address} onChangeText={setAddress} />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: "top" }}
          />
          <Button title="Enregistrer" onPress={saveProfile} loading={savingProfile} />
        </View>

        <View>
          <Text style={styles.sectionTitle}>Mes prestations</Text>
          {profile?.services && profile.services.length > 0 && (
            <View style={styles.badgeRow}>
              {profile.services.map((s) => (
                <Badge key={s.id} label={`${SERVICE_LABELS[s.serviceType]} · dès ${s.priceFrom}€`} />
              ))}
            </View>
          )}
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
          <Input label="Prix à partir de (€)" value={priceFrom} onChangeText={setPriceFrom} keyboardType="decimal-pad" />
          <Button title="Ajouter / mettre à jour" variant="secondary" onPress={saveService} loading={savingService} />
        </View>

        <View>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          {profile?.portfolioImages && profile.portfolioImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
              {profile.portfolioImages.map((img) => (
                <View key={img.id} style={{ marginRight: spacing.sm }}>
                  <Image source={{ uri: img.imageUrl }} style={styles.portfolioImage} />
                  <Pressable onPress={() => removeImage(img.id)}>
                    <Text style={styles.removeLink}>Supprimer</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
          <Input label="URL de la photo" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />
          <Input label="Légende (optionnel)" value={caption} onChangeText={setCaption} />
          <Button title="Ajouter une photo" variant="secondary" onPress={addImage} loading={savingImage} />
        </View>

        <Card>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.meta}>{user?.email}</Text>
        </Card>
        <Button title="Se déconnecter" variant="secondary" onPress={logout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", color: colors.text },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: spacing.sm },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: spacing.sm },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  serviceOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  serviceOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  serviceText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  serviceTextActive: { color: colors.background },
  portfolioImage: { width: 140, height: 100, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  removeLink: { color: colors.danger, fontSize: 12, marginTop: 4, textAlign: "center" },
  name: { color: colors.text, fontSize: 16, fontWeight: "700" },
  meta: { color: colors.textMuted, marginTop: 4 },
});
