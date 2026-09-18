import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme/colors";
import { Badge, Button, Card, Screen, StarRating } from "../../components/ui";
import { api } from "../../api/client";
import { ProfessionalProfile, SERVICE_LABELS } from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ClientStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList, "ProfessionalDetail">;

export default function ProfessionalDetailScreen({ route, navigation }: Props) {
  const { professionalId } = route.params;
  const [professional, setProfessional] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    api
      .get<{ professional: ProfessionalProfile }>(`/professionals/${professionalId}`)
      .then((data) => setProfessional(data.professional))
      .finally(() => setLoading(false));
  }, [professionalId]);

  async function handleMessage() {
    if (!professional) return;
    setMessaging(true);
    try {
      const data = await api.post<{ conversation: { id: string } }>("/conversations", {
        professionalId: professional.id,
      });
      navigation.navigate("Chat", { conversationId: data.conversation.id, title: professional.businessName });
    } finally {
      setMessaging(false);
    }
  }

  if (loading || !professional) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={{ color: colors.textMuted }}>Chargement...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        <View>
          <Text style={styles.name}>{professional.businessName}</Text>
          <Text style={styles.city}>{professional.city}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
            <StarRating rating={professional.averageRating} />
            <Text style={styles.reviewCount}>
              {professional.averageRating.toFixed(1)} ({professional.reviewCount} avis)
            </Text>
          </View>
        </View>

        {professional.description && <Text style={styles.description}>{professional.description}</Text>}

        <View style={styles.badgeRow}>
          {professional.services?.map((s) => (
            <Badge
              key={s.id}
              label={`${SERVICE_LABELS[s.serviceType]}${s.priceFrom ? ` · dès ${s.priceFrom}€` : ""}`}
            />
          ))}
        </View>

        {professional.portfolioImages && professional.portfolioImages.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Réalisations</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {professional.portfolioImages.map((img) => (
                <Image key={img.id} source={{ uri: img.imageUrl }} style={styles.portfolioImage} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Demander un devis"
            onPress={() =>
              navigation.navigate("QuoteRequestForm", {
                professionalId: professional.id,
                businessName: professional.businessName,
              })
            }
          />
          <Button
            title="Envoyer un message"
            variant="secondary"
            onPress={handleMessage}
            loading={messaging}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <View>
          <Text style={styles.sectionTitle}>Avis clients</Text>
          {professional.reviews && professional.reviews.length > 0 ? (
            professional.reviews.map((r) => (
              <Card key={r.id} style={{ marginTop: spacing.sm }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.reviewAuthor}>
                    {r.client?.firstName} {r.client?.lastName?.[0]}.
                  </Text>
                  <StarRating rating={r.rating} size={12} />
                </View>
                {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
              </Card>
            ))
          ) : (
            <Text style={{ color: colors.textMuted, marginTop: spacing.sm }}>Aucun avis pour le moment.</Text>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 24, fontWeight: "700", color: colors.text },
  city: { color: colors.textMuted, marginTop: 2 },
  reviewCount: { color: colors.textMuted, fontSize: 13 },
  description: { color: colors.text, lineHeight: 20 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: spacing.xs },
  portfolioImage: {
    width: 220,
    height: 150,
    borderRadius: radius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  actions: { marginTop: spacing.sm },
  reviewAuthor: { color: colors.text, fontWeight: "600" },
  reviewComment: { color: colors.textMuted, marginTop: 4 },
});
