import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
import { Badge, Card, EmptyState, Screen, Subtitle, Title } from "../../components/ui";
import { api } from "../../api/client";
import { QuoteRequest, QuoteRequestStatus, SERVICE_LABELS } from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { ProTabParamList, ProStackParamList } from "../../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<ProTabParamList, "Requests">,
  NativeStackScreenProps<ProStackParamList>
>;

const STATUS_LABELS: Record<QuoteRequestStatus, string> = {
  PENDING_REVIEW: "Nouvelle demande",
  FORWARDED: "Nouvelle demande",
  QUOTED: "Devis envoyé",
  FINALIZED: "Offre transmise au client",
  ACCEPTED: "Acceptée",
  DECLINED: "Refusée",
  CANCELLED: "Annulée",
};

const STATUS_TONES: Record<QuoteRequestStatus, "primary" | "muted" | "success" | "danger"> = {
  PENDING_REVIEW: "muted",
  FORWARDED: "primary",
  QUOTED: "muted",
  FINALIZED: "primary",
  ACCEPTED: "success",
  DECLINED: "danger",
  CANCELLED: "danger",
};

export default function RequestsScreen({ navigation }: Props) {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ quoteRequests: QuoteRequest[] }>("/quote-requests");
      setQuoteRequests(data.quoteRequests);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen>
      <FlatList
        data={quoteRequests}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: spacing.gutter, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Title>Demandes de devis</Title>
            <Subtitle style={styles.lede}>
              Les demandes que LuxuryConnect vous transmet. Vous répondez avec votre prix ; c'est
              LuxuryConnect qui fixe le prix final et le transmet au client.
            </Subtitle>
          </View>
        }
        ListEmptyComponent={
          !loading ? <EmptyState message="Aucune demande pour le moment." /> : null
        }
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate("QuoteRequestDetail", { quoteRequestId: item.id })}>
            <View style={styles.rowBetween}>
              {/* L'identité du client ne vous est communiquée qu'une fois
                  l'offre acceptée : la demande se lit par sa prestation. */}
              <Text style={styles.service}>{SERVICE_LABELS[item.serviceType]}</Text>
              <Badge label={STATUS_LABELS[item.status]} tone={STATUS_TONES[item.status]} />
            </View>
            <Text style={styles.meta}>
              {item.vehicleMake} {item.vehicleModel}
              {item.vehicleYear ? ` (${item.vehicleYear})` : ""}
              {item.city ? ` · ${item.city}` : ""}
            </Text>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.sm },
  lede: { marginTop: spacing.sm },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  service: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 15, flexShrink: 1 },
  meta: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, marginTop: 6 },
});
